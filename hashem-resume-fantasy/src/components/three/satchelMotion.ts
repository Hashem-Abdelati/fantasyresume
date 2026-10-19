import type { Object3D } from "three";
import type gsap from "gsap";

export type RestPose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

// Explicit clearance: the cards first leave their slots vertically, then fan
// apart. On close they return inside before the flap swings across the mouth.
export function animateSatchel(
  timeline: ReturnType<typeof gsap.timeline>,
  object: Object3D,
  home: Map<string, RestPose>,
  active: boolean,
  reduced: boolean,
) {
  const time = (seconds: number) => (reduced ? 0 : seconds);
  const flap = object.getObjectByName("satchel_flap");
  if (!flap) return;
  for (const name of ["buckle_left", "buckle_right"]) {
    const buckle = object.getObjectByName(name);
    if (buckle)
      timeline.to(
        buckle.rotation,
        {
          x: active ? 0.38 : (home.get(name)?.rx ?? 0),
          duration: time(0.22),
          ease: "power2.inOut",
        },
        time(active ? 0 : 1.2),
      );
  }
  timeline.to(
    flap.rotation,
    {
      x: active ? -2.05 : (home.get("satchel_flap")?.rx ?? 0),
      duration: time(active ? 1.1 : 0.92),
      ease: "power2.inOut",
    },
    time(active ? 0.13 : 0.55),
  );

  const cards = [...home.keys()].filter((name) => /^artifact_\d+$/.test(name));
  cards.forEach((name, index) => {
    const card = object.getObjectByName(name);
    const base = home.get(name)!;
    if (!card) return;
    const row = Math.floor(index / 4),
      column = index % 4;
    const columns = Math.min(4, cards.length - row * 4);
    const centered = column - (columns - 1) / 2;
    const fanX = centered * 0.64;
    const fanY = 2.33 + (Math.abs(centered) < 1 ? 0.1 : 0) + row * 0.88;
    if (active) {
      timeline.to(
        card.position,
        {
          y: 2.23 + row * 0.88,
          duration: time(0.46),
          ease: "power2.inOut",
        },
        time(0.76 + column * 0.025),
      );
      timeline.to(
        card.position,
        {
          x: fanX,
          y: fanY,
          z: 0.14 - column * 0.025 - row * 0.1,
          duration: time(0.55),
          ease: "power2.out",
        },
        time(1.2 + column * 0.025),
      );
      timeline.to(
        card.rotation,
        {
          x: 0,
          y: 0,
          z: -centered * 0.085,
          duration: time(0.55),
          ease: "power2.out",
        },
        time(1.2 + column * 0.025),
      );
    } else {
      timeline.to(
        card.position,
        {
          x: base.x,
          z: base.z,
          duration: time(0.26),
          ease: "power2.inOut",
        },
        0,
      );
      timeline.to(
        card.rotation,
        {
          x: base.rx,
          y: base.ry,
          z: base.rz,
          duration: time(0.26),
          ease: "power2.inOut",
        },
        0,
      );
      timeline.to(
        card.position,
        {
          y: base.y,
          duration: time(0.38),
          ease: "power2.inOut",
        },
        time(0.2),
      );
    }
  });
}
