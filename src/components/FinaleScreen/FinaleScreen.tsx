import { useState, useEffect, useMemo } from 'react';
import type { Character } from '../../types/game';
import { Confetti } from './Confetti';
import styles from './FinaleScreen.module.css';

const CHARACTER_DISPLAY_NAMES: Record<Character, string> = {
  dudu: 'Dudu',
  chungu: 'Chungu',
};

interface FinaleScreenProps {
  character: Character;
  heartsCollected: number;
  onRestart: () => void;
}

export const FinaleScreen: React.FC<FinaleScreenProps> = ({ 
  character,
  heartsCollected,
  onRestart,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const characterName = CHARACTER_DISPLAY_NAMES[character];
  
  // Seeded pseudo-random for stable but natural-looking distribution
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate background hearts with stable but random-looking positions
  const bgHearts = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: seededRandom(i * 7 + 1) * 100,
      delay: seededRandom(i * 13 + 2) * 8, // Spread delay over 8 seconds
      fontSize: 16 + Math.floor(seededRandom(i * 19 + 3) * 5) * 6,
      duration: 6 + seededRandom(i * 23 + 4) * 6, // 6-12 second duration
    })),
  []);
  
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
        {bgHearts.map((heart) => (
          <div
            key={heart.id}
            className={styles.bgHeart}
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.fontSize}px`,
            }}
          >
            ♥
          </div>
        ))}
      </div>
      
      {/* Confetti */}
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
            
            <button className={styles.restartButton} onClick={onRestart}>
              Play Again
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {animationPhase >= 4 && (
        <div className={styles.footer}>
          With love, Kuchu 💕
        </div>
      )}
      
      {/* Hearts around text */}
      <div className={styles.decorativeHearts}>
        {['💕', '💗'].map((heart, i) => (
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
