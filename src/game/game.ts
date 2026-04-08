import * as Phaser from "phaser";

import { createGameConfig } from "./gameConfig";

let game: Phaser.Game | null = null;

export function mountGame() {
  if (!game) {
    game = new Phaser.Game(createGameConfig());
  }

  return game;
}
