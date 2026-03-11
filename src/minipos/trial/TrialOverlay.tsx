import { useState } from 'react'
import { useTrial } from './TrialProvider'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TrialOverlay() {
  const { user } = useAuth()
  const { currentStep, completedActions } = useTrial()

  const [open, setOpen] = useState(false)

  if (!user?.trial) return null

  const renderContent = () => {
    switch (currentStep) {
      case 'create_product':
        return {
          title: 'Paso 1',
          text: 'Crea tu primer producto. Solo toma unos segundos.',
          button: 'Ir a Inventario',
          link: null
        }

      case 'make_sale':
        return {
          title: 'Paso 2',
          text: 'Ahora registra una venta. Toca el producto en el POS.',
          button: 'Ir al Punto de Venta',
          link: null
        }

      case 'view_dashboard':
        return {
          title: 'Paso 3',
          text: 'Perfecto. Tu venta ya se registró. Puedes verla en el dashboard.',
          button: 'Ver Dashboard',
          link: null
        }

      case 'conversion':
        return {
          title: 'Listo',
          text: 'Ya probaste lo esencial del sistema. Si quieres usar CajaSimple en tu negocio, escríbenos por WhatsApp y te ayudamos a configurarlo.',
          button: 'Crear cuenta',
          link: '/pos'
        }
    }
  }

  const content = renderContent()

  return (
    <>
      {/* BOTON */}
      <div className="fixed bottom-24 right-6 lg:bottom-6 z-50">

        <button
          onClick={() => setOpen(!open)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl"
        >
          <MessageCircle className="w-6 h-6" />

          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>

      </div>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-5">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Progreso de prueba</h3>

            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* progreso */}

          <div className="text-sm space-y-1 mb-4 text-slate-300">
            <div>
              {completedActions.has('created_product') ? '✔' : '⬜'} Crear producto
            </div>

            <div>
              {completedActions.has('completed_sale') ? '✔' : '⬜'} Registrar venta
            </div>

            <div>
              {completedActions.has('visited_dashboard') ? '✔' : '⬜'} Ver dashboard
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">

            <p className="text-blue-400 text-sm font-semibold mb-1">
              {content.title}
            </p>

            <p className="text-slate-300 text-sm mb-4">
              {content.text}
            </p>

            {content.link && (
              <a
                href="https://wa.me/541169174577"
                target="_blank"
                className="w-full block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Hablar por WhatsApp
              </a>
            )}

          </div>

        </div>
      )}
    </>
  )
}