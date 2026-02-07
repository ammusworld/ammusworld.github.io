# Assets Specification

## Overview

All pixel art assets required for the game. Assets should be 32x32 pixels for tiles and appropriately sized for sprites (32x32 or 32x48 for characters).

## Character Sprites

### Dudu (White Bear)

**File**: `src/assets/sprites/dudu.png`

**Description**: Cute white bear character inspired by the Dudu bear meme/character. Simple, round, friendly appearance.

**Sprite Sheet Layout**: 4 directions × 4 frames = 16 frames total
- Each frame: 32x32 pixels
- Total sheet size: 128x128 pixels

```
┌────┬────┬────┬────┐
│ D1 │ D2 │ D3 │ D4 │  ← Down (facing camera)
├────┼────┼────┼────┤
│ L1 │ L2 │ L3 │ L4 │  ← Left
├────┼────┼────┼────┤
│ R1 │ R2 │ R3 │ R4 │  ← Right
├────┼────┼────┼────┤
│ U1 │ U2 │ U3 │ U4 │  ← Up (back view)
└────┴────┴────┴────┘
```

**Visual Requirements**:
- White/cream body color
- Small black dot eyes
- Pink blush on cheeks
- Tiny ears
- Short stubby limbs
- Walking animation (legs alternating)

### Chungu (Pixel Girl)

**File**: `src/assets/sprites/chungu.png`

**Description**: Cute pixel-art girl character. Simple, charming design.

**Sprite Sheet Layout**: Same as Dudu (4×4 = 16 frames)
- Each frame: 32x32 pixels
- Total sheet size: 128x128 pixels

**Visual Requirements**:
- Dark/black hair (short or ponytail)
- Simple dress (pink or red for Valentine's theme)
- Small dot eyes with blush
- Walking animation (dress sway, leg movement)

## Map Tiles

All tiles are 32x32 pixels.

### Ground Tiles

| File | Description |
|------|-------------|
| `tiles/grass.png` | Green grass base tile with subtle texture |
| `tiles/grass-flowers.png` | Grass with small flowers (pink, red, white) |
| `tiles/dirt-path.png` | Brown dirt path tile |
| `tiles/paved-path.png` | Gray stone/paved path tile |
| `tiles/water.png` | Blue water tile (optional, for ponds) |

### Decoration Tiles (Non-walkable)

| File | Description |
|------|-------------|
| `tiles/tree.png` | Pixel art tree (may be 32x64 for taller trees) |
| `tiles/bush.png` | Small green bush |
| `tiles/rock.png` | Gray rock/boulder |
| `tiles/fence-h.png` | Horizontal fence segment |
| `tiles/fence-v.png` | Vertical fence segment |

### Structure Tiles

**House**: `tiles/house.png`
- Size: 96x96 pixels (3×3 tiles)
- Cute cottage style with heart on door
- Pink/red roof for Valentine's theme
- Will be the endpoint destination

```
┌─────────────────┐
│    ♥ ROOF ♥     │
├─────────────────┤
│  WINDOW  DOOR   │
├─────────────────┤
│    FOUNDATION   │
└─────────────────┘
```

## UI Elements

### Collectible Heart

**Files**:
- `ui/heart.png` - Floating collectible heart (32x32)
- `ui/heart-glow.png` - Same heart with glow effect for animation

**Animation**: 2-frame bobbing animation (up/down float)

**Visual**: 
- Bright red pixel heart
- Subtle shine/sparkle
- Pulsing glow effect

### Heart Counter

**File**: `ui/heart-counter-bg.png`

**Size**: 128x48 pixels

**Description**: UI panel showing collected hearts count (e.g., "♥ 3/10")

### Photo Frame

**File**: `ui/photo-frame.png`

**Size**: 400x400 pixels (or responsive)

**Description**: Decorative pixel-art frame for displaying photos in the modal. Hearts and ribbons decoration.

## Background Elements

### Floating Hearts (Player Select)

**File**: `ui/floating-heart.png`

**Sizes**: 16x16, 24x24, 32x32 (3 sizes for depth effect)

**Colors**: Multiple color variants
- Red (#FF0000)
- Pink (#FF69B4)
- Light Pink (#FFB6C1)

Used for the animated floating hearts background on the player select screen.

### Sparkles

**File**: `ui/sparkle.png`

**Size**: 16x16 pixels

**Animation**: 4-frame twinkle animation

Used for ambient decoration and effects.

## Audio Assets

### Background Music

**File**: `public/music/bgm.mp3`

**Requirements**:
- User-provided 8-bit/chiptune style music
- Loopable
- ~2-3 minutes length
- Placeholder: Empty file until user provides

### Sound Effects (Optional)

| File | Description |
|------|-------------|
| `sfx/collect.mp3` | Heart collection sound (short chime) |
| `sfx/select.mp3` | Menu selection beep |
| `sfx/step.mp3` | Footstep sound (very short) |

## Photo Assets

**Location**: `public/photos/`

**Files**: 
- `photo-01.jpg` through `photo-10.jpg`

**Requirements**:
- 10 photos provided by user
- Any aspect ratio (will be displayed in frame)
- Reasonable file size for web (<500KB each recommended)
- Placeholder: Simple numbered placeholder images until user provides

## Asset Loading Strategy

```typescript
// src/utils/assetLoader.ts

export const ASSETS = {
  sprites: {
    dudu: '/assets/sprites/dudu.png',
    chungu: '/assets/sprites/chungu.png',
  },
  tiles: {
    grass: '/assets/tiles/grass.png',
    grassFlowers: '/assets/tiles/grass-flowers.png',
    dirtPath: '/assets/tiles/dirt-path.png',
    pavedPath: '/assets/tiles/paved-path.png',
    tree: '/assets/tiles/tree.png',
    bush: '/assets/tiles/bush.png',
    house: '/assets/tiles/house.png',
  },
  ui: {
    heart: '/assets/ui/heart.png',
    photoFrame: '/assets/ui/photo-frame.png',
    floatingHeart: '/assets/ui/floating-heart.png',
  },
  photos: Array.from({ length: 10 }, (_, i) => 
    `/photos/photo-${String(i + 1).padStart(2, '0')}.jpg`
  ),
  audio: {
    bgm: '/music/bgm.mp3',
  },
} as const;
```

## Pixel Art Style Guide

### General Rules
- Use limited color palette (16-32 colors max)
- Hard pixel edges, no anti-aliasing
- 1-2 pixel black outlines on characters
- Consistent light source (top-left)
- Dithering for gradients if needed

### Character Style
- Chibi proportions (big head, small body)
- 2-3 pixel eyes (simple dots)
- Expressive despite simplicity
- Clear silhouette at small size

### Tile Style
- Seamless tiling for ground textures
- Distinct visual difference between walkable/non-walkable
- Consistent perspective (top-down, slight 3/4 view)

## Success Criteria

### Automated Verification:
- [x] All asset files exist in correct locations
- [x] Image files are valid SVG format (placeholder - can be replaced with PNG)
- [x] Sprite sheets are correct dimensions (128x128)
- [x] Tiles are 32x32 pixels

### Manual Verification:
- [ ] Characters are visually appealing and cute
- [ ] Dudu looks like the referenced bear character
- [ ] Tiles create cohesive visual style
- [ ] Hearts are easily visible against map
- [ ] House is clearly identifiable as destination
- [ ] All assets render crisp (no blur) at 1x and 2x scale
