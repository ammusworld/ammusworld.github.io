import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudio(src: string, autoPlay = true) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userHasInteractedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    
    const tryPlay = () => {
      if (!audioRef.current) return;
      
      audioRef.current.play()
        .then(() => {
          userHasInteractedRef.current = true;
          setIsPlaying(true);
          // Remove all listeners once user has interacted
          document.removeEventListener('click', tryPlay);
          document.removeEventListener('keydown', tryPlay);
          document.removeEventListener('touchstart', tryPlay);
        })
        .catch(() => {
          // Autoplay blocked - listeners will retry on interaction
        });
    };

    // Attempt autoplay if requested
    if (autoPlay) {
      // If user already interacted previously, play immediately
      if (userHasInteractedRef.current) {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        tryPlay();
        
        // Set up interaction listeners as fallback for autoplay restrictions
        document.addEventListener('click', tryPlay);
        document.addEventListener('keydown', tryPlay);
        document.addEventListener('touchstart', tryPlay);
      }
    }
    
    return () => {
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('keydown', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, autoPlay]);

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
