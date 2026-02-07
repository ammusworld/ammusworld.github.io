# Map Design Specification

## Overview

A forest/nature trail themed map with branching paths leading to a house. The map contains 10 collectible hearts placed strategically along different path branches.

## Map Dimensions

- **Grid Size**: 40 columns × 30 rows = 1200 tiles
- **Pixel Size**: 1280 × 960 pixels
- **Viewport**: 20 × 15 tiles (640 × 480 pixels)

## Map Layout Concept

```
Legend:
  🌲 = Tree (non-walkable)
  🌿 = Grass (walkable)
  🌸 = Grass with flowers (walkable)
  ═  = Paved path (walkable)
  ░  = Dirt path (walkable)
  💧 = Water (non-walkable)
  🏠 = House (goal)
  ♥  = Heart spawn point
  🚩 = Player spawn

         0    5    10   15   20   25   30   35   40
    0   🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
    2   🌲🌿🌿🌿🌲🌲🌿🌿🌿🌿🌲🌲🌲🏠🏠🏠🌲🌲🌿🌲
    4   🌲🌿♥🌿🌿🌿🌿🌿🌸🌿🌿🌿🌿═══🌿🌿🌿🌿🌲
    6   🌲🌿🌿🌿🌲🌲🌿🌿🌿🌿🌲🌿♥═🌿🌿🌲🌲🌿🌲
    8   🌲🌲🌿🌿🌲🌲🌿🌿🌿🌲🌲🌲═══🌲🌲🌿🌿🌿🌲
   10   🌲🌿🌿🌿🌿🌿🌿🌲🌿🌿🌿🌿═🌿🌿🌿🌿🌿🌿🌲
   12   🌲🌿🌸♥🌿🌿🌿🌿🌿🌿🌿🌿═🌿🌿♥🌿🌿🌿🌲
   14   🌲🌿🌿🌿🌿🌲🌲🌲🌿🌿🌿🌿═🌿🌲🌲🌲🌿🌿🌲
   16   🌲🌿🌿🌿🌿🌲💧💧🌿🌿🌿🌿═🌿🌿🌿🌿🌿🌿🌲
   18   🌲🌿♥🌿🌿🌲💧💧🌲🌿🌿🌿═══♥🌿🌿🌿🌿🌲
   20   🌲🌿🌿🌿🌿🌲🌲🌲🌲🌿🌿🌿🌿═🌿🌿🌿🌿🌿🌲
   22   🌲🌿🌸🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿═🌿🌿🌿♥🌿🌲
   24   🌲🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿♥🌿═🌿🌿🌲🌲🌿🌲
   26   🌲🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿═══🌿🌿🌿🌿🌿🌲
   28   🌲🌿🌿🌿♥🌿🌿🌿🌿🌿🌿🌿🚩🌿🌿🌿🌿🌿🌿🌲
   30   🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
```

## Key Locations

### Player Spawn
- **Position**: (20, 28) - Bottom center of map
- On paved path for clear starting direction

### House (Goal)
- **Position**: (18, 2) - Top center area
- Size: 3×3 tiles
- Door faces south
- Interaction zone: (19, 5) - one tile below door

### Heart Positions (10 total)

| # | Position | Path Branch | Description |
|---|----------|-------------|-------------|
| 1 | (3, 4)   | West branch | Hidden near starting area |
| 2 | (13, 6)  | Central path | Early path discovery |
| 3 | (3, 12)  | Southwest loop | Small flowers clearing |
| 4 | (25, 12) | East branch | Past the first fork |
| 5 | (3, 18)  | West pond area | Near water feature |
| 6 | (25, 18) | East clearing | Open area |
| 7 | (27, 22) | Far east | Requires exploration |
| 8 | (11, 24) | Southern path | Side branch |
| 9 | (5, 28)  | Southwest corner | Off main path |
| 10| (30, 10) | Far east glade | Hidden area |

## Path Design

### Main Path (Paved)
- Clear central route from spawn to house
- Paved stones, gray color
- Most direct route but passes only 2-3 hearts

### Branch Paths (Dirt)
- Brown dirt paths branching off main route
- Lead to heart locations
- Some dead-ends for exploration feel
- Width: 1-2 tiles

### Secret Areas
- Gaps between trees leading to clearings
- Reward exploration with hearts
- Flower patches mark special spots

## Tile Placement Strategy

### Ground Layer Distribution

| Tile Type | Approximate % | Purpose |
|-----------|---------------|---------|
| Grass | 50% | Base terrain |
| Grass + Flowers | 10% | Points of interest, near hearts |
| Dirt Path | 15% | Branch paths |
| Paved Path | 8% | Main route |
| Water | 2% | Decoration, barriers |

### Object Layer Distribution

| Object Type | Approximate Count | Purpose |
|-------------|-------------------|---------|
| Trees | 80-100 | Borders, obstacles |
| Bushes | 20-30 | Smaller obstacles |
| Rocks | 10-15 | Path variety |
| Flowers (tall) | 15-20 | Decoration |

## Border Design

The entire map is bordered by trees creating a natural boundary:
- 1-2 tile thick tree border
- Prevents player from reaching map edges
- Creates enclosed forest feeling

## Path Flow Diagram

```
                    [HOUSE]
                       ↑
         ♥←─────┐     ═══     ┌─────→♥
                │      ║      │
        ♥       └──────╬──────┘       ♥
        ↑              ║              ↑
    ┌───┴───┐     ┌────╬────┐     ┌───┴───┐
    │   W   │     │    ║    │     │   E   │
    │ LOOP  │     │ MAIN    │     │ LOOP  │
    │       │     │ PATH    │     │       │
    └───┬───┘     └────╬────┘     └───┬───┘
        ↓              ║              ↓
        ♥         ┌────╬────┐         ♥
                  │    ║    │
         ♥←───────┤    ║    ├────────→♥
                  │    ║    │
                  └────╬────┘
                       ║
                    [SPAWN]
                       ♥
```

## Map Data Implementation

**File**: `src/data/mapData.ts`

```typescript
import { TileType, MapData } from '../types/game';

const T = TileType; // Shorthand

// Helper to create rows
const row = (...tiles: TileType[]) => tiles;

export const MAP_DATA: MapData = {
  width: 40,
  height: 30,
  
  layers: {
    ground: [
      // Row 0 - Top border (all trees base is grass)
      row(T.GRASS, T.GRASS, T.GRASS, /* ... 40 tiles */),
      // ... continue for 30 rows
    ],
    
    objects: [
      // Row 0 - Top border trees
      row(T.TREE, T.TREE, T.TREE, /* ... trees and nulls */),
      // ...
    ],
    
    overhead: [
      // Tree tops that render above player
      // Same positions as tree objects but slightly offset graphics
    ],
  },
  
  playerSpawn: { x: 20, y: 28 },
  
  housePosition: { x: 18, y: 2 },
  
  heartPositions: [
    { x: 3, y: 4, photoIndex: 0 },
    { x: 13, y: 6, photoIndex: 1 },
    { x: 3, y: 12, photoIndex: 2 },
    { x: 25, y: 12, photoIndex: 3 },
    { x: 3, y: 18, photoIndex: 4 },
    { x: 25, y: 18, photoIndex: 5 },
    { x: 27, y: 22, photoIndex: 6 },
    { x: 11, y: 24, photoIndex: 7 },
    { x: 5, y: 28, photoIndex: 8 },
    { x: 30, y: 10, photoIndex: 9 },
  ],
};
```

## Visual Polish Details

### Grass Variation
- Use 2-3 grass tile variants for natural look
- Randomly assign variants when building map
- Or bake into map data for consistency

### Path Edges
- Dirt paths have grass peeking through edges
- Paved paths have clean edges
- Consider auto-tiling system for seamless connections

### Flower Placement
- Cluster around heart locations (hints!)
- Scattered randomly in open grass areas
- Pink, red, and white colors for Valentine theme

### Water Features
- Small pond in west area (2×2 tiles)
- Maybe a small stream
- Adds visual variety

## Success Criteria

### Automated Verification:
- [ ] Map data arrays are correct dimensions (40×30)
- [ ] All 10 heart positions are defined
- [ ] House position is valid
- [ ] Player spawn is on walkable tile
- [ ] All heart positions are on walkable tiles

### Manual Verification:
- [ ] Map is visually appealing and cohesive
- [ ] All paths are connected and navigable
- [ ] Every heart is reachable from spawn
- [ ] House is reachable from spawn
- [ ] Exploration feels rewarding (hearts in hidden spots)
- [ ] No dead-ends that feel frustrating
- [ ] Path flow is intuitive (general direction toward house is clear)
- [ ] Variety in scenery (not repetitive)
- [ ] Valentine theme is evident (flowers, hearts visible)
