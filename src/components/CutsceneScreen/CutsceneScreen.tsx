import { useState, useEffect } from 'react';
import { ASSETS } from '../../utils/assets';
import styles from './CutsceneScreen.module.css';

interface CutsceneScreenProps {
  onComplete: () => void;
}

const CUTSCENE_GIFS: Array<{ src: string; duration: number; scale?: number }> = [
  { src: ASSETS.cutscene.bubuRun, duration: 1500 },
  { src: ASSETS.cutscene.bubuHug, duration: 2000, scale: 2.6 },
  { src: ASSETS.cutscene.bubuSpin, duration: 3000 },
];

export const CutsceneScreen: React.FC<CutsceneScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (currentIndex >= CUTSCENE_GIFS.length) {
      onComplete();
      return;
    }

    const { duration } = CUTSCENE_GIFS[currentIndex];
    
    // Start fade out before transitioning
    const fadeOutTimer = setTimeout(() => {
      setFadeState('out');
    }, duration - 500);

    // Move to next GIF
    const nextTimer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setFadeState('in');
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, onComplete]);

  if (currentIndex >= CUTSCENE_GIFS.length) {
    return null;
  }

  const currentGif = CUTSCENE_GIFS[currentIndex];

  return (
    <div 
      className={styles.container}
      style={{ backgroundImage: `url(${ASSETS.cutscene.houseInside})` }}
    >
      <div className={styles.gifWrapper}>
        <img
          key={currentIndex}
          src={currentGif.src}
          alt="Cutscene"
          className={`${styles.gif} ${styles[fadeState]}`}
          style={currentGif.scale ? { transform: `scale(${currentGif.scale})` } : undefined}
        />
      </div>
    </div>
  );
};
