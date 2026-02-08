import { useCallback, memo, useState, useEffect, useRef } from 'react'
import type { Character as CharacterType, HeartPosition, StreetLabel } from '../../types/game'
import { TileType } from '../../types/game'
import { ASSETS } from '../../utils/assets'
import { MAP_DATA, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../data/mapData'
import { useCamera, useVisibleTiles } from '../../hooks/useCamera'
import { useCharacterController } from '../../hooks/useCharacterController'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { useMobile } from '../../hooks/useMobile'
import { checkHeartCollision, checkHouseCollision } from '../../utils/collision'
import { Character } from '../Character'
import { TileRenderer } from './TileRenderer'
import { DPad } from '../DPad'
import { PasswordModal } from '../PasswordModal'
import { SecretGallery } from '../SecretGallery'
import styles from './GameMap.module.css'

// Hook to calculate viewport scale for mobile
function useViewportScale() {
  const [scale, setScale] = useState(1)
  
  useEffect(() => {
    const calculateScale = () => {
      const padding = 16
      const availableWidth = globalThis.innerWidth - padding
      const availableHeight = globalThis.innerHeight - 60 // Leave room for instructions
      
      const scaleX = availableWidth / VIEWPORT_WIDTH
      const scaleY = availableHeight / VIEWPORT_HEIGHT
      
      // Use the smaller scale to fit, but cap at 1 (no upscaling)
      setScale(Math.min(1, scaleX, scaleY))
    }
    
    calculateScale()
    globalThis.addEventListener('resize', calculateScale)
    return () => globalThis.removeEventListener('resize', calculateScale)
  }, [])
  
  return scale
}

interface GameMapProps {
  character: CharacterType
  onHouseReached: () => void
  onHeartCollected: (photoIndex: number) => void
  collectedHearts: Set<number>
  isPaused?: boolean
  isMusicPlaying: boolean
  onToggleMusic: () => void
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

interface StreetLabelsProps {
  labels: StreetLabel[]
  tileSize: number
}

const StreetLabels = memo(function StreetLabels({
  labels,
  tileSize,
}: Readonly<StreetLabelsProps>) {
  return (
    <div className={styles.streetLabelsLayer}>
      {labels.map((label, index) => (
        <div
          key={`${label.name}-${index}`}
          className={styles.streetLabel}
          style={{
            left: label.x * tileSize,
            top: label.y * tileSize,
            transform: label.rotation ? `rotate(${label.rotation}deg)` : undefined,
          }}
        >
          {label.name}
        </div>
      ))}
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
  isMusicPlaying,
  onToggleMusic,
}: Readonly<GameMapProps>) {
  const [showHousePrompt, setShowHousePrompt] = useState(false)
  const [showLockedBubble, setShowLockedBubble] = useState(false)
  const lockedBubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasAtHouseDoorRef = useRef(false)
  const keys = useKeyboardInput()
  const isMobile = useMobile()
  const viewportScale = useViewportScale()
  
  // Secret lake functionality
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSecretGallery, setShowSecretGallery] = useState(false)
  
  // Check if position is adjacent to water (lake)
  const isAdjacentToWater = useCallback((pos: { x: number; y: number }) => {
    const directions = [
      { dx: 0, dy: -1 },  // up
      { dx: 0, dy: 1 },   // down
      { dx: -1, dy: 0 },  // left
      { dx: 1, dy: 0 },   // right
    ]
    
    for (const { dx, dy } of directions) {
      const checkX = pos.x + dx
      const checkY = pos.y + dy
      if (checkX >= 0 && checkX < MAP_DATA.width && checkY >= 0 && checkY < MAP_DATA.height) {
        if (MAP_DATA.layers.ground[checkY][checkX] === TileType.WATER) {
          return true
        }
      }
    }
    return false
  }, [])
  
  // Handle jump near lake
  const handleJump = useCallback((pos: { x: number; y: number }) => {
    if (isAdjacentToWater(pos) && !showPasswordModal && !showSecretGallery) {
      setShowPasswordModal(true)
    }
  }, [isAdjacentToWater, showPasswordModal, showSecretGallery])
  
  const handlePasswordSuccess = useCallback(() => {
    setShowPasswordModal(false)
    setShowSecretGallery(true)
  }, [])
  
  // Handler for mobile tap on house prompt
  const handleHousePromptTap = useCallback(() => {
    if (isMobile && showHousePrompt && !isPaused) {
      onHouseReached()
    }
  }, [isMobile, showHousePrompt, isPaused, onHouseReached])
  
  // Handle movement and check for collisions
  const handleMove = useCallback((newPos: { x: number; y: number }) => {
    // Don't process collisions when paused
    if (isPaused) return
    
    // Check for heart collision
    const heartIndex = checkHeartCollision(newPos, MAP_DATA.heartPositions, collectedHearts)
    if (heartIndex !== null) {
      // Play heart collected sound effect
      const sfx = new Audio(ASSETS.audio.heartCollected)
      sfx.play().catch(() => {})
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
    jumpOffset,
  } = useCharacterController({
    initialPos: MAP_DATA.playerSpawn,
    mapData: MAP_DATA,
    tileSize: TILE_SIZE,
    onMove: handleMove,
    onJump: handleJump,
    isPaused: isPaused || showPasswordModal || showSecretGallery,
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
  
  // House door interaction zone (one tile south of house door)
  const houseDoorX = MAP_DATA.housePosition.x + 1 // center of 3-wide house
  const houseDoorY = MAP_DATA.housePosition.y + 3 // one tile below house
  const isAtHouseDoor = gridPos.x === houseDoorX && gridPos.y === houseDoorY
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
  
  // Hide CRT overlay while in game map
  useEffect(() => {
    document.body.classList.add('hide-crt')
    return () => {
      document.body.classList.remove('hide-crt')
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
      <div 
        className={styles.viewportWrapper}
        style={{
          width: VIEWPORT_WIDTH * viewportScale,
          height: VIEWPORT_HEIGHT * viewportScale,
        }}
      >
        <div 
          className={styles.viewport}
          style={{
            transform: `scale(${viewportScale})`,
            transformOrigin: 'top left',
          }}
        >
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
          
          {/* Street labels */}
          <StreetLabels
            labels={MAP_DATA.streetLabels}
            tileSize={TILE_SIZE}
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
            jumpOffset={jumpOffset}
            tileSize={TILE_SIZE}
          />
          
          {/* House prompt */}
          {showHousePrompt && (
            <button
              type="button"
              className={`${styles.housePrompt} ${isMobile ? styles.tappable : ''}`}
              style={{
                left: pixelPos.x - 20,
                top: pixelPos.y - 40,
              }}
              onClick={isMobile ? handleHousePromptTap : undefined}
              onTouchEnd={isMobile ? (e) => { e.preventDefault(); handleHousePromptTap(); } : undefined}
            >
              {isMobile ? 'Tap to enter' : 'Press SPACE to enter'}
            </button>
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
          
          {/* Address sign - positioned on grass to the left of house */}
          <div 
            className={styles.addressSign}
            style={{
              left: (MAP_DATA.housePosition.x - 3) * TILE_SIZE,
              top: (MAP_DATA.housePosition.y + 1) * TILE_SIZE,
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
          <button 
            className={styles.musicToggle}
            onClick={onToggleMusic}
            aria-label={isMusicPlaying ? 'Mute music' : 'Unmute music'}
          >
            {isMusicPlaying ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
      </div>
      
      {/* D-pad for mobile - outside viewport so it doesn't get scaled */}
      {isMobile && (
        <div className={styles.dpadContainer}>
          <DPad size={130} />
        </div>
      )}
      
      <p className={styles.instructions}>
        {isMobile 
          ? `Collect all ${MAP_DATA.heartPositions.length} hearts to enter the house`
          : `Arrow keys or WASD to move • SPACE to jump • Collect all ${MAP_DATA.heartPositions.length} hearts to enter the house`
        }
      </p>
      
      {/* Secret lake modals */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
      
      <SecretGallery
        isOpen={showSecretGallery}
        onClose={() => setShowSecretGallery(false)}
        photoCount={MAP_DATA.heartPositions.length}
      />
    </div>
  )
}
