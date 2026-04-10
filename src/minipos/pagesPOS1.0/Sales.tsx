import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Receipt,
  CreditCard,
  Banknote,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Landmark, 
  X
} from 'lucide-react';
import { useTrial } from '../trial/TrialProvider'

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  items: SaleItem[];
  status?: string;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const { trackAction } = useTrial();
  

  const todayString = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const todaySales = sales.filter(
    (sale) =>
      new Date(sale.created_at)
        .toLocaleDateString('en-CA') === todayString
  );
  
  const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  const totalReturns = todaySales.filter(
    (s) => s.status === 'returned'
  ).length;

  const cashSales = todaySales.filter(
    (s) => s.payment_method === 'cash'
  ).length;

  const cardSales = todaySales.filter(
    (s) => s.payment_method === 'card'
  ).length;

  const transferSales = todaySales.filter(
    (s) => s.payment_method === 'transfer'
  ).length;

const [search, setSearch] = useState('');
const [filterMethod, setFilterMethod] = useState('all');

const filteredSales = sales.filter((sale) => {
  const matchesSearch =
    sale.id.includes(search) ||
    sale.total.toString().includes(search);

  const matchesMethod =
    filterMethod === 'all' ||
    sale.payment_method === filterMethod;

  return matchesSearch && matchesMethod;
});



  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSales();

      // 🔒 normalización ligera (sin cambiar estructura)
      const safe = response.map((s: any) => ({
        ...s,
        id: String(s.id),
        total: Number(s.total ?? 0),
        items: (s.items ?? []).map((i: any) => ({
          ...i,
          price: Number(i.price ?? 0),
          quantity: Number(i.quantity ?? 0),
          subtotal: Number(i.subtotal ?? i.price * i.quantity ?? 0),
        }))
      }));

      setSales(safe);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (saleId: string) => {
    if (!confirm('¿Está seguro de realizar esta devolución?')) {
      return;
    }

    setProcessingReturn(saleId);
    try {
      await api.returnSale(saleId);
      await loadSales();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar devolución');
    } finally {
      setProcessingReturn(null);
    }
  };

  const toggleExpand = (saleId: string | number) => {
    const id = String(saleId)
    setExpandedSale(prev => (prev === id ? null : id))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

const getPaymentIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return <Banknote className="w-5 h-5" />;
    case 'card':
      return <CreditCard className="w-5 h-5" />;
    case 'transfer':
      return <Landmark className="w-5 h-5" />;
    default:
      return <Receipt className="w-5 h-5" />;
  }
};

const getPaymentLabel = (method: string) => {
  switch (method) {
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'transfer':
      return 'Transferencia';
    default:
      return method;
  }
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          Ventas del día
        </h1>
        <p className="text-slate-400">
          Total de ventas: {todaySales.length}
        </p>
      </div>

      <button
        onClick={() => setShowDailyModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Receipt className="w-5 h-5" />
        Ver detalle del día
      </button>
    </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <KpiCard title="Ingresos Totales" value={`$${totalRevenue.toLocaleString()}`} color="text-green-400" />
        <KpiCard title="Ventas" value={todaySales.length} />
        <KpiCard title="Devoluciones" value={totalReturns} color="text-orange-400" />
        <KpiCard title="Efectivo" value={cashSales} />
        <KpiCard title="Tarjeta" value={cardSales} />
        <KpiCard title="Transferencias" value={transferSales} />
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por ID o monto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
        />

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
        >
          <option value="all">Todos</option>
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
        </select>
      </div>
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay ventas registradas</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden"
            >

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Receipt className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        ${(sale.total ?? 0).toFixed(2)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {formatDate(sale.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg">
                      {getPaymentIcon(sale.payment_method)}
                      <span className="text-slate-300 text-sm">
                        {getPaymentLabel(sale.payment_method)}
                      </span>
                    </div>

                    {sale.status !== 'returned' && (
                      <button
                        onClick={() => handleReturn(sale.id)}
                        disabled={processingReturn === sale.id}
                        className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Realizar devolución"
                      >
                        {processingReturn === sale.id ? (
                          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RotateCcw className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(sale.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition"
                    >
                      {expandedSale === String(sale.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {sale.status === 'returned' && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                    <RotateCcw className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm">Devuelto</span>
                  </div>
                )}
              </div>

              {expandedSale === String(sale.id) && (
                <div className="border-t border-slate-700 bg-slate-900/30 p-4">
                  <h3 className="text-white font-medium mb-3">Productos</h3>
                  <div className="space-y-2">
                    {sale.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white">{item.product_name}</p>
                          <p className="text-slate-400 text-sm">
                            ${(item.price ?? 0).toFixed(2)} x {item.quantity ?? 0}
                          </p>
                        </div>
                        <p className="text-white font-semibold">
                          ${(item.subtotal ?? 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white font-bold text-xl">
                      ${(sale.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>
      {showDailyModal && (
        <DailyOperationsModal
          onClose={() => setShowDailyModal(false)}
        />
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DailyOperationsModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [report, setReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const data = await api.getCashClosing(today);
        setReport(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el cierre de caja"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, []);

  const formatTime = (date: string | null) =>
    date
      ? new Date(date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  const totals = report.reduce(
    (acc, op) => {
      acc.total += Number(op.total_facturado || 0);
      acc.cash += Number(op.efectivo || 0);
      acc.card += Number(op.tarjeta || 0);
      acc.transfer += Number(op.transferencia || 0);
      acc.sales += Number(op.total_ventas || 0);
      return acc;
    },
    { total: 0, cash: 0, card: 0, transfer: 0, sales: 0 }
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Cierre de Caja
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Control de operaciones del día
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-slate-700">
          <KpiCard
            title="Total Facturado"
            value={`$${totals.total.toLocaleString()}`}
            color="text-green-400"
          />
          <KpiCard title="Ventas" value={totals.sales} />
          <KpiCard
            title="Efectivo"
            value={`$${totals.cash.toLocaleString()}`}
          />
          <KpiCard
            title="Tarjeta"
            value={`$${totals.card.toLocaleString()}`}
          />
          <KpiCard
            title="Transferencia"
            value={`$${totals.transfer.toLocaleString()}`}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <p className="text-center text-slate-400">
              Cargando datos...
            </p>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : report.length === 0 ? (
            <p className="text-center text-slate-400">
              No hay operaciones registradas hoy.
            </p>
          ) : (
            <>
              {/* Vista Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="py-2">Operador</th>
                      <th>Código</th>
                      <th>Primera Venta</th>
                      <th>Última Venta</th>
                      <th>Ventas</th>
                      <th>Efectivo</th>
                      <th>Tarjeta</th>
                      <th>Transferencia</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((op) => (
                      <tr
                        key={op.user_id}
                        className="border-b border-slate-700"
                      >
                        <td className="py-2 font-semibold text-white">
                          {op.operador}
                        </td>
                        <td>{op.codigo_empleado}</td>
                        <td>{formatTime(op.hora_ingreso)}</td>
                        <td>{formatTime(op.hora_ultima_venta)}</td>
                        <td>{op.total_ventas}</td>
                        <td className="text-green-400">
                          ${Number(op.efectivo).toLocaleString()}
                        </td>
                        <td className="text-blue-400">
                          ${Number(op.tarjeta).toLocaleString()}
                        </td>
                        <td className="text-purple-400">
                          ${Number(op.transferencia).toLocaleString()}
                        </td>
                        <td className="font-bold text-white">
                          ${Number(op.total_facturado).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile */}
              <div className="md:hidden space-y-3">
                {report.map((op) => (
                  <div
                    key={op.user_id}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white font-semibold">
                        {op.operador}
                      </p>
                      <p className="text-green-400 font-bold">
                        ${Number(op.total_facturado).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                      <p>Código: {op.codigo_empleado || "-"}</p>
                      <p>Ventas: {op.total_ventas}</p>
                      <p>Ingreso: {formatTime(op.hora_ingreso)}</p>
                      <p>Última: {formatTime(op.hora_ultima_venta)}</p>
                      <p className="text-green-400">
                        Efectivo: ${Number(op.efectivo).toLocaleString()}
                      </p>
                      <p className="text-blue-400">
                        Tarjeta: ${Number(op.tarjeta).toLocaleString()}
                      </p>
                      <p className="text-purple-400 col-span-2">
                        Transferencia: $
                        {Number(op.transferencia).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}