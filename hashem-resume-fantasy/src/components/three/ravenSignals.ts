export const RAVEN_GESTURE = "codex:raven-gesture";
export type RavenGesture = "greet" | "prepare" | "attend";

// Only an animation cue crosses this boundary; message contents stay in the form.
export function signalRaven(gesture: RavenGesture) {
  window.dispatchEvent(new CustomEvent(RAVEN_GESTURE, { detail: gesture }));
}
