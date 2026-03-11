import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  productRef: React.RefObject<HTMLButtonElement>
  cartRef: React.RefObject<HTMLDivElement>
  checkoutRef: React.RefObject<HTMLButtonElement>
  openCart?: () => void
}

export default function POSTour({
  productRef,
  cartRef,
  checkoutRef,
  openCart
}: Props) {

  const { user } = useAuth()

  const [step, setStep] = useState<number | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {

    if (!user?.trial) return

    const shown = sessionStorage.getItem('pos_tour')

    if (!shown) {
      setStep(0)
      sessionStorage.setItem('pos_tour','1')
    }

  }, [user])

  useEffect(() => {

    if (step === null) return

    setRect(null)

    const timer = setInterval(() => {

      let el: HTMLElement | null = null

      if (step === 0) el = productRef.current
      if (step === 1) el = cartRef.current
      if (step === 2) el = checkoutRef.current

      if (el) {

        const r = el.getBoundingClientRect()

        if (r.width > 0 && r.height > 0) {
          setRect(r)
          clearInterval(timer)
        }

      }

    }, 100)

    return () => clearInterval(timer)

  }, [step, productRef, cartRef, checkoutRef])

  if (step === null) return null
  if (!rect) return null

  const messages = [
    "Empieza tocando un producto.\nCada toque lo agrega al carrito.",
    "Aquí verás los productos que estás vendiendo.",
    "Cuando todo esté listo confirma la venta aquí."
  ]

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

      {/* CENTER CARD */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">


        <div className="pointer-events-auto bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 w-[340px] text-center shadow-2xl animate-fade-in">
          <p className="text-xs text-slate-400 mb-2">
          Paso {step + 1} de {messages.length}
          </p>
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded-md animate-pulse"/>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed mb-6">
            {messages[step]}
          </p>

          <button
            onClick={() => {

              if (step === 0 && openCart) {

                openCart()

                setTimeout(() => {
                  setStep(1)
                }, 250)

                return
              }

              if (step === 2) {
                setStep(null)
              } else {
                setStep(step + 1)
              }

            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {step === 2 ? "Entendido" : "Siguiente"}
          </button>

        </div>

      </div>

    </div>
  )
}