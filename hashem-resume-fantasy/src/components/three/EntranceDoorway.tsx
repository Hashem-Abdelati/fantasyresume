import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";
import { DOOR_THRESHOLD_Z, entrancePose } from "./entranceMotion";

type Props = {
  active: boolean;
  reveal: boolean;
  onReady: () => void;
  onComplete: () => void;
};
export default function EntranceDoorway({
  active,
  reveal,
  onReady,
  onComplete,
}: Props) {
  const { scene } = useGLTF("/models/doors.glb");
  const { camera } = useThree();
  const object = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);
  const rig = useMemo(
    () => ({
      left: object.getObjectByName("door_leaf_left"),
      right: object.getObjectByName("door_leaf_right"),
    }),
    [object],
  );
  const time = useRef(0);
  const finished = useRef(false);
  useEffect(() => {
    onReady();
  }, [onReady]);
  useFrame((_, delta) => {
    if (!active || finished.current) return;
    if (reveal) time.current += Math.min(delta, 0.25);
    const pose = entrancePose(time.current);
    rig.left?.rotation.set(0, pose.doorAngle, 0);
    rig.right?.rotation.set(0, -pose.doorAngle, 0);
    camera.position.set(pose.x, pose.y, pose.z);
    camera.lookAt(pose.x * 0.35, pose.lookY, 0);
    camera.rotateZ(pose.roll);
    if (pose.complete) {
      finished.current = true;
      onComplete();
    }
  });
  return (
    <group name="physical-entrance">
      <primitive object={object} position={[0, 0, DOOR_THRESHOLD_Z]} />
      <pointLight
        position={[0, 5.2, 20]}
        color="#c3c5cf"
        intensity={28}
        distance={16}
      />
      <pointLight
        position={[0, 5.3, 12.3]}
        color="#acc8eb"
        intensity={9}
        distance={12}
      />
      {[-4.35, 4.35].map((x) => (
        <pointLight
          key={x}
          position={[x, 3.65, 16.25]}
          color="#ffb557"
          intensity={8}
          distance={7}
        />
      ))}
    </group>
  );
}
