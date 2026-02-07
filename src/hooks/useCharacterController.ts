import { useState, useEffect, useRef, useCallback } from 'react'
import type { Direction, MapData, Position } from '../types/game'
import { canMoveTo } from '../utils/collision'
import { useKeyboardInput } from './useKeyboardInput'

const TILE_SIZE = 32
const MOVE_DURATION = 200 // ms per tile movement

interface UseCharacterControllerOptions {
  initialPos: Position
  mapData: MapData
  tileSize?: number
  onMove?: (newPos: Position) => void
  isPaused?: boolean
}

interface CharacterController {
  gridPos: Position
  pixelPos: Position
  direction: Direction
  isMoving: boolean
  animationFrame: number
}

/**
 * Hook to control character movement with smooth pixel-based animation
 */
export function useCharacterController({
  initialPos,
  mapData,
  tileSize = TILE_SIZE,
  onMove,
  isPaused = false,
}: UseCharacterControllerOptions): CharacterController {
  const [gridPos, setGridPos] = useState<Position>(initialPos)
  const [pixelPos, setPixelPos] = useState<Position>({
    x: initialPos.x * tileSize,
    y: initialPos.y * tileSize,
  })
  const [direction, setDirection] = useState<Direction>('down')
  const [isMoving, setIsMoving] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)
  
  const animationRef = useRef<number | null>(null)
  const keys = useKeyboardInput()
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  // Animate movement from one tile to another
  const startMoveAnimation = useCallback((
    from: Position,
    to: Position,
    onComplete: () => void
  ) => {
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / MOVE_DURATION, 1)
      
      // Linear interpolation (could add easing)
      setPixelPos({
        x: from.x * tileSize + (to.x - from.x) * tileSize * progress,
        y: from.y * tileSize + (to.y - from.y) * tileSize * progress,
      })
      
      // Update walk animation frame (4 frames)
      setAnimationFrame(Math.floor((elapsed / 80)) % 4)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setPixelPos({
          x: to.x * tileSize,
          y: to.y * tileSize,
        })
        setAnimationFrame(0)
        onComplete()
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [tileSize])
  
  // Handle movement based on key state
  useEffect(() => {
    if (isMoving || isPaused) return
    
    let targetDir: Direction | null = null
    let dx = 0
    let dy = 0
    
    // Priority: Up > Down > Left > Right
    if (keys.up) {
      targetDir = 'up'
      dy = -1
    } else if (keys.down) {
      targetDir = 'down'
      dy = 1
    } else if (keys.left) {
      targetDir = 'left'
      dx = -1
    } else if (keys.right) {
      targetDir = 'right'
      dx = 1
    }
    
    if (targetDir) {
      setDirection(targetDir)
      
      const newX = gridPos.x + dx
      const newY = gridPos.y + dy
      
      if (canMoveTo(newX, newY, mapData)) {
        const fromPos = { ...gridPos }
        const toPos = { x: newX, y: newY }
        
        setIsMoving(true)
        setGridPos(toPos)
        
        startMoveAnimation(fromPos, toPos, () => {
          setIsMoving(false)
          onMove?.(toPos)
        })
      }
    }
  }, [keys, isMoving, isPaused, gridPos, mapData, startMoveAnimation, onMove])
  
  return {
    gridPos,
    pixelPos,
    direction,
    isMoving,
    animationFrame,
  }
}
