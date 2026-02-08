import { useEffect, useState, useCallback } from 'react';
import { useMobile } from '../../hooks/useMobile';
import styles from './InstructionsScreen.module.css';

interface InstructionsScreenProps {
  onContinue: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const isMobile = useMobile();
  
  const handleContinue = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onContinue();
    }, 800);
  }, [isExiting, onContinue]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        handleContinue();
      }
    };
    
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue]);

  // Touch support for mobile
  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleContinue();
  }, [handleContinue]);

  const containerClasses = [
    styles.container,
    isExiting ? styles.swipeOut : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} onTouchEnd={isMobile ? handleTouch : undefined}>
      <h1 className={styles.title}>Your Mission</h1>
      
      <div className={styles.instruction}>
        <div className={styles.heartIcon}>♥</div>
        <p className={styles.message}>
          Collect all 10 hearts<br />
          to enter the house
        </p>
        <p className={styles.subMessage}>
          {isMobile ? 'Use the D-pad to move' : 'Use arrow keys or WASD to move'}
        </p>
      </div>
      
      <p className={styles.prompt}>{isMobile ? 'Tap to start' : 'Press SPACE to start'}</p>
    </div>
  );
};
