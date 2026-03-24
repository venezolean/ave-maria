import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {

  const { login, startTrial, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [companySlug, setCompanySlug] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nombre, setNombre] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {

    const trialParam = searchParams.get("trial");

    if (trialParam === "1") {

      const runTrial = async () => {
        try {
          setIsLoading(true);
          await startTrial();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al iniciar trial");
        } finally {
          setIsLoading(false);
        }
      };

      runTrial();

    }

  }, []);

const handleLogin = async (e: React.FormEvent) => {

  e.preventDefault();

  setError('');
  setIsLoading(true);

  try {

    const res = await login({
      email,
      password
    });

    // 🔥 múltiples empresas
    if (res.requires_company) {
      setCompanies(res.companies);
      return;
    }

    // 🔥 login ok → ya AuthContext setea user
    if (res.token) return;

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
  } finally {
    setIsLoading(false);
  }
};

const handleSelectCompany = async (slug: string) => {

  setIsLoading(true);
  setError('');

  try {

    const res = await login({
      email,
      password,
      company_slug: slug
    });

    if (!res.token) {
      setError('Error al iniciar sesión');
    }

  } catch {
    setError('Error al iniciar sesión');
  } finally {
    setIsLoading(false);
  }
};

  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {

      await register({
        company_name: companyName,
        company_slug: companySlug,
        nombre,
        email,
        password
      });

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Error al crear cuenta');

    } finally {

      setIsLoading(false);

    }

  };

  if (isLoading && searchParams.get("trial") === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">

          <div className="flex justify-center mb-8">

            <div className="bg-blue-600 p-4 rounded-xl">

              {mode === "login"
                ? <LogIn className="w-8 h-8 text-white"/>
                : <UserPlus className="w-8 h-8 text-white"/>}

            </div>

          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">

            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}

          </h1>

          <p className="text-slate-400 text-center mb-8">

            {mode === "login"
              ? "Ingresa tus credenciales"
              : "Crea tu tienda en segundos"}

          </p>

          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="space-y-6"
          >

            {mode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  required
                />

                <input
                  type="text"
                  placeholder="Slug de la empresa"
                  value={companySlug}
                  onChange={(e) => setCompanySlug(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  required
                />

                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  required
                />
              </>
            )}



            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              required
            />

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >

              {isLoading
                ? "Procesando..."
                : mode === "login"
                ? "Iniciar Sesión"
                : "Crear Cuenta"}

            </button>

          </form>

          {companies.length > 0 && (
  <div className="mt-6 space-y-3">

    <p className="text-slate-300 text-sm text-center">
      Selecciona tu empresa
    </p>

    {companies.map((c) => (
      <button
        key={c.company_id}
        onClick={() => handleSelectCompany(c.slug)}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg text-left px-4"
      >
        {c.slug}
      </button>
    ))}

  </div>
)}

          <button
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
            className="mt-6 w-full text-sm text-slate-400 hover:text-white"
          >

            {mode === "login"
              ? "¿Es tu primera vez? Crea tu cuenta aqui"
              : "¿Ya tienes cuenta? Iniciar sesión"}

          </button>

          <button
            type="button"
            onClick={async () => {
              setError('');
              setIsLoading(true);

              try {
                await startTrial();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al iniciar trial');
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
          >
            Entrar como prueba (sin cuenta)
          </button>

        </div>

        <p className="text-slate-500 text-center text-sm mt-6">
          Sistema de Punto de Venta
        </p>

      </div>

    </div>
  );
}