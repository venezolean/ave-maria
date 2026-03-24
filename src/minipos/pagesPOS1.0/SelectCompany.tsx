import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  companies: {
    slug: string
    company_id: string
  }[]
  email: string
  password: string
}

export default function SelectCompany({ companies, email, password }: Props) {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = async (slug: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await login({
        email,
        password,
        company_slug: slug
      })

      if (!res.token) {
        setError('No se pudo iniciar sesión')
      }

    } catch {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">

      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700">

        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Selecciona tu empresa
        </h2>

        <div className="space-y-3">
          {companies.map(c => (
            <button
              key={c.company_id}
              onClick={() => handleSelect(c.slug)}
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg text-left px-4"
            >
              {c.slug}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-slate-400 text-sm mt-4 text-center">
            Procesando...
          </p>
        )}

      </div>
    </div>
  )
}