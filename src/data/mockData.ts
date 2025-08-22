import { Customer, Order, Service, Employee, InventoryItem, Invoice } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean@exemple.fr',
    phone: '01-23-45-67-89',
    address: '123 Rue Principale',
    city: 'Paris',
    postalCode: '75001',
    notes: 'Préfère les détergents écologiques',
    createdAt: new Date('2025-01-15')
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie@exemple.fr',
    phone: '01-23-45-67-90',
    address: '456 Avenue des Fleurs',
    city: 'Lyon',
    postalCode: '69001',
    notes: 'Allergique à certains adoucissants',
    createdAt: new Date('2025-02-20')
  },
  {
    id: '3',
    name: 'Robert Bernard',
    email: 'robert@exemple.fr',
    phone: '01-23-45-67-91',
    address: '789 Boulevard du Parc',
    city: 'Marseille',
    postalCode: '13001',
    notes: 'Client VIP',
    createdAt: new Date('2025-03-10')
  },
  {
    id: '4',
    name: 'Sophie Petit',
    email: 'sophie@exemple.fr',
    phone: '01-23-45-67-92',
    address: '321 Rue des Lilas',
    city: 'Toulouse',
    postalCode: '31000',
    notes: '',
    createdAt: new Date('2025-04-05')
  },
  {
    id: '5',
    name: 'Michel Durand',
    email: 'michel@exemple.fr',
    phone: '01-23-45-67-93',
    address: '654 Avenue de la République',
    city: 'Bordeaux',
    postalCode: '33000',
    notes: 'Paie généralement par carte',
    createdAt: new Date('2025-05-12')
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Lavage & Pliage',
    price: 2.50,
    description: 'Par kilo, linge normal',
    estimatedTime: 24
  },
  {
    id: '2',
    name: 'Nettoyage à sec',
    price: 6.00,
    description: 'Par pièce, vêtements standards',
    estimatedTime: 48
  },
  {
    id: '3',
    name: 'Lavage Express',
    price: 3.50,
    description: 'Par kilo, service le jour même',
    estimatedTime: 8
  },
  {
    id: '4',
    name: 'Literie',
    price: 15.00,
    description: 'Par pièce, couettes et couvertures',
    estimatedTime: 48
  },
  {
    id: '5',
    name: 'Repassage',
    price: 3.00,
    description: 'Par pièce, chemises et pantalons',
    estimatedTime: 24
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    services: [{ ...mockServices[0], quantity: 10 }, { ...mockServices[4], quantity: 5 }],
    items: [
      { id: 'item_1_1', productName: 'Lavage & Pliage', quantity: 10, unitPrice: 2.50, total: 25.00 },
      { id: 'item_1_2', productName: 'Repassage', quantity: 5, unitPrice: 3.00, total: 15.00 }
    ],
    status: 'pret',
    totalAmount: 35.50,
    paid: true,
    paymentMethod: 'card',
    notes: '10 kilos de linge + 5 chemises à repasser',
    createdAt: new Date('2025-08-15T10:30:00'),
    updatedAt: new Date('2025-08-16T14:15:00'),
    dueDate: new Date('2025-08-17T17:00:00')
  },
  {
    id: '2',
    customerId: '2',
    services: [{ ...mockServices[1], quantity: 7 }],
    items: [
      { id: 'item_2_1', productName: 'Nettoyage à sec', quantity: 7, unitPrice: 6.00, total: 42.00 }
    ],
    status: 'en_traitement',
    totalAmount: 42.00,
    paid: false,
    paymentMethod: 'cash',
    notes: '7 articles pour nettoyage à sec',
    createdAt: new Date('2025-08-16T09:15:00'),
    updatedAt: new Date('2025-08-16T11:30:00'),
    dueDate: new Date('2025-08-18T17:00:00')
  },
  {
    id: '3',
    customerId: '3',
    services: [{ ...mockServices[0], quantity: 5 }, { ...mockServices[2], quantity: 6 }],
    items: [
      { id: 'item_3_1', productName: 'Lavage & Pliage', quantity: 5, unitPrice: 2.50, total: 12.50 },
      { id: 'item_3_2', productName: 'Lavage Express', quantity: 6, unitPrice: 3.50, total: 21.00 }
    ],
    status: 'lavage',
    totalAmount: 28.75,
    paid: true,
    paymentMethod: 'transfer',
    notes: 'Réparti entre normal et express',
    createdAt: new Date('2025-08-14T14:45:00'),
    updatedAt: new Date('2025-08-15T15:30:00'),
    dueDate: new Date('2025-08-16T14:00:00')
  },
  {
    id: '4',
    customerId: '4',
    services: [{ ...mockServices[3], quantity: 2 }],
    items: [
      { id: 'item_4_1', productName: 'Literie', quantity: 2, unitPrice: 15.00, total: 30.00 }
    ],
    status: 'en_attente',
    totalAmount: 30.00,
    paid: false,
    paymentMethod: 'check',
    notes: '2 couettes',
    createdAt: new Date('2025-08-13T16:20:00'),
    updatedAt: new Date('2025-08-13T16:20:00'),
    dueDate: new Date('2025-08-19T17:00:00')
  },
  {
    id: '5',
    customerId: '5',
    services: [{ ...mockServices[0], quantity: 15 }, { ...mockServices[4], quantity: 2 }],
    items: [
      { id: 'item_5_1', productName: 'Lavage & Pliage', quantity: 15, unitPrice: 2.50, total: 37.50 },
      { id: 'item_5_2', productName: 'Repassage', quantity: 2, unitPrice: 3.00, total: 6.00 }
    ],
    status: 'pliage',
    totalAmount: 40.25,
    paid: true,
    paymentMethod: 'card',
    notes: '15 kilos de linge + 2 chemises à repasser',
    createdAt: new Date('2025-08-12T11:15:00'),
    updatedAt: new Date('2025-08-14T13:45:00'),
    dueDate: new Date('2025-08-15T12:00:00')
  },
  {
    id: '6',
    customerId: '1',
    services: [{ ...mockServices[2], quantity: 6 }],
    items: [
      { id: 'item_6_1', productName: 'Lavage Express', quantity: 6, unitPrice: 3.50, total: 21.00 }
    ],
    status: 'livre',
    totalAmount: 21.00,
    paid: true,
    paymentMethod: 'cash',
    notes: '6 kilos express',
    createdAt: new Date('2025-08-10T08:30:00'),
    updatedAt: new Date('2025-08-10T18:15:00'),
    dueDate: new Date('2025-08-10T18:00:00')
  },
  {
    id: '7',
    customerId: '3',
    services: [{ ...mockServices[1], quantity: 9 }, { ...mockServices[4], quantity: 0 }],
    items: [
      { id: 'item_7_1', productName: 'Nettoyage à sec', quantity: 9, unitPrice: 6.00, total: 54.00 }
    ],
    status: 'pret',
    totalAmount: 54.00,
    paid: false,
    paymentMethod: 'transfer',
    notes: '9 articles nettoyage à sec + repassage',
    createdAt: new Date('2025-08-08T14:20:00'),
    updatedAt: new Date('2025-08-11T16:30:00'),
    dueDate: new Date('2025-08-12T17:00:00')
  },
  {
    id: '8',
    customerId: '2',
    services: [{ ...mockServices[0], quantity: 7 }],
    items: [
      { id: 'item_8_1', productName: 'Lavage & Pliage', quantity: 7, unitPrice: 2.50, total: 17.50 }
    ],
    status: 'livre',
    totalAmount: 17.50,
    paid: true,
    paymentMethod: 'card',
    notes: '7 kilos de linge standard',
    createdAt: new Date('2025-07-28T10:45:00'),
    updatedAt: new Date('2025-07-30T14:20:00'),
    dueDate: new Date('2025-07-30T17:00:00')
  },
  {
    id: '9',
    customerId: '4',
    services: [{ ...mockServices[3], quantity: 1 }, { ...mockServices[0], quantity: 7 }],
    items: [
      { id: 'item_9_1', productName: 'Literie', quantity: 1, unitPrice: 15.00, total: 15.00 },
      { id: 'item_9_2', productName: 'Lavage & Pliage', quantity: 7, unitPrice: 2.50, total: 17.50 }
    ],
    status: 'livre',
    totalAmount: 32.50,
    paid: true,
    paymentMethod: 'cash',
    notes: '1 couette + 7 kilos linge',
    createdAt: new Date('2025-07-25T16:10:00'),
    updatedAt: new Date('2025-07-27T12:45:00'),
    dueDate: new Date('2025-07-27T17:00:00')
  },
  {
    id: '10',
    customerId: '5',
    services: [{ ...mockServices[4], quantity: 8 }],
    items: [
      { id: 'item_10_1', productName: 'Repassage', quantity: 8, unitPrice: 3.00, total: 24.00 }
    ],
    status: 'livre',
    totalAmount: 24.00,
    paid: true,
    paymentMethod: 'check',
    notes: '8 chemises à repasser',
    createdAt: new Date('2025-07-20T09:30:00'),
    updatedAt: new Date('2025-07-21T15:15:00'),
    dueDate: new Date('2025-07-21T17:00:00')
  }
];

// Données mockées pour les factures
export const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2025-001',
    orderId: '1',
    customerId: '1',
    issueDate: new Date('2025-08-16T14:15:00'),
    dueDate: new Date('2025-09-15T23:59:59'),
    items: [
      { id: 'inv_item_1_1', description: 'Lavage & Pliage - 10kg', quantity: 10, unitPrice: 2.50, total: 25.00 },
      { id: 'inv_item_1_2', description: 'Repassage - 5 pièces', quantity: 5, unitPrice: 3.00, total: 15.00 }
    ],
    subtotal: 40.00,
    tax: 8.00,
    discount: 0,
    total: 48.00,
    notes: 'Paiement par carte bancaire',
    status: 'paid',
    createdAt: new Date('2025-08-16T14:15:00'),
    updatedAt: new Date('2025-08-16T14:15:00')
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2025-002',
    orderId: '6',
    customerId: '1',
    issueDate: new Date('2025-08-10T18:15:00'),
    dueDate: new Date('2025-09-09T23:59:59'),
    items: [
      { id: 'inv_item_2_1', description: 'Lavage Express - 6kg', quantity: 6, unitPrice: 3.50, total: 21.00 }
    ],
    subtotal: 21.00,
    tax: 4.20,
    discount: 0,
    total: 25.20,
    notes: 'Paiement en espèces',
    status: 'paid',
    createdAt: new Date('2025-08-10T18:15:00'),
    updatedAt: new Date('2025-08-10T18:15:00')
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2025-003',
    orderId: '7',
    customerId: '3',
    issueDate: new Date('2025-08-11T16:30:00'),
    dueDate: new Date('2025-09-10T23:59:59'),
    items: [
      { id: 'inv_item_3_1', description: 'Nettoyage à sec - 9 articles', quantity: 9, unitPrice: 6.00, total: 54.00 }
    ],
    subtotal: 54.00,
    tax: 10.80,
    discount: 0,
    total: 64.80,
    notes: 'En attente de paiement par virement',
    status: 'sent',
    createdAt: new Date('2025-08-11T16:30:00'),
    updatedAt: new Date('2025-08-11T16:30:00')
  }
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'David Martin',
    role: 'gerant',
    email: 'david@blanchpro.fr',
    phone: '01-23-45-67-94'
  },
  {
    id: '2',
    name: 'Lisa Garcia',
    role: 'operateur',
    email: 'lisa@blanchpro.fr',
    phone: '01-23-45-67-95'
  },
  {
    id: '3',
    name: 'Thomas Leroy',
    role: 'comptoir',
    email: 'thomas@blanchpro.fr',
    phone: '01-23-45-67-96'
  },
  {
    id: '4',
    name: 'Maria Rodriguez',
    role: 'livreur',
    email: 'maria@blanchpro.fr',
    phone: '01-23-45-67-97'
  }
];

export const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Lessive Standard',
    quantity: 25,
    unit: 'litres',
    reorderLevel: 10
  },
  {
    id: '2',
    name: 'Lessive Écologique',
    quantity: 8,
    unit: 'litres',
    reorderLevel: 5
  },
  {
    id: '3',
    name: 'Adoucissant',
    quantity: 15,
    unit: 'litres',
    reorderLevel: 7
  },
  {
    id: '4',
    name: 'Eau de Javel',
    quantity: 12,
    unit: 'litres',
    reorderLevel: 6
  },
  {
    id: '5',
    name: 'Détachant',
    quantity: 4,
    unit: 'bouteilles',
    reorderLevel: 5
  },
  {
    id: '6',
    name: 'Feuilles Assouplissantes',
    quantity: 300,
    unit: 'feuilles',
    reorderLevel: 100
  },
  {
    id: '7',
    name: 'Sacs à Linge',
    quantity: 85,
    unit: 'sacs',
    reorderLevel: 50
  }
];

export const getDashboardStats = () => {
  const pendingOrders = mockOrders.filter(order => 
    ['en_attente', 'en_traitement', 'lavage', 'sechage', 'pliage'].includes(order.status)
  ).length;
  
  const readyForPickup = mockOrders.filter(order => order.status === 'pret').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = mockOrders.filter(order => {
    const orderDate = new Date(order.updatedAt);
    orderDate.setHours(0, 0, 0, 0);
    return order.status === 'livre' && orderDate.getTime() === today.getTime();
  }).length;
  
  const dailyRevenue = mockOrders.filter(order => {
    const orderDate = new Date(order.updatedAt);
    orderDate.setHours(0, 0, 0, 0);
    return order.paid && orderDate.getTime() === today.getTime();
  }).reduce((sum, order) => sum + order.totalAmount, 0);
  
  const lowInventoryItems = mockInventoryItems.filter(item => 
    item.quantity <= item.reorderLevel
  ).length;
  
  return {
    pendingOrders,
    readyForPickup,
    completedToday,
    dailyRevenue,
    lowInventoryItems
  };
};

// Fonction utilitaire pour générer un numéro de facture
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}-${timestamp}`;
};

// Fonction pour créer une facture à partir d'une commande
export const createInvoiceFromOrder = (order: Order): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> => {
  const items = order.items?.map(item => ({
    id: `inv_${item.id}`,
    description: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total
  })) || [];
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.2; // 20% TVA
  const total = subtotal + tax;
  
  return {
    invoiceNumber: generateInvoiceNumber(),
    orderId: order.id,
    customerId: order.customerId,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    items,
    subtotal,
    tax,
    discount: 0,
    total,
    notes: `Facture générée automatiquement pour la commande #${order.id}`,
    status: order.paid ? 'paid' : 'draft'
  };
};