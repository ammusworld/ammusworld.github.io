import { useEffect, useState, useCallback } from 'react';
import styles from './InstructionsScreen.module.css';

interface InstructionsScreenProps {
  onContinue: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  
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
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue]);

  const containerClasses = [
    styles.container,
    isExiting ? styles.swipeOut : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <h1 className={styles.title}>Your Mission</h1>
      
      <div className={styles.instruction}>
        <div className={styles.heartIcon}>♥</div>
        <p className={styles.message}>
          Collect all 10 hearts<br />
          to enter the house
        </p>
        <p className={styles.subMessage}>
          Use arrow keys or WASD to move
        </p>
      </div>
      
      <p className={styles.prompt}>Press SPACE to start</p>
    </div>
  );
};
