import React from 'react';
import { InventoryList } from '../components/inventory/InventoryList';
import { InventoryAlerts } from '../components/inventory/InventoryAlerts';

export const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <InventoryAlerts />
      <InventoryList />
    </div>
  );
};