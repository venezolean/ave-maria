import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"

interface TourStep {
  ref: React.RefObject<HTMLElement>
  message: string
  onEnter?: () => void
}

interface Props {
  steps: TourStep[]
  storageKey: string
}

export default function TourEngine({ steps, storageKey }: Props) {

  const { user } = useAuth()

  const [step, setStep] = useState<number | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // iniciar tour
  useEffect(() => {

    if (!user?.trial) return

    const shown = sessionStorage.getItem(storageKey)

    if (!shown) {
      setStep(0)
      sessionStorage.setItem(storageKey, "1")
    }

  }, [user, storageKey])

  // detectar elemento
  useEffect(() => {

    if (step === null) return

    const stepData = steps[step]

    stepData?.onEnter?.()

    setRect(null)

    const timer = setInterval(() => {

      const el = stepData?.ref.current

      if (el) {

        const r = el.getBoundingClientRect()

        if (r.width > 0 && r.height > 0) {
          setRect(r)
          clearInterval(timer)
        }

      }

    }, 100)

    return () => clearInterval(timer)

  }, [step, steps])

  if (step === null || !rect) return null

  const next = () => {

    if (step === steps.length - 1) {
      setStep(null)
      return
    }

    setStep(step + 1)

  }

  return (
    <div className="fixed inset-0 z-[100]">

      {/* overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>

      {/* highlight */}
      <div
        className="absolute border-2 border-blue-500 rounded-xl shadow-lg animate-pulse pointer-events-none"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12
        }}
      />

      {/* card central */}
      <div className="absolute inset-0 flex items-center justify-center">

        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 w-[340px] text-center shadow-2xl animate-fade-in">

          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded-md animate-pulse"/>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed mb-6">
            {steps[step].message}
          </p>

          <button
            onClick={next}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {step === steps.length - 1 ? "Entendido" : "Siguiente"}
          </button>

        </div>

      </div>

    </div>
  )
}