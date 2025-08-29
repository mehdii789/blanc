import { ClientOrder, Order, OrderItem, Invoice, ServicePack, Customer } from '../types';
import { createInvoiceFromOrder, generateInvoiceNumber } from '../data/mockData';

// Convertir une commande client en commande standard pour le système de gestion
export const convertClientOrderToOrder = (
  clientOrder: ClientOrder,
  servicePacks: ServicePack[],
  customer: Customer
): Order => {
  const services = clientOrder.packs.flatMap(orderPack => {
    const pack = servicePacks.find(p => p.id === orderPack.packId);
    if (!pack) return [];
    
    return pack.services.map(packService => ({
      id: packService.serviceId,
      name: packService.serviceName,
      price: packService.unitPrice,
      description: `Service du pack ${pack.name}`,
      estimatedTime: pack.estimatedTime,
      quantity: packService.quantity * orderPack.quantity
    }));
  });

  const items: OrderItem[] = clientOrder.packs.map(orderPack => ({
    id: `client_item_${orderPack.packId}_${Date.now()}`,
    productName: orderPack.packName,
    quantity: orderPack.quantity,
    unitPrice: orderPack.unitPrice,
    total: orderPack.total
  }));

  return {
    id: clientOrder.id,
    customerId: clientOrder.customerId,
    services,
    items,
    status: clientOrder.status,
    totalAmount: clientOrder.totalAmount,
    paid: false,
    paymentMethod: 'card', // Par défaut pour les commandes en ligne
    notes: `Commande passée via le portail client - ${clientOrder.notes || ''}`,
    createdAt: clientOrder.createdAt,
    updatedAt: clientOrder.updatedAt,
    dueDate: clientOrder.deliveryDate || new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h par défaut
  };
};

// Créer une facture directement à partir d'une commande client
export const createInvoiceFromClientOrder = (
  clientOrder: ClientOrder,
  customer: Customer
): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> => {
  const items = clientOrder.packs.map(pack => ({
    id: `inv_client_${pack.packId}_${Date.now()}`,
    description: `${pack.packName} x${pack.quantity}`,
    quantity: pack.quantity,
    unitPrice: pack.unitPrice,
    total: pack.total
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.2; // 20% TVA
  const total = subtotal + tax;

  return {
    invoiceNumber: generateInvoiceNumber(),
    orderId: clientOrder.id,
    customerId: clientOrder.customerId,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    items,
    subtotal,
    tax,
    discount: 0,
    total,
    notes: `Facture générée pour commande portail client - ${customer.name}`,
    status: 'draft'
  };
};

// Calculer le délai estimé pour une commande client
export const calculateClientOrderEstimatedTime = (
  clientOrder: ClientOrder,
  servicePacks: ServicePack[]
): number => {
  let maxTime = 0;
  
  clientOrder.packs.forEach(orderPack => {
    const pack = servicePacks.find(p => p.id === orderPack.packId);
    if (pack && pack.estimatedTime > maxTime) {
      maxTime = pack.estimatedTime;
    }
  });
  
  return maxTime;
};

// Générer un résumé de commande client pour email de confirmation
export const generateClientOrderSummary = (
  clientOrder: ClientOrder,
  servicePacks: ServicePack[],
  customer: Customer
): {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  packs: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  estimatedDelivery: Date;
  status: string;
} => {
  const packs = clientOrder.packs.map(orderPack => {
    const pack = servicePacks.find(p => p.id === orderPack.packId);
    return {
      name: pack?.name || orderPack.packName,
      quantity: orderPack.quantity,
      price: orderPack.total
    };
  });

  const estimatedTime = calculateClientOrderEstimatedTime(clientOrder, servicePacks);
  const estimatedDelivery = new Date(clientOrder.createdAt.getTime() + estimatedTime * 60 * 60 * 1000);

  return {
    orderNumber: clientOrder.id.slice(-8).toUpperCase(),
    customerName: customer.name,
    customerEmail: customer.email,
    packs,
    totalAmount: clientOrder.totalAmount,
    estimatedDelivery,
    status: clientOrder.status
  };
};

// Vérifier si une commande client peut être facturée
export const canInvoiceClientOrder = (clientOrder: ClientOrder): boolean => {
  const invoiceableStatuses = ['pret', 'livre'];
  return invoiceableStatuses.includes(clientOrder.status);
};

// Calculer les statistiques des commandes clients
export const calculateClientOrderStats = (
  clientOrders: ClientOrder[]
): {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
} => {
  const totalOrders = clientOrders.length;
  const pendingOrders = clientOrders.filter(order => 
    !['livre', 'annule'].includes(order.status)
  ).length;
  const completedOrders = clientOrders.filter(order => 
    order.status === 'livre'
  ).length;
  const totalRevenue = clientOrders
    .filter(order => order.status === 'livre')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    averageOrderValue
  };
};
