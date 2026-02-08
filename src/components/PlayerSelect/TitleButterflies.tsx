import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSETS } from '../../utils/assets';
import { useMobile } from '../../hooks/useMobile';
import styles from './PlayerSelect.module.css';

interface Butterfly {
  id: number;
  t: number; // parametric time for figure-8
  direction: 1 | 3; // 1=right, 3=left
  frame: number;
  speed: number; // how fast t increments
}

interface TitleButterfliesProps {
  titleRef: React.RefObject<HTMLElement | null>;
}

const FRAME_RATE = 150; // ms per frame
const VERTICAL_PADDING = 40; // extra space above/below title
const HORIZONTAL_PADDING = 50; // extra space beyond left/right of title

export function TitleButterflies({ titleRef }: Readonly<TitleButterfliesProps>) {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const [bounds, setBounds] = useState({ width: 900, height: 80 });
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef(0);
  const isMobile = useMobile();

  // Get bounds from title element
  useEffect(() => {
    const updateBounds = () => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        setBounds({ width: rect.width, height: rect.height });
      }
    };
    
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [titleRef]);

  // Initialize butterflies with different speeds and starting phases
  useEffect(() => {
    if (bounds.width < 50) return;
    
    const initButterflies: Butterfly[] = [
      {
        id: 0,
        t: 0, // start at one side of figure-8
        direction: 1,
        frame: 0,
        speed: 0.008, // faster butterfly
      },
      {
        id: 1,
        t: Math.PI, // start at opposite side
        direction: 3,
        frame: 0,
        speed: 0.006, // slower butterfly
      },
    ];
    setButterflies(initButterflies);
  }, [bounds.width, bounds.height]);

  // Calculate position on figure-8 path
  const getPosition = useCallback((t: number) => {
    // Elongated horizontal figure-8 (lemniscate)
    // x = A * sin(t), y = B * sin(2t)
    const amplitudeX = (bounds.width + HORIZONTAL_PADDING * 2 - 32) / 2;
    const amplitudeY = (bounds.height + VERTICAL_PADDING * 2) / 3;
    const centerX = bounds.width / 2 - 16;
    const centerY = bounds.height / 2 - 16;
    
    const x = centerX + amplitudeX * Math.sin(t);
    const y = centerY + amplitudeY * Math.sin(2 * t);
    
    // Direction based on x velocity (derivative of sin(t) is cos(t))
    const xVelocity = Math.cos(t);
    const direction: 1 | 3 = xVelocity > 0 ? 1 : 3;
    
    return { x, y, direction };
  }, [bounds]);

  // Animation loop
  useEffect(() => {
    if (butterflies.length === 0) return;

    const updateButterfly = (b: Butterfly, shouldUpdateFrame: boolean): Butterfly => {
      const newT = b.t + b.speed;
      const { direction } = getPosition(newT);
      
      return {
        ...b,
        t: newT,
        direction,
        frame: shouldUpdateFrame ? (b.frame + 1) % 3 : b.frame,
      };
    };

    const animate = (currentTime: number) => {
      const shouldUpdateFrame = currentTime - lastFrameTime.current > FRAME_RATE;
      if (shouldUpdateFrame) {
        lastFrameTime.current = currentTime;
      }

      setButterflies(prev => prev.map(b => updateButterfly(b, shouldUpdateFrame)));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [butterflies.length, getPosition]);

  // Sprite sheet: 3 cols x 4 rows, each frame 16x32
  // Desktop: Scale 2x = 32x64 display, 96x256 background-size
  // Mobile: Scale 1.5x = 24x48 display, 72x192 background-size
  const getBackgroundPosition = useCallback((direction: number, frame: number) => {
    const col = frame;
    const row = direction;
    const frameWidth = isMobile ? 24 : 32;
    const frameHeight = isMobile ? 48 : 64;
    return `-${col * frameWidth}px -${row * frameHeight}px`;
  }, [isMobile]);

  return (
    <div className={styles.butterfliesContainer} style={{ top: -VERTICAL_PADDING }}>
      {butterflies.map(b => {
        const { x, y } = getPosition(b.t);
        return (
          <div
            key={b.id}
            className={styles.flyingButterfly}
            style={{
              backgroundImage: `url(${ASSETS.sprites.butterfly})`,
              backgroundPosition: getBackgroundPosition(b.direction, b.frame),
              left: x,
              top: y + VERTICAL_PADDING,
            }}
          />
        );
      })}
    </div>
  );
}
