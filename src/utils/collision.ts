import type { MapData, HeartPosition } from '../types/game'
import { TILE_DEFINITIONS } from '../types/game'

/**
 * Check if a position is walkable
 */
export function canMoveTo(
  x: number,
  y: number,
  mapData: MapData
): boolean {
  // Check bounds
  if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) {
    return false
  }
  
  // Check ground layer is walkable
  const groundTile = mapData.layers.ground[y][x]
  const groundDef = TILE_DEFINITIONS[groundTile]
  if (!groundDef.walkable) {
    return false
  }
  
  // Check objects layer
  const objectTile = mapData.layers.objects[y][x]
  if (objectTile !== null) {
    const objectDef = TILE_DEFINITIONS[objectTile]
    if (!objectDef.walkable) {
      return false
    }
  }
  
  // Check for multi-tile objects (house is 3x3)
  // Need to check if this position is occupied by a multi-tile object
  for (let checkY = Math.max(0, y - 2); checkY <= y; checkY++) {
    for (let checkX = Math.max(0, x - 2); checkX <= x; checkX++) {
      const obj = mapData.layers.objects[checkY]?.[checkX]
      if (obj !== null && obj !== undefined) {
        const def = TILE_DEFINITIONS[obj]
        const objWidth = def.width ?? 1
        const objHeight = def.height ?? 1
        
        // Check if (x, y) falls within this object's bounds
        if (
          x >= checkX && x < checkX + objWidth &&
          y >= checkY && y < checkY + objHeight
        ) {
          if (!def.walkable) {
            return false
          }
        }
      }
    }
  }
  
  return true
}

/**
 * Check if player has collected a heart at current position
 */
export function checkHeartCollision(
  playerPos: { x: number; y: number },
  heartPositions: HeartPosition[],
  collectedHearts: Set<number>
): number | null {
  for (const heart of heartPositions) {
    if (
      playerPos.x === heart.x &&
      playerPos.y === heart.y &&
      !collectedHearts.has(heart.photoIndex)
    ) {
      return heart.photoIndex
    }
  }
  return null
}

/**
 * Check if player has reached the house entrance
 * House is 3x3, door is at center bottom of house
 */
export function checkHouseCollision(
  playerPos: { x: number; y: number },
  housePosition: { x: number; y: number },
  collectedHearts: Set<number>,
  totalHearts: number
): boolean {
  // Door is at center of house, one tile below the house
  const doorX = housePosition.x + 1
  const doorY = housePosition.y + 3 // Just below house
  
  // TODO: Remove this hack after testing
  // Only trigger if all hearts collected
  // if (collectedHearts.size < totalHearts) {
  //   return false
  // }
  
  return playerPos.x === doorX && playerPos.y === doorY
}

/**
 * Get the next position based on direction
 */
export function getNextPosition(
  current: { x: number; y: number },
  direction: 'up' | 'down' | 'left' | 'right'
): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: current.x, y: current.y - 1 }
    case 'down':
      return { x: current.x, y: current.y + 1 }
    case 'left':
      return { x: current.x - 1, y: current.y }
    case 'right':
      return { x: current.x + 1, y: current.y }
  }
}
