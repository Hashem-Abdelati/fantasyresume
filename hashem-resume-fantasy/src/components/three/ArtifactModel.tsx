import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import gsap from "gsap";
import { rememberBookAnchor } from "../book/bookHandoff";
import RavenEnchantment from "./RavenEnchantment";
import { signalRaven } from "./ravenSignals";
import { animateSatchel, type RestPose } from "./satchelMotion";
import type { Artifact } from "../../data/navigation";
import { inventoryItems } from "../../data/inventory";

type Props = {
  name: "spellbook" | "satchel" | "raven";
  selected: Artifact;
  chapter: string;
  reduced: boolean;
  hovered: boolean;
  onHover: (name: string | null) => void;
  onSelect: (path: string) => void;
};
export default function ArtifactModel({
  name,
  selected,
  chapter,
  reduced,
  hovered,
  onHover,
  onSelect,
}: Props) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  const object = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material instanceof MeshStandardMaterial)
          node.material = node.material.clone();
      }
    });
    if (name === "satchel") {
      const template = copy.getObjectByName("artifact_0");
      if (template)
        for (let i = 4; i < inventoryItems.length; i++) {
          const card = template.clone(true);
          card.name = `artifact_${i}`;
          card.position.x = ((i % 4) - 1.5) * 0.52;
          card.position.z -= Math.floor(i / 4) * 0.12;
          template.parent?.add(card);
        }
    }
    return copy;
  }, [scene, name]);
  const wrapper = useRef<Group>(null);
  const active = selected === (name === "spellbook" ? "book" : name);
  const home = useMemo(() => {
    const nodes: [string, RestPose][] = [];
    object.traverse((n) =>
      nodes.push([
        n.name,
        {
          x: n.position.x,
          y: n.position.y,
          z: n.position.z,
          ry: n.rotation.y,
          rx: n.rotation.x,
          rz: n.rotation.z,
        },
      ]),
    );
    return new Map(nodes);
  }, [object]);
  useEffect(() => {
    const duration = reduced ? 0 : 1.25;
    const timeline = gsap.timeline();
    const cover = object.getObjectByName("front_cover");
    const clasp = object.getObjectByName("clasp");
    if (cover && clasp) {
      timeline.to(
        clasp.rotation,
        { y: active ? -0.9 : 0, duration: duration * 0.24 },
        active ? 0 : duration * 0.9,
      );
      timeline.to(
        cover.rotation,
        { y: active ? -2.3 : 0, duration, ease: "power3.inOut" },
        active ? duration * 0.12 : 0,
      );
    }
    if (name === "satchel")
      animateSatchel(timeline, object, home, active, reduced);
    return () => {
      timeline.kill();
    };
  }, [active, object, reduced, home, name]);
  useEffect(() => {
    const targets = ["character_tab", "quests_tab", "journey_tab"];
    targets.forEach((name, i) => {
      const node = object.getObjectByName(name);
      const chosen = ["/about", "/projects", "/experience"][i] === chapter;
      node?.traverse((child) => {
        if (
          child instanceof Mesh &&
          child.material instanceof MeshStandardMaterial
        ) {
          child.material.emissive.set("#b77d2d");
          child.material.emissiveIntensity = active && chosen ? 0.26 : 0;
        }
      });
    });
  }, [active, chapter, object]);
  useEffect(
    () => () => {
      object.traverse((n) => {
        if (n instanceof Mesh && n.material instanceof MeshStandardMaterial)
          n.material.dispose();
      });
    },
    [object],
  );
  const projection = useMemo(() => [new Vector3(), new Vector3()], []);
  useFrame(({ clock, camera, size }) => {
    if (name === "spellbook" && selected === "hall" && wrapper.current) {
      const [bottom, top] = projection;
      bottom
        .set(0, 0, 0)
        .applyMatrix4(wrapper.current.matrixWorld)
        .project(camera);
      top
        .set(0, 3.75, 0)
        .applyMatrix4(wrapper.current.matrixWorld)
        .project(camera);
      rememberBookAnchor({
        x: ((top.x + 1) * size.width) / 2,
        y: ((1 - (top.y + bottom.y) / 2) * size.height) / 2,
        height: (Math.abs(top.y - bottom.y) * size.height) / 2,
      });
    }
    if (reduced || name === "raven") return;
    if (wrapper.current)
      wrapper.current.position.y =
        Math.sin(clock.elapsedTime * 0.8) * 0.008 + (hovered ? 0.035 : 0);
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (name === "raven" && active) {
      signalRaven("greet");
      return;
    }
    let node = e.object;
    while (
      node.parent &&
      !/^(character_tab|quests_tab|journey_tab|artifact_\d+)$/.test(node.name)
    )
      node = node.parent;
    const tabRoutes: Record<string, string> = {
      character_tab: "/about",
      quests_tab: "/projects",
      journey_tab: "/experience",
    };
    if (tabRoutes[node.name]) return onSelect(tabRoutes[node.name]);
    if (node.name.startsWith("artifact_")) {
      const item = inventoryItems[Number(node.name.split("_")[1])];
      if (item && active) return onSelect(`/inventory?artifact=${item.id}`);
    }
    onSelect(
      name === "spellbook"
        ? "/about"
        : name === "satchel"
          ? "/inventory"
          : "/contact",
    );
  };
  return (
    <group
      ref={wrapper}
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(name);
      }}
      onPointerOut={() => onHover(null)}
    >
      <primitive object={object} />
      {name === "raven" && (
        <RavenEnchantment
          object={object}
          active={active}
          hovered={hovered}
          reduced={reduced}
        />
      )}
      {hovered && (
        <pointLight
          position={[0, 2, 1.5]}
          color="#e7b960"
          intensity={3}
          distance={4}
        />
      )}
    </group>
  );
}
