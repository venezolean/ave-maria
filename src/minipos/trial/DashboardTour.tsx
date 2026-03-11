import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  kpiRef: React.RefObject<HTMLDivElement>;
}

export default function DashboardTour({ kpiRef }: Props) {

  const { user } = useAuth();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {

    if (!user?.trial) return;

    const shown = sessionStorage.getItem("dashboard_tour");

    if (!shown) {
      setOpen(true);
      sessionStorage.setItem("dashboard_tour","1");
    }

  }, [user]);

  useEffect(() => {

    if (!open) return;

    const timer = setInterval(() => {

      if (kpiRef.current) {
        setRect(kpiRef.current.getBoundingClientRect());
        clearInterval(timer);
      }

    }, 100);

    return () => clearInterval(timer);

  }, [open]);

  if (!open || !rect) return null;

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

          <h2 className="text-white text-xl font-semibold mb-4">
            Bienvenido a CajaSimple
          </h2>

          <p className="text-slate-300 mb-4">
            CajaSimple es una caja digital para tu negocio.
          </p>

          <p className="text-slate-400 mb-4">
            Pruébalo en menos de un minuto:
          </p>

          <div className="text-left text-slate-300 text-sm mb-6 space-y-1">
            <div>1. Crea un producto</div>
            <div>2. Tócalo para venderlo</div>
            <div>3. Mira la venta en el dashboard</div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Empezar prueba
          </button>

        </div>

      </div>

    </div>
  );
}