export const TILE_SIZE = 16;
export const ROOM_WIDTH_TILES = 20;
export const ROOM_HEIGHT_TILES = 12;
export const GROUND_TILE_INDEX = 0;

export type GroundPlacement = {
  x: number;
  y: number;
  index: number;
};

export function createGroundPlacements(): GroundPlacement[] {
  const placements: GroundPlacement[] = [];

  for (let y = 0; y < ROOM_HEIGHT_TILES; y += 1) {
    for (let x = 0; x < ROOM_WIDTH_TILES; x += 1) {
      placements.push({ x, y, index: GROUND_TILE_INDEX });
    }
  }

  return placements;
}

export function getSpawnPosition() {
  return {
    x: (ROOM_WIDTH_TILES * TILE_SIZE) / 2,
    y: (ROOM_HEIGHT_TILES * TILE_SIZE) / 2
  };
}
