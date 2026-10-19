import { test, expect } from "@playwright/test";
import { NodeIO, type Node } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import gsap from "gsap";
import {
  animateSatchel,
  type RestPose,
} from "../src/components/three/satchelMotion";

function meshTree(node: Node): Group {
  const group = new Group();
  group.name = node.getName();
  group.position.fromArray(node.getTranslation());
  group.quaternion.fromArray(node.getRotation());
  group.scale.fromArray(node.getScale());
  node
    .getMesh()
    ?.listPrimitives()
    .forEach((primitive) => {
      const geometry = new BufferGeometry();
      const positions = primitive.getAttribute("POSITION")!;
      const decoded: number[] = [];
      for (let i = 0; i < positions.getCount(); i++)
        decoded.push(...positions.getElement(i, []));
      geometry.setAttribute("position", new Float32BufferAttribute(decoded, 3));
      if (primitive.getIndices())
        geometry.setIndex(Array.from(primitive.getIndices()!.getArray()!));
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      group.add(
        new Mesh(geometry, new MeshBasicMaterial({ side: DoubleSide })),
      );
    });
  node.listChildren().forEach((child) => group.add(meshTree(child)));
  return group;
}
const corners = (box: Box3) =>
  Array.from(
    { length: 8 },
    (_, i) =>
      new Vector3(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      ),
  );

test("satchel has a hollow cavity and cards clear each other, the flap, and shell during interrupted motion", async () => {
  test.skip(
    test.info().project.name !== "chromium",
    "Geometry is engine-independent; run once.",
  );
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const doc = await io.read("public/models/satchel.glb");
  const root = new Group();
  doc
    .getRoot()
    .getDefaultScene()!
    .listChildren()
    .forEach((node) => root.add(meshTree(node)));
  const home = new Map<string, RestPose>();
  root.traverse((node) =>
    home.set(node.name, {
      x: node.position.x,
      y: node.position.y,
      z: node.position.z,
      rx: node.rotation.x,
      ry: node.rotation.y,
      rz: node.rotation.z,
    }),
  );
  root.updateMatrixWorld(true);
  const cards = [0, 1, 2, 3].map((i) => root.getObjectByName(`artifact_${i}`)!);
  const localCorners = cards.map((card) =>
    corners(new Box3().setFromObject(card)).map((corner) =>
      card.worldToLocal(corner),
    ),
  );
  const flap = root.getObjectByName("satchel_flap")!;
  const surfaceMeshes: Mesh[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    let ancestor = node.parent;
    while (ancestor && !cards.includes(ancestor)) ancestor = ancestor.parent;
    if (!ancestor) surfaceMeshes.push(node);
  });
  const ray = new Raycaster();
  const check = (label: string) => {
    root.updateMatrixWorld(true);
    const boxes = cards.map((card) => new Box3().setFromObject(card));
    boxes.forEach((box, i) =>
      boxes.slice(i + 1).forEach((other, j) => {
        expect(
          box.intersectsBox(other),
          `${label}: cards ${i}/${i + j + 1} overlap`,
        ).toBeFalsy();
      }),
    );
    cards.forEach((card, i) => {
      const points = localCorners[i].map((point) =>
        point.clone().applyMatrix4(card.matrixWorld),
      );
      for (let a = 0; a < 8; a++)
        for (const bit of [1, 2, 4]) {
          const b = a ^ bit;
          if (a > b) continue;
          const direction = points[b].clone().sub(points[a]);
          ray.set(points[a], direction.clone().normalize());
          ray.far = direction.length();
          const hits = ray
            .intersectObjects(surfaceMeshes, false)
            .filter(
              (hit) => hit.distance > 0.002 && hit.distance < ray.far - 0.002,
            );
          expect(
            hits.length,
            `${label}: card ${i} intersects bag at ${hits[0]?.point.toArray()}`,
          ).toBe(0);
        }
    });
  };
  const run = (active: boolean, until = 1) => {
    const timeline = gsap.timeline({ paused: true });
    animateSatchel(timeline, root, home, active, false);
    for (let step = 0; step <= 40 * until; step++) {
      timeline.progress(step / 40);
      check(`${active ? "open" : "close"} ${step}/40`);
    }
    timeline.kill();
  };
  run(true);
  // Open bag has a deep floor and enclosing side walls, rather than a top slab.
  ray.set(new Vector3(0, 2.12, 0), new Vector3(0, -1, 0));
  ray.far = 3;
  const floor = ray.intersectObjects(surfaceMeshes, false)[0];
  expect(floor).toBeTruthy();
  expect(floor.point.y).toBeLessThan(0.4);
  expect(floor.point.y).toBeGreaterThan(0.1);
  expect(flap.rotation.x).toBeCloseTo(-2.05, 3);
  run(false);
  run(true, 0.55);
  run(false);
  run(true);
  run(false, 0.4);
  run(true);
  run(false);
  cards.forEach((card) => {
    expect(
      card.position.distanceTo(
        new Vector3(
          home.get(card.name)!.x,
          home.get(card.name)!.y,
          home.get(card.name)!.z,
        ),
      ),
    ).toBeLessThan(0.001);
  });
  root.traverse((node) => {
    if (node instanceof Mesh) {
      node.geometry.dispose();
      (node.material as MeshBasicMaterial).dispose();
    }
  });
});
