import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  createButtonRef: React.RefObject<HTMLButtonElement>;
  tableRef: React.RefObject<HTMLTableElement>;
}

export default function InventoryTour({
  createButtonRef,
  tableRef
}: Props) {

  const { user } = useAuth();
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {

    if (!user?.trial) return;

    const shown = sessionStorage.getItem("inventory_tour");

    if (!shown) {
      setStep(0);
      sessionStorage.setItem("inventory_tour","1");
    }

  }, [user]);

  useEffect(() => {

    if (step === null) return;

    setRect(null);

    const timer = setInterval(() => {

      let el: HTMLElement | null = null;

      if (step === 0) el = createButtonRef.current;
      if (step === 1) el = tableRef.current;

      if (el) {
        setRect(el.getBoundingClientRect());
        clearInterval(timer);
      }

    }, 100);

    return () => clearInterval(timer);

  }, [step]);

  if (step === null || !rect) return null;

  const messages = [
    "Empieza creando un producto.\nSolo necesitas nombre, precio y stock.",
    "Aquí verás los productos que registres.\nLuego podrás venderlos desde el POS."
  ];

  return (
    <div className="fixed inset-0 z-[100]">

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>

      <div
        className="absolute border-2 border-blue-500 rounded-xl animate-pulse"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">

        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 w-[340px] text-center shadow-2xl animate-fade-in">
          <p className="text-xs text-slate-400 mb-2">
          Paso {step + 1} de {messages.length}
          </p>
          <p className="text-slate-200 mb-6">
            {messages[step]}
          </p>

          <button
            onClick={() => {

              if (step === 1) {
                setStep(null)
              } else {
                setStep(step + 1)
              }

            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            {step === 1 ? "Entendido" : "Siguiente"}
          </button>

        </div>

      </div>

    </div>
  );
}