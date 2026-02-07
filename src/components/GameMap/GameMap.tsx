import { useCallback, memo, useState, useEffect, useRef } from 'react'
import type { Character as CharacterType, HeartPosition } from '../../types/game'
import { ASSETS } from '../../utils/assets'
import { MAP_DATA, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../data/mapData'
import { useCamera, useVisibleTiles } from '../../hooks/useCamera'
import { useCharacterController } from '../../hooks/useCharacterController'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { checkHeartCollision, checkHouseCollision } from '../../utils/collision'
import { Character } from '../Character'
import { TileRenderer } from './TileRenderer'
import styles from './GameMap.module.css'

interface GameMapProps {
  character: CharacterType
  onHouseReached: () => void
  onHeartCollected: (photoIndex: number) => void
  collectedHearts: Set<number>
  isPaused?: boolean
}

interface CollectibleHeartsProps {
  heartPositions: HeartPosition[]
  collectedHearts: Set<number>
  tileSize: number
}

const CollectibleHearts = memo(function CollectibleHearts({
  heartPositions,
  collectedHearts,
  tileSize,
}: Readonly<CollectibleHeartsProps>) {
  return (
    <div className={styles.heartsLayer}>
      {heartPositions.map((heart) => {
        if (collectedHearts.has(heart.photoIndex)) {
          return null
        }
        
        return (
          <div
            key={heart.photoIndex}
            className={styles.collectibleHeart}
            style={{
              left: heart.x * tileSize + tileSize / 4,
              top: heart.y * tileSize,
              width: tileSize / 2,
              height: tileSize / 2,
            }}
          >
            <img
              src={ASSETS.ui.heart}
              alt="Heart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )
      })}
    </div>
  )
})

interface HeartCounterProps {
  collected: number
  total: number
}

const HeartCounter = memo(function HeartCounter({
  collected,
  total,
}: Readonly<HeartCounterProps>) {
  return (
    <div className={styles.heartCounter}>
      <img src={ASSETS.ui.heartSmall} alt="Hearts" className={styles.heartIcon} />
      <span className={styles.heartCountText}>
        {collected} / {total}
      </span>
    </div>
  )
})

export function GameMap({
  character,
  onHouseReached,
  onHeartCollected,
  collectedHearts,
  isPaused = false,
}: Readonly<GameMapProps>) {
  const [showHousePrompt, setShowHousePrompt] = useState(false)
  const [showLockedBubble, setShowLockedBubble] = useState(false)
  const lockedBubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasAtHouseDoorRef = useRef(false)
  const keys = useKeyboardInput()
  
  // Handle movement and check for collisions
  const handleMove = useCallback((newPos: { x: number; y: number }) => {
    // Don't process collisions when paused
    if (isPaused) return
    
    // Check for heart collision
    const heartIndex = checkHeartCollision(newPos, MAP_DATA.heartPositions, collectedHearts)
    if (heartIndex !== null) {
      onHeartCollected(heartIndex)
    }
    
    // Check for house collision (only if all hearts collected)
    if (checkHouseCollision(newPos, MAP_DATA.housePosition, collectedHearts, MAP_DATA.heartPositions.length)) {
      onHouseReached()
    }
  }, [collectedHearts, onHeartCollected, onHouseReached, isPaused])
  
  const {
    gridPos,
    pixelPos,
    direction,
    isMoving,
    animationFrame,
  } = useCharacterController({
    initialPos: MAP_DATA.playerSpawn,
    mapData: MAP_DATA,
    tileSize: TILE_SIZE,
    onMove: handleMove,
    isPaused,
  })
  
  const camera = useCamera({
    playerPixelPos: pixelPos,
    mapWidth: MAP_DATA.width,
    mapHeight: MAP_DATA.height,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
    tileSize: TILE_SIZE,
  })
  
  const visibleArea = useVisibleTiles(camera, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE)
  
  // House door interaction zone (one tile south of door at 19,4)
  const isAtHouseDoor = gridPos.x === 19 && gridPos.y === 5
  const allHeartsCollected = collectedHearts.size >= MAP_DATA.heartPositions.length
  
  // Show/hide house prompt when at door
  useEffect(() => {
    setShowHousePrompt(isAtHouseDoor && allHeartsCollected)
  }, [isAtHouseDoor, allHeartsCollected])
  
  // Show locked bubble when arriving at house without all hearts
  useEffect(() => {
    // Only trigger when just arriving at door (rising edge)
    const justArrived = isAtHouseDoor && !wasAtHouseDoorRef.current
    wasAtHouseDoorRef.current = isAtHouseDoor
    
    // Hide bubble when leaving the door area
    if (!isAtHouseDoor && showLockedBubble) {
      setShowLockedBubble(false)
      if (lockedBubbleTimerRef.current) {
        clearTimeout(lockedBubbleTimerRef.current)
        lockedBubbleTimerRef.current = null
      }
      return
    }
    
    if (justArrived && !allHeartsCollected && !isPaused) {
      // Clear any existing timer
      if (lockedBubbleTimerRef.current) {
        clearTimeout(lockedBubbleTimerRef.current)
      }
      setShowLockedBubble(true)
      lockedBubbleTimerRef.current = setTimeout(() => {
        setShowLockedBubble(false)
        lockedBubbleTimerRef.current = null
      }, 3000)
    }
  }, [isAtHouseDoor, allHeartsCollected, isPaused, showLockedBubble])
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (lockedBubbleTimerRef.current) {
        clearTimeout(lockedBubbleTimerRef.current)
      }
    }
  }, [])
  
  // Handle space/enter to enter house
  useEffect(() => {
    if (isAtHouseDoor && allHeartsCollected && keys.action && !isPaused) {
      onHouseReached()
    }
  }, [isAtHouseDoor, allHeartsCollected, keys.action, isPaused, onHouseReached])
  
  return (
    <div className={styles.gameScreen}>
      <div className={styles.viewport}>
        <div
          className={styles.mapContainer}
          style={{
            transform: `translate(${-camera.x}px, ${-camera.y}px)`,
            width: MAP_DATA.width * TILE_SIZE,
            height: MAP_DATA.height * TILE_SIZE,
          }}
        >
          {/* Ground layer */}
          <TileRenderer
            layer={MAP_DATA.layers.ground}
            tileSize={TILE_SIZE}
            visibleArea={visibleArea}
            zIndex={0}
          />
          
          {/* Objects layer */}
          <TileRenderer
            layer={MAP_DATA.layers.objects}
            tileSize={TILE_SIZE}
            visibleArea={visibleArea}
            zIndex={10}
          />
          
          {/* Collectible hearts */}
          <CollectibleHearts
            heartPositions={MAP_DATA.heartPositions}
            collectedHearts={collectedHearts}
            tileSize={TILE_SIZE}
          />
          
          {/* Player character */}
          <Character
            character={character}
            pixelPos={pixelPos}
            direction={direction}
            animationFrame={animationFrame}
            isMoving={isMoving}
            tileSize={TILE_SIZE}
          />
          
          {/* House prompt */}
          {showHousePrompt && (
            <div 
              className={styles.housePrompt}
              style={{
                left: pixelPos.x - 20,
                top: pixelPos.y - 40,
              }}
            >
              Press SPACE to enter
            </div>
          )}
          
          {/* Locked house speech bubble */}
          {showLockedBubble && (
            <div 
              className={styles.speechBubble}
              style={{
                left: pixelPos.x - 40,
                top: pixelPos.y - 50,
              }}
            >
              The house is locked!
              <div className={styles.speechBubbleTail} />
            </div>
          )}
          
          {/* Address sign */}
          <div 
            className={styles.addressSign}
            style={{
              left: (MAP_DATA.housePosition.x + 3) * TILE_SIZE,
              top: (MAP_DATA.housePosition.y + 2) * TILE_SIZE,
            }}
          >
            <div className={styles.signBoard}>9217 Ravine Wy</div>
            <div className={styles.signPost} />
          </div>
          
          {/* Overhead layer */}
          <TileRenderer
            layer={MAP_DATA.layers.overhead}
            tileSize={TILE_SIZE}
            visibleArea={visibleArea}
            zIndex={100}
          />
        </div>
        
        {/* UI Overlay */}
        <div className={styles.uiOverlay}>
          <HeartCounter collected={collectedHearts.size} total={MAP_DATA.heartPositions.length} />
        </div>
      </div>
      
      <p className={styles.instructions}>
        Arrow keys or WASD to move • Collect all {MAP_DATA.heartPositions.length} hearts to enter the house
      </p>
    </div>
  )
}
