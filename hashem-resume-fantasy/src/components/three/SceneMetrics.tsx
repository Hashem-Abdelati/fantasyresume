import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
/** Lightweight diagnostics, also lets the scene lower DPR under sustained load. */
export default function SceneMetrics() {
  const sample = useRef({ frames: 0, total: 0, adjusted: false });
  useFrame(({ gl, setDpr }, delta) => {
    if (delta > 0.25) return;
    const state = sample.current;
    state.frames++;
    state.total += delta;
    if (state.frames < 120) return;
    const fps = state.frames / state.total;
    gl.domElement.dataset.fps = fps.toFixed(1);
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
    gl.domElement.dataset.textures = String(gl.info.memory.textures);
    if (fps < 30 && !state.adjusted) {
      setDpr(1);
      state.adjusted = true;
    }
    state.frames = 0;
    state.total = 0;
  });
  return null;
}
