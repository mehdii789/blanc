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
  mockInventoryItems,
  mockInvoices
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
  deleteCustomer: (id: string) => void;
  
  // Commandes
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  resetAllOrdersPaymentStatus: () => boolean;
  
  // Inventaire
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Factures
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  setInvoices: (invoices: Invoice[]) => void;
  generatePdf: (invoice: Invoice) => Promise<void>;
  
  // Employés
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Filtre de date pour le tableau de bord
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  
  // Sélections
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export // Fonction pour convertir les chaînes de date en objets Date
const parseDates = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => parseDates(item));
  }

  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      // Vérifier si la clé se termine par 'At' (comme createdAt, updatedAt)
      // ou si la valeur ressemble à une date ISO
      if ((key.endsWith('At') || key === 'date') && typeof value === 'string') {
        const date = new Date(value);
        result[key] = isNaN(date.getTime()) ? value : date;
      } else if (value && typeof value === 'object') {
        result[key] = parseDates(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

// Fonction pour charger les données depuis le localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    // Convertir les chaînes de date en objets Date
    return parseDates(parsed);
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key} depuis le localStorage:`, error);
    return defaultValue;
  }
};

// Fonction pour sauvegarder les données dans le localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des ${key} dans le localStorage:`, error);
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
  const [employees, setEmployees] = useState<Employee[]>(
    loadFromLocalStorage<Employee[]>('employees', mockEmployees)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(
    loadFromLocalStorage<Invoice[]>('invoices', mockInvoices)
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => 
    loadFromLocalStorage<InventoryItem[]>('inventory', mockInventoryItems)
  );
  
  // Sauvegarder les articles d'inventaire dans le localStorage lorsqu'ils changent
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventoryItems));
  }, [inventoryItems]);
  
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // État pour la gestion des dates dans le tableau de bord
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  });
  
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

  const deleteCustomer = (id: string) => {
    // Supprimer le client
    setCustomers(customers.filter(customer => customer.id !== id));
    
    // Si le client supprimé est celui qui est actuellement sélectionné, on le déselectionne
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
    
    // Mettre à jour les commandes associées à ce client (optionnel)
    // Par exemple, on pourrait vouloir supprimer ou marquer comme "sans client" les commandes de ce client
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
    const currentDate = new Date();
    const orderIndex = orders.findIndex(order => order.id === updatedOrder.id);
    
    if (orderIndex !== -1) {
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = {
        ...updatedOrder,
        updatedAt: currentDate
      };
      setOrders(updatedOrders);
      saveToLocalStorage('orders', updatedOrders);
    }
  };

  const deleteOrder = (id: string) => {
    const updatedOrders = orders.filter(order => order.id !== id);
    setOrders(updatedOrders);
    saveToLocalStorage('orders', updatedOrders);
    
    // Si une commande sélectionnée est supprimée, on la déselectionne
    if (selectedOrderId === id) {
      setSelectedOrderId(null);
    }
    
    return true; // Indiquer que la suppression a réussi
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
    };
    const newItems = [...inventoryItems, newItem];
    setInventoryItems(newItems);
    saveToLocalStorage('inventoryItems', newItems);
  };

  const updateInventoryItem = (item: InventoryItem) => {
    const newItems = inventoryItems.map(i => i.id === item.id ? item : i);
    setInventoryItems(newItems);
    saveToLocalStorage('inventoryItems', newItems);
  };

  const deleteInventoryItem = (id: string) => {
    const newItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(newItems);
    saveToLocalStorage('inventoryItems', newItems);
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Créer la facture avec le statut fourni
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Synchroniser avec la commande associée
    if (invoiceData.orderId) {
      const orderToUpdate = orders.find(order => order.id === invoiceData.orderId);
      if (orderToUpdate) {
        const shouldMarkAsPaid = newInvoice.status === 'paid';
        const paymentMethod = orderToUpdate.paymentMethod || 'cash';
        
        const updatedOrder = {
          ...orderToUpdate,
          paid: shouldMarkAsPaid,
          paymentMethod: paymentMethod,
          updatedAt: new Date()
        };
        
        // Mettre à jour les commandes de manière synchrone
        const updatedOrders = orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
        
        setOrders(updatedOrders);
        saveToLocalStorage('orders', updatedOrders);
      }
    }
    
    // Ajouter la facture
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    saveToLocalStorage('invoices', updatedInvoices);
    
    return newInvoice;
  };

  const updateInvoice = (invoice: Invoice) => {
    const updatedInvoice = { ...invoice, updatedAt: new Date() };
    const updatedInvoices = invoices.map((inv) => 
      inv.id === invoice.id ? updatedInvoice : inv
    );
    
    // Synchroniser avec la commande associée
    if (updatedInvoice.orderId) {
      const orderToUpdate = orders.find(order => order.id === updatedInvoice.orderId);
      if (orderToUpdate) {
        const shouldMarkAsPaid = updatedInvoice.status === 'paid';
        
        if (orderToUpdate.paid !== shouldMarkAsPaid) {
          const updatedOrder = {
            ...orderToUpdate,
            paid: shouldMarkAsPaid,
            updatedAt: new Date()
          };
          
          const updatedOrders = orders.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          );
          
          setOrders(updatedOrders);
          saveToLocalStorage('orders', updatedOrders);
        }
      }
    }
    
    setInvoices(updatedInvoices);
    saveToLocalStorage('invoices', updatedInvoices);
  };

  const deleteInvoice = (id: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    
    // Synchroniser avec la commande associée
    if (invoiceToDelete && invoiceToDelete.orderId) {
      const orderToUpdate = orders.find(order => order.id === invoiceToDelete.orderId);
      if (orderToUpdate) {
        // Vérifier s'il y a d'autres factures payées pour cette commande
        const otherPaidInvoices = invoices.filter(inv => 
          inv.id !== id && 
          inv.orderId === invoiceToDelete.orderId && 
          inv.status === 'paid'
        );
        
        // Ne marquer comme non payé que s'il n'y a pas d'autres factures payées
        const shouldMarkAsUnpaid = otherPaidInvoices.length === 0;
        
        if (shouldMarkAsUnpaid && orderToUpdate.paid) {
          const updatedOrder = {
            ...orderToUpdate,
            paid: false,
            updatedAt: new Date()
          };
          
          const updatedOrders = orders.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          );
          
          setOrders(updatedOrders);
          saveToLocalStorage('orders', updatedOrders);
        }
      }
    }
    
    // Supprimer la facture
    const updatedInvoices = invoices.filter((inv) => inv.id !== id);
    setInvoices(updatedInvoices);
    saveToLocalStorage('invoices', updatedInvoices);
    
    return true;
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

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    console.log('Adding new employee:', employee);
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
    };
    console.log('Created employee with ID:', newEmployee.id);
    const updatedEmployees = [...employees, newEmployee];
    console.log('Updated employees list:', updatedEmployees);
    setEmployees(updatedEmployees);
    saveToLocalStorage('employees', updatedEmployees);
    console.log('Employee added and saved to localStorage');
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    console.log('Updating employee:', updatedEmployee.id, 'with data:', updatedEmployee);
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? { ...updatedEmployee } : emp
    );
    console.log('Updated employees list:', updatedEmployees);
    setEmployees(updatedEmployees);
    saveToLocalStorage('employees', updatedEmployees);
    console.log('Employee updated and saved to localStorage');
  };

  const deleteEmployee = (id: string) => {
    console.log('Deleting employee with ID:', id);
    const updatedEmployees = employees.filter(emp => {
      console.log('Checking employee:', emp.id, 'against ID to delete:', id);
      return emp.id !== id;
    });
    console.log('Employees after deletion:', updatedEmployees);
    setEmployees(updatedEmployees);
    saveToLocalStorage('employees', updatedEmployees);
    console.log('Employee deleted and changes saved to localStorage');
  };

  // Fonction pour réinitialiser toutes les commandes comme non payées
  const resetAllOrdersPaymentStatus = () => {
    const updatedOrders = orders.map(order => ({
      ...order,
      paid: false,
      updatedAt: new Date()
    }));
    setOrders(updatedOrders);
    saveToLocalStorage('orders', updatedOrders);
    
    // Marquer toutes les factures comme brouillon au lieu de les supprimer
    const updatedInvoices = invoices.map(invoice => ({
      ...invoice,
      status: 'draft' as const,
      updatedAt: new Date()
    }));
    setInvoices(updatedInvoices);
    saveToLocalStorage('invoices', updatedInvoices);
    
    return true;
  };

  const value: AppContextType = {
    customers,
    orders,
    services,
    employees,
    inventoryItems,
    invoices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    setInvoices,
    generatePdf: handleGeneratePdf,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    activeView,
    setActiveView,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedOrderId,
    setSelectedOrderId,
    selectedInvoiceId,
    setSelectedInvoiceId,
    resetAllOrdersPaymentStatus,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};