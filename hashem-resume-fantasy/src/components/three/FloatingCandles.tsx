import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, InstancedMesh, Object3D } from "three";

const candles = [
  [-3.1, 4.6, -3.8],
  [-4.7, 6.25, -3.1],
  [-3.8, 3.8, -2.7],
  [-2.8, 5.4, -3.7],
  [-1.9, 4.3, -2],
  [-0.9, 5.8, -4],
  [0.15, 4.75, -2.5],
  [1.3, 5.6, -3.5],
  [2.15, 4.2, -2.1],
  [3.25, 5.1, -3.3],
  [4.4, 3.8, -2.6],
  [5.45, 5.45, -3.6],
  [-6.6, 5.8, -4.5],
  [6.7, 4.45, -4],
  [-0.7, 3.8, -3.3],
  [3.5, 6.1, -4.8],
];

export default function FloatingCandles({ reduced }: { reduced: boolean }) {
  const wax = useRef<InstancedMesh>(null);
  const brass = useRef<InstancedMesh>(null);
  const flames = useRef<InstancedMesh>(null);
  const glow = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const elapsed = useRef(0);
  const pose = useCallback(
    (time: number) => {
      if (!wax.current || !brass.current || !flames.current || !glow.current)
        return;
      candles.forEach(([x, y, z], i) => {
        const height = 0.32 + (i % 4) * 0.085;
        const bob = Math.sin(time * 0.48 + i * 1.7) * 0.115;
        const drift = Math.sin(time * 0.24 + i * 2.1) * 0.07;
        dummy.rotation.set(0, 0, Math.sin(time * 0.36 + i) * 0.025);
        dummy.position.set(x + drift, y + bob, z);
        dummy.scale.set(0.057, height, 0.057);
        dummy.updateMatrix();
        wax.current!.setMatrixAt(i * 3, dummy.matrix);
        for (let j = 1; j <= 2; j++) {
          dummy.position.set(
            x + drift + (j === 1 ? -0.045 : 0.035),
            y + bob + height * 0.18,
            z + 0.025,
          );
          dummy.scale.set(0.014, height * (j === 1 ? 0.44 : 0.28), 0.019);
          dummy.updateMatrix();
          wax.current!.setMatrixAt(i * 3 + j, dummy.matrix);
        }
        dummy.position.set(x + drift, y + bob - height / 2, z);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        dummy.scale.setScalar(0.075);
        dummy.updateMatrix();
        brass.current!.setMatrixAt(i, dummy.matrix);
        const tip = y + bob + height / 2 + 0.085;
        dummy.position.set(
          x + drift + Math.sin(time * 2.1 + i) * 0.008,
          tip,
          z,
        );
        dummy.rotation.set(0, 0, Math.sin(time * 2.6 + i) * 0.08);
        dummy.scale.set(
          0.024,
          0.085 * (1 + Math.sin(time * 3.5 + i) * 0.13),
          0.024,
        );
        dummy.updateMatrix();
        flames.current!.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x + drift, tip, z + 0.035);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.48 + Math.sin(time * 2 + i) * 0.025);
        dummy.updateMatrix();
        glow.current!.setMatrixAt(i, dummy.matrix);
      });
      for (const mesh of [
        wax.current,
        brass.current,
        flames.current,
        glow.current,
      ]) {
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
    [dummy],
  );
  useLayoutEffect(() => {
    pose(0);
  }, [pose]);
  useFrame((_, delta) => {
    if (reduced) return;
    elapsed.current += Math.min(delta, 0.05);
    pose(elapsed.current);
  });
  return (
    <group name="floating-candles">
      <instancedMesh
        ref={wax}
        args={[undefined, undefined, candles.length * 3]}
        frustumCulled={false}
        raycast={() => null}
      >
        <cylinderGeometry args={[0.94, 1, 1, 10]} />
        <meshStandardMaterial color="#ead4a3" roughness={0.87} />
      </instancedMesh>
      <instancedMesh
        ref={brass}
        args={[undefined, undefined, candles.length]}
        frustumCulled={false}
        raycast={() => null}
      >
        <torusGeometry args={[1, 0.11, 5, 14]} />
        <meshStandardMaterial
          color="#b98a47"
          metalness={0.75}
          roughness={0.36}
        />
      </instancedMesh>
      <instancedMesh
        ref={flames}
        args={[undefined, undefined, candles.length]}
        frustumCulled={false}
        raycast={() => null}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#fff0c7" toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={glow}
        args={[undefined, undefined, candles.length]}
        frustumCulled={false}
        raycast={() => null}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`varying vec2 vUv;void main(){vUv=uv;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);center.xy+=position.xy*length(instanceMatrix[0].xyz);gl_Position=projectionMatrix*center;}`}
          fragmentShader={`varying vec2 vUv;void main(){float d=length(vUv-.5)*2.;float a=pow(max(0.,1.-d),3.);gl_FragColor=vec4(1.,.61,.22,a*.62);}`}
        />
      </instancedMesh>
    </group>
  );
}
