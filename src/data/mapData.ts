import type { MapData, StreetLabel } from '../types/game'
import { TileType } from '../types/game'

const T = TileType

// Map dimensions
const WIDTH = 45
const HEIGHT = 35

// Helper to create a row filled with a tile type
function fillRow(tile: typeof T[keyof typeof T], width: number = WIDTH): typeof T[keyof typeof T][] {
  return new Array<typeof T[keyof typeof T]>(width).fill(tile)
}

// Helper to create empty object row
function emptyObjectRow(width: number = WIDTH): null[] {
  return new Array<null>(width).fill(null)
}

// Helper to draw a horizontal paved road
function drawHorizontalRoad(ground: typeof T[keyof typeof T][][], y: number, startX: number, endX: number): void {
  for (let x = startX; x <= endX; x++) {
    if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
      ground[y][x] = T.PAVED_PATH
    }
    if (y + 1 >= 0 && y + 1 < HEIGHT && x >= 0 && x < WIDTH) {
      ground[y + 1][x] = T.PAVED_PATH
    }
  }
}

// Helper to draw a vertical paved road
function drawVerticalRoad(ground: typeof T[keyof typeof T][][], x: number, startY: number, endY: number): void {
  for (let y = startY; y <= endY; y++) {
    if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
      ground[y][x] = T.PAVED_PATH
    }
    if (y >= 0 && y < HEIGHT && x + 1 >= 0 && x + 1 < WIDTH) {
      ground[y][x + 1] = T.PAVED_PATH
    }
  }
}

// Create ground layer - accurate street grid
function createGroundLayer(): typeof T[keyof typeof T][][] {
  const ground: typeof T[keyof typeof T][][] = []
  
  // Initialize with grass
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(fillRow(T.GRASS))
  }
  
  // Flower decorations
  const flowerPositions = [
    { x: 5, y: 10 }, { x: 8, y: 15 }, { x: 12, y: 8 },
    { x: 18, y: 12 }, { x: 25, y: 10 }, { x: 30, y: 15 },
    { x: 15, y: 22 }, { x: 22, y: 25 }, { x: 35, y: 20 },
  ]
  for (const pos of flowerPositions) {
    if (pos.y >= 0 && pos.y < HEIGHT && pos.x >= 0 && pos.x < WIDTH) {
      ground[pos.y][pos.x] = T.GRASS_FLOWERS
    }
  }
  
  // ===== HORIZONTAL ROADS (parallel) =====
  
  // FLATBUSH DR - top horizontal road (y=6-7)
  // Finial Dr becomes Flatbush from the right (spawn entrance)
  drawHorizontalRoad(ground, 6, 4, 43)
  
  // THE RAVINE WY - middle horizontal road (y=16-17)
  // Extended to reach Prospect Park area on the left
  drawHorizontalRoad(ground, 16, 1, 36)
  
  // BOATHOUSE DR - bottom horizontal road (y=26-27)
  drawHorizontalRoad(ground, 26, 4, 36)
  
  // ===== VERTICAL ROADS (parallel) =====
  
  // PERISTYLE DR - left vertical road (x=8-9)
  drawVerticalRoad(ground, 8, 6, 30)
  
  // AMBERGILL CT - center vertical road (x=22-23)
  drawVerticalRoad(ground, 22, 6, 30)
  
  // TURACO TRL - right vertical road (x=34-35)
  drawVerticalRoad(ground, 34, 6, 30)
  
  // ===== LAKE below spawn point (right side) =====
  for (let y = 10; y <= 18; y++) {
    for (let x = 38; x <= 42; x++) {
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
  
  // Add border trees (leave spawn area on right side open for Finial Dr)
  for (let x = 0; x < WIDTH; x++) {
    objects[0][x] = T.TREE
    objects[HEIGHT - 1][x] = T.TREE
  }
  for (let y = 1; y < HEIGHT - 1; y++) {
    objects[y][0] = T.TREE
    if (y < 5 || y > 9) { // Leave spawn entrance open at Finial Dr level
      objects[y][WIDTH - 1] = T.TREE
    }
  }
  
  // ===== SCATTERED TREES (avoiding roads and lake) =====
  const treePositions = [
    // Top left area
    { x: 2, y: 3 }, { x: 5, y: 2 }, { x: 3, y: 10 }, { x: 5, y: 12 },
    // Between Peristyle and Ambergill
    { x: 12, y: 10 }, { x: 15, y: 12 }, { x: 18, y: 10 }, { x: 13, y: 22 },
    // Between Ambergill and Turaco
    { x: 26, y: 10 }, { x: 29, y: 12 }, { x: 27, y: 22 }, { x: 30, y: 24 },
    // Right side (moved outside lake area - lake is x=38-42, y=10-18)
    { x: 37, y: 20 }, { x: 40, y: 20 }, { x: 38, y: 22 }, { x: 41, y: 25 },
    // Bottom area
    { x: 4, y: 30 }, { x: 12, y: 30 }, { x: 28, y: 30 },
  ]
  for (const pos of treePositions) {
    if (pos.y > 0 && pos.y < HEIGHT - 1 && pos.x > 0 && pos.x < WIDTH - 1) {
      objects[pos.y][pos.x] = T.TREE
    }
  }
  
  // ===== BUSHES (decorative) =====
  const bushPositions = [
    { x: 6, y: 4 }, { x: 14, y: 4 }, { x: 28, y: 4 },
    { x: 6, y: 14 }, { x: 14, y: 20 }, { x: 30, y: 14 },
    { x: 6, y: 24 }, { x: 19, y: 24 }, { x: 30, y: 20 },
  ]
  for (const pos of bushPositions) {
    if (objects[pos.y]?.[pos.x] === null) {
      objects[pos.y][pos.x] = T.BUSH
    }
  }
  
  // ===== HOUSE on The Ravine Wy, near Ambergill Ct (pink X location) =====
  // House anchor at x=18, y=18 (3x3 house will occupy 18-20, 18-20)
  objects[18][18] = T.HOUSE
  
  return objects
}

// Create overhead layer
function createOverheadLayer(): (typeof T[keyof typeof T] | null)[][] {
  const overhead: (typeof T[keyof typeof T] | null)[][] = []
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(emptyObjectRow())
  }
  return overhead
}

// Street labels
const STREET_LABELS: StreetLabel[] = [
  // Horizontal roads
  { name: 'Flatbush Dr', x: 15, y: 5, rotation: 0 },
  { name: 'Finial Dr', x: 38, y: 5, rotation: 0 },
  { name: 'The Ravine Wy', x: 13, y: 15, rotation: 0 },
  { name: 'Boathouse Dr', x: 15, y: 25, rotation: 0 },
  // Vertical roads
  { name: 'Peristyle Dr', x: 7, y: 11, rotation: 90 },
  { name: 'Ambergill Ct', x: 21, y: 11, rotation: 90 },
  { name: 'Turaco Trl', x: 33, y: 11, rotation: 90 },
]

export const MAP_DATA: MapData = {
  width: WIDTH,
  height: HEIGHT,
  layers: {
    ground: createGroundLayer(),
    objects: createObjectsLayer(),
    overhead: createOverheadLayer(),
  },
  // Spawn at Finial Dr (right side, entering as Flatbush Dr)
  playerSpawn: { x: 42, y: 7 },
  // House on The Ravine Wy, near Ambergill Ct (pink X location)
  housePosition: { x: 18, y: 18 },
  heartPositions: [
    { x: 10, y: 7, photoIndex: 0 },   // Flatbush Dr near Peristyle
    { x: 28, y: 7, photoIndex: 1 },   // Flatbush Dr near Ambersill
    { x: 9, y: 12, photoIndex: 2 },   // Peristyle Dr upper
    { x: 35, y: 12, photoIndex: 3 },  // Turaco Trl upper
    { x: 12, y: 17, photoIndex: 4 },  // Ravine Wy west
    { x: 30, y: 17, photoIndex: 5 },  // Ravine Wy east
    { x: 9, y: 22, photoIndex: 6 },   // Peristyle Dr lower
    { x: 23, y: 22, photoIndex: 7 },  // Ambersill Ct lower
    { x: 15, y: 27, photoIndex: 8 },  // Boathouse Dr west
    { x: 30, y: 27, photoIndex: 9 },  // Boathouse Dr east
  ],
  streetLabels: STREET_LABELS,
}

export const TILE_SIZE = 32
export const VIEWPORT_WIDTH = 960  // 30 tiles
export const VIEWPORT_HEIGHT = 704 // 22 tiles
