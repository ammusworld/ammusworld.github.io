import { useState, useEffect } from 'react'

interface KeyboardState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
}

const initialKeyState: KeyboardState = {
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
}

/**
 * Hook to track keyboard input state for game controls
 */
export function useKeyboardInput(): KeyboardState {
  const [keys, setKeys] = useState<KeyboardState>(initialKeyState)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys to avoid scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(k => ({ ...k, up: true }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(k => ({ ...k, down: true }))
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(k => ({ ...k, left: true }))
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(k => ({ ...k, right: true }))
          break
        case ' ':
        case 'Enter':
          setKeys(k => ({ ...k, action: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(k => ({ ...k, up: false }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(k => ({ ...k, down: false }))
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(k => ({ ...k, left: false }))
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(k => ({ ...k, right: false }))
          break
        case ' ':
        case 'Enter':
          setKeys(k => ({ ...k, action: false }))
          break
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    globalThis.addEventListener('keyup', handleKeyUp)
    
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown)
      globalThis.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
