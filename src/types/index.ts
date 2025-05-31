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

export interface Order {
  id: string;
  customerId: string;
  services: Service[];
  status: OrderStatus;
  totalAmount: number;
  paid: boolean;
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