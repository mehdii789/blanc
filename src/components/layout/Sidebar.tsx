import React from 'react';
import { 
  Home, 
  Users, 
  ClipboardList, 
  ShoppingCart, 
  DollarSign, 
  Settings,
  BarChart2,
  UserPlus,
  FileText,
  Globe,
  Key
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';


interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  view: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  view,
  active
}) => {
  return (
    <Link 
      to={`/${view === 'dashboard' ? '' : view}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className={`${active ? 'text-blue-600' : 'text-gray-500'}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {

  const menuItems = [
    { icon: <Home size={20} />, label: 'Tableau de bord', view: 'dashboard' },
    { icon: <Users size={20} />, label: 'Clients', view: 'customers' },
    { icon: <ClipboardList size={20} />, label: 'Commandes', view: 'orders' },
    { icon: <ShoppingCart size={20} />, label: 'Inventaire', view: 'inventory' },
    { icon: <UserPlus size={20} />, label: 'Employés', view: 'employees' },
    { icon: <DollarSign size={20} />, label: 'Paiements', view: 'payments' },
    { icon: <FileText size={20} />, label: 'Factures', view: 'invoices' },
    { icon: <BarChart2 size={20} />, label: 'Rapports', view: 'reports' },
    { icon: <Key size={20} />, label: 'Accès Clients', view: 'client-access' },
    { icon: <Settings size={20} />, label: 'Paramètres', view: 'settings' },
  ];

  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 p-4 flex flex-col">
      <Link to="/" className="mb-8 flex items-center gap-3 px-4">
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
          <ClipboardList size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">BlanchPro</h1>
      </Link>
      
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.view || 
                         (currentPath === '' && item.view === 'dashboard');
          
          return (
            <SidebarItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              view={item.view}
              active={isActive}
            />
          );
        })}
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="mb-4">
          <a
            href="/client-login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Globe size={16} />
            <span>Portail Client</span>
            <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-3 px-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-medium">DW</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">David Wilson</p>
            <p className="text-xs text-gray-500">Gérant</p>
          </div>
        </div>
      </div>
    </div>
  );
};