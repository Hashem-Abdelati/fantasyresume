import { test, expect } from "@playwright/test";
import {
  entrancePose,
  DOOR_THRESHOLD_Z,
  WALK_DURATION,
} from "../src/components/three/entranceMotion";

test("walking camera crosses the physical threshold only after both doors clear its path", () => {
  test.skip(
    test.info().project.name !== "chromium",
    "Pure geometry check runs once.",
  );
  expect(entrancePose(0).z).toBeGreaterThan(DOOR_THRESHOLD_Z);
  let previous = entrancePose(0),
    crossed = false;
  for (let time = 0; time <= WALK_DURATION + 0.01; time += 0.025) {
    const pose = entrancePose(time);
    expect(pose.z).toBeLessThanOrEqual(previous.z + 0.0001);
    expect(Math.abs(pose.x)).toBeLessThan(0.025);
    expect(Math.abs(pose.y - 3.3)).toBeLessThan(0.035);
    if (pose.z <= DOOR_THRESHOLD_Z && previous.z > DOOR_THRESHOLD_Z) {
      crossed = true;
      expect(pose.doorAngle).toBeGreaterThan(Math.PI / 2);
    }
    previous = pose;
  }
  expect(crossed).toBe(true);
  expect(entrancePose(WALK_DURATION)).toMatchObject({ complete: true });
  expect(entrancePose(WALK_DURATION).z).toBeCloseTo(12.1);
  expect(entrancePose(WALK_DURATION).y).toBeCloseTo(3.3);
  expect(entrancePose(WALK_DURATION).lookY).toBeCloseTo(1.65);
});
