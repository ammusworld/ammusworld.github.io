import { useMemo } from 'react'

interface CameraState {
  x: number
  y: number
}

interface UseCameraParams {
  playerPixelPos: { x: number; y: number }
  mapWidth: number
  mapHeight: number
  viewportWidth: number
  viewportHeight: number
  tileSize: number
}

/**
 * Calculate camera position to keep player centered, clamped to map bounds
 */
export function useCamera({
  playerPixelPos,
  mapWidth,
  mapHeight,
  viewportWidth,
  viewportHeight,
  tileSize,
}: UseCameraParams): CameraState {
  return useMemo(() => {
    // Calculate ideal camera position (player centered) using pixel position
    const idealX = playerPixelPos.x - viewportWidth / 2 + tileSize / 2
    const idealY = playerPixelPos.y - viewportHeight / 2 + tileSize / 2
    
    // Calculate max camera position (map size - viewport size)
    const maxX = mapWidth * tileSize - viewportWidth
    const maxY = mapHeight * tileSize - viewportHeight
    
    return {
      x: Math.max(0, Math.min(idealX, maxX)),
      y: Math.max(0, Math.min(idealY, maxY)),
    }
  }, [playerPixelPos.x, playerPixelPos.y, mapWidth, mapHeight, viewportWidth, viewportHeight, tileSize])
}

/**
 * Calculate which tiles are visible in the viewport
 */
export function useVisibleTiles(
  camera: CameraState,
  viewportWidth: number,
  viewportHeight: number,
  tileSize: number
) {
  return useMemo(() => {
    const startX = Math.floor(camera.x / tileSize) - 1
    const startY = Math.floor(camera.y / tileSize) - 1
    const endX = startX + Math.ceil(viewportWidth / tileSize) + 2
    const endY = startY + Math.ceil(viewportHeight / tileSize) + 2
    
    return {
      startX: Math.max(0, startX),
      startY: Math.max(0, startY),
      endX,
      endY,
    }
  }, [camera.x, camera.y, viewportWidth, viewportHeight, tileSize])
}
