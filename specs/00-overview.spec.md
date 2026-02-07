# Valentine's Day RPG Game - Overview Specification

## Project Summary

A Valentine's Day themed mini-RPG web game where the player selects a character (Dudu the bear or Chungu the girl), then explores a top-down Pokémon-style forest map, collecting hearts that reveal personal photos, ultimately reaching a house that triggers a Valentine's Day celebration message.

## Tech Stack

- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: CSS Modules + CSS Animations
- **Fonts**: Press Start 2P (Google Fonts) for retro pixel aesthetic
- **Hosting**: GitHub Pages (static build)
- **Build**: Vite with base path config for GitHub Pages

## Game Flow

```
┌─────────────────────┐
│   Title Screen      │
│  (Music toggle)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Player Select      │
│  Dudu  |  Chungu    │
│ (animated sprites)  │
└──────────┬──────────┘
           │ (swipe transition)
           ▼
┌─────────────────────┐
│    Game Map         │
│  - Forest paths     │
│  - 10 hearts        │
│  - House endpoint   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────────┐
│ Collect │ │ Reach House │
│ Heart   │ │             │
└────┬────┘ └──────┬──────┘
     │             │
     ▼             ▼
┌─────────┐ ┌─────────────────────┐
│ Show    │ │ Animated Valentine  │
│ Photo   │ │ Message Finale      │
│ Modal   │ │ "Happy Valentine's  │
└─────────┘ │  Day, [Name]!"      │
            └─────────────────────┘
```

## Directory Structure

```
vsite/
├── specs/                    # Specification documents
├── public/
│   ├── photos/              # 10 JPG photos for heart collection
│   │   ├── photo-01.jpg
│   │   ├── photo-02.jpg
│   │   └── ... (photo-10.jpg)
│   ├── music/
│   │   └── bgm.mp3          # Background music (user-provided)
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── sprites/         # Character sprite sheets
│   │   │   ├── dudu.png
│   │   │   └── chungu.png
│   │   ├── tiles/           # Map tile images
│   │   │   ├── grass.png
│   │   │   ├── dirt-path.png
│   │   │   ├── paved-path.png
│   │   │   ├── flowers.png
│   │   │   ├── tree.png
│   │   │   └── house.png
│   │   └── ui/              # UI elements
│   │       ├── heart.png
│   │       ├── heart-collected.png
│   │       └── frame.png
│   ├── components/
│   │   ├── TitleScreen/
│   │   ├── PlayerSelect/
│   │   ├── GameMap/
│   │   ├── Character/
│   │   ├── Heart/
│   │   ├── PhotoModal/
│   │   ├── FinaleScreen/
│   │   └── UI/
│   ├── hooks/
│   │   ├── useKeyboardInput.ts
│   │   ├── useGameState.ts
│   │   └── useAudio.ts
│   ├── data/
│   │   ├── mapData.ts       # Tile map definition
│   │   └── heartPositions.ts
│   ├── types/
│   │   └── game.ts
│   ├── utils/
│   │   └── collision.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Pages deployment
```

## Spec Files Index

| File | Description |
|------|-------------|
| [01-project-setup.spec.md](./01-project-setup.spec.md) | Vite, React, TypeScript, GitHub Pages config |
| [02-assets.spec.md](./02-assets.spec.md) | All pixel art assets, sprites, tiles, UI elements |
| [03-player-select.spec.md](./03-player-select.spec.md) | Character selection screen with animations |
| [04-tile-map-engine.spec.md](./04-tile-map-engine.spec.md) | Map rendering, camera, tile system |
| [05-character-controller.spec.md](./05-character-controller.spec.md) | Player movement, animation, collision |
| [06-map-design.spec.md](./06-map-design.spec.md) | Actual map layout, paths, decorations |
| [07-heart-collection.spec.md](./07-heart-collection.spec.md) | Heart pickups and photo modal |
| [08-finale-screen.spec.md](./08-finale-screen.spec.md) | House interaction, Valentine's message |

## Visual Style Guide

### Color Palette (Retro 8-bit Valentine's)

```css
--pink-light: #FFB6C1;    /* Light pink - backgrounds */
--pink-medium: #FF69B4;   /* Hot pink - accents */
--pink-dark: #FF1493;     /* Deep pink - highlights */
--red-heart: #FF0000;     /* Pure red - hearts */
--purple-soft: #DDA0DD;   /* Plum - secondary accent */
--green-grass: #228B22;   /* Forest green - grass */
--brown-dirt: #8B4513;    /* Saddle brown - dirt paths */
--gray-stone: #696969;    /* Dim gray - paved paths */
--white: #FFFFFF;         /* White - text, Dudu */
--black: #000000;         /* Black - outlines */
```

### Typography

- **Primary Font**: "Press Start 2P" (Google Fonts) - all text
- **Font Sizes**: 8px, 16px, 24px, 32px (multiples of 8 for pixel-perfect)

### Visual Effects

- CRT scanline overlay (subtle)
- Pixelated rendering (image-rendering: pixelated)
- Floating hearts animation on select screen
- Screen shake on heart collection
- Confetti on finale screen

## Constraints

- **Desktop only** - no mobile/touch support
- **Keyboard controls only** - Arrow keys for movement
- **Static hosting** - no backend, no save state
- **Refresh = restart** - game state resets on page reload
- **10 photos max** - hardcoded in repo
