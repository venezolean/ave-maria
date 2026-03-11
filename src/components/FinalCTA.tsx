import { ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 sm:p-16 shadow-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Prueba el POS ahora mismo
          </h2>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Accede a la demo y explora el sistema en minutos.
          </p>

          <Link 
            to="/pos"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full text-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
          >
            Probar POS ahora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link >
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Mini POS. Sistema de punto de venta simple y moderno.
        </p>
      </div>
    </section>
  );
}
