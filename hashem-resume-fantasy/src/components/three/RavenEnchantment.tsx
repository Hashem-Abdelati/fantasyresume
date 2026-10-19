import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group, MathUtils, Points, PointLight } from "three";
import { RAVEN_GESTURE, type RavenGesture } from "./ravenSignals";

type Props = {
  object: Group;
  active: boolean;
  hovered: boolean;
  reduced: boolean;
};

export default function RavenEnchantment({
  object,
  active,
  hovered,
  reduced,
}: Props) {
  const motes = useRef<Points>(null);
  const light = useRef<PointLight>(null);
  const motion = useRef({
    time: 0,
    gestureTime: 10,
    gesture: "greet" as RavenGesture,
    attention: 0,
  });
  const rig = useMemo(() => {
    const find = (name: string) => object.getObjectByName(name);
    const nodes = {
      body: find("raven_body"),
      head: find("raven_head"),
      eye: find("raven_eye"),
      left: find("raven_wing_left"),
      right: find("raven_wing_right"),
      tail: find("raven_tail"),
    };
    return nodes;
  }, [object]);
  const positions = useMemo(() => {
    const data = new Float32Array(42 * 3);
    for (let i = 0; i < 42; i++) {
      const a = i * 2.39996,
        r = 0.65 + (i % 7) * 0.105;
      data.set(
        [Math.cos(a) * r, 0.45 + (i / 42) * 2.7, Math.sin(a) * 0.45],
        i * 3,
      );
    }
    return data;
  }, []);
  useEffect(() => {
    if (!active || reduced) return;
    const receive = (event: Event) => {
      const gesture = (event as CustomEvent<RavenGesture>).detail;
      if (!["greet", "prepare", "attend"].includes(gesture)) return;
      // Repeated focus changes do not restart a gesture that is already playing.
      if (gesture === "attend" && motion.current.gestureTime < 3) return;
      motion.current.gesture = gesture;
      motion.current.gestureTime = 0;
    };
    window.addEventListener(RAVEN_GESTURE, receive);
    return () => window.removeEventListener(RAVEN_GESTURE, receive);
  }, [active, reduced]);
  useEffect(() => {
    motion.current.gestureTime = 10;
    for (const node of [rig.body, rig.head, rig.left, rig.right, rig.tail])
      node?.rotation.set(0, 0, 0);
    rig.head?.rotation.set(0, -0.18, 0);
    rig.body?.scale.setScalar(1);
    rig.eye?.scale.setScalar(1);
  }, [active, reduced, rig]);

  // Three.js owns this cloned, imperative animation rig; React never renders its transforms.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (reduced) return;
    const m = motion.current,
      dt = Math.min(delta, 0.05);
    m.time += dt;
    m.gestureTime += dt;
    m.attention = MathUtils.damp(m.attention, hovered ? 1 : 0, 4, dt);
    const t = m.time,
      g = m.gestureTime;
    // A slow unfurl, a short feather flutter, then a deliberate fold back to rest.
    const duration = m.gesture === "prepare" ? 4.4 : 3.2;
    const envelope = g < duration ? Math.sin((Math.PI * g) / duration) ** 2 : 0;
    const strength =
      m.gesture === "attend" ? 0.18 : m.gesture === "prepare" ? 1 : 0.72;
    const gesture = envelope * strength;
    const stretch =
      Math.max(0, Math.sin((((t % 16) - 11) / 3) * Math.PI)) ** 6 *
      (t % 16 > 11 ? 0.2 : 0);
    const spread =
      0.025 +
      m.attention * 0.17 +
      stretch +
      gesture * (0.94 + 0.08 * Math.sin(g * 12));
    // The anatomical wings rest along the flanks and open out from the shoulders.
    if (rig.left) {
      rig.left.rotation.x = -spread;
      rig.left.rotation.z = -spread * 0.12;
    }
    if (rig.right) {
      rig.right.rotation.x = spread;
      rig.right.rotation.z = spread * 0.12;
    }
    if (rig.body) {
      rig.body.scale.y = 1 + Math.sin(t * 1.65) * 0.005;
      rig.body.rotation.z = -0.025 * gesture;
    }
    if (rig.head) {
      rig.head.rotation.y =
        -0.18 + Math.sin(t * 0.55) * 0.065 - m.attention * 0.14;
      rig.head.rotation.z =
        Math.sin(t * 0.9) * 0.027 + m.attention * 0.065 - gesture * 0.075;
      rig.head.rotation.x = Math.sin(t * 0.38) * 0.022;
    }
    if (rig.eye) {
      const blink = t % 5.7;
      rig.eye.scale.y =
        blink > 5.48
          ? 1 - 0.92 * Math.sin(((blink - 5.48) / 0.22) * Math.PI)
          : 1;
    }
    if (rig.tail)
      rig.tail.rotation.y = Math.sin(t * 0.75) * 0.025 + gesture * 0.12;
    if (motes.current) {
      motes.current.rotation.y += dt * (0.085 + gesture * 0.45);
      motes.current.position.y = Math.sin(t * 0.6) * 0.09;
      motes.current.scale.setScalar(1 + gesture * 0.14);
    }
    if (light.current)
      light.current.intensity = (active ? 2.6 : 1.2) + gesture * 3;
  });
  /* eslint-enable react-hooks/immutability */
  return (
    <group>
      <points ref={motes} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(16./-p.z,1.,4.);}`}
          fragmentShader={`void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.08,.5,d);gl_FragColor=vec4(.55,.78,1.,a*.7);}`}
        />
      </points>
      <pointLight
        ref={light}
        position={[-0.65, 2.3, 1]}
        color="#85bde9"
        intensity={active ? 2.6 : 1.2}
        distance={4}
      />
    </group>
  );
}
