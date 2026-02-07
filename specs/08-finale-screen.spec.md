# Finale Screen Specification

## Overview

When the player reaches the house and interacts with it, the game transitions to a fullscreen animated Valentine's Day celebration message.

## House Interaction Zone

The house is a 3×3 tile structure. The interaction trigger:

- **House tiles**: (18,2), (19,2), (20,2), (18,3), (19,3), (20,3), (18,4), (19,4), (20,4)
- **Door position**: Center bottom (19, 4)
- **Interaction zone**: (19, 5) - one tile south of door

When player stands at (19, 5):
1. A prompt appears: "Press SPACE to enter"
2. Player presses Space/Enter
3. Finale transition begins

## Interaction Trigger

**File**: In `GameMap.tsx`

```typescript
const isAtHouse = playerGridPos.x === 19 && playerGridPos.y === 5;
const [showHousePrompt, setShowHousePrompt] = useState(false);

useEffect(() => {
  setShowHousePrompt(isAtHouse);
}, [isAtHouse]);

useEffect(() => {
  if (isAtHouse && keys.action) {
    onHouseReached();
  }
}, [isAtHouse, keys.action]);

// In render:
{showHousePrompt && (
  <div className={styles.housePrompt}>
    Press SPACE to enter
  </div>
)}
```

## House Prompt UI

```css
.housePrompt {
  position: absolute;
  top: -40px; /* Above the player */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: var(--white);
  padding: 8px 16px;
  border: 2px solid var(--pink-medium);
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  animation: bob 1s ease-in-out infinite;
  z-index: 200;
}

@keyframes bob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}
```

## Finale Screen Component

**File**: `src/components/FinaleScreen/FinaleScreen.tsx`

```typescript
interface FinaleScreenProps {
  characterName: 'Dudu' | 'Chungu';
  heartsCollected: number;
}

export const FinaleScreen: React.FC<FinaleScreenProps> = ({ 
  characterName,
  heartsCollected 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    // Sequence the animations
    const timers = [
      setTimeout(() => setAnimationPhase(1), 500),   // Hearts start
      setTimeout(() => setAnimationPhase(2), 1500),  // Title appears
      setTimeout(() => setAnimationPhase(3), 2500),  // Name appears
      setTimeout(() => setAnimationPhase(4), 3500),  // Stats appear
    ];
    
    return () => timers.forEach(clearTimeout);
  }, []);
  
  return (
    <div className={styles.container}>
      {/* Animated background hearts */}
      <div className={styles.heartsBackground}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={styles.bgHeart}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${16 + Math.random() * 24}px`,
            }}
          >
            ♥
          </div>
        ))}
      </div>
      
      {/* Confetti (optional) */}
      {animationPhase >= 1 && <Confetti />}
      
      {/* Main Message */}
      <div className={styles.messageContainer}>
        {animationPhase >= 2 && (
          <h1 className={styles.title}>
            Happy Valentine's Day
          </h1>
        )}
        
        {animationPhase >= 3 && (
          <h2 className={styles.name}>
            {characterName}!
          </h2>
        )}
        
        {animationPhase >= 4 && (
          <div className={styles.stats}>
            <p>You collected</p>
            <p className={styles.heartCount}>
              ♥ {heartsCollected} / 10 ♥
            </p>
            <p>precious memories!</p>
          </div>
        )}
      </div>
      
      {/* Hearts around text */}
      <div className={styles.decorativeHearts}>
        {['♥', '♡', '❤', '💕', '💗'].map((heart, i) => (
          <span
            key={i}
            className={styles.floatingHeart}
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {heart}
          </span>
        ))}
      </div>
    </div>
  );
};
```

## Finale Styling

**File**: `src/components/FinaleScreen/FinaleScreen.module.css`

```css
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    135deg,
    #1a0a2e 0%,
    #2d1b4e 25%,
    #4a1942 50%,
    #2d1b4e 75%,
    #1a0a2e 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: fadeIn 1s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Background falling hearts */
.heartsBackground {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.bgHeart {
  position: absolute;
  top: -50px;
  color: var(--pink-medium);
  opacity: 0.3;
  animation: fall 8s linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-50px) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

/* Main message */
.messageContainer {
  text-align: center;
  z-index: 10;
}

.title {
  font-size: 48px;
  color: var(--pink-light);
  text-shadow:
    0 0 10px var(--pink-medium),
    0 0 20px var(--pink-medium),
    0 0 40px var(--pink-dark),
    4px 4px 0 var(--pink-dark);
  margin: 0;
  animation: titleAppear 1s ease-out;
}

@keyframes titleAppear {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  60% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.name {
  font-size: 64px;
  color: var(--red-heart);
  text-shadow:
    0 0 10px var(--red-heart),
    0 0 30px var(--pink-medium),
    4px 4px 0 #8B0000;
  margin: 24px 0;
  animation: nameAppear 1s ease-out, pulse 2s ease-in-out infinite;
  animation-delay: 0s, 1s;
}

@keyframes nameAppear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stats {
  margin-top: 32px;
  animation: statsAppear 0.8s ease-out;
}

@keyframes statsAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats p {
  font-size: 16px;
  color: var(--pink-light);
  margin: 8px 0;
}

.heartCount {
  font-size: 32px !important;
  color: var(--red-heart) !important;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Decorative floating hearts around text */
.decorativeHearts {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floatingHeart {
  position: absolute;
  font-size: 32px;
  animation: floatAround 5s ease-in-out infinite;
}

.floatingHeart:nth-child(1) { top: 20%; left: 10%; }
.floatingHeart:nth-child(2) { top: 30%; right: 15%; }
.floatingHeart:nth-child(3) { bottom: 25%; left: 20%; }
.floatingHeart:nth-child(4) { bottom: 30%; right: 10%; }
.floatingHeart:nth-child(5) { top: 50%; left: 5%; }

@keyframes floatAround {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(10deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-10deg);
  }
}
```

## Confetti Component (Optional Enhancement)

**File**: `src/components/FinaleScreen/Confetti.tsx`

```typescript
export const Confetti: React.FC = () => {
  const pieces = useMemo(() => 
    Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: ['#FF69B4', '#FF1493', '#FF0000', '#FFB6C1', '#DDA0DD'][
        Math.floor(Math.random() * 5)
      ],
      size: 8 + Math.random() * 8,
    })),
  []);
  
  return (
    <div className={styles.confettiContainer}>
      {pieces.map(piece => (
        <div
          key={piece.id}
          className={styles.confetti}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
          }}
        />
      ))}
    </div>
  );
};
```

## Screen Transition

Transition from game map to finale:

```typescript
// In App.tsx

const handleHouseReached = () => {
  // Start transition
  setIsTransitioning(true);
  
  // Wait for transition, then show finale
  setTimeout(() => {
    setScreen('finale');
    setIsTransitioning(false);
  }, 1000);
};

// Transition overlay
{isTransitioning && (
  <div className={styles.transitionOverlay}>
    <div className={styles.transitionCircle} />
  </div>
)}
```

**Transition effect**: Classic circle wipe (like entering a Pokémon building)

```css
.transitionOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--black);
  z-index: 2000;
  animation: circleWipe 1s ease-in-out forwards;
}

@keyframes circleWipe {
  0% {
    clip-path: circle(0% at 50% 50%);
  }
  50% {
    clip-path: circle(0% at 50% 50%);
    background: var(--black);
  }
  100% {
    clip-path: circle(150% at 50% 50%);
    background: transparent;
  }
}
```

## Success Criteria

### Automated Verification:
- [ ] Component renders without errors
- [ ] Character name prop is displayed correctly
- [ ] Hearts collected count is displayed
- [ ] TypeScript compiles without errors

### Manual Verification:
- [ ] House prompt appears when player is at interaction zone
- [ ] Pressing Space at house triggers transition
- [ ] Transition animation is smooth (circle wipe or fade)
- [ ] Finale screen background is visually appealing
- [ ] "Happy Valentine's Day" appears with animation
- [ ] Character name appears with dramatic effect
- [ ] Hearts collected count is shown correctly
- [ ] Background hearts animation is smooth
- [ ] Confetti adds festive feel (if implemented)
- [ ] Overall effect is celebratory and cute
- [ ] Text is readable despite animations
- [ ] Works for both "Dudu" and "Chungu" character names
