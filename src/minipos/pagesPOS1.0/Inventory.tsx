import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  History,
  X,
  Upload,
  ArrowDownZA,
  ArrowDown,
} from 'lucide-react'
import { useTrial } from '../trial/TrialProvider'


interface Product {
  id: string
  name: string
  price: number
  stock: number
  stock_value: number
  movements_count: number
  last_movement: string | null
  is_low_stock: boolean
  image_url?: string
}

interface Movement {
  id: string
  movement_type: string
  quantity: number
  created_at: string
  reference_id: string | null
}

export default function Inventory() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showMovements, setShowMovements] = useState(false)
  const [movements, setMovements] = useState<Movement[]>([])
  const { trackAction } = useTrial()
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [showPurchase, setShowPurchase] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  useEffect(() => {
    loadProducts()
  }, [])

const loadProducts = async () => {
  try {
    setIsLoading(true);

    const response = await api.getProducts();

    const normalized = response.map((p: any) => ({
      id: p.id ?? p.product_id,   // ← clave
      name: p.name,
      price: Number(p.price),
      stock: Number(p.stock),
      stock_value: Number(p.stock_value ?? p.price * p.stock),
      movements_count: Number(p.movements_count ?? 0),
      last_movement: p.last_movement ?? null,
      is_low_stock: Boolean(p.is_low_stock ?? p.stock <= 5),
      image_url: p.image_url ?? null,
    }));

    setProducts(normalized);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al cargar productos');
  } finally {
    setIsLoading(false);
  }
};

  const loadMovements = async (productId: string) => {
    const response = await api.getProductMovements(productId)
    setMovements(response)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-white">Inventario</h1>
        <button
          ref={createButtonRef}
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      <table ref={tableRef} className="w-full text-left text-white">
        <thead className="text-slate-400">
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Valor</th>
            <th>Mov</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-700">
              <td className="py-3 flex items-center gap-3">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    loading="lazy"
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-slate-600" />
                )}
                <div>
                  <div>{p.name}</div>
                  {p.is_low_stock && (
                    <span className="text-xs text-orange-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Stock bajo
                    </span>
                  )}
                </div>
              </td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>${p.stock_value.toFixed(2)}</td>
              <td>{p.movements_count}</td>
<td>
  <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
    
    <button
      className="p-2 bg-slate-700 rounded-md"
      onClick={() => {
        setSelectedProduct(p)
        setShowMovements(true)
        loadMovements(p.id)
      }}
    >
      <History className="w-4 h-4" />
    </button>

    {user?.tipo_usuario === 'admin' && (
      <>
        <button
          className="p-2 bg-slate-700 rounded-md"
          onClick={() => {
            setSelectedProduct(p)
            setShowEdit(true)
          }}
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          className="p-2 bg-green-600/20 rounded-md"
          onClick={() => {
            setSelectedProduct(p)
            setShowPurchase(true)
          }}
        >
          <Plus className="w-4 h-4 text-green-400" />
        </button>

        <button
          className="p-2 bg-orange-600/20 rounded-md"
          onClick={() => {
            setSelectedProduct(p)
            setShowAdjust(true)
          }}
        >
          <Edit2 className="w-4 h-4 text-orange-400" />
        </button>
      </>
    )}
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <ProductModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={loadProducts}
        />
      )}

      {showEdit && selectedProduct && (
        <ProductModal
          mode="edit"
          product={selectedProduct}
          onClose={() => {
            setShowEdit(false)
            setSelectedProduct(null)
          }}
          onSuccess={loadProducts}
        />
      )}
      {showMovements && selectedProduct && (
        <MovementsModal
          product={selectedProduct}
          movements={movements}
          onClose={() => setShowMovements(false)}
        />
      )}

    {showPurchase && selectedProduct && (
      <StockMovementModal
        product={selectedProduct}
        type="purchase"
        onClose={()=>setShowPurchase(false)}
        onSuccess={loadProducts}
      />
    )}

    {showAdjust && selectedProduct && (
      <StockMovementModal
        product={selectedProduct}
        type="adjustment"
        onClose={()=>setShowAdjust(false)}
        onSuccess={loadProducts}
      />
    )}
    </div>
    
  )
}

/* ============================= */
/*        PRODUCT MODAL          */
/* ============================= */

function ProductModal({
  mode,
  product,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit'
  product?: Product
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(product?.name || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [stock, setStock] = useState(product?.stock?.toString() || '0')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(
    product?.image_url || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { trackAction } = useTrial()

  useEffect(() => {
    if (!imageFile) return

    const url = URL.createObjectURL(imageFile)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let productId = product?.id

      if (mode === 'create') {
        const created = await api.createProduct({
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
        })
        productId = created.id
      } else {
        await api.updateProduct(productId!, {
          name,
          price: parseFloat(price),
        })
      }

      if (imageFile && productId) {
        const { upload_url, public_url } =
          await api.getProductUploadUrl(productId, imageFile.type)

        const upload = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'Content-Type': imageFile.type
          },
          body: imageFile
        })

        if (!upload.ok) {
          const errorText = await upload.text()
          throw new Error(`Upload failed: ${errorText}`)
        }

        await api.setProductImage(productId, public_url)

        

        
      }

      onSuccess()
      trackAction('created_product')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-white text-xl mb-4">
          {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 bg-slate-900 text-white rounded"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            step="1000.00"
            className="w-full p-2 bg-slate-900 text-white rounded"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          {/* <input
            type="number"
            className="w-full p-2 bg-slate-900 text-white rounded"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          /> */}

          <label className="block text-slate-400 text-sm">Imagen</label>

          {preview && (
            <img
              src={preview}
              className="w-24 h-24 rounded object-cover mb-2"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
          />

          {error && <div className="text-red-400">{error}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 py-2 rounded text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 py-2 rounded text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
    
  )
  
}
function MovementsModal({
  product,
  movements,
  onClose,
}: {
  product: Product
  movements: Movement[]
  onClose: () => void
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sale: 'Venta',
      purchase: 'Compra',
      adjustment: 'Ajuste',
      return: 'Devolución',
    }
    return types[type] || type
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Movimientos de {product.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Total: {movements.length}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {movements.length > 0 ? (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {getMovementTypeLabel(movement.movement_type)}
                    </span>

                    <span
                      className={`font-semibold ${
                        movement.quantity > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </span>
                  </div>

                  <div className="text-slate-400 text-sm mt-1">
                    {formatDate(movement.created_at)}
                  </div>

                  {movement.reference_id && (
                    <div className="text-slate-500 text-xs mt-1">
                      Ref: {movement.reference_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">
              No hay movimientos registrados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StockMovementModal({
  product,
  type,
  onClose,
  onSuccess
}:{
  product: Product
  type: 'purchase' | 'adjustment'
  onClose: () => void
  onSuccess: () => void
}) {

  const [qty,setQty] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const config = {
    purchase: {
      title: "Compra de stock",
      button: "Registrar compra",
      color: "bg-green-600",
      help: "Ingresá la cantidad comprada. Solo números positivos."
    },
    adjustment: {
      title: "Ajuste de inventario",
      button: "Aplicar ajuste",
      color: "bg-orange-600",
      help: "Usá números positivos para sumar stock o negativos para descontar."
    }
  }

  const submit = async () => {

    const quantity = Number(qty)

    if(!qty || quantity === 0){
      setError("Ingresá una cantidad válida")
      return
    }

    if(type === 'purchase' && quantity < 0){
      setError("La compra solo puede ser un número positivo")
      return
    }

    setLoading(true)

    try{

      await api.adjustStock(product.id,{
        quantity: quantity,
        reason: type
      })

      onSuccess()
      onClose()

    }catch(e){
      console.error(e)
      setError("No se pudo registrar el movimiento")
    }

    setLoading(false)
  }

  const ui = config[type]

  return(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div className="bg-slate-800 p-6 rounded-xl w-96">

        <h2 className="text-white mb-2">
          {ui.title}
        </h2>

        <p className="text-slate-400 text-sm mb-4">
          {ui.help}
        </p>
        <div className="bg-slate-900 rounded p-3 mb-4 text-sm">

          <div className="flex justify-between text-slate-400">
            <span>Stock actual</span>
            <span className="text-white">{product.stock}</span>
          </div>

        </div>
        <input
          type="number"
          value={qty}
          placeholder={type === "purchase" ? "Ej: 50" : "Ej: -2 o 5"}
          onChange={e=>{
            setQty(e.target.value)
            setError("")
          }}
          className="w-full p-2 bg-slate-900 text-white rounded"
        />

        {qty && (
          <div className="bg-slate-900 rounded p-3 mt-4 text-sm">

            <div className="flex justify-between text-slate-400">
              <span>Movimiento</span>
              <span className={Number(qty) > 0 ? "text-green-400" : "text-red-400"}>
                {Number(qty) > 0 ? "+" : ""}{qty}
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-slate-400">Stock resultante</span>
              <span className="text-white font-semibold">
                {product.stock + Number(qty)}
              </span>
            </div>

          </div>
        )}
        

        {error && (
          <div className="text-red-400 text-sm mt-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-4">

          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 py-2 rounded"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className={`flex-1 ${ui.color} py-2 rounded`}
          >
            {ui.button}
          </button>

        </div>

      </div>

    </div>
  )
}