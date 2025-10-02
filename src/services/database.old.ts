// Service de base de données centralisée avec Supabase
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

    try {
      const response = await fetch(`${DB_BASE_URL}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(initialData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation de la base de données');
      }

      this.cache = initialData;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    } catch (error) {
      console.error('Erreur d\'initialisation de la DB:', error);
      // Fallback vers les données mockées locales
      this.cache = initialData;
    }
  }

  // Récupérer toutes les données
  async getAllData(): Promise<DatabaseData> {
    // Vérifier le cache
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const response = await fetch(`${DB_BASE_URL}/${BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const result = await response.json();
      const data = result.record as DatabaseData;
      
      // Mettre à jour le cache
      this.cache = data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return data;
    } catch (error) {
      console.error('Erreur de récupération des données:', error);
      
      // Fallback vers les données mockées ou le cache existant
      if (this.cache) {
        return this.cache;
      }
      
      // Dernière option : données mockées par défaut
      const fallbackData: DatabaseData = {
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
      
      return fallbackData;
    }
  }

  // Sauvegarder toutes les données
  async saveAllData(data: Partial<DatabaseData>): Promise<void> {
    try {
      const currentData = await this.getAllData();
      const updatedData: DatabaseData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch(`${DB_BASE_URL}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde des données');
      }

      // Mettre à jour le cache
      this.cache = updatedData;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      throw error;
    }
  }

  // Méthodes spécifiques pour chaque type de données
  async getCustomers(): Promise<Customer[]> {
    const data = await this.getAllData();
    return data.customers;
  }

  async saveCustomers(customers: Customer[]): Promise<void> {
    await this.saveAllData({ customers });
  }

  async getOrders(): Promise<Order[]> {
    const data = await this.getAllData();
    return data.orders;
  }

  async saveOrders(orders: Order[]): Promise<void> {
    await this.saveAllData({ orders });
  }

  async getEmployees(): Promise<Employee[]> {
    const data = await this.getAllData();
    return data.employees;
  }

  async saveEmployees(employees: Employee[]): Promise<void> {
    await this.saveAllData({ employees });
  }

  async getServices(): Promise<Service[]> {
    const data = await this.getAllData();
    return data.services;
  }

  async saveServices(services: Service[]): Promise<void> {
    await this.saveAllData({ services });
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const data = await this.getAllData();
    return data.inventoryItems;
  }

  async saveInventoryItems(inventoryItems: InventoryItem[]): Promise<void> {
    await this.saveAllData({ inventoryItems });
  }

  async getInvoices(): Promise<Invoice[]> {
    const data = await this.getAllData();
    return data.invoices;
  }

  async saveInvoices(invoices: Invoice[]): Promise<void> {
    await this.saveAllData({ invoices });
  }

  async getClientAccess(): Promise<ClientAccess[]> {
    const data = await this.getAllData();
    return data.clientAccess;
  }

  async saveClientAccess(clientAccess: ClientAccess[]): Promise<void> {
    await this.saveAllData({ clientAccess });
  }

  async getServicePacks(): Promise<ServicePack[]> {
    const data = await this.getAllData();
    return data.servicePacks;
  }

  async saveServicePacks(servicePacks: ServicePack[]): Promise<void> {
    await this.saveAllData({ servicePacks });
  }

  async getClientOrders(): Promise<ClientOrder[]> {
    const data = await this.getAllData();
    return data.clientOrders;
  }

  async saveClientOrders(clientOrders: ClientOrder[]): Promise<void> {
    await this.saveAllData({ clientOrders });
  }

  // Réinitialiser la base de données aux données mockées
  async resetToMockData(): Promise<void> {
    await this.initializeDatabase();
  }

  // Vider le cache pour forcer une nouvelle récupération
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

// Instance singleton du service de base de données
export const databaseService = new DatabaseService();
