import React, { memo } from 'react'
import type { TileType } from '../../types/game'
import { TILE_DEFINITIONS } from '../../types/game'
import { ASSETS } from '../../utils/assets'
import styles from './GameMap.module.css'

interface TileRendererProps {
  layer: (TileType | null)[][]
  tileSize: number
  visibleArea: {
    startX: number
    startY: number
    endX: number
    endY: number
  }
  zIndex?: number
}

interface TileProps {
  type: TileType
  x: number
  y: number
  tileSize: number
}

const Tile = memo(function Tile({ type, x, y, tileSize }: Readonly<TileProps>) {
  const definition = TILE_DEFINITIONS[type]
  const spriteKey = definition.sprite as keyof typeof ASSETS.tiles
  const spriteSrc = ASSETS.tiles[spriteKey]
  
  if (!spriteSrc) {
    return null
  }
  
  const width = (definition.width ?? 1) * tileSize
  const height = (definition.height ?? 1) * tileSize
  
  return (
    <img
      className={styles.tile}
      src={spriteSrc}
      alt=""
      style={{
        left: x * tileSize,
        top: y * tileSize,
        width,
        height,
      }}
    />
  )
})

export const TileRenderer = memo(function TileRenderer({
  layer,
  tileSize,
  visibleArea,
  zIndex = 0,
}: Readonly<TileRendererProps>) {
  const tiles: React.ReactNode[] = []
  
  for (let y = visibleArea.startY; y < visibleArea.endY && y < layer.length; y++) {
    if (y < 0) continue
    const row = layer[y]
    if (!row) continue
    
    for (let x = visibleArea.startX; x < visibleArea.endX && x < row.length; x++) {
      if (x < 0) continue
      const tile = row[x]
      if (tile === null || tile === undefined) continue
      
      tiles.push(
        <Tile
          key={`${x}-${y}`}
          type={tile}
          x={x}
          y={y}
          tileSize={tileSize}
        />
      )
    }
  }
  
  return (
    <div className={styles.tileLayer} style={{ zIndex }}>
      {tiles}
    </div>
  )
})
