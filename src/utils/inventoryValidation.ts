import { Service, InventoryItem } from '../types';
import { calculateInventoryConsumption, serviceInventoryMappings } from './inventorySync';

export interface QuantityLimits {
  serviceId: string;
  maxQuantity: number;
  limitingFactor: {
    itemName: string;
    availableStock: number;
    requiredPerUnit: number;
  };
}

// Calculer la quantité maximale possible pour un service donné l'inventaire disponible
export const calculateMaxQuantityForService = (
  service: Service,
  inventoryItems: InventoryItem[]
): QuantityLimits => {
  const mapping = serviceInventoryMappings.find(m => m.serviceId === service.id);
  
  if (!mapping) {
    return {
      serviceId: service.id,
      maxQuantity: 999, // Pas de limite si pas de mapping
      limitingFactor: {
        itemName: 'Aucune contrainte',
        availableStock: 999,
        requiredPerUnit: 0
      }
    };
  }

  let minMaxQuantity = 999;
  let limitingFactor = {
    itemName: 'Aucune contrainte',
    availableStock: 999,
    requiredPerUnit: 0
  };

  mapping.inventoryRequirements.forEach(req => {
    const inventoryItem = inventoryItems.find(item => item.id === req.itemId);
    if (inventoryItem) {
      const maxForThisItem = Math.floor(inventoryItem.quantity / req.quantityPerUnit);
      if (maxForThisItem < minMaxQuantity) {
        minMaxQuantity = maxForThisItem;
        limitingFactor = {
          itemName: inventoryItem.name,
          availableStock: inventoryItem.quantity,
          requiredPerUnit: req.quantityPerUnit
        };
      }
    }
  });

  return {
    serviceId: service.id,
    maxQuantity: Math.max(0, minMaxQuantity),
    limitingFactor
  };
};

// Calculer les limites pour tous les services sélectionnés en tenant compte des interactions
export const calculateQuantityLimitsForServices = (
  services: { service: Service; quantity: number }[],
  inventoryItems: InventoryItem[]
): { [serviceId: string]: QuantityLimits } => {
  const limits: { [serviceId: string]: QuantityLimits } = {};
  
  // Simuler l'inventaire après consommation des autres services
  let simulatedInventory = [...inventoryItems];
  
  services.forEach(({ service, quantity }) => {
    // Calculer la consommation pour ce service uniquement
    const tempOrder = {
      id: 'temp',
      customerId: 'temp',
      services: [{ ...service, quantity }],
      items: [],
      status: 'en_traitement' as const,
      totalAmount: 0,
      paid: false,
      paymentMethod: 'cash' as const,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date()
    };
    
    const consumption = calculateInventoryConsumption(tempOrder);
    
    // Appliquer la consommation à l'inventaire simulé
    consumption.forEach(cons => {
      const itemIndex = simulatedInventory.findIndex(item => item.id === cons.itemId);
      if (itemIndex >= 0) {
        simulatedInventory[itemIndex] = {
          ...simulatedInventory[itemIndex],
          quantity: Math.max(0, simulatedInventory[itemIndex].quantity - cons.quantity)
        };
      }
    });
  });
  
  // Calculer les limites pour chaque service avec l'inventaire restant
  services.forEach(({ service }) => {
    limits[service.id] = calculateMaxQuantityForService(service, simulatedInventory);
  });
  
  return limits;
};

// Valider si une quantité est acceptable pour un service
export const validateServiceQuantity = (
  service: Service,
  quantity: number,
  inventoryItems: InventoryItem[],
  otherServices: { service: Service; quantity: number }[] = []
): {
  isValid: boolean;
  maxAllowed: number;
  errors: string[];
} => {
  const allServices = [...otherServices, { service, quantity }];
  const limits = calculateQuantityLimitsForServices(allServices, inventoryItems);
  const serviceLimit = limits[service.id];
  
  const errors: string[] = [];
  let isValid = true;
  
  if (quantity > serviceLimit.maxQuantity) {
    isValid = false;
    if (serviceLimit.maxQuantity === 0) {
      errors.push(`Stock insuffisant pour ${service.name}. Article manquant: ${serviceLimit.limitingFactor.itemName}`);
    } else {
      errors.push(`Quantité maximale pour ${service.name}: ${serviceLimit.maxQuantity} (limité par ${serviceLimit.limitingFactor.itemName})`);
    }
  }
  
  return {
    isValid,
    maxAllowed: serviceLimit.maxQuantity,
    errors
  };
};
