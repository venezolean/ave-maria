import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

type User = {
  id: string
  nombre: string
  email?: string
  tipo_usuario?: string
  role?: string
  trial?: boolean

  company?: {
    id: string
    name: string
    slug: string
  }
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: {
    email: string
    password?: string
    company_slug?: string
  }) => Promise<any>;
  startTrial: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  register: (data: {
    company_name: string
    company_slug: string
    nombre: string
    email: string
    password: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const startTrial = async () => {
  const response = await api.startTrial();
    setUser(response.user);
  };

  useEffect(() => {
    const storedUser = api.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: {
    email: string
    password?: string
    company_slug?: string
  }) => {

    const response = await api.login(data);

    // 🔥 CASO LOGIN EXITOSO
    if ('token' in response) {
      setUser(response.user);
      return response;
    }

    // 🔥 CASO MULTI EMPRESA
    if ('requires_company' in response) {
      return response;
    }

    return response;
  };

  const register = async (data: {
    company_name: string
    company_slug: string
    nombre: string
    email: string
    password: string
  }) => {

    const response = await api.register(data)

    setUser({
      ...response.user,
      company: response.company,
      trial: false
    })

  }

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        startTrial,
        logout,
        isLoading,
        register
      }}
>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
