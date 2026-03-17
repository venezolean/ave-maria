import { useEffect, useState } from 'react'
import { useTrial } from './TrialProvider'
import { useAuth } from '../context/AuthContext'
import { Edit2, Plus, History } from 'lucide-react'

export default function AfterProductModal() {
  const { completedActions } = useTrial()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user?.trial) return

    const shown = sessionStorage.getItem('after_product_modal')

    if (
      completedActions.has('created_product') &&
      !shown
    ) {
      setOpen(true)
      sessionStorage.setItem('after_product_modal', '1')
    }
  }, [completedActions, user])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-slate-800 p-6 rounded-xl w-[420px] text-center space-y-5 border border-slate-700">

        <h2 className="text-xl font-semibold text-white">
          Producto creado
        </h2>

        <p className="text-slate-300 text-sm">
          Ahora puedes gestionar tu producto desde el inventario:
        </p>

        {/* SIMULACIÓN DE BOTONES */}
        <div className="bg-slate-900 rounded-lg p-4 space-y-4 text-left">

          {/* EDITAR */}
          <div className="flex items-start gap-3">
            <Edit2 className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <p className="text-white text-sm font-medium">
                Editar producto
              </p>
              <p className="text-slate-400 text-xs">
                Cambia nombre y precio.
              </p>
            </div>
          </div>

          {/* COMPRA */}
          <div className="flex items-start gap-3">
            <Plus className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <p className="text-white text-sm font-medium">
                Agregar stock
              </p>
              <p className="text-slate-400 text-xs">
                Simula una compra ingresando cantidades positivas.
              </p>
            </div>
          </div>

          {/* AJUSTE */}
          <div className="flex items-start gap-3">
            <History className="w-5 h-5 text-orange-400 mt-1" />
            <div>
              <p className="text-white text-sm font-medium">
                Ajustar inventario
              </p>
              <p className="text-slate-400 text-xs">
                Corrige stock usando valores positivos o negativos.
              </p>
            </div>
          </div>

        </div>

        <div className="space-y-2">

          <button
            onClick={() => setOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold"
          >
            Entendido
          </button>

        </div>

      </div>
    </div>
  )
}