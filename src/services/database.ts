// Service de base de données avec Supabase
import { Customer, Order, Service, Employee, InventoryItem, Invoice, ClientAccess, ServicePack, ClientOrder } from '../types';
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

import { getDatabaseConfig } from '../config/database';
import { supabaseService } from './supabaseService';

// Configuration de l'API de base de données
const config = getDatabaseConfig();

interface DatabaseData {
  customers: Customer[];
  orders: Order[];
  services: Service[];
  employees: Employee[];
  inventoryItems: InventoryItem[];
  invoices: Invoice[];
  clientAccess: ClientAccess[];
  servicePacks: ServicePack[];
  clientOrders: ClientOrder[];
  lastUpdated: string;
}

class DatabaseService {
  private cache: DatabaseData | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = config.CACHE_DURATION;
  private useSupabase = config.USE_SUPABASE;

  // Initialiser la base de données avec les données mockées
  async initializeDatabase(): Promise<void> {
    if (this.useSupabase) {
      try {
        // Initialiser Supabase avec les données mockées si les tables sont vides
        await supabaseService.initializeWithMockData();
        console.log('Base de données Supabase initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation Supabase:', error);
        // Fallback vers localStorage
        this.useSupabase = false;
      }
    }

    // Si pas de Supabase ou fallback, initialiser localStorage
    if (!this.useSupabase) {
      const existingData = localStorage.getItem('databaseData');
      if (!existingData) {
        const initialData: DatabaseData = {
          customers: mockCustomers,
          orders: mockOrders,
          services: mockServices,
          employees: mockEmployees,
          inventoryItems: mockInventoryItems,
          invoices: mockInvoices,
          clientAccess: mockClientAccess,
          servicePacks: mockServicePacks,
          clientOrders: mockClientOrders,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('databaseData', JSON.stringify(initialData));
        console.log('Base de données localStorage initialisée avec les données mockées');
      }
    }
  }

  // Obtenir les données depuis le cache ou la source
  async getAllData(): Promise<DatabaseData> {
    // Vérifier le cache
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    let data: DatabaseData;

    if (this.useSupabase) {
      try {
        // Récupérer depuis Supabase
        data = await supabaseService.getAllData();
      } catch (error) {
        console.error('Erreur Supabase, fallback vers localStorage:', error);
        data = this.getLocalData();
        this.useSupabase = false;
      }
    } else {
      // Récupérer depuis localStorage
      data = this.getLocalData();
    }

    // Mettre en cache
    this.cache = data;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;

    return data;
  }

  // Récupérer les données depuis localStorage
  private getLocalData(): DatabaseData {
    const stored = localStorage.getItem('databaseData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Erreur parsing localStorage:', error);
      }
    }

    // Données par défaut si rien en localStorage
    return {
      customers: mockCustomers,
      orders: mockOrders,
      services: mockServices,
      employees: mockEmployees,
      inventoryItems: mockInventoryItems,
      invoices: mockInvoices,
      clientAccess: mockClientAccess,
      servicePacks: mockServicePacks,
      clientOrders: mockClientOrders,
      lastUpdated: new Date().toISOString()
    };
  }

  // Sauvegarder toutes les données
  async saveAllData(data: DatabaseData): Promise<void> {
    if (this.useSupabase) {
      try {
        // Sauvegarder dans Supabase (implémentation simplifiée)
        console.log('Sauvegarde Supabase non implémentée pour saveAllData');
        // Pour l'instant, on sauvegarde aussi en local
        localStorage.setItem('databaseData', JSON.stringify(data));
      } catch (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        // Fallback localStorage
        localStorage.setItem('databaseData', JSON.stringify(data));
      }
    } else {
      // Sauvegarder en localStorage
      localStorage.setItem('databaseData', JSON.stringify(data));
    }

    // Mettre à jour le cache
    data.lastUpdated = new Date().toISOString();
    this.cache = data;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  // Méthodes pour les clients
  async addCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const data = this.getLocalData();
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    data.customers.push(newCustomer);
    await this.saveAllData(data);
    return newCustomer;
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    const data = this.getLocalData();
    const index = data.customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      data.customers[index] = customer;
      await this.saveAllData(data);
    }
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    const data = this.getLocalData();
    data.customers = data.customers.filter(c => c.id !== id);
    await this.saveAllData(data);
  }

  // Méthodes pour les commandes
  async addOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const data = this.getLocalData();
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.orders.push(newOrder);
    await this.saveAllData(data);
    return newOrder;
  }

  async updateOrder(order: Order): Promise<Order> {
    const data = this.getLocalData();
    const index = data.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      data.orders[index] = { ...order, updatedAt: new Date() };
      await this.saveAllData(data);
    }
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    const data = this.getLocalData();
    data.orders = data.orders.filter(o => o.id !== id);
    await this.saveAllData(data);
  }

  // Méthodes pour les services
  async addService(service: Omit<Service, 'id'>): Promise<Service> {
    const data = this.getLocalData();
    const newService: Service = { ...service, id: Date.now().toString() };
    data.services.push(newService);
    await this.saveAllData(data);
    return newService;
  }

  // Méthodes pour les employés
  async addEmployee(employeeData: Omit<Employee, 'id'>): Promise<Employee> {
    const data = this.getLocalData();
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString()
    };
    data.employees.push(newEmployee);
    await this.saveAllData(data);
    return newEmployee;
  }

  // Méthodes pour l'inventaire
  async addInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const data = this.getLocalData();
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString()
    };
    data.inventoryItems.push(newItem);
    await this.saveAllData(data);
    return newItem;
  }

  async updateInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    const data = this.getLocalData();
    const index = data.inventoryItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      data.inventoryItems[index] = { ...item };
      await this.saveAllData(data);
    }
    return item;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const data = this.getLocalData();
    data.inventoryItems = data.inventoryItems.filter(i => i.id !== id);
    await this.saveAllData(data);
  }

  // Méthodes pour les factures
  async addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const data = this.getLocalData();
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.invoices.push(newInvoice);
    await this.saveAllData(data);
    return newInvoice;
  }

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = this.getLocalData();
    const index = data.invoices.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      data.invoices[index] = { ...invoice, updatedAt: new Date() };
      await this.saveAllData(data);
    }
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    const data = this.getLocalData();
    data.invoices = data.invoices.filter(i => i.id !== id);
    await this.saveAllData(data);
  }

  // Méthodes pour les accès clients
  async addClientAccess(accessData: Omit<ClientAccess, 'id'>): Promise<ClientAccess> {
    const data = this.getLocalData();
    const newAccess: ClientAccess = {
      ...accessData,
      id: Date.now().toString()
    };
    data.clientAccess.push(newAccess);
    await this.saveAllData(data);
    return newAccess;
  }

  async updateClientAccess(access: ClientAccess): Promise<ClientAccess> {
    const data = this.getLocalData();
    const index = data.clientAccess.findIndex(a => a.id === access.id);
    if (index !== -1) {
      data.clientAccess[index] = { ...access };
      await this.saveAllData(data);
    }
    return access;
  }

  async deleteClientAccess(id: string): Promise<void> {
    const data = this.getLocalData();
    data.clientAccess = data.clientAccess.filter(a => a.id !== id);
    await this.saveAllData(data);
  }

  // Méthodes pour les commandes clients
  async addClientOrder(orderData: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientOrder> {
    const data = this.getLocalData();
    const newOrder: ClientOrder = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.clientOrders.push(newOrder);
    await this.saveAllData(data);
    return newOrder;
  }

  // Méthodes de sauvegarde par entité (pour compatibilité avec DatabaseContext)
  async saveCustomers(customers: Customer[]): Promise<void> {
    const data = this.getLocalData();
    data.customers = customers;
    await this.saveAllData(data);
  }

  async saveOrders(orders: Order[]): Promise<void> {
    const data = this.getLocalData();
    data.orders = orders;
    await this.saveAllData(data);
  }

  async saveEmployees(employees: Employee[]): Promise<void> {
    const data = this.getLocalData();
    data.employees = employees;
    await this.saveAllData(data);
  }

  async saveInventoryItems(inventoryItems: InventoryItem[]): Promise<void> {
    const data = this.getLocalData();
    data.inventoryItems = inventoryItems;
    await this.saveAllData(data);
  }

  async saveInvoices(invoices: Invoice[]): Promise<void> {
    const data = this.getLocalData();
    data.invoices = invoices;
    await this.saveAllData(data);
  }

  async saveClientAccess(clientAccess: ClientAccess[]): Promise<void> {
    const data = this.getLocalData();
    data.clientAccess = clientAccess;
    await this.saveAllData(data);
  }

  async saveServicePacks(servicePacks: ServicePack[]): Promise<void> {
    const data = this.getLocalData();
    data.servicePacks = servicePacks;
    await this.saveAllData(data);
  }

  async saveClientOrders(clientOrders: ClientOrder[]): Promise<void> {
    const data = this.getLocalData();
    data.clientOrders = clientOrders;
    await this.saveAllData(data);
  }

  // Méthodes utilitaires
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  async resetToMockData(): Promise<void> {
    const mockData: DatabaseData = {
      customers: mockCustomers,
      orders: mockOrders,
      services: mockServices,
      employees: mockEmployees,
      inventoryItems: mockInventoryItems,
      invoices: mockInvoices,
      clientAccess: mockClientAccess,
      servicePacks: mockServicePacks,
      clientOrders: mockClientOrders,
      lastUpdated: new Date().toISOString()
    };
    await this.saveAllData(mockData);
  }
}

// Instance singleton du service de base de données
export const databaseService = new DatabaseService();
