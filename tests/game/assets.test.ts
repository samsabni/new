import { describe, expect, it } from "vitest";

import {
  FOREST_TILESET_KEY,
  FOREST_TILESET_PATH,
  PLAYER_TEXTURE_KEY,
  PLAYER_TEXTURE_PATH,
  TILESET_FRAME_SIZE
} from "../../src/game/assets";

describe("asset manifest", () => {
  it("pins the exact forest tileset path", () => {
    expect(FOREST_TILESET_KEY).toBe("forest-ground");
    expect(FOREST_TILESET_PATH).toBe("/assets/forest/top-down-forest-tileset.png");
    expect(TILESET_FRAME_SIZE).toBe(16);
  });

  it("pins the exact MetroCity player image path", () => {
    expect(PLAYER_TEXTURE_KEY).toBe("metrocity-player");
    expect(PLAYER_TEXTURE_PATH).toBe("/assets/metrocity/player.png");
  });
});
