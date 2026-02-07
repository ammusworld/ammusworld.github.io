# Heart Collection System Specification

## Overview

When the player walks over a heart pickup, it triggers a collection animation, displays a photo in a modal overlay, and updates the heart counter.

## Heart Pickup Component

### Heart (Collectible)

**File**: `src/components/Heart/Heart.tsx`

```typescript
interface HeartProps {
  position: { x: number; y: number };
  photoIndex: number;
  isCollected: boolean;
  onCollect: (photoIndex: number) => void;
}

export const Heart: React.FC<HeartProps> = ({
  position,
  photoIndex,
  isCollected,
  onCollect,
}) => {
  if (isCollected) return null;
  
  return (
    <div
      className={styles.heart}
      style={{
        left: position.x * TILE_SIZE,
        top: position.y * TILE_SIZE,
      }}
    />
  );
};
```

**Styling**: `src/components/Heart/Heart.module.css`

```css
.heart {
  position: absolute;
  width: 32px;
  height: 32px;
  background-image: url('/assets/ui/heart.png');
  background-size: contain;
  image-rendering: pixelated;
  z-index: 50;
  
  /* Floating animation */
  animation: float 1s ease-in-out infinite, glow 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 0, 0, 0.8));
  }
}
```

## Collection Detection

In the main `GameMap` component:

```typescript
useEffect(() => {
  const collectedHeart = checkHeartCollision(playerGridPos, heartPositions, collectedHearts);
  
  if (collectedHeart !== null) {
    setCollectedHearts(prev => new Set([...prev, collectedHeart]));
    setShowingPhoto(collectedHeart);
    // Optional: Play collection sound
  }
}, [playerGridPos]);
```

## Collection Animation

When a heart is collected:

1. **Heart Pickup Effect**
   - Heart scales up briefly (1.5x)
   - Bursts into smaller hearts/sparkles
   - Fade out over 300ms

2. **Screen Effect**
   - Brief screen flash (white overlay, 100ms)
   - Optional: Screen shake (subtle, 2-3 frames)

3. **Counter Update**
   - Heart counter increments
   - Counter does a bounce animation
   - "+1" floats up from counter (optional)

```css
@keyframes collect {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.heartCollecting {
  animation: collect 0.3s ease-out forwards;
}
```

## Photo Modal

**File**: `src/components/PhotoModal/PhotoModal.tsx`

```typescript
interface PhotoModalProps {
  photoIndex: number;
  onClose: () => void;
  isOpen: boolean;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photoIndex,
  onClose,
  isOpen,
}) => {
  const photoSrc = `/photos/photo-${String(photoIndex + 1).padStart(2, '0')}.jpg`;
  
  // Close on Escape or Space/Enter
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.frame}>
          <img src={photoSrc} alt={`Memory ${photoIndex + 1}`} />
        </div>
        <div className={styles.counter}>
          {photoIndex + 1} / 10
        </div>
        <p className={styles.hint}>Press space to continue</p>
      </div>
    </div>
  );
};
```

**Styling**: `src/components/PhotoModal/PhotoModal.module.css`

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { 
    transform: scale(0.8);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}

.frame {
  width: 400px;
  height: 400px;
  padding: 16px;
  background: linear-gradient(135deg, var(--pink-medium), var(--pink-dark));
  border: 4px solid var(--pink-light);
  border-radius: 8px;
  box-shadow: 
    0 0 30px rgba(255, 105, 180, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  image-rendering: auto; /* Photos should NOT be pixelated */
}

.counter {
  margin-top: 16px;
  font-size: 16px;
  color: var(--pink-light);
}

.hint {
  margin-top: 24px;
  font-size: 10px;
  color: var(--pink-medium);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

## Heart Counter UI

**File**: `src/components/UI/HeartCounter.tsx`

```typescript
interface HeartCounterProps {
  collected: number;
  total: number;
}

export const HeartCounter: React.FC<HeartCounterProps> = ({ collected, total }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (collected > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [collected]);
  
  return (
    <div className={`${styles.counter} ${isAnimating ? styles.bounce : ''}`}>
      <span className={styles.heartIcon}>♥</span>
      <span className={styles.count}>{collected}/{total}</span>
    </div>
  );
};
```

**Styling**: `src/components/UI/HeartCounter.module.css`

```css
.counter {
  position: fixed;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--pink-medium);
  border-radius: 4px;
  z-index: 500;
}

.heartIcon {
  color: var(--red-heart);
  font-size: 20px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.count {
  font-size: 14px;
  color: var(--white);
}

.bounce {
  animation: counterBounce 0.3s ease;
}

@keyframes counterBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

## Game State Integration

```typescript
// In GameMap component

const [collectedHearts, setCollectedHearts] = useState<Set<number>>(new Set());
const [showingPhotoIndex, setShowingPhotoIndex] = useState<number | null>(null);

const handleHeartCollect = (photoIndex: number) => {
  setCollectedHearts(prev => new Set([...prev, photoIndex]));
  setShowingPhotoIndex(photoIndex);
};

const handleModalClose = () => {
  setShowingPhotoIndex(null);
  // Resume game input
};

return (
  <>
    <div className="gameViewport">
      {/* ... map rendering */}
      {MAP_DATA.heartPositions.map(heart => (
        <Heart
          key={heart.photoIndex}
          position={{ x: heart.x, y: heart.y }}
          photoIndex={heart.photoIndex}
          isCollected={collectedHearts.has(heart.photoIndex)}
        />
      ))}
    </div>
    
    <HeartCounter collected={collectedHearts.size} total={10} />
    
    <PhotoModal
      photoIndex={showingPhotoIndex ?? 0}
      isOpen={showingPhotoIndex !== null}
      onClose={handleModalClose}
    />
  </>
);
```

## Pause Game When Modal Open

While the photo modal is showing:
- Player movement is paused
- Keyboard input only closes modal
- Game timer paused (if any)

```typescript
// In useKeyboardInput or useCharacterController
const isModalOpen = showingPhotoIndex !== null;

useEffect(() => {
  if (isModalOpen) {
    // Disable normal game input
    return;
  }
  // Normal movement handling
}, [isModalOpen, /* other deps */]);
```

## Success Criteria

### Automated Verification:
- [ ] Heart positions array has 10 entries
- [ ] Photo paths are correctly formatted
- [ ] Heart state tracks collection correctly
- [ ] Modal opens/closes without errors
- [ ] TypeScript compiles without errors

### Manual Verification:
- [ ] Hearts are visible and animated (floating, glowing)
- [ ] Walking over heart collects it
- [ ] Collection animation plays (optional if implemented)
- [ ] Photo modal appears with correct image
- [ ] Modal can be closed with Escape/Space/Enter/Click
- [ ] Heart disappears after collection
- [ ] Heart counter updates correctly
- [ ] Counter bounce animation plays on collection
- [ ] Game pauses while modal is open
- [ ] Previously collected hearts stay gone
- [ ] All 10 photos display correctly
