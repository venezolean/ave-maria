import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Plus } from 'lucide-react'

interface User {
  id: string
  nombre: string
  tipo_usuario: string
  codigo_empleado: string
}

export default function Users() {
  const { user } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const loadUsers = async () => {
    const res = await api.getUsers()
    setUsers(res)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
    console.log(user)
  }, [])

  if (user?.tipo_usuario !== 'admin' && user?.role !== 'admin') {
    return <div className="text-white">No autorizado</div>
  }

  if (loading) return <div className="text-white">Cargando...</div>

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl text-white font-bold">Usuarios</h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg">
        {users.map(u => (
          <div className="flex justify-between p-3 border-b border-slate-700">
            <div>
                <div className="text-white">{u.nombre}</div>
                <div className="text-xs text-slate-500">
                {u.codigo_empleado}
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <span className="text-slate-400">{u.tipo_usuario}</span>
                

                <button
                onClick={() => setEditingUser(u)}
                className="text-xs text-blue-400"
                >
                Editar
                </button>
            </div>
            </div>
        ))}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={loadUsers}
        />
      )}

      {editingUser && (
        <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={loadUsers}
        />
        )}

    </div>
  )
}


function EditUserModal({ user, onClose, onSuccess }: any) {

  const [nombre, setNombre] = useState(user.nombre)
  const [tipo, setTipo] = useState(user.tipo_usuario)
  const [password, setPassword] = useState('')

  const submit = async () => {

    await api.updateUser(user.id, {
      nombre,
      tipo_usuario: tipo,
      password: password || undefined
    })

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-xl w-80 space-y-4">

        <h2 className="text-white text-lg">Editar Usuario</h2>

        <input
          className="w-full p-2 bg-slate-900 text-white rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          className="w-full p-2 bg-slate-900 text-white rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-2 bg-slate-900 text-white rounded"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="operador">Operador</option>
          <option value="supervisor">Supervisor</option>
        </select>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-700 p-2 rounded text-white">
            Cancelar
          </button>
          <button onClick={submit} className="flex-1 bg-blue-600 p-2 rounded text-white">
            Guardar
          </button>
        </div>

      </div>
    </div>
  )
}

function CreateUserModal({ onClose, onSuccess }: any) {

  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'operador' | 'supervisor'>('operador')
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

const submit = async () => {
  if (!nombre || !password) return

    setLoading(true)

    await api.createUser({
    nombre,
    tipo_usuario: tipo,
    password
    })

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div className="bg-slate-800 p-6 rounded-xl w-80 space-y-4">

        <h2 className="text-white text-lg">Nuevo Usuario</h2>

        <input
          className="w-full p-2 bg-slate-900 text-white rounded"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
        type="password"
        className="w-full p-2 bg-slate-900 text-white rounded"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-2 bg-slate-900 text-white rounded"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as any)}
        >
          <option value="operador">Operador</option>
          <option value="supervisor">Supervisor</option>
        </select>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-700 p-2 rounded text-white">
            Cancelar
          </button>
          <button onClick={submit} className="flex-1 bg-blue-600 p-2 rounded text-white">
            {loading ? '...' : 'Crear'}
          </button>
        </div>

      </div>
    </div>
  )
}