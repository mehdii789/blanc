import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { generatePdf } from '../utils/pdfGenerator';
import type { OrderStatus } from '../types';
import { 
  Customer, 
  Order, 
  Service, 
  Employee, 
  InventoryItem,
  Invoice
} from '../types';
import { 
  mockCustomers, 
  mockOrders, 
  mockServices, 
  mockEmployees, 
  mockInventoryItems
} from '../data/mockData';

interface AppContextType {
  customers: Customer[];
  orders: Order[];
  services: Service[];
  employees: Employee[];
  inventoryItems: InventoryItem[];
  invoices: Invoice[];
  
  // Clients
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  
  // Commandes
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (order: Order) => void;
  
  // Inventaire
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  
  // Factures
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  setInvoices: (invoices: Invoice[]) => void;
  generatePdf: (invoice: Invoice) => Promise<void>;
  
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Sélections
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export // Fonction pour charger les données depuis le localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key} depuis le localStorage:`, error);
    return defaultValue;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Charger les données depuis le localStorage ou utiliser les données mockées
  const [customers, setCustomers] = useState<Customer[]>(
    loadFromLocalStorage<Customer[]>('customers', mockCustomers)
  );
  const [orders, setOrders] = useState<Order[]>(
    loadFromLocalStorage<Order[]>('orders', mockOrders)
  );
  const [services] = useState<Service[]>(
    loadFromLocalStorage<Service[]>('services', mockServices)
  );
  const [employees] = useState<Employee[]>(
    loadFromLocalStorage<Employee[]>('employees', mockEmployees)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(
    loadFromLocalStorage<Invoice[]>('invoices', [])
  );
  
  // Sauvegarder les données dans le localStorage lorsqu'elles changent
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    loadFromLocalStorage<InventoryItem[]>('inventory', mockInventoryItems)
  );
  
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: (customers.length + 1).toString(),
      createdAt: new Date()
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: (orders.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(order => 
      order.id === updatedOrder.id 
        ? { ...updatedOrder, updatedAt: new Date() } 
        : order
    ));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: (inventoryItems.length + 1).toString()
    };
    setInventoryItems([...inventoryItems, newItem]);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInvoices([...invoices, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) => 
      inv.id === invoice.id ? { ...invoice, updatedAt: new Date() } : inv
    ));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const handleGeneratePdf = async (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (!customer) return;

    const company = {
      name: 'Votre Entreprise',
      address: '123 Rue de la Laverie',
      city: 'Paris',
      postalCode: '75000',
      email: 'contact@votrelaverie.com',
      phone: '01 23 45 67 89',
      siret: '123 456 789 00012',
    };

    await generatePdf(invoice, company, customer);
  };

  const value = {
    customers,
    orders,
    services,
    employees,
    inventoryItems,
    invoices,
    
    addCustomer,
    updateCustomer,
    
    addOrder,
    updateOrderStatus,
    updateOrder,
    
    addInventoryItem,
    updateInventoryItem,
    
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generatePdf: handleGeneratePdf,
    setInvoices,
    
    activeView,
    setActiveView,
    
    selectedCustomerId,
    setSelectedCustomerId,
    
    selectedOrderId,
    setSelectedOrderId,
    
    selectedInvoiceId,
    setSelectedInvoiceId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};