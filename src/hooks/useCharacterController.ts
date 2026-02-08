import { useState, useEffect, useRef, useCallback } from 'react'
import type { Direction, MapData, Position } from '../types/game'
import { canMoveTo } from '../utils/collision'
import { useKeyboardInput } from './useKeyboardInput'

const TILE_SIZE = 32
const MOVE_DURATION = 200 // ms per tile movement
const JUMP_DURATION = 400 // ms for full jump
const JUMP_HEIGHT = 24 // pixels to jump up

interface UseCharacterControllerOptions {
  initialPos: Position
  mapData: MapData
  tileSize?: number
  onMove?: (newPos: Position) => void
  onJump?: (pos: Position) => void
  isPaused?: boolean
}

interface CharacterController {
  gridPos: Position
  pixelPos: Position
  direction: Direction
  isMoving: boolean
  animationFrame: number
  isJumping: boolean
  jumpOffset: number
}

/**
 * Hook to control character movement with smooth pixel-based animation
 */
export function useCharacterController({
  initialPos,
  mapData,
  tileSize = TILE_SIZE,
  onMove,
  onJump,
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
  const [isJumping, setIsJumping] = useState(false)
  const [jumpOffset, setJumpOffset] = useState(0)
  
  const animationRef = useRef<number | null>(null)
  const jumpAnimationRef = useRef<number | null>(null)
  const keys = useKeyboardInput()
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
      if (jumpAnimationRef.current !== null) {
        cancelAnimationFrame(jumpAnimationRef.current)
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
  
  // Start jump animation
  const startJumpAnimation = useCallback(() => {
    if (isJumping) return
    
    setIsJumping(true)
    const startTime = performance.now()
    
    const animateJump = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / JUMP_DURATION, 1)
      
      // Parabolic curve: up then down using sine
      const jumpProgress = Math.sin(progress * Math.PI)
      setJumpOffset(jumpProgress * JUMP_HEIGHT)
      
      if (progress < 1) {
        jumpAnimationRef.current = requestAnimationFrame(animateJump)
      } else {
        setJumpOffset(0)
        setIsJumping(false)
      }
    }
    
    jumpAnimationRef.current = requestAnimationFrame(animateJump)
  }, [isJumping])
  
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
  
  // Handle jump input
  useEffect(() => {
    if (keys.jump && !isJumping && !isPaused) {
      startJumpAnimation()
      onJump?.(gridPos)
    }
  }, [keys.jump, isJumping, isPaused, startJumpAnimation, onJump, gridPos])
  
  return {
    gridPos,
    pixelPos,
    direction,
    isMoving,
    animationFrame,
    isJumping,
    jumpOffset,
  }
}
