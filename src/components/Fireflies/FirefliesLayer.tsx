import { memo, useEffect, useState } from 'react'
import styles from './Fireflies.module.css'

interface FirefliesLayerProps {
  isNightMode: boolean
  mapWidth: number
  mapHeight: number
  tileSize: number
  lakeArea?: { x1: number; y1: number; x2: number; y2: number }
}

interface Firefly {
  id: number
  x: number
  y: number
  phase: number // For offset glow timing
  size: number
  speed: number
}

const FIREFLY_COUNT = 25
const LAKE_AREA = { x1: 36, y1: 8, x2: 44, y2: 20 } // Default lake area

export const FirefliesLayer = memo(function FirefliesLayer({
  isNightMode,
  mapWidth,
  mapHeight,
  tileSize,
  lakeArea = LAKE_AREA,
}: Readonly<FirefliesLayerProps>) {
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  // Generate fireflies on mount
  useEffect(() => {
    const generated: Firefly[] = []
    
    // 80% near lake
    const lakeCount = Math.floor(FIREFLY_COUNT * 0.8)
    for (let i = 0; i < lakeCount; i++) {
      generated.push({
        id: i,
        x: lakeArea.x1 + Math.random() * (lakeArea.x2 - lakeArea.x1),
        y: lakeArea.y1 + Math.random() * (lakeArea.y2 - lakeArea.y1),
        phase: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
      })
    }
    
    // 40% scattered
    for (let i = lakeCount; i < FIREFLY_COUNT; i++) {
      generated.push({
        id: i,
        x: Math.random() * mapWidth,
        y: Math.random() * mapHeight,
        phase: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
      })
    }
    
    setFireflies(generated)
  }, [mapWidth, mapHeight, lakeArea])

  // Animate firefly movement
  useEffect(() => {
    if (!isNightMode) return

    const intervalId = setInterval(() => {
      setFireflies(prev => prev.map(f => ({
        ...f,
        x: f.x + (Math.random() - 0.5) * f.speed * 0.8,
        y: f.y + (Math.random() - 0.5) * f.speed * 0.8,
        phase: f.phase + 0.1,
      })))
    }, 350)

    return () => clearInterval(intervalId)
  }, [isNightMode])

  if (!isNightMode) return null

  return (
    <div className={styles.firefliesLayer}>
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className={styles.firefly}
          style={{
            left: firefly.x * tileSize,
            top: firefly.y * tileSize,
            width: firefly.size,
            height: firefly.size,
            animationDelay: `${firefly.phase}s`,
          }}
        />
      ))}
    </div>
  )
})
