import { useLayoutEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import {
  InstancedMesh,
  Object3D,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
} from "three";

/** The entrance, aisle and artifact alcove share one permanent stone room. */
export default function RoomShell() {
  const blocks = useRef<InstancedMesh>(null);
  const maps = useTexture([
    "/models/materials/basalt-color.webp",
    "/models/materials/basalt-normal.webp",
    "/models/materials/basalt-roughness.webp",
  ]);
  const [map, normalMap, roughnessMap] = useMemo(
    () =>
      maps.map((source, i) => {
        const texture = source.clone();
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.repeat.set(2, 2);
        if (i === 0) texture.colorSpace = SRGBColorSpace;
        texture.needsUpdate = true;
        return texture;
      }),
    [maps],
  );
  const floorMaps = useMemo(
    () =>
      [map, normalMap, roughnessMap].map((source) => {
        const texture = source.clone();
        texture.repeat.set(12, 18);
        return texture;
      }),
    [map, normalMap, roughnessMap],
  );
  useLayoutEffect(
    () => () => {
      [map, normalMap, roughnessMap, ...floorMaps].forEach((texture) =>
        texture.dispose(),
      );
    },
    [map, normalMap, roughnessMap, floorMaps],
  );
  useLayoutEffect(() => {
    const pose = new Object3D();
    let i = 0;
    for (const side of [-1, 1]) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 14; col++) {
          pose.position.set(
            side * 8.25,
            row * 0.72 + 0.35,
            -3.7 + col * 1.48 + (row % 2) * 0.74,
          );
          pose.updateMatrix();
          blocks.current!.setMatrixAt(i++, pose.matrix);
        }
      }
    }
    blocks.current!.instanceMatrix.needsUpdate = true;
  }, []);
  const vault = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-8.25, 6.45);
    shape.bezierCurveTo(-8.25, 8.4, -3.4, 10, 0, 10.8);
    shape.bezierCurveTo(3.4, 10, 8.25, 8.4, 8.25, 6.45);
    shape.lineTo(8.48, 6.45);
    shape.bezierCurveTo(8.48, 8.6, 3.4, 10.25, 0, 11.05);
    shape.bezierCurveTo(-3.4, 10.25, -8.48, 8.6, -8.48, 6.45);
    shape.closePath();
    return shape;
  }, []);
  const material = {
    map,
    normalMap,
    roughnessMap,
    color: "#9c9da3",
    roughness: 1,
    metalness: 0.02,
  };
  return (
    <group name="continuous-vaulted-hall">
      <pointLight
        position={[0, 7.8, 8]}
        color="#8d9bb6"
        intensity={24}
        distance={22}
      />
      <instancedMesh
        ref={blocks}
        args={[undefined, undefined, 252]}
        receiveShadow
      >
        <boxGeometry args={[0.64, 0.7, 1.46]} />
        <meshStandardMaterial {...material} />
      </instancedMesh>
      <mesh position={[0, 0, -4.4]} receiveShadow>
        <extrudeGeometry
          args={[vault, { depth: 20, bevelEnabled: false, curveSegments: 16 }]}
        />
        <meshStandardMaterial {...material} color="#53545a" />
      </mesh>
      {[-3.5, 2.6, 8.7, 14.6].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh receiveShadow scale={[0.98, 0.98, 1]}>
            <extrudeGeometry
              args={[
                vault,
                { depth: 0.24, bevelEnabled: false, curveSegments: 16 },
              ]}
            />
            <meshStandardMaterial {...material} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 7.94, 0, 0]}>
              <mesh position={[0, 3.25, 0]} receiveShadow>
                <boxGeometry args={[0.36, 6.5, 0.52]} />
                <meshStandardMaterial {...material} />
              </mesh>
              {[0.2, 6.3].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                  <boxGeometry args={[0.6, 0.28, 0.73]} />
                  <meshStandardMaterial {...material} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, -0.22, 10]} receiveShadow>
        <boxGeometry args={[30, 0.35, 30]} />
        <meshStandardMaterial
          map={floorMaps[0]}
          normalMap={floorMaps[1]}
          roughnessMap={floorMaps[2]}
          color="#51545a"
          roughness={0.83}
          metalness={0.08}
        />
      </mesh>
      {/* Narrow stone bands draw the eye along the same aisle throughout the walk. */}
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, -0.038, 8]} receiveShadow>
          <boxGeometry args={[0.09, 0.012, 25]} />
          <meshStandardMaterial
            color="#4b4538"
            roughness={0.76}
            metalness={0.22}
          />
        </mesh>
      ))}
      <mesh position={[0, 9.3, -4.45]} receiveShadow>
        <boxGeometry args={[17, 5, 0.6]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </group>
  );
}
