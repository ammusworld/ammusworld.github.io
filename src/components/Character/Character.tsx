import { memo } from 'react'
import type { Character as CharacterType, Direction, Position } from '../../types/game'
import { ASSETS } from '../../utils/assets'
import styles from './Character.module.css'

interface CharacterProps {
  character: CharacterType
  pixelPos: Position
  direction: Direction
  animationFrame: number
  isMoving: boolean
  jumpOffset?: number
  tileSize?: number
}

const DIRECTION_ROW: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
}

export const Character = memo(function Character({
  character,
  pixelPos,
  direction,
  animationFrame,
  isMoving,
  jumpOffset = 0,
  tileSize = 32,
}: Readonly<CharacterProps>) {
  const spriteSheet = ASSETS.sprites[character]
  const directionRow = DIRECTION_ROW[direction]
  
  // Use frame 0 when idle, otherwise use walk cycle
  const frameCol = isMoving ? animationFrame : 0
  
  // Sprite is 32x32 in a 128x128 sheet (4x4 grid)
  const spriteFrameSize = 32
  const sheetSize = 128
  
  return (
    <div
      className={styles.character}
      style={{
        left: pixelPos.x,
        // Offset Y slightly so sprite appears above tile (feet on ground)
        // Subtract jumpOffset to move character up when jumping
        top: pixelPos.y - tileSize * 0.25 - jumpOffset,
        width: tileSize,
        height: tileSize * 1.5,
      }}
    >
      <div
        className={styles.sprite}
        style={{
          backgroundImage: `url(${spriteSheet})`,
          backgroundPosition: `-${frameCol * spriteFrameSize}px -${directionRow * spriteFrameSize}px`,
          backgroundSize: `${sheetSize}px ${sheetSize}px`,
          width: spriteFrameSize,
          height: spriteFrameSize,
        }}
      />
    </div>
  )
})
