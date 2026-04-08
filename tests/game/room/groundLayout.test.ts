import { describe, expect, it } from "vitest";

import {
  GROUND_TILE_INDEX,
  ROOM_HEIGHT_TILES,
  ROOM_WIDTH_TILES,
  TILE_SIZE,
  createGroundPlacements,
  getSpawnPosition
} from "../../../src/game/room/groundLayout";

describe("createGroundPlacements", () => {
  it("fills the room with one ground tile index", () => {
    const placements = createGroundPlacements();

    expect(placements).toHaveLength(ROOM_WIDTH_TILES * ROOM_HEIGHT_TILES);
    expect(placements[0]).toEqual({ x: 0, y: 0, index: GROUND_TILE_INDEX });
    expect(placements.at(-1)).toEqual({
      x: ROOM_WIDTH_TILES - 1,
      y: ROOM_HEIGHT_TILES - 1,
      index: GROUND_TILE_INDEX
    });
    expect(new Set(placements.map((placement) => placement.index))).toEqual(
      new Set([GROUND_TILE_INDEX])
    );
  });
});

describe("getSpawnPosition", () => {
  it("returns the room center in pixels", () => {
    expect(getSpawnPosition()).toEqual({
      x: (ROOM_WIDTH_TILES * TILE_SIZE) / 2,
      y: (ROOM_HEIGHT_TILES * TILE_SIZE) / 2
    });
  });
});
