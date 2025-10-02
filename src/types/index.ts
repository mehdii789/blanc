export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check';

export interface OrderService extends Service {
  quantity: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  services: OrderService[];
  items?: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  estimatedTime: number; // en heures
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  email: string;
  phone: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export type OrderStatus = 
  | 'en_attente' 
  | 'en_traitement' 
  | 'lavage' 
  | 'sechage' 
  | 'pliage' 
  | 'pret' 
  | 'livre' 
  | 'annule';

export type EmployeeRole = 
  | 'gerant' 
  | 'operateur' 
  | 'comptoir' 
  | 'livreur';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  pendingOrders: number;
  readyForPickup: number;
  completedToday: number;
  dailyRevenue: number;
  lowInventoryItems: number;
}

// Types pour le portail client
export interface ClientAccess {
  id: string;
  customerId: string;
  accessCode: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface ServicePack {
  id: string;
  name: string;
  description: string;
  services: PackService[];
  inventoryItems?: PackInventoryItem[];
  totalPrice: number;
  estimatedTime: number;
  isActive: boolean;
  category: PackCategory;
}

export interface PackService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface PackInventoryItem {
  itemId: string;
  itemName: string;
  quantityPerPack: number;
  unit: string;
}

export type PackCategory = 'standard' | 'express' | 'premium' | 'literie' | 'professionnel';

export interface ClientOrder {
  id: string;
  clientAccessId: string;
  customerId: string;
  packs: OrderPack[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderPack {
  packId: string;
  packName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}