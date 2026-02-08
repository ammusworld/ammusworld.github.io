import { useState, useEffect, useRef, useCallback } from 'react'
import { useMobile } from '../../hooks/useMobile'
import styles from './SecretGallery.module.css'

interface SecretGalleryProps {
  isOpen: boolean
  onClose: () => void
  photoCount?: number
}

export function SecretGallery({
  isOpen,
  onClose,
  photoCount = 10,
}: Readonly<SecretGalleryProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMobile()

  const getPhotoSrc = (index: number) => 
    `${import.meta.env.BASE_URL}photos/photo-${String(index + 1).padStart(2, '0')}.jpg`

  // Reset loading state when index changes
  useEffect(() => {
    setIsLoading(true)
  }, [currentIndex])

  // Open/close dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      setCurrentIndex(0)
    } else {
      dialog.close()
    }
  }, [isOpen])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photoCount)
  }, [photoCount])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photoCount) % photoCount)
  }, [photoCount])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }

    globalThis.addEventListener('keydown', handleKey)
    return () => globalThis.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, goNext, goPrev])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>🏊 The Lake of Embarrassing Photos 🏊</h2>
        
        <div className={styles.gallery}>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={goPrev}
            onTouchEnd={(e) => { e.preventDefault(); goPrev(); }}
            aria-label="Previous photo"
          >
            ◀
          </button>
          
          <div className={styles.frame}>
            {isLoading && <div className={styles.loader}>Loading...</div>}
            <img
              src={getPhotoSrc(currentIndex)}
              alt={`Embarrassing photo ${currentIndex + 1}`}
              className={styles.photo}
              onLoad={() => setIsLoading(false)}
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          </div>
          
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={goNext}
            onTouchEnd={(e) => { e.preventDefault(); goNext(); }}
            aria-label="Next photo"
          >
            ▶
          </button>
        </div>
        
        <div className={styles.counter}>
          {currentIndex + 1} / {photoCount}
        </div>
        
        <p className={styles.hint}>
          {isMobile ? 'Tap arrows to browse • Tap outside to close' : 'Use ← → to browse • ESC to close'}
        </p>
      </div>
    </dialog>
  )
}
