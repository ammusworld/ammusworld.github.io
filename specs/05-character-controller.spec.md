# Character Controller Specification

## Overview

Handles player input, character movement, sprite animation, and collision response. The character moves tile-by-tile (not pixel-based) in the classic GBA Pokémon style.

## Movement System

### Grid-Based Movement
- Character occupies exactly one tile at a time
- Movement is tile-to-tile (32px per move)
- Smooth animation interpolates between tiles
- Movement speed: ~4 tiles per second (250ms per tile)

### Movement States
```typescript
type MovementState = 'idle' | 'walking';
type Direction = 'up' | 'down' | 'left' | 'right';

interface CharacterState {
  gridPos: { x: number; y: number };     // Current tile position
  pixelPos: { x: number; y: number };    // Animated pixel position
  direction: Direction;
  state: MovementState;
  isMoving: boolean;
}
```

## Keyboard Input Hook

**File**: `src/hooks/useKeyboardInput.ts`

```typescript
interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean; // Space/Enter for interactions
}

export function useKeyboardInput(): KeyboardState {
  const [keys, setKeys] = useState<KeyboardState>({
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(k => ({ ...k, up: true }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(k => ({ ...k, down: true }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(k => ({ ...k, left: true }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(k => ({ ...k, right: true }));
          break;
        case ' ':
        case 'Enter':
          setKeys(k => ({ ...k, action: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // ... similar logic setting to false
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
```

## Character Controller Hook

**File**: `src/hooks/useCharacterController.ts`

```typescript
interface UseCharacterControllerOptions {
  initialPos: { x: number; y: number };
  mapData: MapData;
  onMove?: (newPos: { x: number; y: number }) => void;
}

interface CharacterController {
  gridPos: { x: number; y: number };
  pixelPos: { x: number; y: number };
  direction: Direction;
  isMoving: boolean;
  animationFrame: number;
}

export function useCharacterController({
  initialPos,
  mapData,
  onMove,
}: UseCharacterControllerOptions): CharacterController {
  const [gridPos, setGridPos] = useState(initialPos);
  const [pixelPos, setPixelPos] = useState({
    x: initialPos.x * TILE_SIZE,
    y: initialPos.y * TILE_SIZE,
  });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  const keys = useKeyboardInput();
  
  // Movement logic
  useEffect(() => {
    if (isMoving) return; // Can't start new movement while moving
    
    let targetDir: Direction | null = null;
    let dx = 0, dy = 0;
    
    // Priority: most recent key or first pressed
    if (keys.up) { targetDir = 'up'; dy = -1; }
    else if (keys.down) { targetDir = 'down'; dy = 1; }
    else if (keys.left) { targetDir = 'left'; dx = -1; }
    else if (keys.right) { targetDir = 'right'; dx = 1; }
    
    if (targetDir) {
      setDirection(targetDir);
      
      const newX = gridPos.x + dx;
      const newY = gridPos.y + dy;
      
      if (canMoveTo(newX, newY, mapData)) {
        setIsMoving(true);
        startMoveAnimation(gridPos, { x: newX, y: newY });
        setGridPos({ x: newX, y: newY });
        onMove?.({ x: newX, y: newY });
      }
    }
  }, [keys, isMoving, gridPos, mapData]);
  
  // Animate pixel position
  const startMoveAnimation = (from: Position, to: Position) => {
    const startTime = performance.now();
    const duration = 250; // ms per tile
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const eased = progress; // Linear, or use easeOutQuad
      
      setPixelPos({
        x: from.x * TILE_SIZE + (to.x - from.x) * TILE_SIZE * eased,
        y: from.y * TILE_SIZE + (to.y - from.y) * TILE_SIZE * eased,
      });
      
      // Update animation frame for walk cycle
      setAnimationFrame(Math.floor(elapsed / 100) % 4);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        setAnimationFrame(0);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  return { gridPos, pixelPos, direction, isMoving, animationFrame };
}
```

## Character Component

**File**: `src/components/Character/Character.tsx`

```typescript
interface CharacterProps {
  character: 'dudu' | 'chungu';
  pixelPos: { x: number; y: number };
  direction: Direction;
  animationFrame: number;
  isMoving: boolean;
}

export const Character: React.FC<CharacterProps> = ({
  character,
  pixelPos,
  direction,
  animationFrame,
  isMoving,
}) => {
  const spriteSheet = character === 'dudu' ? duduSprite : chunguSprite;
  
  // Calculate sprite sheet offset
  const directionRow = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  }[direction];
  
  const frameCol = isMoving ? animationFrame : 0;
  
  return (
    <div
      className={styles.character}
      style={{
        left: pixelPos.x,
        top: pixelPos.y,
        backgroundImage: `url(${spriteSheet})`,
        backgroundPosition: `-${frameCol * 32}px -${directionRow * 32}px`,
      }}
    />
  );
};
```

**File**: `src/components/Character/Character.module.css`

```css
.character {
  position: absolute;
  width: 32px;
  height: 32px;
  background-size: 128px 128px; /* 4×4 sprite sheet */
  image-rendering: pixelated;
  z-index: 100;
  pointer-events: none;
  
  /* Center sprite on tile */
  transform: translate(0, 0);
}
```

## Sprite Animation Frames

### Walk Cycle
```
Frame 0: Standing (neutral position)
Frame 1: Left leg forward
Frame 2: Standing (neutral position)
Frame 3: Right leg forward
```

### Direction Mapping (Sprite Sheet Rows)
```
Row 0 (Y: 0px):   Down (facing camera)
Row 1 (Y: 32px):  Left
Row 2 (Y: 64px):  Right
Row 3 (Y: 96px):  Up (back view)
```

### Animation Timing
- Walk cycle: 4 frames at ~10 FPS (100ms per frame)
- Full cycle: 400ms
- Matches movement duration (250ms per tile = ~2.5 frames)

## Collision Response

When the player attempts to move to a non-walkable tile:
1. Direction is updated (character faces that direction)
2. Movement is blocked (position doesn't change)
3. Optional: Play a "bump" sound effect
4. Optional: Slight visual feedback (character does tiny bump animation)

```typescript
// Bump animation (optional polish)
const playBumpAnimation = () => {
  // Character moves 4px in blocked direction, then back
  const bumpDistance = 4;
  // ... CSS animation
};
```

## Edge Case Handling

### Holding Multiple Keys
- Priority order: Up > Down > Left > Right
- Only one direction processed at a time
- Changing direction while moving: queued for next movement

### Rapid Key Presses
- Movement queue: max 1 queued movement
- Can't spam inputs faster than movement animation

### Reaching Map Edges
- Collision detection prevents moving out of bounds
- Camera handling (spec 04) ensures no visual glitches

## Success Criteria

### Automated Verification:
- [ ] Keyboard events are captured correctly
- [ ] Grid position updates after movement completes
- [ ] Collision detection prevents invalid moves
- [ ] TypeScript compiles without errors

### Manual Verification:
- [ ] Arrow keys move character in correct direction
- [ ] WASD keys also work for movement
- [ ] Character faces correct direction when moving
- [ ] Walk animation plays smoothly during movement
- [ ] Character stops and shows idle frame when not moving
- [ ] Movement feels responsive (no input lag)
- [ ] Cannot walk through trees, rocks, water
- [ ] Cannot walk off map edges
- [ ] Movement speed feels correct (not too fast/slow)
- [ ] Holding a key continues movement (doesn't require repeated presses)
