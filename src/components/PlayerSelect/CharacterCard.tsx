import type { Character } from '../../types/game';
import { ASSETS } from '../../utils/assets';
import { AnimatedSprite } from './AnimatedSprite';
import styles from './PlayerSelect.module.css';

interface CharacterCardProps {
  character: Character;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
  keyHint: string;
  isMobile?: boolean;
}

const CHARACTER_NAMES: Record<Character, string> = {
  dudu: 'Dudu',
  chungu: 'Chungu',
};

export function CharacterCard({
  character,
  isHighlighted,
  isSelected,
  onClick,
  keyHint,
  isMobile = false,
}: Readonly<CharacterCardProps>) {
  const spriteSrc = ASSETS.sprites[character];
  
  const cardClasses = [
    styles.characterCard,
    isHighlighted ? styles.highlighted : '',
    isSelected ? styles.selected : '',
  ].filter(Boolean).join(' ');

  return (
    <button 
      type="button"
      className={cardClasses} 
      onClick={onClick}
    >
      <div className={styles.spriteContainer}>
        <AnimatedSprite
          src={spriteSrc}
          frameWidth={32}
          frameHeight={32}
          frameCount={4}
          fps={4}
          row={0}
          scale={3}
        />
      </div>
      <span className={styles.characterName}>{CHARACTER_NAMES[character]}</span>
      {!isMobile && <span className={styles.keyHint}>{keyHint}</span>}
    </button>
  );
}
