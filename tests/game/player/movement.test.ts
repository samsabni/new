import { describe, expect, it } from "vitest";

import {
  getFacingDirection,
  getMovementVector,
  type MovementState
} from "../../../src/game/player/movement";

const idle: MovementState = {
  up: false,
  down: false,
  left: false,
  right: false
};

describe("getMovementVector", () => {
  it("returns zero movement when no keys are pressed", () => {
    expect(getMovementVector(idle, 120)).toEqual({ x: 0, y: 0 });
  });

  it("moves at full speed on one axis", () => {
    expect(getMovementVector({ ...idle, right: true }, 120)).toEqual({
      x: 120,
      y: 0
    });
  });

  it("normalizes diagonal movement", () => {
    const vector = getMovementVector({ ...idle, up: true, right: true }, 120);

    expect(vector.x).toBeCloseTo(84.8528, 4);
    expect(vector.y).toBeCloseTo(-84.8528, 4);
  });
});

describe("getFacingDirection", () => {
  it("updates facing when movement input exists", () => {
    expect(getFacingDirection({ ...idle, left: true }, "down")).toBe("left");
  });

  it("keeps the previous facing when idle", () => {
    expect(getFacingDirection(idle, "right")).toBe("right");
  });
});
