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

export interface InvoiceFormData extends Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber' | 'items'> {
  items: Array<Omit<InvoiceItem, 'id' | 'total'>>;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}
