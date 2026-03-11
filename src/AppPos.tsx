import { useState } from 'react';
import { AuthProvider, useAuth } from './minipos/context/AuthContext';
import Layout from './minipos/components/Layout';
import Login from './minipos/pagesPOS1.0/Login';
import Dashboard from './minipos/pagesPOS1.0/Dashboard';
import Inventory from './minipos/pagesPOS1.0/Inventory';
import POS from './minipos/pagesPOS1.0/POS';
import Sales from './minipos/pagesPOS1.0/Sales';
import { TrialProvider } from './minipos/trial/TrialProvider'

type Page = 'dashboard' | 'inventory' | 'pos' | 'sales';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <POS />;
      case 'sales':
        return <Sales />;
      default:
        return <POS />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <TrialProvider>
        <AppContent />
      </TrialProvider>
    </AuthProvider>
  );
}

export default App;
