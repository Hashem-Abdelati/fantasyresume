export const DOOR_THRESHOLD_Z = 15;
export const WALK_DURATION = 8.2;
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** Physical camera and hinge poses, in the same world units as the doorway GLB. */
export function entrancePose(elapsed: number) {
  const door = smooth(elapsed / 2.5);
  const walking = clamp((elapsed - 1.0) / 6.8);
  const progress = smooth(walking);
  const steps = Math.sin(Math.PI * walking);
  return {
    doorAngle: door * 1.78,
    x: Math.sin((elapsed - 1) * 5.1) * 0.018 * steps,
    y: 3.3 + Math.sin((elapsed - 1) * 10.2) * 0.026 * steps,
    z: 25 - 12.9 * progress,
    lookY: 3.3 - 1.65 * progress,
    roll: Math.sin((elapsed - 1) * 5.1) * 0.0018 * steps,
    complete: elapsed >= WALK_DURATION,
  };
}
