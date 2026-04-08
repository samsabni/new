import * as Phaser from "phaser";

import {
  FOREST_TILESET_KEY,
  FOREST_TILESET_PATH,
  PLAYER_FRAME_SIZE,
  PLAYER_START_FRAME,
  PLAYER_TEXTURE_KEY,
  PLAYER_TEXTURE_PATH,
  TILESET_FRAME_SIZE
} from "../assets";
import { getFacingDirection, getMovementVector, type FacingDirection } from "../player/movement";
import {
  ROOM_HEIGHT_TILES,
  ROOM_WIDTH_TILES,
  TILE_SIZE,
  createGroundPlacements,
  getSpawnPosition
} from "../room/groundLayout";

const PLAYER_SPEED = 120;
const PLAYER_SCALE = 2;

type MovementKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private keys!: MovementKeys;
  private facing: FacingDirection = "down";

  constructor() {
    super("play");
  }

  preload() {
    this.load.spritesheet(FOREST_TILESET_KEY, FOREST_TILESET_PATH, {
      frameWidth: TILESET_FRAME_SIZE,
      frameHeight: TILESET_FRAME_SIZE
    });
    this.load.spritesheet(PLAYER_TEXTURE_KEY, PLAYER_TEXTURE_PATH, {
      frameWidth: PLAYER_FRAME_SIZE,
      frameHeight: PLAYER_FRAME_SIZE
    });
  }

  create() {
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: ROOM_WIDTH_TILES,
      height: ROOM_HEIGHT_TILES
    });

    const tileset = map.addTilesetImage(
      FOREST_TILESET_KEY,
      FOREST_TILESET_KEY,
      TILE_SIZE,
      TILE_SIZE
    );

    if (!tileset) {
      throw new Error("Unable to create forest tileset");
    }

    const groundLayer = map.createBlankLayer("ground", tileset, 0, 0);

    if (!groundLayer) {
      throw new Error("Unable to create ground layer");
    }

    for (const placement of createGroundPlacements()) {
      groundLayer.putTileAt(placement.index, placement.x, placement.y);
    }

    const spawn = getSpawnPosition();
    this.player = this.add.sprite(spawn.x, spawn.y, PLAYER_TEXTURE_KEY, PLAYER_START_FRAME);
    this.player.setScale(PLAYER_SCALE);
    this.player.setDepth(1);

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable");
    }

    this.keys = keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D"
    }) as MovementKeys;
  }

  update(_: number, delta: number) {
    const input = {
      up: this.keys.up.isDown,
      down: this.keys.down.isDown,
      left: this.keys.left.isDown,
      right: this.keys.right.isDown
    };

    const velocity = getMovementVector(input, PLAYER_SPEED);
    this.facing = getFacingDirection(input, this.facing);

    this.player.x += velocity.x * (delta / 1000);
    this.player.y += velocity.y * (delta / 1000);

    const halfWidth = this.player.displayWidth / 2;
    const halfHeight = this.player.displayHeight / 2;
    const worldWidth = ROOM_WIDTH_TILES * TILE_SIZE;
    const worldHeight = ROOM_HEIGHT_TILES * TILE_SIZE;

    this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, worldWidth - halfWidth);
    this.player.y = Phaser.Math.Clamp(this.player.y, halfHeight, worldHeight - halfHeight);

    this.player.setFlipX(this.facing === "left");
  }
}
