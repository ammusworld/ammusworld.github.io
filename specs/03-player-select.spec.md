# Player Select Screen Specification

## Overview

A retro game-style character selection screen where the player chooses between Dudu (white bear) or Chungu (pixel girl). Features animated character sprites, floating hearts background, and 8-bit music toggle.

## Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  ♪ [Music Toggle]                                          │
│                                                            │
│              ♥ ♥    CHOOSE YOUR    ♥ ♥                     │
│                      PLAYER                                │
│                                                            │
│    ┌─────────────┐            ┌─────────────┐              │
│    │             │            │             │              │
│    │    DUDU     │            │   CHUNGU    │              │
│    │   (sprite)  │            │   (sprite)  │              │
│    │  animated   │            │  animated   │              │
│    │             │            │             │              │
│    └─────────────┘            └─────────────┘              │
│         [A]                        [B]                     │
│                                                            │
│              Press A or B to select                        │
│                                                            │
│    ♥    ♥         ♥       ♥          ♥    ♥               │
│         (floating hearts animation)                        │
└────────────────────────────────────────────────────────────┘
```

## Components

### PlayerSelectScreen

**File**: `src/components/PlayerSelect/PlayerSelectScreen.tsx`

```typescript
interface PlayerSelectScreenProps {
  onSelect: (character: 'dudu' | 'chungu') => void;
}

export const PlayerSelectScreen: React.FC<PlayerSelectScreenProps> = ({ onSelect }) => {
  // ...
}
```

**State**:
- `selectedCharacter: 'dudu' | 'chungu' | null` - Currently highlighted character
- `isTransitioning: boolean` - True when swipe-away animation is playing

**Keyboard Controls**:
- `A` key → Select Dudu
- `B` key → Select Chungu
- `←` `→` Arrow keys → Highlight/preview character
- `Enter` / `Space` → Confirm highlighted selection

### CharacterCard

**File**: `src/components/PlayerSelect/CharacterCard.tsx`

```typescript
interface CharacterCardProps {
  character: 'dudu' | 'chungu';
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}
```

**Features**:
- Displays character name
- Shows animated idle sprite (2-4 frame loop)
- Glowing border when highlighted
- Bounce animation when selected
- Selection key indicator (A or B)

### AnimatedSprite

**File**: `src/components/PlayerSelect/AnimatedSprite.tsx`

```typescript
interface AnimatedSpriteProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  row: number; // Which row of sprite sheet (direction)
}
```

**Implementation**:
- Uses CSS animation to cycle through sprite frames
- `background-position` shifts to show each frame
- Configurable FPS (default: 4 fps for idle animation)

### FloatingHearts

**File**: `src/components/PlayerSelect/FloatingHearts.tsx`

```typescript
interface FloatingHeartsProps {
  count: number; // Number of hearts (default: 20-30)
}
```

**Implementation**:
- Generates random hearts with varying:
  - Sizes (16px, 24px, 32px)
  - Colors (red, pink, light pink)
  - Horizontal positions
  - Animation delays
  - Float speeds (8-15 seconds)
- CSS animation: float from bottom to top
- Hearts respawn when they exit viewport
- Subtle rotation during float

**CSS Animation**:
```css
@keyframes floatUp {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.floating-heart {
  position: absolute;
  animation: floatUp var(--duration) linear infinite;
  animation-delay: var(--delay);
}
```

### MusicToggle

**File**: `src/components/UI/MusicToggle.tsx`

```typescript
interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}
```

**Implementation**:
- Pixel art speaker icon
- Muted by default (shows 🔇)
- Click to toggle → shows 🔊 when playing
- Uses `useAudio` hook for audio control

## Animations

### Character Idle Animation

- 4-frame loop at 4 FPS
- Subtle breathing/bobbing motion
- Frame sequence: 1 → 2 → 3 → 4 → 3 → 2 → 1 (ping-pong)

### Selection Animation

When character is selected:
1. Selected card scales up slightly (1.1x) with bounce easing
2. Other card fades out (opacity 0.3)
3. Hearts speed up briefly
4. 500ms delay, then transition starts

### Screen Transition

After selection:
1. Selected character moves to center
2. Entire screen slides/swipes left (or right)
3. Game map fades in from the opposite direction
4. Transition duration: 800ms

**CSS Transition**:
```css
@keyframes swipeOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.screen-exit {
  animation: swipeOut 0.8s ease-in-out forwards;
}
```

## Styling

**File**: `src/components/PlayerSelect/PlayerSelect.module.css`

```css
.container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #1a0a1a 0%, #2d1f3d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.title {
  font-size: 32px;
  color: var(--pink-medium);
  text-shadow: 
    2px 2px 0 var(--pink-dark),
    4px 4px 0 rgba(0,0,0,0.5);
  margin-bottom: 48px;
  animation: pulse 2s ease-in-out infinite;
}

.characterGrid {
  display: flex;
  gap: 64px;
}

.characterCard {
  width: 200px;
  height: 280px;
  background: rgba(255,255,255,0.1);
  border: 4px solid var(--pink-medium);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.characterCard:hover,
.characterCard.highlighted {
  border-color: var(--pink-light);
  box-shadow: 
    0 0 20px var(--pink-medium),
    inset 0 0 20px rgba(255,182,193,0.2);
  transform: scale(1.05);
}

.characterCard.selected {
  animation: selectBounce 0.5s ease;
}

@keyframes selectBounce {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.15); }
}

.characterName {
  font-size: 16px;
  color: var(--white);
  margin-top: 16px;
}

.keyHint {
  font-size: 12px;
  color: var(--pink-light);
  margin-top: auto;
  padding: 8px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 4px;
}

.instructions {
  position: absolute;
  bottom: 48px;
  font-size: 12px;
  color: var(--pink-light);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

## Audio Hook

**File**: `src/hooks/useAudio.ts`

```typescript
export function useAudio(src: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, [src]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return { isPlaying, toggle };
}
```

## Game State Integration

The selected character is passed to the parent `App` component which manages game state:

```typescript
// App.tsx
type GameScreen = 'select' | 'game' | 'finale';
type Character = 'dudu' | 'chungu';

function App() {
  const [screen, setScreen] = useState<GameScreen>('select');
  const [character, setCharacter] = useState<Character | null>(null);

  const handleCharacterSelect = (char: Character) => {
    setCharacter(char);
    // Transition animation handled by component
    setTimeout(() => setScreen('game'), 800);
  };

  return (
    <>
      {screen === 'select' && (
        <PlayerSelectScreen onSelect={handleCharacterSelect} />
      )}
      {screen === 'game' && character && (
        <GameMap character={character} />
      )}
    </>
  );
}
```

## Success Criteria

### Automated Verification:
- [ ] Component renders without errors
- [ ] Keyboard events (A, B, arrows, Enter) are handled
- [ ] Audio toggle works correctly
- [ ] TypeScript compiles without errors

### Manual Verification:
- [ ] Title is clearly visible with retro styling
- [ ] Both character cards display correctly
- [ ] Character sprites animate smoothly (idle animation)
- [ ] Floating hearts animation is smooth and continuous
- [ ] Hover/highlight effects work on character cards
- [ ] Selection animation plays correctly
- [ ] Screen transition is smooth (swipe effect)
- [ ] Music toggle icon updates correctly
- [ ] Music plays when toggled on
- [ ] Overall aesthetic is "cute retro game"
