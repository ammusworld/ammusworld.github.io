import { memo, useState, useEffect, useRef } from 'react'
import { ASSETS } from '../../utils/assets'
import styles from './Wildlife.module.css'

interface WildlifeLayerProps {
  playerPos: { x: number; y: number }
  mapWidth: number
  mapHeight: number
  tileSize: number
  isPaused?: boolean
}

interface Butterfly {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  frame: number
  direction: 0 | 1 | 2 | 3 // 0=up, 1=right, 2=down, 3=left
  state: 'idle' | 'fleeing'
}

interface Bird {
  id: number
  x: number
  y: number
  direction: 'left' | 'right'
  frame: number
  speed: number
}

const BUTTERFLY_COUNT = 6
const BIRD_COUNT = 2
const FLEE_DISTANCE = 4 // tiles
const FLEE_SPEED = 0.15

// Butterfly sprite: 48x128 = 3 columns x 4 rows of 16x32 frames
// Row 0 = up/north, Row 1 = right/east, Row 2 = down/south, Row 3 = left/west
const BUTTERFLY_COLS = 3
const BUTTERFLY_ROWS = 4
const BUTTERFLY_FRAME_WIDTH = 16
const BUTTERFLY_FRAME_HEIGHT = 32
const BUTTERFLY_FRAMES_PER_DIRECTION = BUTTERFLY_COLS // 3 frames per direction

// Bird sprite: 96x256 = 3 columns x 8 rows of 32x32 frames
// Row 0 = flying right to left, Row 3 = flying left to right
const BIRD_COLS = 3
const BIRD_ROWS = 8
const BIRD_FRAME_WIDTH = 32
const BIRD_FRAME_HEIGHT = 32
const BIRD_FRAMES = BIRD_COLS // 3 frames per direction

export const WildlifeLayer = memo(function WildlifeLayer({
  playerPos,
  mapWidth,
  mapHeight,
  tileSize,
  isPaused = false,
}: Readonly<WildlifeLayerProps>) {
  const [butterflies, setButterflies] = useState<Butterfly[]>([])
  const [birds, setBirds] = useState<Bird[]>([])
  const animationRef = useRef<number | null>(null)

  // Initialize wildlife
  useEffect(() => {
    // Spawn butterflies in grassy areas
    const newButterflies: Butterfly[] = []
    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
      newButterflies.push({
        id: i,
        x: 5 + Math.random() * (mapWidth - 10),
        y: 5 + Math.random() * (mapHeight - 10),
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        frame: Math.floor(Math.random() * BUTTERFLY_FRAMES_PER_DIRECTION),
        direction: 2, // default facing down
        state: 'idle',
      })
    }
    setButterflies(newButterflies)

    // Spawn birds flying across
    const newBirds: Bird[] = []
    for (let i = 0; i < BIRD_COUNT; i++) {
      const goingRight = Math.random() > 0.5
      newBirds.push({
        id: i,
        x: goingRight ? -5 : mapWidth + 5,
        y: 3 + Math.random() * (mapHeight - 6),
        direction: goingRight ? 'right' : 'left',
        frame: 0,
        speed: 0.15 + Math.random() * 0.08,
      })
    }
    setBirds(newBirds)
  }, [mapWidth, mapHeight])

  // Animation loop
  useEffect(() => {
    if (isPaused) return

    let lastTime = performance.now()
    
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime
      
      if (delta > 50) { // ~20fps for wildlife
        lastTime = currentTime

        // Update butterflies
        setButterflies(prev => prev.map(b => {
          const dx = b.x - playerPos.x
          const dy = b.y - playerPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          let newVx = b.vx
          let newVy = b.vy
          let newState = b.state
          
          // Flee from player
          if (distance < FLEE_DISTANCE) {
            newState = 'fleeing'
            const fleeAngle = Math.atan2(dy, dx)
            newVx = Math.cos(fleeAngle) * FLEE_SPEED
            newVy = Math.sin(fleeAngle) * FLEE_SPEED
          } else {
            newState = 'idle'
            // Random gentle movement
            newVx += (Math.random() - 0.5) * 0.02
            newVy += (Math.random() - 0.5) * 0.02
            // Dampen
            newVx *= 0.95
            newVy *= 0.95
          }
          
          let newX = b.x + newVx
          let newY = b.y + newVy
          
          // Bounce off edges
          if (newX < 0 || newX > mapWidth) newVx *= -1
          if (newY < 0 || newY > mapHeight) newVy *= -1
          newX = Math.max(0, Math.min(mapWidth, newX))
          newY = Math.max(0, Math.min(mapHeight, newY))
          
          // Only update direction when velocity is significant (above threshold)
          const DIRECTION_THRESHOLD = 0.03
          let newDirection = b.direction
          const absVx = Math.abs(newVx)
          const absVy = Math.abs(newVy)
          if (absVx > DIRECTION_THRESHOLD || absVy > DIRECTION_THRESHOLD) {
            if (absVx > absVy) {
              newDirection = newVx > 0 ? 1 : 3 // right or left
            } else {
              newDirection = newVy > 0 ? 2 : 0 // down or up
            }
          }
          
          return {
            ...b,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            direction: newDirection,
            state: newState,
            frame: (b.frame + (newState === 'fleeing' ? 0.3 : 0.15)) % BUTTERFLY_FRAMES_PER_DIRECTION,
          }
        }))

        // Update birds
        setBirds(prev => prev.map(bird => {
          let newX = bird.x + (bird.direction === 'right' ? bird.speed : -bird.speed)
          let newY = bird.y
          
          // Respawn on other side when out of view with randomized Y position
          if (newX > mapWidth + 10) {
            newX = -5
            newY = 3 + Math.random() * (mapHeight - 6)
          } else if (newX < -10) {
            newX = mapWidth + 5
            newY = 3 + Math.random() * (mapHeight - 6)
          }
          
          return {
            ...bird,
            x: newX,
            y: newY,
            frame: (bird.frame + 0.2) % BIRD_FRAMES,
          }
        }))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, playerPos, mapWidth, mapHeight])

  return (
    <div className={styles.wildlifeLayer}>
      {/* Butterflies */}
      {butterflies.map((butterfly) => {
        const col = Math.floor(butterfly.frame) % BUTTERFLY_COLS
        
        return (
          <div
            key={`butterfly-${butterfly.id}`}
            className={`${styles.butterfly} ${butterfly.state === 'fleeing' ? styles.fleeing : ''}`}
            style={{
              left: butterfly.x * tileSize,
              top: butterfly.y * tileSize,
              width: BUTTERFLY_FRAME_WIDTH,
              height: BUTTERFLY_FRAME_HEIGHT,
              backgroundImage: `url(${ASSETS.sprites.butterfly})`,
              backgroundPosition: `-${col * BUTTERFLY_FRAME_WIDTH}px -${butterfly.direction * BUTTERFLY_FRAME_HEIGHT}px`,
              backgroundSize: `${BUTTERFLY_COLS * BUTTERFLY_FRAME_WIDTH}px ${BUTTERFLY_ROWS * BUTTERFLY_FRAME_HEIGHT}px`,
            }}
          />
        )
      })}
      
      {/* Birds */}
      {birds.map((bird) => {
        // Row 0 = right to left, Row 3 = left to right
        const row = bird.direction === 'left' ? 0 : 3
        const col = Math.floor(bird.frame) % BIRD_COLS
        
        return (
          <div
            key={`bird-${bird.id}`}
            className={styles.bird}
            style={{
              left: bird.x * tileSize,
              top: bird.y * tileSize,
              width: BIRD_FRAME_WIDTH,
              height: BIRD_FRAME_HEIGHT,
              backgroundImage: `url(${ASSETS.sprites.bird})`,
              backgroundPosition: `-${col * BIRD_FRAME_WIDTH}px -${row * BIRD_FRAME_HEIGHT}px`,
              backgroundSize: `${BIRD_COLS * BIRD_FRAME_WIDTH}px ${BIRD_ROWS * BIRD_FRAME_HEIGHT}px`,
            }}
          />
        )
      })}
    </div>
  )
})
