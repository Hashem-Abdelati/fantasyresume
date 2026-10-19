import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import RoomShell from "./RoomShell";
import FloatingCandles from "./FloatingCandles";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Shape,
  Vector3,
  Points,
  AdditiveBlending,
} from "three";
function Arch({ x }: { x: number }) {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-1.4, 0);
    s.lineTo(-1.4, 4.5);
    s.quadraticCurveTo(-1.4, 6, 0, 6.8);
    s.quadraticCurveTo(1.4, 6, 1.4, 4.5);
    s.lineTo(1.4, 0);
    s.lineTo(1.18, 0);
    s.lineTo(1.18, 4.5);
    s.quadraticCurveTo(1.18, 5.8, 0, 6.5);
    s.quadraticCurveTo(-1.18, 5.8, -1.18, 4.5);
    s.lineTo(-1.18, 0);
    s.closePath();
    return s;
  }, []);
  const pane = useMemo(() => {
    const s = new Shape();
    s.moveTo(-1.18, 0);
    s.lineTo(-1.18, 4.5);
    s.quadraticCurveTo(-1.18, 5.8, 0, 6.5);
    s.quadraticCurveTo(1.18, 5.8, 1.18, 4.5);
    s.lineTo(1.18, 0);
    s.closePath();
    return s;
  }, []);
  return (
    <group position={[x, 0, -4]}>
      <mesh>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.3,
              bevelEnabled: true,
              bevelSegments: 2,
              steps: 1,
              bevelSize: 0.07,
              bevelThickness: 0.06,
            },
          ]}
        />
        <meshStandardMaterial color="#27282d" roughness={0.91} />
      </mesh>
      {[-1.5, 1.5].map((side) => (
        <group key={side} position={[side, 0, 0.04]}>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.11, 0.16, 5, 10]} />
            <meshStandardMaterial color="#303039" roughness={0.8} />
          </mesh>
          {[0.25, 4.6].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.38, 0.13, 0.42]} />
              <meshStandardMaterial
                color="#655239"
                metalness={0.45}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}
      {[-0.57, 0.57].map((xx) => (
        <mesh key={xx} position={[xx, 3.5, -0.05]}>
          <boxGeometry args={[0.035, 5.6, 0.08]} />
          <meshStandardMaterial
            color="#766247"
            metalness={0.4}
            roughness={0.65}
          />
        </mesh>
      ))}
      <mesh position={[0, 3.3, -0.04]}>
        <boxGeometry args={[2.4, 0.045, 0.08]} />
        <meshStandardMaterial
          color="#766247"
          metalness={0.4}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0, 0, -0.18]}>
        <shapeGeometry args={[pane]} />
        <shaderMaterial
          uniforms={{ seed: { value: x + 7 } }}
          vertexShader={`varying vec2 vUv;void main(){vUv=(uv+vec2(1.18,0.))/vec2(2.36,6.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 vUv;uniform float seed;
            float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
            void main(){vec3 col=mix(vec3(.014,.024,.04),vec3(.038,.065,.108),vUv.y);
              vec2 grid=vUv*vec2(19.,42.);vec2 cell=floor(grid);float star=step(.966,hash(cell));
              float light=pow(max(0.,1.-length(fract(grid)-.5)*3.),6.)*star;
              col+=vec3(.48,.57,.7)*light*smoothstep(.25,.6,vUv.y);
              float ridge=.13+.035*sin(vUv.x*19.+seed)+.024*sin(vUv.x*37.);
              col=mix(col,vec3(.011,.018,.029),1.-smoothstep(ridge,ridge+.004,vUv.y));
              gl_FragColor=vec4(col,1.);}`}
        />
      </mesh>
    </group>
  );
}
function Candle({
  position,
  height = 0.5,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.16, 0.23, 0.18, 16]} />
        <meshStandardMaterial color="#8e6636" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, height / 2 + 0.18, 0]}>
        <cylinderGeometry args={[0.072, 0.085, height, 16]} />
        <meshStandardMaterial color="#bc9b67" roughness={0.85} />
      </mesh>
      <mesh position={[0, height + 0.27, 0]} scale={[0.035, 0.12, 0.035]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ffda93" />
      </mesh>
    </group>
  );
}
export default function Study({ reduced }: { reduced: boolean }) {
  const motes = useRef<Points>(null);
  useFrame((_, delta) => {
    if (!reduced && motes.current)
      motes.current.rotation.y += Math.min(delta, 0.05) * 0.012;
  });
  const dust = useMemo(() => {
    const g = new BufferGeometry();
    const points = [];
    for (let i = 0; i < 110; i++) {
      const n = Math.sin(i * 123.45) * 43758.54;
      const f = n - Math.floor(n);
      points.push(
        (f - 0.5) * 13,
        ((i * 37) % 67) / 13,
        -2 + ((i * 19) % 59) / 12,
      );
    }
    g.setAttribute("position", new Float32BufferAttribute(points, 3));
    return g;
  }, []);
  return (
    <group>
      <fog attach="fog" args={["#080a0f", 12, 27]} />
      {[-6.2, -3.1, 0, 3.1, 6.2].map((x) => (
        <Arch key={x} x={x} />
      ))}
      <FloatingCandles reduced={reduced} />
      <mesh position={[0, 5.15, -4.14]}>
        <circleGeometry args={[0.53, 48]} />
        <meshBasicMaterial color="#bed5e6" />
      </mesh>
      <mesh position={[0.2, 5.27, -4.13]}>
        <circleGeometry args={[0.48, 48]} />
        <meshBasicMaterial color="#09111c" />
      </mesh>
      <mesh position={[0, 5.15, -4.12]}>
        <planeGeometry args={[3.5, 3.5]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 vUv;void main(){float a=pow(max(0.,1.-length(vUv-.5)*2.),3.);gl_FragColor=vec4(.35,.58,.9,a*.22);}`}
        />
      </mesh>
      <Suspense fallback={null}>
        <RoomShell />
      </Suspense>
      <mesh position={[0, -0.04, 0.03]} receiveShadow>
        <cylinderGeometry args={[1.85, 2.05, 0.23, 64]} />
        <meshStandardMaterial
          color="#25252a"
          roughness={0.8}
          metalness={0.18}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.03]}>
        <cylinderGeometry args={[1.82, 1.85, 0.025, 64]} />
        <meshStandardMaterial
          color="#76502c"
          metalness={0.72}
          roughness={0.42}
        />
      </mesh>
      {[-5.1, -2.4, 2.25, 5.1].map((x, i) => (
        <Candle
          key={x}
          position={[x, 0, i % 2 ? -1.6 : 1]}
          height={i % 2 ? 0.75 : 0.44}
        />
      ))}
      {[-5, 5].map((x) => (
        <pointLight
          key={x}
          position={[x, 1.25, 0.5]}
          color="#ffbc69"
          intensity={8}
          distance={7}
          decay={2}
        />
      ))}
      <points ref={motes} geometry={dust} raycast={() => null}>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(20./-p.z,1.,3.);}`}
          fragmentShader={`void main(){float a=1.-smoothstep(.05,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(.9,.7,.4,a*.55);}`}
        />
      </points>
      <pointLight
        position={[0, 4.8, -2]}
        color="#a5c7ef"
        intensity={9}
        distance={9}
      />
      <spotLight
        position={[-4, 7, 5]}
        target-position={new Vector3(0, 1, 0)}
        color="#ffdbab"
        intensity={100}
        angle={0.85}
        penumbra={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <directionalLight position={[4, 5, -2]} color="#dcb279" intensity={3} />
      <directionalLight position={[-3, 3, 4]} color="#8197b8" intensity={1.0} />
      <hemisphereLight args={["#a8b2c4", "#39291c", 1.5]} />
    </group>
  );
}
