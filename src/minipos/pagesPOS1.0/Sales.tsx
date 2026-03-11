import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Receipt,
  CreditCard,
  Banknote,
  RotateCcw,
  ChevronDown,
  ChevronUp,
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
  const { trackAction } = useTrial()

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSales();
      setSales(response);
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

  const toggleExpand = (saleId: string) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

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
    return method === 'cash' ? (
      <Banknote className="w-5 h-5" />
    ) : (
      <CreditCard className="w-5 h-5" />
    );
  };

  const getPaymentLabel = (method: string) => {
    return method === 'cash' ? 'Efectivo' : 'Tarjeta';
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Historial de Ventas</h1>
        <p className="text-slate-400">Total de ventas: {sales.length}</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay ventas registradas</p>
          </div>
        ) : (
          sales.map((sale) => (
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
                        ${sale.total.toFixed(2)}
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
                      {expandedSale === sale.id ? (
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

              {expandedSale === sale.id && (
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
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-white font-semibold">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white font-bold text-xl">
                      ${sale.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
