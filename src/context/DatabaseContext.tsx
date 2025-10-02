import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockCustomers, mockOrders, mockServices, mockEmployees, mockInventoryItems, mockInvoices, mockClientAccess, mockServicePacks, mockClientOrders } from '../data/mockData';
import { Customer, Order, Service, Employee, InventoryItem, Invoice, ClientAccess, ServicePack, ClientOrder, OrderStatus } from '../types';
import { databaseService } from '../services/database';
import { 
  checkInventoryAvailability,
  calculateTheoreticalInventory,
  getLowStockItems,
  getOutOfStockItems,
  calculateInventoryConsumption,
  INVENTORY_CONSUMING_STATUSES
} from '../utils/inventorySync';

interface DatabaseContextType {
  // État de chargement
  loading: boolean;
  error: string | null;
  
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Date range for dashboard filtering
  dateRange: {
    start: Date;
    end: Date;
  };
  setDateRange: (range: { start: Date; end: Date }) => void;
  
  // Données
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
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Commandes
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Inventaire
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  checkInventoryForOrder: (order: Order) => { available: boolean; shortages: { itemName: string; required: number; available: number }[] };
  getTheoreticalInventory: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getOutOfStockItems: () => InventoryItem[];
  
  // Factures
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // Employés
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Portail Client
  addClientAccess: (access: Omit<ClientAccess, 'id' | 'createdAt'>) => Promise<void>;
  updateClientAccess: (access: ClientAccess) => Promise<void>;
  deleteClientAccess: (id: string) => Promise<void>;
  addServicePack: (pack: Omit<ServicePack, 'id'>) => Promise<void>;
  updateServicePack: (pack: ServicePack) => Promise<void>;
  deleteServicePack: (id: string) => Promise<void>;
  addClientOrder: (order: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClientOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateClientOrder: (order: ClientOrder) => Promise<void>;
  deleteClientOrder: (id: string) => Promise<void>;
  
  // Utilitaires
  refreshData: () => Promise<void>;
  resetToMockData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // Date range state for dashboard filtering
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date() // Today
  });
  
  // États des données
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services] = useState<Service[]>(mockServices);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientAccess, setClientAccess] = useState<ClientAccess[]>([]);
  const [servicePacks, setServicePacks] = useState<ServicePack[]>([]);
  const [clientOrders, setClientOrders] = useState<ClientOrder[]>([]);

  // Charger les données au démarrage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await databaseService.getAllData();
      
      setCustomers(data.customers);
      setOrders(data.orders);
      setEmployees(data.employees);
      setInventoryItems(data.inventoryItems);
      setInvoices(data.invoices);
      setClientAccess(data.clientAccess);
      setServicePacks(data.servicePacks);
      setClientOrders(data.clientOrders);
      
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    databaseService.clearCache();
    await loadAllData();
  };

  const resetToMockData = async () => {
    try {
      setLoading(true);
      await databaseService.resetToMockData();
      await loadAllData();
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
      console.error('Erreur de réinitialisation:', err);
    }
  };

  // Fonctions pour les clients
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    await databaseService.saveCustomers(updatedCustomers);
  };

  const updateCustomer = async (customer: Customer) => {
    const updatedCustomers = customers.map(c => c.id === customer.id ? customer : c);
    setCustomers(updatedCustomers);
    await databaseService.saveCustomers(updatedCustomers);
  };

  const deleteCustomer = async (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    await databaseService.saveCustomers(updatedCustomers);
  };

  // Fonctions pour les commandes
  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Consommer l'inventaire si le statut le nécessite
    if (INVENTORY_CONSUMING_STATUSES.includes(newOrder.status)) {
      const consumption = calculateInventoryConsumption(newOrder);
      
      if (consumption.length > 0) {
        console.log('🔥 Consommation d\'inventaire:', consumption.map(c => {
          const item = inventoryItems.find(i => i.id === c.itemId);
          return `${item?.name}: -${c.quantity} ${item?.unit}`;
        }).join(', '));
        
        // Mettre à jour l'inventaire
        const updatedInventory = inventoryItems.map(item => {
          const consumptionForItem = consumption.find(c => c.itemId === item.id);
          if (consumptionForItem) {
            const newQuantity = Math.max(0, item.quantity - consumptionForItem.quantity);
            return {
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        });
        
        setInventoryItems(updatedInventory);
        
        // Sauvegarder l'inventaire mis à jour
        for (const item of updatedInventory) {
          if (inventoryItems.find(i => i.id === item.id)?.quantity !== item.quantity) {
            await databaseService.updateInventoryItem(item);
          }
        }
      }
    }
    
    // Ajouter la commande
    const newOrderFromService = await databaseService.addOrder(orderData);
    setOrders([...orders, newOrderFromService]);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    );
    setOrders(updatedOrders);
    await databaseService.saveOrders(updatedOrders);
  };

  const updateOrder = async (order: Order) => {
    const updatedOrders = orders.map(o => o.id === order.id ? { ...order, updatedAt: new Date() } : o);
    setOrders(updatedOrders);
    await databaseService.saveOrders(updatedOrders);
  };

  const deleteOrder = async (id: string) => {
    const updatedOrders = orders.filter(o => o.id !== id);
    setOrders(updatedOrders);
    await databaseService.saveOrders(updatedOrders);
  };

  // Fonctions pour l'inventaire
  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem = await databaseService.addInventoryItem(itemData);
    setInventoryItems([...inventoryItems, newItem]);
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    const updatedItem = await databaseService.updateInventoryItem(item);
    setInventoryItems(inventoryItems.map(i => i.id === item.id ? updatedItem : i));
  };

  const deleteInventoryItem = async (id: string) => {
    await databaseService.deleteInventoryItem(id);
    setInventoryItems(inventoryItems.filter(i => i.id !== id));
  };

  // Fonctions pour les factures
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    await databaseService.saveInvoices(updatedInvoices);
  };

  const updateInvoice = async (invoice: Invoice) => {
    const updatedInvoices = invoices.map(i => i.id === invoice.id ? { ...invoice, updatedAt: new Date() } : i);
    setInvoices(updatedInvoices);
    await databaseService.saveInvoices(updatedInvoices);
  };

  const deleteInvoice = async (id: string) => {
    const updatedInvoices = invoices.filter(i => i.id !== id);
    setInvoices(updatedInvoices);
    await databaseService.saveInvoices(updatedInvoices);
  };

  // Fonctions pour les employés
  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString()
    };
    
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    await databaseService.saveEmployees(updatedEmployees);
  };

  const updateEmployee = async (employee: Employee) => {
    const updatedEmployees = employees.map(e => e.id === employee.id ? employee : e);
    setEmployees(updatedEmployees);
    await databaseService.saveEmployees(updatedEmployees);
  };

  const deleteEmployee = async (id: string) => {
    const updatedEmployees = employees.filter(e => e.id !== id);
    setEmployees(updatedEmployees);
    await databaseService.saveEmployees(updatedEmployees);
  };

  // Fonctions pour le portail client
  const addClientAccess = async (accessData: Omit<ClientAccess, 'id' | 'createdAt'>) => {
    const newAccess: ClientAccess = {
      ...accessData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedAccess = [...clientAccess, newAccess];
    setClientAccess(updatedAccess);
    await databaseService.saveClientAccess(updatedAccess);
  };

  const updateClientAccess = async (access: ClientAccess) => {
    const updatedAccess = clientAccess.map(a => a.id === access.id ? access : a);
    setClientAccess(updatedAccess);
    await databaseService.saveClientAccess(updatedAccess);
  };

  const deleteClientAccess = async (id: string) => {
    const updatedAccess = clientAccess.filter(a => a.id !== id);
    setClientAccess(updatedAccess);
    await databaseService.saveClientAccess(updatedAccess);
  };

  const addServicePack = async (packData: Omit<ServicePack, 'id'>) => {
    const newPack: ServicePack = {
      ...packData,
      id: Date.now().toString()
    };
    
    const updatedPacks = [...servicePacks, newPack];
    setServicePacks(updatedPacks);
    await databaseService.saveServicePacks(updatedPacks);
  };

  const updateServicePack = async (pack: ServicePack) => {
    const updatedPacks = servicePacks.map(p => p.id === pack.id ? pack : p);
    setServicePacks(updatedPacks);
    await databaseService.saveServicePacks(updatedPacks);
  };

  const deleteServicePack = async (id: string) => {
    const updatedPacks = servicePacks.filter(p => p.id !== id);
    setServicePacks(updatedPacks);
    await databaseService.saveServicePacks(updatedPacks);
  };

  const addClientOrder = async (orderData: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: ClientOrder = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedOrders = [...clientOrders, newOrder];
    setClientOrders(updatedOrders);
    await databaseService.saveClientOrders(updatedOrders);
  };

  const updateClientOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrders = clientOrders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    );
    setClientOrders(updatedOrders);
    await databaseService.saveClientOrders(updatedOrders);
  };

  const updateClientOrder = async (order: ClientOrder) => {
    const updatedOrders = clientOrders.map(o => o.id === order.id ? { ...order, updatedAt: new Date() } : o);
    setClientOrders(updatedOrders);
    await databaseService.saveClientOrders(updatedOrders);
  };

  const deleteClientOrder = async (id: string) => {
    const updatedOrders = clientOrders.filter(o => o.id !== id);
    setClientOrders(updatedOrders);
    await databaseService.saveClientOrders(updatedOrders);
  };

  // Fonctions utilitaires pour l'inventaire
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

  const value: DatabaseContextType = {
    loading,
    error,
    activeView,
    setActiveView,
    dateRange,
    setDateRange,
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
    checkInventoryForOrder,
    getTheoreticalInventory,
    getLowStockItems: getLowStockItemsList,
    getOutOfStockItems: getOutOfStockItemsList,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addEmployee,
    updateEmployee,
    deleteEmployee,
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
    refreshData,
    resetToMockData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
