import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useTrial } from '../trial/TrialProvider'
import DashboardTour from "../trial/DashboardTour";

interface DashboardData {
  today: {
    total_sales: number;
    transactions: number;
    total_items: number;
  };
  top_products: Array<{ name: string; quantity: number }>;
  low_stock: Array<{ name: string; stock: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { trackAction } = useTrial()
  const kpiRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    loadDashboard();
    trackAction('visited_dashboard')
  }, []);

  const loadDashboard = async () => {
    try {
      setError('');
      setIsLoading(true);

      const response = await api.getDashboard();

      // Defensa por si backend cambia forma
      const normalized: DashboardData = {
        today: {
          total_sales: response?.today?.total_sales ?? 0,
          transactions: response?.today?.transactions ?? 0,
          total_items: response?.today?.total_items ?? 0,
        },
        top_products: response?.top_products ?? [],
        low_stock: response?.low_stock ?? [],
      };

      setData(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Resumen de ventas de hoy</p>
        </div>

        <button
          onClick={loadDashboard}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div ref={kpiRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          icon={<DollarSign className="w-6 h-6 text-green-400" />}
          label="Ventas Totales"
          value={`$${data.today.total_sales.toFixed(2)}`}
          color="green"
        />

        <KpiCard
          icon={<ShoppingCart className="w-6 h-6 text-blue-400" />}
          label="Transacciones"
          value={data.today.transactions}
          color="blue"
        />

        <KpiCard
          icon={<Package className="w-6 h-6 text-purple-400" />}
          label="Items Vendidos"
          value={data.today.total_items}
          color="purple"
        />

        <KpiCard
          icon={<TrendingDown className="w-6 h-6 text-orange-400" />}
          label="Stock Bajo"
          value={data.low_stock.length}
          color="orange"
        />
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Top Productos
          </h2>

          {data.top_products.length === 0 ? (
            <EmptyState text="No hay datos disponibles" />
          ) : (
            <div className="space-y-3">
              {data.top_products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <span className="text-slate-300">{product.name}</span>
                  <span className="text-blue-400 font-semibold">
                    {product.quantity} ventas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Productos con Stock Bajo
          </h2>

          {data.low_stock.length === 0 ? (
            <EmptyState text="Todo el stock está en niveles óptimos" />
          ) : (
            <div className="space-y-3">
              {data.low_stock.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-orange-500/20"
                >
                  <span className="text-slate-300">{product.name}</span>
                  <span className="text-orange-400 font-semibold">
                    Stock: {product.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DashboardTour kpiRef={kpiRef} />
    </div>
  );
}

/* COMPONENTES AUXILIARES */

function KpiCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {

  const colorMap = {
    green: 'bg-green-600/20',
    blue: 'bg-blue-600/20',
    purple: 'bg-purple-600/20',
    orange: 'bg-orange-600/20',
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorMap[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-slate-500 text-center py-8">
      {text}
    </p>
  );
}