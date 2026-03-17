import { createContext, useContext, useState } from 'react'
import { useAuth } from '../context/AuthContext'

type TrialAction =
  | 'created_product'
  | 'completed_sale'
  | 'visited_dashboard'

interface TrialContextType {
  completedActions: Set<TrialAction>
  trackAction: (action: TrialAction) => void
}

const TrialContext = createContext<TrialContextType | undefined>(undefined)

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [completedActions, setCompletedActions] = useState<Set<TrialAction>>(
    () => new Set()
  )

  const trackAction = (action: TrialAction) => {
    if (!user?.trial) return

    setCompletedActions(prev => {
      if (prev.has(action)) return prev
      const updated = new Set(prev)
      updated.add(action)
      return updated
    })
  }

  return (
    <TrialContext.Provider
      value={{
        completedActions,
        trackAction
      }}
    >
      {children}
    </TrialContext.Provider>
  )
}

export function useTrial() {
  const ctx = useContext(TrialContext)
  if (!ctx) throw new Error('useTrial must be used inside TrialProvider')
  return ctx
}