import { useState } from 'react'
import { useTrial } from './TrialProvider'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, X } from 'lucide-react'

export default function TrialOverlay() {
  const { user } = useAuth()
  const { completedActions } = useTrial()
  const [open, setOpen] = useState(false)

  if (!user?.trial) return null

  const steps = [
    {
      key: 'created_product',
      label: 'Crear producto'
    },
    {
      key: 'completed_sale',
      label: 'Registrar venta'
    },
    {
      key: 'visited_dashboard',
      label: 'Ver dashboard'
    }
  ]

  const allDone =
    completedActions.has('created_product') &&
    completedActions.has('completed_sale') &&
    completedActions.has('visited_dashboard')

  return (
    <>
      {/* BOTÓN */}
      <div className="fixed bottom-24 right-6 lg:bottom-6 z-50">

        <button
          onClick={() => setOpen(!open)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl"
        >
          <MessageCircle className="w-6 h-6" />

          {!allDone && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>

      </div>

      {/* PANEL */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-5">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">
              Progreso
            </h3>

            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHECKLIST */}
          <div className="text-sm space-y-2 mb-4 text-slate-300">

            {steps.map(step => (
              <div key={step.key}>
                {completedActions.has(step.key as any) ? '✔' : '⬜'} {step.label}
              </div>
            ))}

          </div>

          {/* MENSAJE FINAL */}
          {allDone && (
            <div className="border-t border-slate-700 pt-4 space-y-3">

              <p className="text-blue-400 text-sm font-semibold">
                Listo
              </p>

              <p className="text-slate-300 text-sm">
                Ya probaste lo esencial del sistema.
              </p>

              <a
                href="https://wa.me/541169174577"
                target="_blank"
                className="w-full block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Usarlo en mi negocio
              </a>

            </div>
          )}

        </div>
      )}
    </>
  )
}