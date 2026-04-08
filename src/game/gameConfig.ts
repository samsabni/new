import * as Phaser from "phaser";

import { ROOM_HEIGHT_TILES, ROOM_WIDTH_TILES, TILE_SIZE } from "./room/groundLayout";
import { PlayScene } from "./scenes/PlayScene";

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "app",
    width: ROOM_WIDTH_TILES * TILE_SIZE,
    height: ROOM_HEIGHT_TILES * TILE_SIZE,
    backgroundColor: "#11181f",
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PlayScene]
  };
}
