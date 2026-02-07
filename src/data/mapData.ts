import type { MapData } from '../types/game'
import { TileType } from '../types/game'

const T = TileType

// Map dimensions
const WIDTH = 40
const HEIGHT = 30

// Helper to create a row filled with a tile type
function fillRow(tile: typeof T[keyof typeof T], width: number = WIDTH): typeof T[keyof typeof T][] {
  return new Array<typeof T[keyof typeof T]>(width).fill(tile)
}

// Helper to create empty object row
function emptyObjectRow(width: number = WIDTH): null[] {
  return new Array<null>(width).fill(null)
}

// Create ground layer - mostly grass with paths
function createGroundLayer(): typeof T[keyof typeof T][][] {
  const ground: typeof T[keyof typeof T][][] = []
  
  // Initialize with grass
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(fillRow(T.GRASS))
  }
  
  // Add deterministic flower patches near heart positions and special areas
  const flowerPositions = [
    // Near hearts for visual hints
    { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 5 },
    { x: 12, y: 6 }, { x: 14, y: 6 }, { x: 13, y: 7 },
    { x: 2, y: 12 }, { x: 4, y: 12 }, { x: 3, y: 13 },
    { x: 24, y: 12 }, { x: 26, y: 12 }, { x: 25, y: 13 },
    { x: 2, y: 18 }, { x: 4, y: 18 },
    { x: 24, y: 18 }, { x: 26, y: 18 },
    { x: 26, y: 22 }, { x: 28, y: 22 },
    { x: 10, y: 24 }, { x: 12, y: 24 },
    { x: 4, y: 27 }, { x: 6, y: 27 }, { x: 5, y: 26 },
    { x: 29, y: 10 }, { x: 31, y: 10 },
    // Scattered decoration
    { x: 8, y: 15 }, { x: 15, y: 20 }, { x: 32, y: 25 },
    { x: 7, y: 3 }, { x: 35, y: 6 }, { x: 10, y: 10 },
  ]
  
  for (const pos of flowerPositions) {
    if (pos.y >= 0 && pos.y < HEIGHT && pos.x >= 0 && pos.x < WIDTH) {
      ground[pos.y][pos.x] = T.GRASS_FLOWERS
    }
  }
  
  // Main paved path from spawn to house (central corridor)
  const mainPath = [
    // Vertical central path
    ...Array.from({ length: 24 }, (_, i) => ({ x: 19, y: 28 - i })),
    { x: 20, y: 28 }, { x: 20, y: 27 }, { x: 20, y: 26 },
    { x: 18, y: 28 }, { x: 18, y: 27 }, { x: 18, y: 26 },
  ]
  
  for (const point of mainPath) {
    if (point.y >= 5 && point.y < HEIGHT && point.x >= 0 && point.x < WIDTH) {
      ground[point.y][point.x] = T.PAVED_PATH
    }
  }
  
  // Paved area in front of house
  for (let y = 3; y <= 5; y++) {
    for (let x = 17; x <= 21; x++) {
      ground[y][x] = T.PAVED_PATH
    }
  }
  
  // West branch paths (to hearts at (3,4), (3,12), (3,18), (5,28))
  const westPaths = [
    // Branch from main path west at y=6
    ...Array.from({ length: 16 }, (_, i) => ({ x: 18 - i, y: 6 })),
    // South from x=3
    ...Array.from({ length: 15 }, (_, i) => ({ x: 3, y: 6 + i })),
    ...Array.from({ length: 15 }, (_, i) => ({ x: 4, y: 6 + i })),
    // Connect to (5,28)
    ...Array.from({ length: 8 }, (_, i) => ({ x: 5, y: 21 + i })),
    // North branch to (3,4)
    { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 4 },
  ]
  
  for (const point of westPaths) {
    if (point.y >= 0 && point.y < HEIGHT && point.x >= 0 && point.x < WIDTH) {
      ground[point.y][point.x] = T.DIRT_PATH
    }
  }
  
  // East branch paths (to hearts at (25,12), (25,18), (27,22), (30,10))
  const eastPaths = [
    // Branch from main path east at y=10
    ...Array.from({ length: 12 }, (_, i) => ({ x: 20 + i, y: 10 })),
    // South from x=25
    ...Array.from({ length: 14 }, (_, i) => ({ x: 25, y: 10 + i })),
    ...Array.from({ length: 14 }, (_, i) => ({ x: 26, y: 10 + i })),
    // Branch to (27,22)
    ...Array.from({ length: 4 }, (_, i) => ({ x: 26 + i, y: 22 })),
    // Branch to (30,10)
    { x: 27, y: 10 }, { x: 28, y: 10 }, { x: 29, y: 10 }, { x: 30, y: 10 }, { x: 31, y: 10 },
    // Branch from main path at y=6 to (13,6)
    ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 6 })),
  ]
  
  for (const point of eastPaths) {
    if (point.y >= 0 && point.y < HEIGHT && point.x >= 0 && point.x < WIDTH) {
      ground[point.y][point.x] = T.DIRT_PATH
    }
  }
  
  // South branch to (11,24)
  const southBranch = [
    ...Array.from({ length: 8 }, (_, i) => ({ x: 19 - i, y: 24 })),
    { x: 11, y: 24 }, { x: 12, y: 24 },
  ]
  
  for (const point of southBranch) {
    if (point.y >= 0 && point.y < HEIGHT && point.x >= 0 && point.x < WIDTH) {
      ground[point.y][point.x] = T.DIRT_PATH
    }
  }
  
  // Water features (careful not to block paths)
  // West pond (moved to avoid path)
  for (let x = 6; x <= 8; x++) {
    for (let y = 14; y <= 16; y++) {
      ground[y][x] = T.WATER
    }
  }
  
  // East pond
  for (let x = 33; x <= 36; x++) {
    for (let y = 18; y <= 20; y++) {
      ground[y][x] = T.WATER
    }
  }
  
  return ground
}

// Create objects layer - trees, bushes, house
function createObjectsLayer(): (typeof T[keyof typeof T] | null)[][] {
  const objects: (typeof T[keyof typeof T] | null)[][] = []
  
  for (let y = 0; y < HEIGHT; y++) {
    objects.push(emptyObjectRow())
  }
  
  // Add border trees (leave spawn area open)
  for (let x = 0; x < WIDTH; x++) {
    if (x < 17 || x > 21) { // Leave spawn area open
      objects[0][x] = T.TREE
      objects[HEIGHT - 1][x] = T.TREE
    }
  }
  for (let y = 1; y < HEIGHT - 1; y++) {
    objects[y][0] = T.TREE
    objects[y][WIDTH - 1] = T.TREE
  }
  
  // Add scattered trees (avoiding paths and heart positions)
  const treePositions = [
    // Northern area near house
    { x: 5, y: 2 }, { x: 8, y: 3 }, { x: 10, y: 2 }, { x: 12, y: 3 },
    { x: 26, y: 2 }, { x: 28, y: 3 }, { x: 32, y: 2 }, { x: 35, y: 3 },
    // Western side
    { x: 2, y: 8 }, { x: 8, y: 10 }, { x: 10, y: 8 },
    { x: 2, y: 22 }, { x: 8, y: 24 },
    // Eastern side  
    { x: 32, y: 6 }, { x: 35, y: 8 }, { x: 37, y: 12 },
    { x: 32, y: 24 }, { x: 35, y: 26 },
    // Central scattered
    { x: 15, y: 12 }, { x: 15, y: 18 },
    { x: 23, y: 14 }, { x: 23, y: 20 },
  ]
  
  for (const pos of treePositions) {
    objects[pos.y][pos.x] ??= T.TREE
  }
  
  // Add bushes
  const bushPositions = [
    { x: 7, y: 7 }, { x: 9, y: 4 }, { x: 4, y: 18 }, { x: 6, y: 24 },
    { x: 32, y: 6 }, { x: 34, y: 10 }, { x: 36, y: 20 }, { x: 31, y: 26 },
    { x: 15, y: 10 }, { x: 23, y: 5 }, { x: 26, y: 18 }, { x: 11, y: 26 },
  ]
  
  for (const pos of bushPositions) {
    objects[pos.y][pos.x] ??= T.BUSH
  }
  
  // Place house (3x3 at position 18,2 - so tiles 18-20, 2-4)
  // Mark house position - only mark the anchor point, rendering handles the rest
  objects[2][18] = T.HOUSE
  
  return objects
}

// Create overhead layer - tree tops that render above player
function createOverheadLayer(): (typeof T[keyof typeof T] | null)[][] {
  const overhead: (typeof T[keyof typeof T] | null)[][] = []
  
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(emptyObjectRow())
  }
  
  // Tree tops would go here if we had separate top sprites
  // For now, we'll handle tree rendering in a single layer
  
  return overhead
}

export const MAP_DATA: MapData = {
  width: WIDTH,
  height: HEIGHT,
  layers: {
    ground: createGroundLayer(),
    objects: createObjectsLayer(),
    overhead: createOverheadLayer(),
  },
  playerSpawn: { x: 19, y: 28 },
  housePosition: { x: 18, y: 2 },
  heartPositions: [
    { x: 3, y: 4, photoIndex: 0 },    // West branch - hidden near starting area
    { x: 13, y: 6, photoIndex: 1 },   // Central path - early path discovery  
    { x: 3, y: 12, photoIndex: 2 },   // Southwest loop - small flowers clearing
    { x: 25, y: 12, photoIndex: 3 },  // East branch - past the first fork
    { x: 3, y: 18, photoIndex: 4 },   // West pond area - near water feature
    { x: 25, y: 18, photoIndex: 5 },  // East clearing - open area
    { x: 27, y: 22, photoIndex: 6 },  // Far east - requires exploration
    { x: 11, y: 24, photoIndex: 7 },  // Southern path - side branch
    { x: 5, y: 26, photoIndex: 8 },   // Southwest corner - off main path
    { x: 30, y: 10, photoIndex: 9 },  // Far east glade - hidden area
  ],
}

export const TILE_SIZE = 32
export const VIEWPORT_WIDTH = 960  // 30 tiles
export const VIEWPORT_HEIGHT = 704 // 22 tiles
