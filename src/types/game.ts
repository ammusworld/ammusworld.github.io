// Game type definitions

export type Character = 'dudu' | 'chungu'

export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameScreen = 'select' | 'instructions' | 'game' | 'cutscene' | 'finale'

export interface Position {
  x: number
  y: number
}

export interface GameState {
  screen: GameScreen
  character: Character | null
  collectedHearts: Set<number>
  playerPosition: Position
}

// Tile system
export const TileType = {
  // Walkable ground
  GRASS: 0,
  GRASS_FLOWERS: 1,
  DIRT_PATH: 2,
  PAVED_PATH: 3,
  
  // Non-walkable obstacles
  TREE: 10,
  BUSH: 11,
  ROCK: 12,
  WATER: 13,
  FENCE: 14,
  
  // Special tiles
  HOUSE: 20,
  HEART_SPAWN: 30,
} as const

export type TileType = typeof TileType[keyof typeof TileType]

export interface TileDefinition {
  type: TileType
  walkable: boolean
  sprite: string
  width?: number  // For multi-tile objects (default: 1)
  height?: number // For multi-tile objects (default: 1)
}

export const TILE_DEFINITIONS: Record<TileType, TileDefinition> = {
  [TileType.GRASS]: { type: TileType.GRASS, walkable: true, sprite: 'grass' },
  [TileType.GRASS_FLOWERS]: { type: TileType.GRASS_FLOWERS, walkable: true, sprite: 'grassFlowers' },
  [TileType.DIRT_PATH]: { type: TileType.DIRT_PATH, walkable: true, sprite: 'dirtPath' },
  [TileType.PAVED_PATH]: { type: TileType.PAVED_PATH, walkable: true, sprite: 'pavedPath' },
  [TileType.TREE]: { type: TileType.TREE, walkable: false, sprite: 'tree', height: 2 },
  [TileType.BUSH]: { type: TileType.BUSH, walkable: false, sprite: 'bush' },
  [TileType.ROCK]: { type: TileType.ROCK, walkable: false, sprite: 'bush' }, // Use bush sprite as fallback
  [TileType.WATER]: { type: TileType.WATER, walkable: false, sprite: 'water' },
  [TileType.FENCE]: { type: TileType.FENCE, walkable: false, sprite: 'bush' }, // Use bush sprite as fallback
  [TileType.HOUSE]: { type: TileType.HOUSE, walkable: false, sprite: 'house', width: 3, height: 3 },
  [TileType.HEART_SPAWN]: { type: TileType.HEART_SPAWN, walkable: true, sprite: 'grass' },
}

export interface HeartPosition {
  x: number
  y: number
  photoIndex: number
}

export interface StreetLabel {
  name: string
  x: number
  y: number
  rotation?: number // degrees, 0 = horizontal, 90 = vertical
}

export interface MapData {
  width: number
  height: number
  layers: {
    ground: TileType[][]
    objects: (TileType | null)[][]
    overhead: (TileType | null)[][]
  }
  playerSpawn: Position
  housePosition: Position
  heartPositions: HeartPosition[]
  streetLabels: StreetLabel[]
}
