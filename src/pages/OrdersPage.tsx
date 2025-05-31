import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderList } from '../components/orders/OrderList';
import { OrderDetails } from '../components/orders/OrderDetails';

export const OrdersPage: React.FC = () => {
  const { selectedOrderId } = useApp();
  
  return (
    <div>
      {selectedOrderId ? (
        <OrderDetails orderId={selectedOrderId} />
      ) : (
        <OrderList />
      )}
    </div>
  );
};