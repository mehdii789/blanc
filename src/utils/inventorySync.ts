import { Order, InventoryItem, Service, ServicePack, ClientOrder } from '../types';

// Mapping entre les services et les produits d'inventaire nécessaires
export interface ServiceInventoryMapping {
  serviceId: string;
  serviceName: string;
  inventoryRequirements: {
    itemId: string;
    quantityPerUnit: number; // Quantité d'inventaire nécessaire par unité de service
  }[];
}

// Configuration du mapping service -> inventaire
export const serviceInventoryMappings: ServiceInventoryMapping[] = [
  {
    serviceId: '1', // Lavage & Pliage
    serviceName: 'Lavage & Pliage',
    inventoryRequirements: [
      { itemId: '1', quantityPerUnit: 0.1 }, // Lessive Standard - 0.1L par kg
      { itemId: '3', quantityPerUnit: 0.05 }, // Adoucissant - 0.05L par kg
      { itemId: '7', quantityPerUnit: 1 }, // Sacs à Linge - 1 sac par commande
    ]
  },
  {
    serviceId: '2', // Nettoyage à sec
    serviceName: 'Nettoyage à sec',
    inventoryRequirements: [
      { itemId: '5', quantityPerUnit: 0.2 }, // Détachant - 0.2 bouteille par pièce
      { itemId: '7', quantityPerUnit: 1 }, // Sacs à Linge - 1 sac par commande
    ]
  },
  {
    serviceId: '3', // Lavage Express
    serviceName: 'Lavage Express',
    inventoryRequirements: [
      { itemId: '1', quantityPerUnit: 0.15 }, // Lessive Standard - 0.15L par kg (plus concentré)
      { itemId: '3', quantityPerUnit: 0.08 }, // Adoucissant - 0.08L par kg
      { itemId: '7', quantityPerUnit: 1 }, // Sacs à Linge - 1 sac par commande
    ]
  },
  {
    serviceId: '4', // Literie
    serviceName: 'Literie',
    inventoryRequirements: [
      { itemId: '2', quantityPerUnit: 0.3 }, // Lessive Écologique - 0.3L par pièce
      { itemId: '3', quantityPerUnit: 0.2 }, // Adoucissant - 0.2L par pièce
      { itemId: '4', quantityPerUnit: 0.1 }, // Eau de Javel - 0.1L par pièce
      { itemId: '7', quantityPerUnit: 1 }, // Sacs à Linge - 1 sac par commande
    ]
  },
  {
    serviceId: '5', // Repassage
    serviceName: 'Repassage',
    inventoryRequirements: [
      { itemId: '6', quantityPerUnit: 2 }, // Feuilles Assouplissantes - 2 feuilles par pièce
    ]
  }
];

// Statuts de commande qui consomment l'inventaire
export const INVENTORY_CONSUMING_STATUSES = [
  'en_traitement',
  'lavage',
  'sechage',
  'pliage',
  'pret',
  'livre'
];

// Statuts de commande qui ne consomment pas encore l'inventaire
export const NON_CONSUMING_STATUSES = [
  'en_attente',
  'annule'
];

// Calculer la consommation d'inventaire pour une commande
export const calculateInventoryConsumption = (order: Order): { itemId: string; quantity: number }[] => {
  const consumption: { itemId: string; quantity: number }[] = [];
  
  order.services.forEach(service => {
    const mapping = serviceInventoryMappings.find(m => m.serviceId === service.id);
    if (mapping) {
      mapping.inventoryRequirements.forEach(req => {
        const existingConsumption = consumption.find(c => c.itemId === req.itemId);
        const additionalQuantity = req.quantityPerUnit * service.quantity;
        
        if (existingConsumption) {
          existingConsumption.quantity += additionalQuantity;
        } else {
          consumption.push({
            itemId: req.itemId,
            quantity: additionalQuantity
          });
        }
      });
    }
  });
  
  return consumption;
};

// Vérifier si l'inventaire est suffisant pour une commande
export const checkInventoryAvailability = (
  order: Order, 
  inventoryItems: InventoryItem[]
): { available: boolean; shortages: { itemName: string; required: number; available: number }[] } => {
  const consumption = calculateInventoryConsumption(order);
  const shortages: { itemName: string; required: number; available: number }[] = [];
  
  consumption.forEach(cons => {
    const inventoryItem = inventoryItems.find(item => item.id === cons.itemId);
    if (!inventoryItem || inventoryItem.quantity < cons.quantity) {
      const item = inventoryItems.find(item => item.id === cons.itemId);
      shortages.push({
        itemName: item?.name || 'Article inconnu',
        required: cons.quantity,
        available: inventoryItem?.quantity || 0
      });
    }
  });
  
  return {
    available: shortages.length === 0,
    shortages
  };
};

// Appliquer la consommation d'inventaire pour une commande
export const applyInventoryConsumption = (
  order: Order,
  inventoryItems: InventoryItem[]
): InventoryItem[] => {
  const consumption = calculateInventoryConsumption(order);
  
  return inventoryItems.map(item => {
    const consumptionForItem = consumption.find(c => c.itemId === item.id);
    if (consumptionForItem) {
      return {
        ...item,
        quantity: Math.max(0, item.quantity - consumptionForItem.quantity)
      };
    }
    return item;
  });
};

// Restaurer l'inventaire lors de l'annulation d'une commande
export const restoreInventoryConsumption = (
  order: Order,
  inventoryItems: InventoryItem[]
): InventoryItem[] => {
  const consumption = calculateInventoryConsumption(order);
  
  return inventoryItems.map(item => {
    const consumptionForItem = consumption.find(c => c.itemId === item.id);
    if (consumptionForItem) {
      return {
        ...item,
        quantity: item.quantity + consumptionForItem.quantity
      };
    }
    return item;
  });
};

// Calculer l'inventaire théorique basé sur toutes les commandes
export const calculateTheoreticalInventory = (
  baseInventory: InventoryItem[],
  orders: Order[]
): InventoryItem[] => {
  let theoreticalInventory = [...baseInventory];
  
  // Appliquer la consommation pour toutes les commandes qui consomment l'inventaire
  orders.forEach(order => {
    if (INVENTORY_CONSUMING_STATUSES.includes(order.status)) {
      theoreticalInventory = applyInventoryConsumption(order, theoreticalInventory);
    }
  });
  
  return theoreticalInventory;
};

// Obtenir les articles en rupture de stock
export const getLowStockItems = (inventoryItems: InventoryItem[]): InventoryItem[] => {
  return inventoryItems.filter(item => item.quantity <= item.reorderLevel);
};

// Obtenir les articles en rupture critique (quantité = 0)
export const getOutOfStockItems = (inventoryItems: InventoryItem[]): InventoryItem[] => {
  return inventoryItems.filter(item => item.quantity <= 0);
};

// Calculer la consommation d'inventaire pour un pack de services
export const calculatePackInventoryConsumption = (pack: ServicePack, quantity: number = 1): { itemId: string; quantity: number }[] => {
  const consumption: { itemId: string; quantity: number }[] = [];
  
  pack.services.forEach(packService => {
    const mapping = serviceInventoryMappings.find(m => m.serviceId === packService.serviceId);
    if (mapping) {
      mapping.inventoryRequirements.forEach(req => {
        const existingConsumption = consumption.find(c => c.itemId === req.itemId);
        const additionalQuantity = req.quantityPerUnit * packService.quantity * quantity;
        
        if (existingConsumption) {
          existingConsumption.quantity += additionalQuantity;
        } else {
          consumption.push({
            itemId: req.itemId,
            quantity: additionalQuantity
          });
        }
      });
    }
  });
  
  return consumption;
};

// Vérifier la disponibilité d'inventaire pour une commande client
export const checkClientOrderInventoryAvailability = (
  clientOrder: ClientOrder,
  servicePacks: ServicePack[],
  inventoryItems: InventoryItem[]
): { available: boolean; shortages: { itemName: string; required: number; available: number }[] } => {
  const totalConsumption: { itemId: string; quantity: number }[] = [];
  const shortages: { itemName: string; required: number; available: number }[] = [];
  
  clientOrder.packs.forEach(orderPack => {
    const pack = servicePacks.find(p => p.id === orderPack.packId);
    if (pack) {
      const packConsumption = calculatePackInventoryConsumption(pack, orderPack.quantity);
      
      packConsumption.forEach(cons => {
        const existing = totalConsumption.find(c => c.itemId === cons.itemId);
        if (existing) {
          existing.quantity += cons.quantity;
        } else {
          totalConsumption.push({ ...cons });
        }
      });
    }
  });
  
  totalConsumption.forEach(cons => {
    const inventoryItem = inventoryItems.find(item => item.id === cons.itemId);
    if (!inventoryItem || inventoryItem.quantity < cons.quantity) {
      const item = inventoryItems.find(item => item.id === cons.itemId);
      shortages.push({
        itemName: item?.name || 'Article inconnu',
        required: cons.quantity,
        available: inventoryItem?.quantity || 0
      });
    }
  });
  
  return {
    available: shortages.length === 0,
    shortages
  };
};

// Appliquer la consommation d'inventaire pour une commande client
export const applyClientOrderInventoryConsumption = (
  clientOrder: ClientOrder,
  servicePacks: ServicePack[],
  inventoryItems: InventoryItem[]
): InventoryItem[] => {
  const totalConsumption: { itemId: string; quantity: number }[] = [];
  
  clientOrder.packs.forEach(orderPack => {
    const pack = servicePacks.find(p => p.id === orderPack.packId);
    if (pack) {
      const packConsumption = calculatePackInventoryConsumption(pack, orderPack.quantity);
      
      packConsumption.forEach(cons => {
        const existing = totalConsumption.find(c => c.itemId === cons.itemId);
        if (existing) {
          existing.quantity += cons.quantity;
        } else {
          totalConsumption.push({ ...cons });
        }
      });
    }
  });
  
  return inventoryItems.map(item => {
    const consumptionForItem = totalConsumption.find(c => c.itemId === item.id);
    if (consumptionForItem) {
      return {
        ...item,
        quantity: Math.max(0, item.quantity - consumptionForItem.quantity)
      };
    }
    return item;
  });
};
