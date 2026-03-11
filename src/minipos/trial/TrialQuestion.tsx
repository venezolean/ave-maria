import { useTrial } from './TrialProvider'
import { api } from '../lib/api'

const WHATSAPP_LINK =
  "https://wa.me/541169174577?text=Hola%20quiero%20usar%20CajaSimple"

export default function TrialQuestion() {

  const { question, closeQuestion } = useTrial()

  const sendFeedback = async (
    questionName: string,
    answer: string,
    screen: string
  ) => {

    try {

      const start = Number(sessionStorage.getItem("trial_start") || Date.now())
      const timeInApp = Math.floor((Date.now() - start) / 1000)

      await api.sendTrialFeedback({
        meta: {
          question: questionName,
          answer: answer,
          screen: screen,
          time_in_app: timeInApp
        }
      })

    } catch (err) {
      console.error("trial feedback error", err)
    }

    closeQuestion()
  }

  if (!question) return null


  /* ============================= */
  /* BUSINESS TYPE */
  /* ============================= */

  if (question === "after_product") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

        <div className="bg-slate-800 p-6 rounded-xl w-80 space-y-4">

          <h3 className="text-white font-semibold">
            ¿En qué tipo de negocio usarías CajaSimple?
          </h3>

          <p className="text-slate-400 text-sm">
            Esto nos ayuda a adaptar mejor el sistema.
          </p>

          {[
            "Tienda",
            "Ropa",
            "Café o restaurante",
            "Ferretería",
            "Otro"
          ].map(opt => (
            <button
              key={opt}
              onClick={() => sendFeedback("business_type", opt, "inventory")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
            >
              {opt}
            </button>
          ))}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            Hablar por WhatsApp
          </a>

        </div>
      </div>
    )
  }


  /* ============================= */
  /* EASY PART */
  /* ============================= */

  if (question === "after_sale") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

        <div className="bg-slate-800 p-6 rounded-xl w-80 text-center space-y-4">

          <h3 className="text-white font-semibold">
            ¿Qué fue lo más fácil de entender hasta ahora?
          </h3>

          <p className="text-slate-400 text-sm">
            Tu opinión nos ayuda a mejorar la demo.
          </p>

          {[
            "Registrar una venta",
            "Crear productos",
            "Usar el carrito",
            "Ver el dashboard",
            "Todo fue claro"
          ].map(opt => (
            <button
              key={opt}
              onClick={() => sendFeedback("easy_part", opt, "pos")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
            >
              {opt}
            </button>
          ))}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            Usarlo en mi negocio
          </a>

        </div>
      </div>
    )
  }


  /* ============================= */
  /* INVENTORY SIZE */
  /* ============================= */

  if (question === "after_dashboard") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

        <div className="bg-slate-800 p-6 rounded-xl w-80 text-center space-y-4">

          <h3 className="text-white font-semibold">
            ¿Cuántos productos tiene tu negocio?
          </h3>

          <p className="text-slate-400 text-sm">
            Esto nos ayuda a entender qué tipo de negocios usan CajaSimple.
          </p>

          {[
            "1-20 productos",
            "20-100 productos",
            "100-500 productos",
            "500+ productos"
          ].map(opt => (
            <button
              key={opt}
              onClick={() => sendFeedback("inventory_size", opt, "dashboard")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
            >
              {opt}
            </button>
          ))}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            Hablar por WhatsApp
          </a>

        </div>
      </div>
    )
  }

  return null
}