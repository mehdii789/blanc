import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
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
import { useApp } from './context/AppContext';

// Composant pour gérer la vue protégée avec le Layout
const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const location = useLocation();

  // Mettre à jour l'activeView en fonction de l'URL
  React.useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    if (path !== activeView) {
      setActiveView(path);
    }
  }, [location, activeView, setActiveView]);

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
      <Route path="*" element={renderWithLayout(<Navigate to="/dashboard" replace />)} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;