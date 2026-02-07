import { useMemo } from 'react';
import styles from './FinaleScreen.module.css';

interface ConfettiProps {
  count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ count = 100 }) => {
  const pieces = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: ['#FF69B4', '#FF1493', '#FF0000', '#FFB6C1', '#DDA0DD'][
        Math.floor(Math.random() * 5)
      ],
      size: 8 + Math.random() * 8,
    })),
  [count]);
  
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
