import { useState, useCallback } from 'react'
import type { Character, GameScreen } from './types/game'
import { PlayerSelectScreen } from './components/PlayerSelect'
import { InstructionsScreen } from './components/InstructionsScreen'
import { GameMap } from './components/GameMap'
import { PhotoModal } from './components/PhotoModal'
import { CutsceneScreen } from './components/CutsceneScreen'
import { FinaleScreen } from './components/FinaleScreen'
import { MAP_DATA } from './data/mapData'
import { useAudio } from './hooks/useAudio'
import { ASSETS } from './utils/assets'
import './App.css'

function App() {
  const [screen, setScreen] = useState<GameScreen>('select')
  const [character, setCharacter] = useState<Character | null>(null)
  const [collectedHearts, setCollectedHearts] = useState<Set<number>>(new Set())
  const [showingPhotoIndex, setShowingPhotoIndex] = useState<number | null>(null)
  const [currentMusic, setCurrentMusic] = useState(ASSETS.audio.bgm)
  
  // Global audio state - persists across all screens
  const { isPlaying: isMusicPlaying, toggle: toggleMusic } = useAudio(currentMusic)

  const handleCharacterSelect = (char: Character) => {
    setCharacter(char)
    // Transition animation is handled by PlayerSelectScreen
    // After animation completes, switch to instructions screen
    setTimeout(() => setScreen('instructions'), 800)
  }

  const handleInstructionsContinue = useCallback(() => {
    setScreen('game')
  }, [])

  const handleHeartCollected = useCallback((photoIndex: number) => {
    setCollectedHearts((prev) => new Set([...prev, photoIndex]))
    setShowingPhotoIndex(photoIndex)
  }, [])

  const handleModalClose = useCallback(() => {
    setShowingPhotoIndex(null)
  }, [])

  const handleHouseReached = useCallback(() => {
    setCurrentMusic(ASSETS.audio.finale)
    setScreen('cutscene')
  }, [])

  const handleCutsceneComplete = useCallback(() => {
    setScreen('finale')
  }, [])

  const handleRestart = useCallback(() => {
    setScreen('select')
    setCharacter(null)
    setCollectedHearts(new Set())
    setShowingPhotoIndex(null)
    setCurrentMusic(ASSETS.audio.bgm)
  }, [])

  return (
    <>
      {screen === 'select' && (
        <PlayerSelectScreen 
          onSelect={handleCharacterSelect}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleMusic}
        />
      )}
      {screen === 'instructions' && (
        <InstructionsScreen onContinue={handleInstructionsContinue} />
      )}
      {screen === 'game' && character && (
        <>
          <GameMap
            character={character}
            onHouseReached={handleHouseReached}
            onHeartCollected={handleHeartCollected}
            collectedHearts={collectedHearts}
            isPaused={showingPhotoIndex !== null}
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={toggleMusic}
          />
          <PhotoModal
            photoIndex={showingPhotoIndex ?? 0}
            isOpen={showingPhotoIndex !== null}
            onClose={handleModalClose}
            totalHearts={MAP_DATA.heartPositions.length}
            collectedCount={collectedHearts.size}
          />
        </>
      )}
      {screen === 'cutscene' && (
        <CutsceneScreen onComplete={handleCutsceneComplete} />
      )}
      {screen === 'finale' && character && (
        <FinaleScreen 
          character={character}
          heartsCollected={collectedHearts.size}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}

export default App
