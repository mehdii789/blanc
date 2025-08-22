import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderList } from '../components/orders/OrderList';
import { OrderDetails } from '../components/orders/OrderDetails';

export const OrdersPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const { setSelectedOrderId } = useApp();

  // Mettre à jour l'état selectedOrderId lorsque l'URL change
  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
    } else {
      // S'assurer qu'aucun ordre n'est sélectionné quand on est sur la liste
      setSelectedOrderId(null);
    }
  }, [orderId, setSelectedOrderId]);
  
  // Fonction pour gérer le retour à la liste
  const handleBackToList = useCallback(() => {
    navigate('/orders', { replace: true });
  }, [navigate]);
  
  // Éviter les rendus inutiles
  const renderContent = useCallback(() => {
    if (orderId) {
      return (
        <div className="p-4 md:p-6">
          <OrderDetails orderId={orderId} onBack={handleBackToList} />
        </div>
      );
    }
    
    return (
      <div className="p-4 md:p-6">
        <OrderList />
      </div>
    );
  }, [orderId, handleBackToList]);
  
  return renderContent();
};