import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useTrial } from './TrialProvider'

export default function FirstSaleCelebration() {
  const { question, closeQuestion } = useTrial()

  

  useEffect(() => {
    const duration = 1500
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 }
      })

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 }
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])
  
  if (question !== 'after_sale') return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

      <div className="bg-slate-800 rounded-xl p-8 w-96 text-center space-y-4 border border-slate-700">

        <h2 className="text-2xl font-bold text-white">
          ¡Primera venta registrada!
        </h2>

        <p className="text-slate-300">
          El sistema acaba de registrar tu primera venta correctamente.
        </p>

        <button
          onClick={closeQuestion}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Ver Dashboard
        </button>

      </div>

    </div>
  )
}