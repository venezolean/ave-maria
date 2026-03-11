import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import TrialOverlay from '../trial/TrialOverlay';
import TrialQuestion from '../trial/TrialQuestion'
import FirstSaleCelebration from '../trial/FirstSaleCelebration';


interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'inventory' | 'pos' | 'sales';
  onNavigate: (page: 'dashboard' | 'inventory' | 'pos' | 'sales') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos' as const, label: 'Punto de Venta', icon: ShoppingCart },
    { id: 'inventory' as const, label: 'Inventario', icon: Package },
    { id: 'sales' as const, label: 'Ventas', icon: Receipt },
  ];

  const handleLogout = () => {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">POS System</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.nombre?.charAt(0)?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.nombre ?? 'Usuario'}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {user?.tipo_usuario ?? 'admin'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.nombre?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user?.nombre ?? 'Usuario'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {user?.tipo_usuario ?? 'admin'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
        
      </main>
      
      <TrialOverlay />
      <TrialQuestion />
      <FirstSaleCelebration />
    </div>
  );
}
