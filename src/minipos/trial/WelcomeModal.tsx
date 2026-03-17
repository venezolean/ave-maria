import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function WelcomeModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user?.trial) return

    const shown = sessionStorage.getItem('trial_welcome')

    if (!shown) {
      setOpen(true)
      sessionStorage.setItem('trial_welcome', '1')
    }
  }, [user])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-slate-800 p-8 rounded-xl w-96 text-center space-y-4 border border-slate-700">

        <h2 className="text-xl text-white font-semibold">
          Bienvenido a CajaSimple
        </h2>

        <p className="text-slate-300 text-sm">
          En menos de 1 minuto puedes:
        </p>

        <div className="text-left text-sm text-slate-300 space-y-1">
          <div>• Crear un producto</div>
          <div>• Registrar una venta</div>
          <div>• Ver tu dashboard</div>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white"
        >
          Empezar
        </button>

      </div>
    </div>
  )
}