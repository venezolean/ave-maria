import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

type TrialAction =
  | 'visited_inventory'
  | 'created_product'
  | 'completed_sale'
  | 'visited_dashboard'

type TrialStep =
  | 'create_product'
  | 'make_sale'
  | 'view_dashboard'
  | 'conversion'

type TrialQuestion =
  | 'after_product'
  | 'after_sale'
  | null

interface TrialContextType {
  completedActions: Set<TrialAction>
  trackAction: (action: TrialAction) => void
  currentStep: TrialStep
  question: TrialQuestion
  closeQuestion: () => void
}

const TrialContext = createContext<TrialContextType | undefined>(undefined)

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [completedActions, setCompletedActions] = useState<Set<TrialAction>>(
    () => new Set()
  )

  const [question, setQuestion] = useState<TrialQuestion>(null)

  const [askedQuestions, setAskedQuestions] = useState<Set<TrialQuestion>>(
    () => new Set()
  )

  const trackAction = (action: TrialAction) => {
    if (!user?.trial) return

    setCompletedActions(prev => {
      const updated = new Set(prev)
      updated.add(action)
      return updated
    })
  }

  const closeQuestion = () => {
    setQuestion(null)
  }

  const randomDelay = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min) + min)

  useEffect(() => {

    if (!user?.trial) return

    const timers: NodeJS.Timeout[] = []

    // Pregunta 1 (30-60s)
    timers.push(
      setTimeout(() => {

        if (!askedQuestions.has('after_product')) {

          setQuestion('after_product')

          setAskedQuestions(prev => {
            const updated = new Set(prev)
            updated.add('after_product')
            return updated
          })

        }

      }, randomDelay(30000, 60000))
    )

    // Pregunta 2 (90-120s)
    timers.push(
      setTimeout(() => {

        if (!askedQuestions.has('after_sale')) {

          setQuestion('after_sale')

          setAskedQuestions(prev => {
            const updated = new Set(prev)
            updated.add('after_sale')
            return updated
          })

        }

      }, randomDelay(90000, 120000))
    )

    return () => timers.forEach(clearTimeout)

  }, [user])

  const currentStep: TrialStep = useMemo(() => {
    if (!completedActions.has('created_product')) return 'create_product'
    if (!completedActions.has('completed_sale')) return 'make_sale'
    if (!completedActions.has('visited_dashboard')) return 'view_dashboard'
    return 'conversion'
  }, [completedActions])

  return (
    <TrialContext.Provider
      value={{
        completedActions,
        trackAction,
        currentStep,
        question,
        closeQuestion
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