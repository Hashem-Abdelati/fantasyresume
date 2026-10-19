import { Component, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, PCFShadowMap, PerspectiveCamera } from "three";
import gsap from "gsap";
import type { Artifact } from "../../data/navigation";
import ArtifactModel from "./ArtifactModel";
import EntranceDoorway from "./EntranceDoorway";
import Study from "./Study";
import SceneMetrics from "./SceneMetrics";
for (const name of ["spellbook", "satchel", "raven"])
  useGLTF.preload(`/models/${name}.glb`);
class AssetBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Camera({
  selected,
  reduced,
  entering,
  reveal,
}: {
  selected: Artifact;
  reduced: boolean;
  entering: boolean;
  reveal: boolean;
}) {
  const { camera, invalidate, size } = useThree();
  const target = useRef(new Vector3(0, 1.9, 0));
  useEffect(() => {
    const lens = camera as PerspectiveCamera;
    const fov =
      selected === "hall"
        ? Math.min(
            85,
            (2 *
              Math.atan(
                Math.tan(Math.PI / 9) *
                  Math.max(1, 1.4 / (size.width / size.height)),
              ) *
              180) /
              Math.PI,
          )
        : selected === "book"
          ? 40
          : (2 *
              Math.atan(
                (Math.tan(Math.PI / 9) * size.height) /
                  Math.max(1, size.height - 74),
              ) *
              180) /
            Math.PI;
    if (entering) {
      target.current.set(0, 1.65, 0);
      gsap.set(lens, { fov });
      lens.updateProjectionMatrix();
      return;
    }
    const duration = reduced ? 0 : 1.5;
    // Fit the raven to the open left-hand stage, with room for its wings and caption.
    const ravenScale = 1.42;
    const stageTop = 110;
    const captionSpace = size.height < 741 ? 110 : 175;
    const stageHeight = Math.max(
      180,
      Math.min(
        size.height - stageTop - captionSpace,
        (size.width * 0.42 - 55) * 1.7,
      ),
    );
    const halfFov = Math.tan((fov * Math.PI) / 360);
    const ravenDistance =
      (2.73 * ravenScale * size.height) / (2 * halfFov * stageHeight);
    const halfHeight = halfFov * ravenDistance;
    const stageNdcY = 1 - (2 * (stageTop + stageHeight / 2)) / size.height;
    const viewBack = new Vector3(0, 0.16, 1).normalize();
    const viewUp = new Vector3(0, 1, -0.16).normalize();
    const ravenTarget = new Vector3(3.55, 0.05 + 1.28 * ravenScale, 0.1)
      .add(new Vector3(0.56 * halfHeight * (size.width / size.height), 0, 0))
      .addScaledVector(viewUp, -stageNdcY * halfHeight);
    // Approach from the front of the perch so the bird keeps its three-quarter pose.
    const ravenCamera = new Vector3(
      3.4,
      0.05 + 1.28 * ravenScale,
      0.1,
    ).addScaledVector(viewBack, ravenDistance * 1.1);
    const positions: Record<Artifact, number[]> = {
      hall: [0, 3.3, 12.1],
      book: [-0.4, 2.5, 6.4],
      satchel: [-3.4, 4.3, 8.2],
      raven: ravenCamera.toArray(),
    };
    // Preserve the chapter composition after removing the old 74px canvas jump.
    const verticalOffset = (distance: number) =>
      (Math.tan(Math.PI / 9) * distance * 74) / Math.max(1, size.height - 74);
    const targets: Record<Artifact, number[]> = {
      hall: [0, 1.65, 0],
      book: [-0.4, 1.85, 0],
      satchel: [-0.6, 1.02 + verticalOffset(8.2), 0],
      raven: ravenTarget.toArray(),
    };
    const p = positions[selected],
      t = targets[selected];
    const timeline = gsap.timeline({
      onUpdate: () => {
        camera.lookAt(target.current);
        invalidate();
      },
    });
    timeline
      .to(
        lens,
        {
          fov,
          duration,
          ease: "power3.inOut",
          onUpdate: () => lens.updateProjectionMatrix(),
        },
        0,
      )
      .to(
        camera.position,
        {
          x: p[0],
          y: p[1],
          z: p[2],
          duration,
          ease: "power3.inOut",
        },
        0,
      )
      .to(
        target.current,
        {
          x: t[0],
          y: t[1],
          z: t[2],
          duration,
          ease: "power3.inOut",
        },
        0,
      );
    return () => {
      timeline.kill();
    };
  }, [
    camera,
    selected,
    reduced,
    invalidate,
    size.width,
    size.height,
    entering,
    reveal,
  ]);
  useFrame(({ pointer }) => {
    if (!reduced && !entering) {
      camera.lookAt(
        target.current.x + pointer.x * 0.025,
        target.current.y + pointer.y * 0.018,
        target.current.z,
      );
    }
  });
  return null;
}
function RenderActivity({
  selected,
  visible,
  reduced,
}: {
  selected: Artifact;
  visible: boolean;
  reduced: boolean;
}) {
  const { setFrameloop, invalidate } = useThree();
  useEffect(() => {
    setFrameloop(!visible ? "never" : reduced ? "demand" : "always");
    invalidate();
    // Once the reader covers the scene, stop rendering the hidden 3D hall.
    if (selected === "book") {
      const timer = window.setTimeout(
        () => setFrameloop("never"),
        reduced ? 0 : 2200,
      );
      return () => window.clearTimeout(timer);
    }
  }, [selected, visible, reduced, setFrameloop, invalidate]);
  return null;
}
type Props = {
  selected: Artifact;
  onDoorReady: () => void;
  onEntranceComplete: () => void;
  entering: boolean;
  reveal: boolean;
  chapter: string;
  reduced: boolean;
  hovered: string | null;
  onHover: (name: string | null) => void;
  onSelect: (path: string) => void;
  onError: () => void;
  onReady: () => void;
  visible: boolean;
};
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}
export default function GrandHallScene(props: Props) {
  // Keep the doorway and its lighting mounted after walking past them.
  const [hadEntrance] = useState(props.entering);
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={1}
      camera={{ position: [0, 3.3, 12.1], fov: 40, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={!props.visible ? "never" : props.reduced ? "demand" : "always"}
      fallback={<span>Explore the portfolio with the navigation links.</span>}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", props.onError, {
          once: true,
        });
      }}
    >
      <RenderActivity
        selected={props.selected}
        visible={props.visible}
        reduced={props.reduced}
      />
      <SceneMetrics />
      <Camera
        selected={props.selected}
        reduced={props.reduced}
        entering={props.entering}
        reveal={props.reveal}
      />
      <Study reduced={props.reduced} />
      {props.selected === "satchel" && (
        <pointLight
          position={[-3.5, 3.6, 2.8]}
          color="#ffddad"
          intensity={12}
          distance={7}
        />
      )}
      {props.selected === "raven" && (
        <>
          <pointLight
            position={[4.0, 4.8, 4]}
            color="#d4e4ff"
            intensity={42}
            distance={7}
          />
          <pointLight
            position={[3.5, 2.5, 4.5]}
            color="#bdcbdc"
            intensity={14}
            distance={8}
          />
          <pointLight
            position={[5.3, 3.3, -1.4]}
            color="#a38ad7"
            intensity={9}
            distance={5}
          />
        </>
      )}
      {hadEntrance && (
        <AssetBoundary onError={props.onEntranceComplete}>
          <Suspense fallback={null}>
            <EntranceDoorway
              active={props.entering}
              reveal={props.reveal}
              onReady={props.onDoorReady}
              onComplete={props.onEntranceComplete}
            />
          </Suspense>
        </AssetBoundary>
      )}
      <AssetBoundary onError={props.onError}>
        <Suspense fallback={null}>
          <group
            position={[-3.5, 0.06, 0.1]}
            rotation={[0, 0.2, 0]}
            scale={0.91}
          >
            <ArtifactModel
              {...props}
              name="satchel"
              hovered={props.hovered === "satchel"}
            />
          </group>
          <group
            position={[0, 0.11, 0]}
            rotation={[0, -0.12, -0.035]}
            scale={1.02}
          >
            <ArtifactModel
              {...props}
              name="spellbook"
              hovered={props.hovered === "spellbook"}
            />
          </group>
          <group
            position={[3.55, 0.05, 0.1]}
            rotation={[0, -1.1, 0]}
            scale={1.42}
          >
            <ArtifactModel
              {...props}
              name="raven"
              hovered={props.hovered === "raven"}
            />
          </group>
          <Ready onReady={props.onReady} />
        </Suspense>
      </AssetBoundary>
    </Canvas>
  );
}
