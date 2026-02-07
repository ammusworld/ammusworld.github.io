# Tile Map Engine Specification

## Overview

A top-down 2D tile map renderer in the style of GBA Pokémon games. Renders a grid of tiles with a camera that follows the player character, handling layered rendering (ground, objects, player, overhead).

## Core Concepts

### Tile Size
- Base tile: 32×32 pixels
- Map grid: ~40×30 tiles (1280×960 logical pixels)
- Viewport: Centered on player, shows ~20×15 tiles

### Coordinate System
```
(0,0) ────────────────────► X (columns)
  │
  │   [0,0] [1,0] [2,0] ...
  │   [0,1] [1,1] [2,1] ...
  │   [0,2] [1,2] [2,2] ...
  │
  ▼ Y (rows)
```

### Tile Types
```typescript
// src/types/game.ts

export enum TileType {
  // Walkable ground
  GRASS = 0,
  GRASS_FLOWERS = 1,
  DIRT_PATH = 2,
  PAVED_PATH = 3,
  
  // Non-walkable obstacles
  TREE = 10,
  BUSH = 11,
  ROCK = 12,
  WATER = 13,
  FENCE = 14,
  
  // Special tiles
  HOUSE = 20,
  HEART_SPAWN = 30, // Invisible, marks heart locations
}

export interface TileDefinition {
  type: TileType;
  walkable: boolean;
  sprite: string;
  width?: number;  // For multi-tile objects (default: 1)
  height?: number; // For multi-tile objects (default: 1)
}

export const TILE_DEFINITIONS: Record<TileType, TileDefinition> = {
  [TileType.GRASS]: { type: TileType.GRASS, walkable: true, sprite: 'grass' },
  [TileType.GRASS_FLOWERS]: { type: TileType.GRASS_FLOWERS, walkable: true, sprite: 'grassFlowers' },
  [TileType.DIRT_PATH]: { type: TileType.DIRT_PATH, walkable: true, sprite: 'dirtPath' },
  [TileType.PAVED_PATH]: { type: TileType.PAVED_PATH, walkable: true, sprite: 'pavedPath' },
  [TileType.TREE]: { type: TileType.TREE, walkable: false, sprite: 'tree', height: 2 },
  [TileType.BUSH]: { type: TileType.BUSH, walkable: false, sprite: 'bush' },
  [TileType.ROCK]: { type: TileType.ROCK, walkable: false, sprite: 'rock' },
  [TileType.WATER]: { type: TileType.WATER, walkable: false, sprite: 'water' },
  [TileType.FENCE]: { type: TileType.FENCE, walkable: false, sprite: 'fence' },
  [TileType.HOUSE]: { type: TileType.HOUSE, walkable: false, sprite: 'house', width: 3, height: 3 },
  [TileType.HEART_SPAWN]: { type: TileType.HEART_SPAWN, walkable: true, sprite: 'grass' },
};
```

## Map Data Structure

**File**: `src/data/mapData.ts`

```typescript
export interface MapData {
  width: number;   // Number of columns
  height: number;  // Number of rows
  layers: {
    ground: TileType[][];      // Base layer (grass, paths)
    objects: (TileType | null)[][]; // Objects layer (trees, bushes)
    overhead: (TileType | null)[][]; // Rendered above player (tree tops)
  };
  playerSpawn: { x: number; y: number };
  housePosition: { x: number; y: number };
  heartPositions: { x: number; y: number; photoIndex: number }[];
}

// Example:
export const MAP_DATA: MapData = {
  width: 40,
  height: 30,
  layers: {
    ground: [
      [0, 0, 0, 2, 2, 0, 0, ...], // Row 0
      [0, 0, 2, 2, 2, 2, 0, ...], // Row 1
      // ... 30 rows total
    ],
    objects: [
      [10, null, null, null, null, 10, ...],
      // ...
    ],
    overhead: [
      // Tree tops that render above player
    ],
  },
  playerSpawn: { x: 20, y: 28 },
  housePosition: { x: 18, y: 2 },
  heartPositions: [
    { x: 5, y: 10, photoIndex: 0 },
    { x: 12, y: 15, photoIndex: 1 },
    // ... 10 hearts total
  ],
};
```

## Components

### GameMap

**File**: `src/components/GameMap/GameMap.tsx`

```typescript
interface GameMapProps {
  character: 'dudu' | 'chungu';
  onHouseReached: () => void;
  onHeartCollected: (photoIndex: number) => void;
}

export const GameMap: React.FC<GameMapProps> = ({ 
  character, 
  onHouseReached, 
  onHeartCollected 
}) => {
  const [playerPos, setPlayerPos] = useState(MAP_DATA.playerSpawn);
  const [collectedHearts, setCollectedHearts] = useState<Set<number>>(new Set());
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // ... keyboard input, collision, rendering
};
```

### TileRenderer

**File**: `src/components/GameMap/TileRenderer.tsx`

```typescript
interface TileRendererProps {
  layer: (TileType | null)[][];
  camera: { x: number; y: number };
  tileSize: number;
}
```

**Implementation**:
- Only renders tiles visible within viewport (+ 1 tile buffer)
- Uses CSS transform for camera offset
- Applies `image-rendering: pixelated`

### Camera System

The camera follows the player, keeping them centered unless near map edges.

```typescript
// src/hooks/useCamera.ts

interface CameraState {
  x: number;  // Pixel offset
  y: number;
}

export function useCamera(
  playerPos: { x: number; y: number },
  mapSize: { width: number; height: number },
  viewportSize: { width: number; height: number },
  tileSize: number
): CameraState {
  // Calculate ideal camera position (player centered)
  const idealX = playerPos.x * tileSize - viewportSize.width / 2 + tileSize / 2;
  const idealY = playerPos.y * tileSize - viewportSize.height / 2 + tileSize / 2;
  
  // Clamp to map bounds
  const maxX = mapSize.width * tileSize - viewportSize.width;
  const maxY = mapSize.height * tileSize - viewportSize.height;
  
  return {
    x: Math.max(0, Math.min(idealX, maxX)),
    y: Math.max(0, Math.min(idealY, maxY)),
  };
}
```

## Rendering Layers

The map renders in this order:
1. **Ground Layer** - Grass, paths (always behind everything)
2. **Objects Layer** - Trees, bushes, rocks (sorted by Y for depth)
3. **Hearts** - Collectible hearts (floating animation)
4. **Player** - Character sprite
5. **Overhead Layer** - Tree tops, arches (always above player)
6. **UI Overlay** - Heart counter, etc.

```tsx
// Render order in GameMap
<div className="map-container" style={{ transform: `translate(${-camera.x}px, ${-camera.y}px)` }}>
  <TileRenderer layer={MAP_DATA.layers.ground} />
  <TileRenderer layer={MAP_DATA.layers.objects} />
  <Hearts positions={heartPositions} collected={collectedHearts} />
  <Character position={playerPos} character={character} direction={direction} />
  <TileRenderer layer={MAP_DATA.layers.overhead} />
</div>
<HeartCounter collected={collectedHearts.size} total={10} />
```

## Viewport & Scaling

**File**: `src/components/GameMap/GameMap.module.css`

```css
.viewport {
  width: 640px;  /* 20 tiles × 32px */
  height: 480px; /* 15 tiles × 32px */
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  border: 4px solid var(--pink-medium);
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
  background: var(--green-grass);
}

.mapContainer {
  position: absolute;
  transition: transform 0.1s linear; /* Smooth camera movement */
}

.tile {
  position: absolute;
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}
```

## Collision Detection

**File**: `src/utils/collision.ts`

```typescript
export function canMoveTo(
  x: number,
  y: number,
  mapData: MapData
): boolean {
  // Check bounds
  if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) {
    return false;
  }
  
  // Check ground layer is walkable
  const groundTile = mapData.layers.ground[y][x];
  if (!TILE_DEFINITIONS[groundTile].walkable) {
    return false;
  }
  
  // Check objects layer
  const objectTile = mapData.layers.objects[y][x];
  if (objectTile !== null && !TILE_DEFINITIONS[objectTile].walkable) {
    return false;
  }
  
  return true;
}

export function checkHeartCollision(
  playerPos: { x: number; y: number },
  heartPositions: { x: number; y: number; photoIndex: number }[],
  collectedHearts: Set<number>
): number | null {
  for (const heart of heartPositions) {
    if (
      playerPos.x === heart.x &&
      playerPos.y === heart.y &&
      !collectedHearts.has(heart.photoIndex)
    ) {
      return heart.photoIndex;
    }
  }
  return null;
}

export function checkHouseCollision(
  playerPos: { x: number; y: number },
  housePosition: { x: number; y: number }
): boolean {
  // House is 3×3 tiles, check if player is adjacent to door (center bottom)
  const doorX = housePosition.x + 1;
  const doorY = housePosition.y + 3; // Just below house
  
  return playerPos.x === doorX && playerPos.y === doorY;
}
```

## Performance Optimizations

1. **Tile Culling**: Only render tiles within viewport + 1 tile buffer
2. **Layer Caching**: Pre-render static layers to offscreen canvas (optional)
3. **React.memo**: Memoize tile components that don't change
4. **CSS Transform**: Use GPU-accelerated transforms for camera movement

```typescript
// Viewport culling
const visibleTiles = useMemo(() => {
  const startX = Math.floor(camera.x / TILE_SIZE) - 1;
  const startY = Math.floor(camera.y / TILE_SIZE) - 1;
  const endX = startX + Math.ceil(viewportWidth / TILE_SIZE) + 2;
  const endY = startY + Math.ceil(viewportHeight / TILE_SIZE) + 2;
  
  return { startX, startY, endX, endY };
}, [camera.x, camera.y]);
```

## Success Criteria

### Automated Verification:
- [ ] Map data loads without errors
- [ ] Tile types are correctly defined
- [ ] Collision detection works for all tile types
- [ ] TypeScript compiles without errors

### Manual Verification:
- [ ] Map renders correctly with all layers
- [ ] Camera follows player smoothly
- [ ] Camera stops at map edges (no black areas visible)
- [ ] Tiles are crisp and pixel-perfect
- [ ] Z-ordering is correct (player behind tree tops)
- [ ] Performance is smooth (60fps target)
- [ ] No visual glitches during movement
