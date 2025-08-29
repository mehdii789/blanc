import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { generatePdf } from '../utils/pdfGenerator';
import type { OrderStatus } from '../types';
import { 
  Customer, 
  Order, 
  Service, 
  Employee, 
  InventoryItem,
  Invoice,
  ClientAccess,
  ServicePack,
  ClientOrder
} from '../types';
import { 
  mockCustomers, 
  mockOrders, 
  mockServices, 
  mockEmployees, 
  mockInventoryItems,
  mockInvoices,
  mockClientAccess,
  mockServicePacks,
  mockClientOrders
} from '../data/mockData';
import {
  applyInventoryConsumption,
  restoreInventoryConsumption,
  checkInventoryAvailability,
  calculateTheoreticalInventory,
  getLowStockItems,
  getOutOfStockItems,
  INVENTORY_CONSUMING_STATUSES,
  NON_CONSUMING_STATUSES,
  checkClientOrderInventoryAvailability,
  applyClientOrderInventoryConsumption,
  serviceInventoryMappings
} from '../utils/inventorySync';

interface AppContextType {
  customers: Customer[];
  orders: Order[];
  services: Service[];
  employees: Employee[];
  inventoryItems: InventoryItem[];
  invoices: Invoice[];
  clientAccess: ClientAccess[];
  servicePacks: ServicePack[];
  clientOrders: ClientOrder[];
  
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
  checkInventoryForOrder: (order: Order) => { available: boolean; shortages: { itemName: string; required: number; available: number }[] };
  getTheoreticalInventory: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getOutOfStockItems: () => InventoryItem[];
  
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
  
  // Portail Client
  addClientAccess: (access: Omit<ClientAccess, 'id' | 'createdAt'>) => void;
  updateClientAccess: (access: ClientAccess) => void;
  deleteClientAccess: (id: string) => void;
  addServicePack: (pack: Omit<ServicePack, 'id'>) => void;
  updateServicePack: (pack: ServicePack) => void;
  deleteServicePack: (id: string) => void;
  addClientOrder: (order: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClientOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateClientOrder: (order: ClientOrder) => void;
  deleteClientOrder: (id: string) => void;
  checkClientOrderInventory: (order: ClientOrder) => { available: boolean; shortages: { itemName: string; required: number; available: number }[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Fonction pour convertir les chaînes de date en objets Date
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
  const [clientAccess, setClientAccess] = useState<ClientAccess[]>(
    loadFromLocalStorage<ClientAccess[]>('clientAccess', mockClientAccess)
  );
  const [servicePacks, setServicePacks] = useState<ServicePack[]>(
    loadFromLocalStorage<ServicePack[]>('servicePacks', mockServicePacks)
  );
  const [clientOrders, setClientOrders] = useState<ClientOrder[]>(
    loadFromLocalStorage<ClientOrder[]>('clientOrders', mockClientOrders)
  );
  
  // Sauvegarder les données dans le localStorage lorsqu'elles changent
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('clientAccess', JSON.stringify(clientAccess));
  }, [clientAccess]);
  
  useEffect(() => {
    localStorage.setItem('servicePacks', JSON.stringify(servicePacks));
  }, [servicePacks]);
  
  useEffect(() => {
    localStorage.setItem('clientOrders', JSON.stringify(clientOrders));
  }, [clientOrders]);
  
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
    // Créer un nouvel ID unique basé sur le timestamp
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Vérifier la disponibilité de l'inventaire si la commande consomme des ressources
    let updatedInventory = [...inventoryItems];
    if (INVENTORY_CONSUMING_STATUSES.includes(newOrder.status)) {
      const availability = checkInventoryAvailability(newOrder, updatedInventory);
      if (!availability.available) {
        console.warn('Inventaire insuffisant pour la commande:', availability.shortages);
        // Ici, vous pourriez vouloir lever une exception ou retourner une erreur
        // pour empêcher la création de la commande
        throw new Error('Stock insuffisant pour créer cette commande');
      }
      
      // Appliquer la consommation d'inventaire
      updatedInventory = applyInventoryConsumption(newOrder, updatedInventory);
    }

    // Mettre à jour l'état des commandes
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    
    // Sauvegarder les commandes mises à jour
    saveToLocalStorage('orders', updatedOrders);
    
    // Mettre à jour l'inventaire si nécessaire
    if (INVENTORY_CONSUMING_STATUSES.includes(newOrder.status)) {
      setInventoryItems(updatedInventory);
      saveToLocalStorage('inventory', updatedInventory);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    console.log(`Mise à jour du statut de la commande ${orderId} vers:`, status);
    
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate) {
      console.warn(`Commande non trouvée: ${orderId}`);
      return;
    }

    const oldStatus = orderToUpdate.status;
    const wasConsuming = INVENTORY_CONSUMING_STATUSES.includes(oldStatus);
    const willConsume = INVENTORY_CONSUMING_STATUSES.includes(status);

    console.log(`Ancien statut: ${oldStatus}, Nouveau statut: ${status}`);
    console.log(`Consommation avant/après: ${wasConsuming}/${willConsume}`);

    let updatedInventory = [...inventoryItems];
    let inventoryUpdated = false;

    // Gérer les changements d'inventaire selon le changement de statut
    if (!wasConsuming && willConsume) {
      // La commande commence à consommer l'inventaire
      console.log('Application de la consommation d\'inventaire');
      updatedInventory = applyInventoryConsumption(orderToUpdate, updatedInventory);
      inventoryUpdated = true;
    } else if (wasConsuming && !willConsume) {
      // La commande arrête de consommer l'inventaire (annulation)
      console.log('Restauration de l\'inventaire');
      updatedInventory = restoreInventoryConsumption(orderToUpdate, updatedInventory);
      inventoryUpdated = true;
    } else if (wasConsuming && willConsume) {
      // La commande change de statut mais continue de consommer - recalculer la consommation
      console.log('Recalcul de la consommation d\'inventaire');
      updatedInventory = restoreInventoryConsumption(orderToUpdate, updatedInventory);
      updatedInventory = applyInventoryConsumption(
        { ...orderToUpdate, status }, 
        updatedInventory
      );
      inventoryUpdated = true;
    }

    // Mettre à jour l'inventaire si nécessaire
    if (inventoryUpdated) {
      console.log('Mise à jour de l\'inventaire:', updatedInventory);
      setInventoryItems(updatedInventory);
      saveToLocalStorage('inventory', updatedInventory);
    }

    // Mettre à jour la commande
    const updatedOrder = { 
      ...orderToUpdate, 
      status, 
      updatedAt: new Date() 
    };
    
    const updatedOrders = orders.map(order => 
      order.id === orderId ? updatedOrder : order
    );
    
    console.log('Mise à jour de la commande:', updatedOrder);
    setOrders(updatedOrders);
    saveToLocalStorage('orders', updatedOrders);
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
    const orderToDelete = orders.find(order => order.id === id);
    
    // Restaurer l'inventaire si la commande consommait des ressources
    if (orderToDelete && INVENTORY_CONSUMING_STATUSES.includes(orderToDelete.status)) {
      const updatedInventory = restoreInventoryConsumption(orderToDelete, inventoryItems);
      setInventoryItems(updatedInventory);
      saveToLocalStorage('inventory', updatedInventory);
    }
    
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

  // Nouvelles fonctions pour la gestion de l'inventaire
  const checkInventoryForOrder = (order: Order) => {
    return checkInventoryAvailability(order, inventoryItems);
  };

  const getTheoreticalInventory = () => {
    return calculateTheoreticalInventory(inventoryItems, orders);
  };

  const getLowStockItemsList = () => {
    return getLowStockItems(inventoryItems);
  };

  const getOutOfStockItemsList = () => {
    return getOutOfStockItems(inventoryItems);
  };

  // Fonctions pour la gestion du portail client
  const addClientAccess = (access: Omit<ClientAccess, 'id' | 'createdAt'>) => {
    const newAccess: ClientAccess = {
      ...access,
      id: `access_${Date.now()}`,
      createdAt: new Date()
    };
    setClientAccess([...clientAccess, newAccess]);
  };

  const updateClientAccess = (updatedAccess: ClientAccess) => {
    setClientAccess(clientAccess.map(access => 
      access.id === updatedAccess.id ? updatedAccess : access
    ));
  };

  const deleteClientAccess = (id: string) => {
    setClientAccess(clientAccess.filter(access => access.id !== id));
  };

  const addServicePack = (pack: Omit<ServicePack, 'id'>) => {
    const newPack: ServicePack = {
      ...pack,
      id: `pack_${Date.now()}`
    };
    setServicePacks([...servicePacks, newPack]);
  };

  const updateServicePack = (updatedPack: ServicePack) => {
    setServicePacks(servicePacks.map(pack => 
      pack.id === updatedPack.id ? updatedPack : pack
    ));
  };

  const deleteServicePack = (id: string) => {
    setServicePacks(servicePacks.filter(pack => pack.id !== id));
  };

  const addClientOrder = (order: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: ClientOrder = {
      ...order,
      id: `client_order_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Vérifier la disponibilité de l'inventaire avant de créer la commande
    const availability = checkClientOrderInventoryAvailability(newOrder, servicePacks, inventoryItems);
    if (!availability.available) {
      throw new Error(`Stock insuffisant pour cette commande. Articles manquants: ${availability.shortages.map(s => `${s.itemName} (requis: ${s.required}, disponible: ${s.available})`).join(', ')}`);
    }
    
    // Appliquer la consommation d'inventaire si nécessaire
    let updatedInventory = [...inventoryItems];
    if (INVENTORY_CONSUMING_STATUSES.includes(newOrder.status)) {
      updatedInventory = applyClientOrderInventoryConsumption(newOrder, servicePacks, inventoryItems);
      setInventoryItems(updatedInventory);
      saveToLocalStorage('inventory', updatedInventory);
    }
    
    const updatedClientOrders = [...clientOrders, newOrder];
    setClientOrders(updatedClientOrders);
    saveToLocalStorage('clientOrders', updatedClientOrders);
    
    return newOrder;
  };

  const updateClientOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = clientOrders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    const updatedOrder = { ...order, status, updatedAt: new Date() };

    // Gérer la synchronisation de l'inventaire
    if (INVENTORY_CONSUMING_STATUSES.includes(oldStatus) && !INVENTORY_CONSUMING_STATUSES.includes(status)) {
      // Restaurer l'inventaire si on passe d'un statut consommateur à non-consommateur
      const restoredInventory = applyClientOrderInventoryConsumption(order, servicePacks, inventoryItems);
      setInventoryItems(restoredInventory.map(item => {
        const consumption = calculateClientOrderInventoryConsumption(order, servicePacks);
        const consumptionForItem = consumption.find(c => c.itemId === item.id);
        if (consumptionForItem) {
          return { ...item, quantity: item.quantity + consumptionForItem.quantity };
        }
        return item;
      }));
    } else if (!INVENTORY_CONSUMING_STATUSES.includes(oldStatus) && INVENTORY_CONSUMING_STATUSES.includes(status)) {
      // Consommer l'inventaire si on passe d'un statut non-consommateur à consommateur
      const updatedInventory = applyClientOrderInventoryConsumption(updatedOrder, servicePacks, inventoryItems);
      setInventoryItems(updatedInventory);
    }

    const updatedClientOrders = clientOrders.map(o => o.id === orderId ? updatedOrder : o);
    setClientOrders(updatedClientOrders);
    saveToLocalStorage('clientOrders', updatedClientOrders);
  };

  const updateClientOrder = (updatedOrder: ClientOrder) => {
    const updatedClientOrders = clientOrders.map(order => 
      order.id === updatedOrder.id ? { ...updatedOrder, updatedAt: new Date() } : order
    );
    setClientOrders(updatedClientOrders);
    saveToLocalStorage('clientOrders', updatedClientOrders);
  };

  const deleteClientOrder = (id: string): boolean => {
    try {
      const order = clientOrders.find(o => o.id === id);
      if (!order) return false;
      
      // Restaurer l'inventaire si la commande consommait des ressources
      if (INVENTORY_CONSUMING_STATUSES.includes(order.status)) {
        const restoredInventory = applyClientOrderInventoryConsumption(order, servicePacks, inventoryItems);
        setInventoryItems(restoredInventory.map(item => {
          const consumption = calculateClientOrderInventoryConsumption(order, servicePacks);
          const consumptionForItem = consumption.find(c => c.itemId === item.id);
          if (consumptionForItem) {
            return { ...item, quantity: item.quantity + consumptionForItem.quantity };
          }
          return item;
        }));
      }
      
      // Mettre à jour la liste des commandes
      const updatedClientOrders = clientOrders.filter(order => order.id !== id);
      setClientOrders(updatedClientOrders);
      
      // Récupérer les informations du client via le customerId de la commande
      const customer = customers.find(c => c.id === order.customerId);
      if (customer) {
        // Envoyer une notification au client (à implémenter selon votre système de notification)
        console.log(`Notification envoyée au client ${customer.name} (${customer.email}) : ` +
          `Votre commande #${id} a été supprimée. Veuillez nous contacter pour plus d'informations.`);
        
        // Optionnel : Ajouter une notification dans le système
        // addNotification({
        //   type: 'info',
        //   message: `Le client ${customer.name} a été notifié de la suppression de sa commande #${id}`,
        //   timestamp: new Date()
        // });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande client:', error);
      return false;
    }
  };

  const checkClientOrderInventory = (order: ClientOrder) => {
    return checkClientOrderInventoryAvailability(order, servicePacks, inventoryItems);
  };

  // Import nécessaire pour les fonctions d'inventaire client
  const calculateClientOrderInventoryConsumption = (order: ClientOrder, packs: ServicePack[]) => {
    const totalConsumption: { itemId: string; quantity: number }[] = [];
    
    order.packs.forEach(orderPack => {
      const pack = packs.find(p => p.id === orderPack.packId);
      if (pack) {
        pack.services.forEach(packService => {
          const mapping = serviceInventoryMappings.find(m => m.serviceId === packService.serviceId);
          if (mapping) {
            mapping.inventoryRequirements.forEach(req => {
              const existing = totalConsumption.find(c => c.itemId === req.itemId);
              const additionalQuantity = req.quantityPerUnit * packService.quantity * orderPack.quantity;
              
              if (existing) {
                existing.quantity += additionalQuantity;
              } else {
                totalConsumption.push({
                  itemId: req.itemId,
                  quantity: additionalQuantity
                });
              }
            });
          }
        });
      }
    });
    
    return totalConsumption;
  };

  const value: AppContextType = {
    customers,
    orders,
    services,
    employees,
    inventoryItems,
    invoices,
    clientAccess,
    servicePacks,
    clientOrders,
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
    checkInventoryForOrder,
    getTheoreticalInventory,
    getLowStockItems: getLowStockItemsList,
    getOutOfStockItems: getOutOfStockItemsList,
    addClientAccess,
    updateClientAccess,
    deleteClientAccess,
    addServicePack,
    updateServicePack,
    deleteServicePack,
    addClientOrder,
    updateClientOrderStatus,
    updateClientOrder,
    deleteClientOrder,
    checkClientOrderInventory,
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