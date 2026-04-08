export type MovementState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type FacingDirection = "up" | "down" | "left" | "right";

export function getMovementVector(input: MovementState, speed: number) {
  let x = 0;
  let y = 0;

  if (input.left) {
    x -= 1;
  }

  if (input.right) {
    x += 1;
  }

  if (input.up) {
    y -= 1;
  }

  if (input.down) {
    y += 1;
  }

  if (x === 0 && y === 0) {
    return { x: 0, y: 0 };
  }

  if (x !== 0 && y !== 0) {
    const diagonalSpeed = speed * Math.SQRT1_2;
    return { x: x * diagonalSpeed, y: y * diagonalSpeed };
  }

  return { x: x * speed, y: y * speed };
}

export function getFacingDirection(
  input: MovementState,
  previousFacing: FacingDirection
): FacingDirection {
  if (input.left) {
    return "left";
  }

  if (input.right) {
    return "right";
  }

  if (input.up) {
    return "up";
  }

  if (input.down) {
    return "down";
  }

  return previousFacing;
}
