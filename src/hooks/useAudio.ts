import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudio(src: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay was prevented, user needs to interact first
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const play = useCallback(() => {
    if (!audioRef.current || isPlaying) return;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (!audioRef.current || !isPlaying) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, [isPlaying]);

  return { isPlaying, toggle, play, pause };
}
