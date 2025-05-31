import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerDetails } from '../components/customers/CustomerDetails';

export const CustomersPage: React.FC = () => {
  const { selectedCustomerId } = useApp();
  
  return (
    <div>
      {selectedCustomerId ? (
        <CustomerDetails customerId={selectedCustomerId} />
      ) : (
        <CustomerList />
      )}
    </div>
  );
};