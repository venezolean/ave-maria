import { ArrowLeft } from 'lucide-react';

export default function POSDemo() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-2xl flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-500 rounded-xl animate-pulse"></div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Demo del Mini POS</h1>
        <p className="text-gray-400 mb-8">
          La demostración completa del sistema estará disponible pronto.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
