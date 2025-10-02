import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DatabaseProvider } from './context/DatabaseContext';
import './utils/mockApi'; // Intercept external API requests
import { Dashboard } from './pages/Dashboard';
import { CustomersPage } from './pages/CustomersPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import InvoicesPage from './pages/InvoicesPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientPortalPage from './pages/ClientPortalPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import ClientAccessPage from './pages/ClientAccessPage';
import { SimpleServiceConfigPage } from './pages/SimpleServiceConfigPage';
import { PackManagementPage } from './pages/PackManagementPage';
import { useDatabase } from './context/DatabaseContext';
import { FullPageLoader } from './components/common/LoadingSpinner';

// Composant pour gérer la vue protégée avec le Layout
const AppContent: React.FC = () => {
  const { activeView, setActiveView, loading, error } = useDatabase();
  const location = useLocation();

  // Mettre à jour l'activeView en fonction de l'URL
  React.useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    if (path !== activeView) {
      setActiveView(path);
    }
  }, [location, activeView, setActiveView]);

  // Afficher le loader pendant le chargement initial
  if (loading) {
    return <FullPageLoader message="Synchronisation avec la base de données..." />;
  }

  // Afficher l'erreur si il y en a une
  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour rendre les routes avec un layout commun
  const renderWithLayout = (element: React.ReactNode) => (
    <Layout>
      {element}
    </Layout>
  );

  return (
    <Routes>
      <Route path="/" element={renderWithLayout(<Navigate to="/dashboard" replace />)} />
      <Route path="/dashboard" element={renderWithLayout(<Dashboard />)} />
      <Route path="/customers" element={renderWithLayout(<CustomersPage />)} />
      
      {/* Route pour la liste des commandes */}
      <Route path="/orders" element={renderWithLayout(<OrdersPage />)} />
      {/* Route pour les détails d'une commande spécifique */}
      <Route path="/orders/:orderId" element={renderWithLayout(<OrdersPage />)} />
      
      <Route path="/inventory" element={renderWithLayout(<InventoryPage />)} />
      <Route path="/employees" element={renderWithLayout(<EmployeesPage />)} />
      <Route path="/payments" element={renderWithLayout(<PaymentsPage />)} />
      <Route path="/invoices" element={renderWithLayout(<InvoicesPage />)} />
      <Route path="/reports" element={renderWithLayout(<ReportsPage />)} />
      <Route path="/settings" element={renderWithLayout(<SettingsPage />)} />
      <Route path="/simple-service-config" element={renderWithLayout(<SimpleServiceConfigPage />)} />
      <Route path="/pack-management" element={renderWithLayout(<PackManagementPage />)} />
      
      {/* Routes pour le portail client */}
      <Route path="/client-login" element={<ClientLoginPage />} />
      <Route path="/client-portal" element={<ClientPortalPage />} />
      <Route path="/client-orders" element={<ClientOrdersPage />} />
      <Route path="/client-access" element={renderWithLayout(<ClientAccessPage />)} />
      
      <Route path="*" element={renderWithLayout(<Navigate to="/dashboard" replace />)} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
};

export default App;