import { describe, expect, it } from "vitest";

import { createGameConfig } from "../../src/game/gameConfig";
import {
  ROOM_HEIGHT_TILES,
  ROOM_WIDTH_TILES,
  TILE_SIZE
} from "../../src/game/room/groundLayout";

describe("createGameConfig", () => {
  it("sizes the game to the single room", () => {
    const config = createGameConfig();

    expect(config.width).toBe(ROOM_WIDTH_TILES * TILE_SIZE);
    expect(config.height).toBe(ROOM_HEIGHT_TILES * TILE_SIZE);
    expect(config.pixelArt).toBe(true);
  });

  it("registers exactly one scene", () => {
    const config = createGameConfig();
    const scenes = Array.isArray(config.scene) ? config.scene : [config.scene];

    expect(scenes).toHaveLength(1);
  });
});
