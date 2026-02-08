import { useCallback, useRef, useEffect } from 'react'
import { useVirtualInput } from '../../hooks/useVirtualInput'
import styles from './DPad.module.css'

type Direction = 'up' | 'down' | 'left' | 'right'

interface DPadProps {
  size?: number
}

export function DPad({ size = 140 }: Readonly<DPadProps>) {
  const { setDirection } = useVirtualInput()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeDirectionsRef = useRef<Set<Direction>>(new Set())
  const buttonRectsRef = useRef<Map<Direction, DOMRect>>(new Map())
  
  // Update button rects on mount and resize
  useEffect(() => {
    const updateRects = () => {
      const container = containerRef.current
      if (!container) return
      
      const buttons = container.querySelectorAll<HTMLButtonElement>('button[data-direction]')
      buttons.forEach((btn) => {
        const direction = btn.dataset.direction as Direction
        if (direction) {
          buttonRectsRef.current.set(direction, btn.getBoundingClientRect())
        }
      })
    }
    
    updateRects()
    globalThis.addEventListener('resize', updateRects)
    return () => globalThis.removeEventListener('resize', updateRects)
  }, [])
  
  // Clear all directions on touchend anywhere
  useEffect(() => {
    const handleGlobalTouchEnd = (e: TouchEvent) => {
      // If no more touches, clear all directions
      if (e.touches.length === 0) {
        activeDirectionsRef.current.forEach((dir) => {
          setDirection(dir, false)
        })
        activeDirectionsRef.current.clear()
      }
    }
    
    globalThis.addEventListener('touchend', handleGlobalTouchEnd)
    globalThis.addEventListener('touchcancel', handleGlobalTouchEnd)
    
    return () => {
      globalThis.removeEventListener('touchend', handleGlobalTouchEnd)
      globalThis.removeEventListener('touchcancel', handleGlobalTouchEnd)
    }
  }, [setDirection])
  
  const handleTouchStart = useCallback((direction: Direction) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!activeDirectionsRef.current.has(direction)) {
      activeDirectionsRef.current.add(direction)
      setDirection(direction, true)
    }
  }, [setDirection])

  const handleTouchEnd = useCallback((direction: Direction) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    activeDirectionsRef.current.delete(direction)
    setDirection(direction, false)
  }, [setDirection])

  const buttonSize = size * 0.35
  const centerOffset = (size - buttonSize) / 2

  return (
    <div 
      ref={containerRef}
      className={styles.dpad}
      style={{ width: size, height: size }}
    >
      {/* Up button */}
      <button
        data-direction="up"
        className={`${styles.button} ${styles.up}`}
        style={{
          width: buttonSize,
          height: buttonSize,
          left: centerOffset,
          top: 0,
        }}
        onTouchStart={handleTouchStart('up')}
        onTouchEnd={handleTouchEnd('up')}
        onTouchCancel={handleTouchEnd('up')}
        aria-label="Move up"
      >
        <span className={styles.arrow}>▲</span>
      </button>
      
      {/* Down button */}
      <button
        data-direction="down"
        className={`${styles.button} ${styles.down}`}
        style={{
          width: buttonSize,
          height: buttonSize,
          left: centerOffset,
          bottom: 0,
        }}
        onTouchStart={handleTouchStart('down')}
        onTouchEnd={handleTouchEnd('down')}
        onTouchCancel={handleTouchEnd('down')}
        aria-label="Move down"
      >
        <span className={styles.arrow}>▼</span>
      </button>
      
      {/* Left button */}
      <button
        data-direction="left"
        className={`${styles.button} ${styles.left}`}
        style={{
          width: buttonSize,
          height: buttonSize,
          left: 0,
          top: centerOffset,
        }}
        onTouchStart={handleTouchStart('left')}
        onTouchEnd={handleTouchEnd('left')}
        onTouchCancel={handleTouchEnd('left')}
        aria-label="Move left"
      >
        <span className={styles.arrow}>◀</span>
      </button>
      
      {/* Right button */}
      <button
        data-direction="right"
        className={`${styles.button} ${styles.right}`}
        style={{
          width: buttonSize,
          height: buttonSize,
          right: 0,
          top: centerOffset,
        }}
        onTouchStart={handleTouchStart('right')}
        onTouchEnd={handleTouchEnd('right')}
        onTouchCancel={handleTouchEnd('right')}
        aria-label="Move right"
      >
        <span className={styles.arrow}>▶</span>
      </button>
      
      {/* Center circle (decorative) */}
      <div 
        className={styles.center}
        style={{
          width: buttonSize * 0.6,
          height: buttonSize * 0.6,
          left: centerOffset + buttonSize * 0.2,
          top: centerOffset + buttonSize * 0.2,
        }}
      />
    </div>
  )
}
