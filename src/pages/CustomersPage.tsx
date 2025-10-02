import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerDetails } from '../components/customers/CustomerDetails';

export const CustomersPage: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  return (
    <div>
      {selectedCustomerId ? (
        <CustomerDetails 
          customerId={selectedCustomerId} 
          onBack={() => setSelectedCustomerId(null)} 
        />
      ) : (
        <CustomerList onSelectCustomer={setSelectedCustomerId} />
      )}
    </div>
  );
};