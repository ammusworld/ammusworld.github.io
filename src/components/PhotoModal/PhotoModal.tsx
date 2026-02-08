import { useEffect, useRef } from 'react'
import { useMobile } from '../../hooks/useMobile'
import styles from './PhotoModal.module.css'

interface PhotoModalProps {
  photoIndex: number
  onClose: () => void
  isOpen: boolean
  totalHearts: number
  collectedCount: number
}

export function PhotoModal({
  photoIndex,
  onClose,
  isOpen,
  totalHearts,
  collectedCount,
}: Readonly<PhotoModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isMobile = useMobile()
  
  // Get photo path - use base path for GitHub Pages
  const photoSrc = `${import.meta.env.BASE_URL}photos/photo-${String(photoIndex + 1).padStart(2, '0')}.svg`
  
  // Open/close dialog and handle keyboard
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])
  
  // Close on Escape, Space, or Enter
  useEffect(() => {
    if (!isOpen) return
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onClose()
      }
    }
    
    globalThis.addEventListener('keydown', handleKey)
    return () => globalThis.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <dialog 
      ref={dialogRef}
      className={styles.overlay}
      onClick={onClose}
      aria-label={`Photo ${photoIndex + 1} of ${totalHearts}`}
    >
      <div 
        className={styles.modal}
      >
        <div className={styles.frame}>
          <img 
            src={photoSrc} 
            alt={`Memory ${photoIndex + 1}`} 
          />
        </div>a
        <div className={styles.counter}>
          {collectedCount} / {totalHearts}
        </div>
        <p className={styles.hint}>{isMobile ? 'Tap to continue' : 'Press space to continue'}</p>
      </div>
    </dialog>
  )
}
