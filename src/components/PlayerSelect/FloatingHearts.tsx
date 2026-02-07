import { useMemo } from 'react';
import styles from './PlayerSelect.module.css';

interface FloatingHeart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const HEART_COLORS = [
  '#ff6b9d', // pink
  '#ff4757', // red
  '#ff8a9d', // light pink
  '#e84393', // hot pink
  '#fd79a8', // pastel pink
];

export function FloatingHearts({ count = 25 }: Readonly<{ count?: number }>) {
  const hearts = useMemo<FloatingHeart[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 24,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 15,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    }));
  }, [count]);

  return (
    <div className={styles.heartsContainer}>
      {hearts.map((heart) => (
        <svg
          key={heart.id}
          className={styles.floatingHeart}
          style={{
            left: `${heart.left}%`,
            width: heart.size,
            height: heart.size,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
          viewBox="0 0 24 24"
          fill={heart.color}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
