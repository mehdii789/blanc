import React from 'react';
import { 
  ClipboardList, 
  DollarSign, 
  Clock,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { OrderStatusChart } from '../components/dashboard/OrderStatusChart';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { InventoryAlert } from '../components/dashboard/InventoryAlert';
import { getDashboardStats } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { customers } = useApp();
  const stats = getDashboardStats();
  
  return (
    <div className="space-y-6 main-content">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 auto-rows-fr w-full">
        <div className="w-full">
          <StatCard 
            titre="Revenus du jour"
            valeur={formatCurrency(stats.dailyRevenue)}
            icone={<DollarSign className="text-emerald-600" size={24} />}
            iconeBg="bg-transparent"
            couleurTexte="text-gray-800"
            tendance={{ valeur: 8, estPositif: true }}
            borderColor="border-emerald-500"
            bgColor="#D1FAE5" // Vert clair
          />
        </div>
        
        <div className="w-full">
          <StatCard 
            titre="Commandes en cours"
            valeur={stats.pendingOrders}
            icone={<ClipboardList className="text-blue-600" size={24} />}
            iconeBg="bg-transparent"
            couleurTexte="text-gray-800"
            tendance={{ valeur: 12, estPositif: true }}
            borderColor="border-blue-500"
            bgColor="#E0F2FE" // Bleu clair
          />
        </div>
        
        <div className="w-full">
          <StatCard 
            titre="Prêt pour retrait"
            valeur={stats.readyForPickup}
            icone={<Clock className="text-violet-600" size={24} />}
            iconeBg="bg-transparent"
            couleurTexte="text-gray-800"
            borderColor="border-violet-500"
            bgColor="#EDE9FE" // Violet clair
          />
        </div>
        
        <div className="w-full">
          <StatCard 
            titre="Total clients"
            valeur={customers.length}
            icone={<Users className="text-amber-600" size={24} />}
            iconeBg="bg-transparent"
            couleurTexte="text-gray-800"
            borderColor="border-amber-500"
            bgColor="#FEF3C7" // Ambre clair
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusChart />
        <InventoryAlert />
      </div>
      
      <RecentOrders />
    </div>
  );
};