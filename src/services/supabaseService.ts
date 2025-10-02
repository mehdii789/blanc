// Service de base de données Supabase
import { supabase, monitor } from '../config/supabase';
import { 
  Customer, 
  Order, 
  Service, 
  Employee, 
  InventoryItem, 
  Invoice, 
  ClientAccess, 
  ServicePack, 
  ClientOrder,
  OrderService,
  OrderItem,
  InvoiceItem,
  PackService,
  OrderPack
} from '../types';

// Utilitaire pour mesurer le temps de réponse
const measureTime = async <T>(operation: () => Promise<T>): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const responseTime = Date.now() - startTime;
    monitor.recordQuery(true, responseTime);
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordQuery(false, responseTime, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Utilitaire pour convertir les dates
const convertDates = (obj: any): any => {
  if (!obj) return obj;
  
  const converted = { ...obj };
  
  // Convertir les champs de date courants
  const dateFields = ['created_at', 'updated_at', 'due_date', 'issue_date', 'pickup_date', 'delivery_date', 'last_login'];
  
  dateFields.forEach(field => {
    if (converted[field]) {
      converted[field] = new Date(converted[field]);
    }
  });
  
  // Mapper les champs snake_case vers camelCase
  if (converted.created_at) converted.createdAt = converted.created_at;
  if (converted.updated_at) converted.updatedAt = converted.updated_at;
  if (converted.due_date) converted.dueDate = converted.due_date;
  if (converted.issue_date) converted.issueDate = converted.issue_date;
  if (converted.pickup_date) converted.pickupDate = converted.pickup_date;
  if (converted.delivery_date) converted.deliveryDate = converted.delivery_date;
  if (converted.last_login) converted.lastLogin = converted.last_login;
  if (converted.postal_code) converted.postalCode = converted.postal_code;
  if (converted.estimated_time) converted.estimatedTime = converted.estimated_time;
  if (converted.reorder_level) converted.reorderLevel = converted.reorder_level;
  if (converted.total_amount) converted.totalAmount = converted.total_amount;
  if (converted.payment_method) converted.paymentMethod = converted.payment_method;
  if (converted.customer_id) converted.customerId = converted.customer_id;
  if (converted.order_id) converted.orderId = converted.order_id;
  if (converted.invoice_number) converted.invoiceNumber = converted.invoice_number;
  if (converted.access_code) converted.accessCode = converted.access_code;
  if (converted.is_active) converted.isActive = converted.is_active;
  if (converted.total_price) converted.totalPrice = converted.total_price;
  if (converted.client_access_id) converted.clientAccessId = converted.client_access_id;
  
  return converted;
};

// Utilitaire pour convertir vers snake_case pour Supabase
const toSnakeCase = (obj: any): any => {
  if (!obj) return obj;
  
  const converted = { ...obj };
  
  // Mapper camelCase vers snake_case
  if (converted.createdAt) converted.created_at = converted.createdAt;
  if (converted.updatedAt) converted.updated_at = converted.updatedAt;
  if (converted.dueDate) converted.due_date = converted.dueDate;
  if (converted.issueDate) converted.issue_date = converted.issueDate;
  if (converted.pickupDate) converted.pickup_date = converted.pickupDate;
  if (converted.deliveryDate) converted.delivery_date = converted.deliveryDate;
  if (converted.lastLogin) converted.last_login = converted.lastLogin;
  if (converted.postalCode) converted.postal_code = converted.postalCode;
  if (converted.estimatedTime) converted.estimated_time = converted.estimatedTime;
  if (converted.reorderLevel) converted.reorder_level = converted.reorderLevel;
  if (converted.totalAmount) converted.total_amount = converted.totalAmount;
  if (converted.paymentMethod) converted.payment_method = converted.paymentMethod;
  if (converted.customerId) converted.customer_id = converted.customerId;
  if (converted.orderId) converted.order_id = converted.orderId;
  if (converted.invoiceNumber) converted.invoice_number = converted.invoiceNumber;
  if (converted.accessCode) converted.access_code = converted.accessCode;
  if (converted.isActive) converted.is_active = converted.isActive;
  if (converted.totalPrice) converted.total_price = converted.totalPrice;
  if (converted.clientAccessId) converted.client_access_id = converted.clientAccessId;
  
  return converted;
};

export class SupabaseService {
  // CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data?.map(convertDates) || [];
    });
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('customers')
        .insert([toSnakeCase(customer)])
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('customers')
        .update(toSnakeCase(customer))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // ORDERS
  async getOrders(): Promise<Order[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_services (
            id,
            service_id,
            quantity,
            unit_price,
            total_price,
            services (name, description)
          ),
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(order => {
        const converted = convertDates(order);
        
        // Convertir les services de commande
        converted.services = order.order_services?.map((os: any) => ({
          id: os.service_id,
          name: os.services?.name || '',
          description: os.services?.description || '',
          price: os.unit_price,
          quantity: os.quantity,
          estimatedTime: 0
        })) || [];
        
        // Convertir les items de commande
        converted.items = order.order_items?.map((item: any) => convertDates(item)) || [];
        
        return converted;
      }) || [];
    });
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return measureTime(async () => {
      // Créer la commande principale
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([toSnakeCase({
          ...order,
          services: undefined,
          items: undefined
        })])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Ajouter les services
      if (order.services && order.services.length > 0) {
        const orderServices = order.services.map(service => ({
          order_id: orderData.id,
          service_id: service.id,
          quantity: service.quantity,
          unit_price: service.price,
          total_price: service.price * service.quantity
        }));
        
        const { error: servicesError } = await supabase
          .from('order_services')
          .insert(orderServices);
        
        if (servicesError) throw servicesError;
      }
      
      // Ajouter les items
      if (order.items && order.items.length > 0) {
        const orderItems = order.items.map(item => ({
          order_id: orderData.id,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }
      
      // Récupérer la commande complète
      return this.getOrderById(orderData.id);
    });
  }

  async getOrderById(id: string): Promise<Order> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_services (
            id,
            service_id,
            quantity,
            unit_price,
            total_price,
            services (name, description, estimated_time)
          ),
          order_items (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const converted = convertDates(data);
      
      // Convertir les services de commande
      converted.services = data.order_services?.map((os: any) => ({
        id: os.service_id,
        name: os.services?.name || '',
        description: os.services?.description || '',
        price: os.unit_price,
        quantity: os.quantity,
        estimatedTime: os.services?.estimated_time || 0
      })) || [];
      
      // Convertir les items de commande
      converted.items = data.order_items?.map((item: any) => convertDates(item)) || [];
      
      return converted;
    });
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('orders')
        .update(toSnakeCase({
          ...order,
          services: undefined,
          items: undefined
        }))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return this.getOrderById(id);
    });
  }

  async deleteOrder(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // SERVICES
  async getServices(): Promise<Service[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data?.map(convertDates) || [];
    });
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('services')
        .insert([toSnakeCase(service)])
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async updateService(id: string, service: Partial<Service>): Promise<Service> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('services')
        .update(toSnakeCase(service))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async deleteService(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // EMPLOYEES
  async getEmployees(): Promise<Employee[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data?.map(convertDates) || [];
    });
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // INVENTORY
  async getInventoryItems(): Promise<InventoryItem[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data?.map(convertDates) || [];
    });
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([toSnakeCase(item)])
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(toSnakeCase(item))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // INVOICES
  async getInvoices(): Promise<Invoice[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(invoice => {
        const converted = convertDates(invoice);
        converted.items = invoice.invoice_items?.map((item: any) => convertDates(item)) || [];
        return converted;
      }) || [];
    });
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return measureTime(async () => {
      // Créer la facture principale
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([toSnakeCase({
          ...invoice,
          items: undefined
        })])
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Ajouter les items
      if (invoice.items && invoice.items.length > 0) {
        const invoiceItems = invoice.items.map(item => ({
          invoice_id: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (itemsError) throw itemsError;
      }
      
      return this.getInvoiceById(invoiceData.id);
    });
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const converted = convertDates(data);
      converted.items = data.invoice_items?.map((item: any) => convertDates(item)) || [];
      
      return converted;
    });
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('invoices')
        .update(toSnakeCase({
          ...invoice,
          items: undefined
        }))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return this.getInvoiceById(id);
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // CLIENT ACCESS
  async getClientAccess(): Promise<ClientAccess[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data?.map(convertDates) || [];
    });
  }

  async createClientAccess(access: Omit<ClientAccess, 'id' | 'createdAt'>): Promise<ClientAccess> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_access')
        .insert([toSnakeCase(access)])
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async updateClientAccess(id: string, access: Partial<ClientAccess>): Promise<ClientAccess> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_access')
        .update(toSnakeCase(access))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return convertDates(data);
    });
  }

  async deleteClientAccess(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('client_access')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // SERVICE PACKS
  async getServicePacks(): Promise<ServicePack[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('service_packs')
        .select(`
          *,
          pack_services (
            id,
            service_id,
            service_name,
            quantity,
            unit_price
          )
        `)
        .order('name');
      
      if (error) throw error;
      
      return data?.map(pack => {
        const converted = convertDates(pack);
        converted.services = pack.pack_services?.map((ps: any) => ({
          serviceId: ps.service_id,
          serviceName: ps.service_name,
          quantity: ps.quantity,
          unitPrice: ps.unit_price
        })) || [];
        return converted;
      }) || [];
    });
  }

  async createServicePack(pack: Omit<ServicePack, 'id'>): Promise<ServicePack> {
    return measureTime(async () => {
      // Créer le pack principal
      const { data: packData, error: packError } = await supabase
        .from('service_packs')
        .insert([toSnakeCase({
          ...pack,
          services: undefined
        })])
        .select()
        .single();
      
      if (packError) throw packError;
      
      // Ajouter les services
      if (pack.services && pack.services.length > 0) {
        const packServices = pack.services.map(service => ({
          pack_id: packData.id,
          service_id: service.serviceId,
          service_name: service.serviceName,
          quantity: service.quantity,
          unit_price: service.unitPrice
        }));
        
        const { error: servicesError } = await supabase
          .from('pack_services')
          .insert(packServices);
        
        if (servicesError) throw servicesError;
      }
      
      return this.getServicePackById(packData.id);
    });
  }

  async getServicePackById(id: string): Promise<ServicePack> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('service_packs')
        .select(`
          *,
          pack_services (
            id,
            service_id,
            service_name,
            quantity,
            unit_price
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const converted = convertDates(data);
      converted.services = data.pack_services?.map((ps: any) => ({
        serviceId: ps.service_id,
        serviceName: ps.service_name,
        quantity: ps.quantity,
        unitPrice: ps.unit_price
      })) || [];
      
      return converted;
    });
  }

  async updateServicePack(id: string, pack: Partial<ServicePack>): Promise<ServicePack> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('service_packs')
        .update(toSnakeCase({
          ...pack,
          services: undefined
        }))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return this.getServicePackById(id);
    });
  }

  async deleteServicePack(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('service_packs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // CLIENT ORDERS
  async getClientOrders(): Promise<ClientOrder[]> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_orders')
        .select(`
          *,
          client_order_packs (
            id,
            pack_id,
            pack_name,
            quantity,
            unit_price,
            total
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(order => {
        const converted = convertDates(order);
        converted.packs = order.client_order_packs?.map((cop: any) => ({
          packId: cop.pack_id,
          packName: cop.pack_name,
          quantity: cop.quantity,
          unitPrice: cop.unit_price,
          total: cop.total
        })) || [];
        return converted;
      }) || [];
    });
  }

  async createClientOrder(order: Omit<ClientOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientOrder> {
    return measureTime(async () => {
      // Créer la commande principale
      const { data: orderData, error: orderError } = await supabase
        .from('client_orders')
        .insert([toSnakeCase({
          ...order,
          packs: undefined
        })])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Ajouter les packs
      if (order.packs && order.packs.length > 0) {
        const orderPacks = order.packs.map(pack => ({
          client_order_id: orderData.id,
          pack_id: pack.packId,
          pack_name: pack.packName,
          quantity: pack.quantity,
          unit_price: pack.unitPrice,
          total: pack.total
        }));
        
        const { error: packsError } = await supabase
          .from('client_order_packs')
          .insert(orderPacks);
        
        if (packsError) throw packsError;
      }
      
      return this.getClientOrderById(orderData.id);
    });
  }

  async getClientOrderById(id: string): Promise<ClientOrder> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_orders')
        .select(`
          *,
          client_order_packs (
            id,
            pack_id,
            pack_name,
            quantity,
            unit_price,
            total
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const converted = convertDates(data);
      converted.packs = data.client_order_packs?.map((cop: any) => ({
        packId: cop.pack_id,
        packName: cop.pack_name,
        quantity: cop.quantity,
        unitPrice: cop.unit_price,
        total: cop.total
      })) || [];
      
      return converted;
    });
  }

  async updateClientOrder(id: string, order: Partial<ClientOrder>): Promise<ClientOrder> {
    return measureTime(async () => {
      const { data, error } = await supabase
        .from('client_orders')
        .update(toSnakeCase({
          ...order,
          packs: undefined
        }))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return this.getClientOrderById(id);
    });
  }

  async deleteClientOrder(id: string): Promise<void> {
    return measureTime(async () => {
      const { error } = await supabase
        .from('client_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }

  // MÉTHODES UTILITAIRES
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('count')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<any> {
    return measureTime(async () => {
      const [customers, orders, invoices, inventory] = await Promise.all([
        this.getCustomers(),
        this.getOrders(),
        this.getInvoices(),
        this.getInventoryItems()
      ]);

      return {
        totalCustomers: customers.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'en_attente').length,
        completedOrders: orders.filter(o => o.status === 'livre').length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(i => i.status === 'paid').length,
        lowStockItems: inventory.filter(i => i.quantity <= i.reorderLevel).length,
        totalRevenue: invoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + i.total, 0)
      };
    });
  }

  // Initialiser la base de données avec les données mockées
  async initializeWithMockData(): Promise<void> {
    return measureTime(async () => {
      try {
        // Vérifier si les tables ont déjà des données
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('id')
          .limit(1);

        if (existingCustomers && existingCustomers.length > 0) {
          console.log('Base de données déjà initialisée');
          return;
        }

        console.log('Initialisation de la base de données avec les données mockées...');
        
        // Pour l'instant, on ne fait que vérifier la connexion
        // L'insertion des données mockées sera implémentée plus tard
        console.log('Connexion Supabase vérifiée avec succès');
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        throw error;
      }
    });
  }
}

// Instance singleton du service Supabase
export const supabaseService = new SupabaseService();
