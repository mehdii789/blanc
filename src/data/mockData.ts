import { Customer, Order, Service, Employee, InventoryItem } from '../types';

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
    createdAt: new Date('2023-01-15')
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
    createdAt: new Date('2023-02-20')
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
    createdAt: new Date('2023-03-10')
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
    createdAt: new Date('2023-04-05')
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
    createdAt: new Date('2023-05-12')
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
    services: [mockServices[0], mockServices[4]],
    status: 'pret',
    totalAmount: 35.50,
    paid: true,
    notes: '10 kilos de linge + 5 chemises à repasser',
    createdAt: new Date('2023-07-01T10:30:00'),
    updatedAt: new Date('2023-07-02T14:15:00'),
    dueDate: new Date('2023-07-03T17:00:00')
  },
  {
    id: '2',
    customerId: '2',
    services: [mockServices[1]],
    status: 'en_traitement',
    totalAmount: 42.00,
    paid: false,
    notes: '7 articles pour nettoyage à sec',
    createdAt: new Date('2023-07-02T09:15:00'),
    updatedAt: new Date('2023-07-02T11:30:00'),
    dueDate: new Date('2023-07-04T17:00:00')
  },
  {
    id: '3',
    customerId: '3',
    services: [mockServices[0], mockServices[2]],
    status: 'lavage',
    totalAmount: 28.75,
    paid: true,
    notes: 'Réparti entre normal et express',
    createdAt: new Date('2023-07-02T14:45:00'),
    updatedAt: new Date('2023-07-02T15:30:00'),
    dueDate: new Date('2023-07-03T14:00:00')
  },
  {
    id: '4',
    customerId: '4',
    services: [mockServices[3]],
    status: 'en_attente',
    totalAmount: 30.00,
    paid: false,
    notes: '2 couettes',
    createdAt: new Date('2023-07-02T16:20:00'),
    updatedAt: new Date('2023-07-02T16:20:00'),
    dueDate: new Date('2023-07-05T17:00:00')
  },
  {
    id: '5',
    customerId: '5',
    services: [mockServices[0], mockServices[4]],
    status: 'pliage',
    totalAmount: 40.25,
    paid: true,
    notes: '15 kilos de linge + 2 chemises à repasser',
    createdAt: new Date('2023-07-01T11:15:00'),
    updatedAt: new Date('2023-07-02T13:45:00'),
    dueDate: new Date('2023-07-03T12:00:00')
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