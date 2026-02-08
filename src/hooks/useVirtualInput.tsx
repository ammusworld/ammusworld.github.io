import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

interface VirtualInputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  action: boolean
}

interface VirtualInputContextType {
  state: VirtualInputState
  setDirection: (direction: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void
  triggerAction: () => void
}

const initialState: VirtualInputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
}

const VirtualInputContext = createContext<VirtualInputContextType | null>(null)

export function VirtualInputProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<VirtualInputState>(initialState)

  const setDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    setState((prev) => ({ ...prev, [direction]: pressed }))
  }, [])

  const triggerAction = useCallback(() => {
    setState((prev) => ({ ...prev, action: true }))
    // Reset action after a brief moment (like a key press)
    setTimeout(() => {
      setState((prev) => ({ ...prev, action: false }))
    }, 100)
  }, [])

  const value = useMemo(
    () => ({ state, setDirection, triggerAction }),
    [state, setDirection, triggerAction]
  )

  return (
    <VirtualInputContext.Provider value={value}>
      {children}
    </VirtualInputContext.Provider>
  )
}

export function useVirtualInput(): VirtualInputContextType {
  const context = useContext(VirtualInputContext)
  if (!context) {
    // Return a no-op implementation if used outside provider
    return {
      state: initialState,
      setDirection: () => {},
      triggerAction: () => {},
    }
  }
  return context
}

export function useVirtualInputState(): VirtualInputState {
  const { state } = useVirtualInput()
  return state
}
