import { useState, useEffect, useRef } from 'react'
import { useMobile } from '../../hooks/useMobile'
import styles from './PasswordModal.module.css'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CORRECT_PASSWORD = '1724'

export function PasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<PasswordModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const isMobile = useMobile()

  // Open/close dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      setPassword('')
      setError(false)
      // Focus input after a brief delay for animation
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    globalThis.addEventListener('keydown', handleKey)
    return () => globalThis.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      onSuccess()
    } else {
      setError(true)
    }
  }

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
        <div className={styles.frame}>
          {error ? (
            <div className={styles.errorMessage}>
              <span className={styles.skull}>💀</span>
              <p>You are not worthy, child.</p>
              <p>Flee now!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.challenge}>
                Who DARES to swim in the<br />
                Lake of Embarrassing Photos?
              </p>
              <label className={styles.label}>
                Enter Password:
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete="off"
                />
              </label>
              <button type="submit" className={styles.submitButton}>
                Submit
              </button>
            </form>
          )}
        </div>
        <p className={styles.hint}>
          {error 
            ? (isMobile ? 'Tap to flee' : 'Press ESC to flee')
            : (isMobile ? 'Tap outside to cancel' : 'Press ESC to cancel')
          }
        </p>
      </div>
    </dialog>
  )
}
