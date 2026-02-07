import styles from './PlayerSelect.module.css';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function MusicToggle({ isPlaying, onToggle }: Readonly<MusicToggleProps>) {
  return (
    <button 
      className={styles.musicToggle}
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
    >
      <span className={styles.musicIcon}>
        {isPlaying ? '🔊' : '🔇'}
      </span>
    </button>
  );
}
