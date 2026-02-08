import { useState, useEffect, useMemo } from 'react'
import { useVirtualInputState } from './useVirtualInput'

export interface KeyboardState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
  jump: boolean
}

const initialKeyState: KeyboardState = {
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
  jump: false,
}

/**
 * Hook to track keyboard input state for game controls
 * Merges physical keyboard input with virtual input (D-pad, touch)
 */
export function useKeyboardInput(): KeyboardState {
  const [keys, setKeys] = useState<KeyboardState>(initialKeyState)
  const virtualInput = useVirtualInputState()

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
        case 'Enter':
          setKeys(k => ({ ...k, action: true }))
          break
        case ' ':
          setKeys(k => ({ ...k, jump: true }))
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
        case 'Enter':
          setKeys(k => ({ ...k, action: false }))
          break
        case ' ':
          setKeys(k => ({ ...k, jump: false }))
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

  // Merge keyboard state with virtual input (D-pad, touch)
  const mergedState = useMemo<KeyboardState>(() => ({
    up: keys.up || virtualInput.up,
    down: keys.down || virtualInput.down,
    left: keys.left || virtualInput.left,
    right: keys.right || virtualInput.right,
    action: keys.action || virtualInput.action,
    jump: keys.jump || virtualInput.jump,
  }), [keys, virtualInput])

  return mergedState
}
