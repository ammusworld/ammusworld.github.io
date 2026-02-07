import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../../types/game';
import { FloatingHearts } from './FloatingHearts';
import { CharacterCard } from './CharacterCard';
import { MusicToggle } from './MusicToggle';
import styles from './PlayerSelect.module.css';

interface PlayerSelectScreenProps {
  onSelect: (character: Character) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

const CHARACTERS: Character[] = ['dudu', 'chungu'];
const KEY_HINTS: Record<Character, string> = {
  dudu: 'Press A',
  chungu: 'Press B',
};

export function PlayerSelectScreen({ onSelect, isMusicPlaying, onToggleMusic }: Readonly<PlayerSelectScreenProps>) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleSelect = useCallback((character: Character) => {
    if (selectedCharacter) return; // Already selected
    
    setSelectedCharacter(character);
    
    // Call onSelect after selection bounce animation
    setTimeout(() => {
      onSelect(character);
    }, 600);
  }, [selectedCharacter, onSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCharacter) return;

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          setHighlightedIndex(0);
          break;
        case 'arrowright':
          setHighlightedIndex(1);
          break;
        case 'a':
          handleSelect('dudu');
          break;
        case 'b':
          handleSelect('chungu');
          break;
        case 'enter':
        case ' ':
          handleSelect(CHARACTERS[highlightedIndex]);
          break;
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [highlightedIndex, selectedCharacter, handleSelect]);

  const containerClasses = styles.container;

  return (
    <div className={containerClasses}>
      <FloatingHearts count={25} />
      
      <MusicToggle isPlaying={isMusicPlaying} onToggle={onToggleMusic} />
      
      <h1 className={styles.title}>Choose Your Character</h1>
      
      <div className={styles.characterGrid}>
        {CHARACTERS.map((character, index) => (
          <CharacterCard
            key={character}
            character={character}
            isHighlighted={highlightedIndex === index}
            isSelected={selectedCharacter === character}
            onClick={() => handleSelect(character)}
            keyHint={KEY_HINTS[character]}
          />
        ))}
      </div>
      
      <p className={styles.instructions}>
        Use Arrow Keys to highlight, A/B or Enter to select
      </p>
    </div>
  );
}
