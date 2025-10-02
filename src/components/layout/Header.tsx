import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { RefreshIndicator } from '../common/RefreshIndicator';
import NotificationSystem from '../notifications/NotificationSystem';
import { useApp } from '../../hooks/useApp';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { activeView } = useApp();
  
  const getHeaderTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'customers':
        return 'Gestion des clients';
      case 'orders':
        return 'Gestion des commandes';
      case 'inventory':
        return 'Gestion du stock';
      case 'employees':
        return 'Gestion des employés';
      case 'payments':
        return 'Paiements';
      case 'reports':
        return 'Rapports et analyses';
      case 'settings':
        return 'Paramètres système';
      case 'client-access':
        return 'Gestion des Accès Clients';
      case 'supabase-monitoring':
        return 'Monitoring Supabase';
      default:
        return 'BlanchPro';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle}
          className="md:hidden mr-3 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{getHeaderTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-40 md:w-56 lg:w-64"
          />
          <svg className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center space-x-4">
          <RefreshIndicator className="hidden md:flex" />
          <NotificationSystem />
          <div className="text-sm text-gray-600 hidden lg:block">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
};