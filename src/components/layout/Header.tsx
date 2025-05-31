import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
          <Menu size={24} />
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
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="relative">
          <button className="text-gray-600 hover:text-blue-600 transition-colors p-1">
            <Bell size={20} />
            <span className="sr-only">Notifications</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              <span className="sr-only">3 nouvelles notifications</span>
              <span aria-hidden="true">3</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};