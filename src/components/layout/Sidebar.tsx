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
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  view: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  active, 
  onClick 
}) => {
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
        active 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="text-current">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const menuItems = [
    { icon: <Home size={20} />, label: 'Tableau de bord', view: 'dashboard' },
    { icon: <Users size={20} />, label: 'Clients', view: 'customers' },
    { icon: <ClipboardList size={20} />, label: 'Commandes', view: 'orders' },
    { icon: <ShoppingCart size={20} />, label: 'Inventaire', view: 'inventory' },
    { icon: <UserPlus size={20} />, label: 'Employés', view: 'employees' },
    { icon: <DollarSign size={20} />, label: 'Paiements', view: 'payments' },
    { icon: <FileText size={20} />, label: 'Factures', view: 'invoices' },
    { icon: <BarChart2 size={20} />, label: 'Rapports', view: 'reports' },
    { icon: <Settings size={20} />, label: 'Paramètres', view: 'settings' },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
          <ClipboardList size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">BlanchPro</h1>
      </div>
      
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            view={item.view}
            active={activeView === item.view}
            onClick={() => setActiveView(item.view)}
          />
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
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