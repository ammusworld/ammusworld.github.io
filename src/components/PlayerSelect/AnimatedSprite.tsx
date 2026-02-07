import { useState, useEffect } from 'react';
import styles from './PlayerSelect.module.css';

interface AnimatedSpriteProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
  row?: number;
  scale?: number;
}

export function AnimatedSprite({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 4,
  row = 0,
  scale = 3
}: Readonly<AnimatedSpriteProps>) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frameCount);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [frameCount, fps]);

  const displayWidth = frameWidth * scale;
  const displayHeight = frameHeight * scale;

  return (
    <div
      className={styles.animatedSprite}
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url(${src})`,
        backgroundPosition: `-${frame * frameWidth * scale}px -${row * frameHeight * scale}px`,
        backgroundSize: `${frameWidth * 4 * scale}px ${frameHeight * 4 * scale}px`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
