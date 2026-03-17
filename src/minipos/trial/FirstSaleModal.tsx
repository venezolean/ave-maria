import { useEffect, useState } from 'react'
import { useTrial } from './TrialProvider'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function FirstSaleModal() {
  const { completedActions } = useTrial()
  const { user, logout } = useAuth();
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showRegister, setShowRegister] = useState(false);
  

  useEffect(() => {
    if (!user?.trial) return

    const alreadyShown = sessionStorage.getItem('first_sale_modal')

    if (
      completedActions.has('completed_sale') &&
      !alreadyShown
    ) {
      setOpen(true)
      sessionStorage.setItem('first_sale_modal', '1')
    }
  }, [completedActions, user])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-slate-800 p-8 rounded-xl w-96 text-center space-y-4 border border-slate-700">

        <h2 className="text-2xl text-white font-bold">
          🎉 Primera venta registrada
        </h2>

        <p className="text-slate-300 text-sm">
          Acabas de usar CajaSimple como lo harías en tu negocio real.
        </p>

        <p className="text-slate-400 text-sm">
          Ahora imagina esto funcionando todos los días.
        </p>

        <div className="space-y-2">

          <button
            onClick={() => {
              logout()
              window.location.href = '/pos'
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold"
          >
            Crear mi cuenta gratis
          </button>

          <a
            href="https://wa.me/541169174577"
            target="_blank"
            className="block w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white font-semibold"
          >
            Hablar por WhatsApp
          </a>

        </div>

        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 text-sm hover:text-white"
        >
          Seguir probando
        </button>

      </div>
    </div>
  )
}