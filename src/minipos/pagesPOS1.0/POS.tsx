import { useEffect, useMemo, useState, useRef } from 'react';
import { api } from '../lib/api';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { useTrial } from '../trial/TrialProvider'


interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
}

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  max_stock: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const { trackAction } = useTrial()
  const [showCartMobile, setShowCartMobile] = useState(false);
  const productRef = useRef<HTMLButtonElement>(null)
  const cartRef = useRef<HTMLDivElement>(null)
  const checkoutRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
console.log("API PRODUCTS RAW:", response);
      // 🔒 Normalización fuerte
      const normalized: Product[] = response.map((p: any) => ({
        id: p.id ?? p.product_id,
        name: p.name,
        price: Number(p.price),
        stock: Number(p.stock),
        image_url: p.image_url ?? null,
      }));
console.log("NORMALIZED PRODUCTS:", normalized);
      setProducts(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const showTempError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const addToCart = (product: Product) => {
    if (!product.id) return;

    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);

      if (existing) {
        if (existing.quantity + 1 > existing.max_stock) {
          showTempError('Stock insuficiente');
          return prev;
        }

        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      if (product.stock < 1) {
        showTempError('Producto sin stock');
        return prev;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          max_stock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product_id !== productId) return item;

          const newQty = item.quantity + delta;

          if (newQty <= 0) return null;
          if (newQty > item.max_stock) {
            showTempError('Stock insuficiente');
            return item;
          }

          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showTempError('El carrito está vacío');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🔥 EXACTO formato que tu SQL espera
      const payload = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        payment_method: paymentMethod,
      };

      await api.createSale(payload);

      setSuccess('Venta realizada con éxito');
      trackAction('completed_sale')
      setCart([]);
      await loadProducts();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message.toLowerCase() : '';

      if (message.includes('insufficient stock')) {
        showTempError('Stock insuficiente');
      } else if (message.includes('product not found')) {
        showTempError('Producto no encontrado');
      } else {
        showTempError('Error al procesar venta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen lg:h-[calc(100vh-8rem)]">

      {/* PRODUCTOS */}
      <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Punto de Venta</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <button
                ref={index === 0 ? productRef : undefined}
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock < 1}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 transition text-left"
              >
                <div className="aspect-square bg-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <h3 className="text-white font-medium truncate">
                  {product.name}
                </h3>

                <p className="text-blue-400 font-semibold">
                  ${product.price.toFixed(2)}
                </p>

                <p className={`text-sm ${product.stock < 10 ? 'text-orange-400' : 'text-slate-400'}`}>
                  Stock: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARRITO */}
      {/* CARRITO */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/50 transition-opacity lg:static lg:bg-transparent
          ${showCartMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
        `}
      >
        <div
          className={`
            absolute bottom-0 left-0 right-0 bg-slate-800 p-6 rounded-t-2xl h-[85vh] flex flex-col
            lg:relative lg:h-[calc(100vh-6rem)] lg:rounded-xl lg:border lg:border-slate-700/50
            transition-transform duration-300
            ${showCartMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}
        >
          {/* Botón cerrar mobile */}
          <button
            onClick={() => setShowCartMobile(false)}
            className="lg:hidden text-slate-400 mb-4 text-right"
          >
            Cerrar
          </button>

          <div ref={cartRef} className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Carrito</h2>
            <span className="ml-auto text-slate-400">{cart.length} items</span>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="text-white text-sm">{item.name}</h3>
                      <p className="text-blue-400 text-sm">${item.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => updateQuantity(item.product_id, -1)}>
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)}>
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <span className="text-white font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-slate-400">Total:</span>
              <span className="text-white font-bold text-2xl">
                ${total.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 p-3 rounded-lg border ${
                  paymentMethod === 'cash'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Efectivo</span>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-3 rounded-lg border ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Tarjeta</span>
              </button>
            </div>

            <button
              ref={checkoutRef}
              onClick={handleCheckout}
              disabled={isLoading || cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white py-4 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </div>
        </div>
      </div>
      {/* Botón flotante mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCartMobile(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-xl relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </div>
    
  );
}