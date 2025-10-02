import { InventoryItem } from '../types';
import { ServiceInventoryMapping } from './inventorySync';

// Fonction pour corriger automatiquement les mappings avec les vrais IDs des produits
export const fixInventoryMappings = (inventoryItems: InventoryItem[]): ServiceInventoryMapping[] => {
  // Créer un mapping nom -> ID pour les produits existants
  const productNameToId: { [name: string]: string } = {};
  inventoryItems.forEach(item => {
    productNameToId[item.name.toLowerCase()] = item.id;
  });

  // Fonction helper pour trouver un ID par nom (avec variations)
  const findProductId = (searchNames: string[]): string | null => {
    for (const name of searchNames) {
      const id = productNameToId[name.toLowerCase()];
      if (id) return id;
    }
    return null;
  };

  // Mappings corrigés avec les vrais IDs
  const correctedMappings: ServiceInventoryMapping[] = [
    {
      serviceId: '1', // Lavage & Pliage
      serviceName: 'Lavage & Pliage',
      inventoryRequirements: [
        { 
          itemId: findProductId(['lessive standard', 'lessive']) || 'missing-lessive',
          quantityPerUnit: 0.1 
        },
        { 
          itemId: findProductId(['adoucissant']) || 'missing-adoucissant',
          quantityPerUnit: 0.05 
        },
        { 
          itemId: findProductId(['sacs à linge', 'sacs', 'sac']) || 'missing-sacs',
          quantityPerUnit: 1 
        },
      ]
    },
    {
      serviceId: '2', // Nettoyage à sec
      serviceName: 'Nettoyage à sec',
      inventoryRequirements: [
        { 
          itemId: findProductId(['détachant']) || 'missing-detachant',
          quantityPerUnit: 0.2 
        },
        { 
          itemId: findProductId(['sacs à linge', 'sacs', 'sac']) || 'missing-sacs',
          quantityPerUnit: 1 
        },
      ]
    },
    {
      serviceId: '3', // Lavage Express
      serviceName: 'Lavage Express',
      inventoryRequirements: [
        { 
          itemId: findProductId(['lessive standard', 'lessive']) || 'missing-lessive',
          quantityPerUnit: 0.15 
        },
        { 
          itemId: findProductId(['adoucissant']) || 'missing-adoucissant',
          quantityPerUnit: 0.08 
        },
        { 
          itemId: findProductId(['sacs à linge', 'sacs', 'sac']) || 'missing-sacs',
          quantityPerUnit: 1 
        },
      ]
    },
    {
      serviceId: '4', // Literie
      serviceName: 'Literie',
      inventoryRequirements: [
        { 
          itemId: findProductId(['lessive écologique', 'lessive bio']) || 'missing-lessive-eco',
          quantityPerUnit: 0.3 
        },
        { 
          itemId: findProductId(['adoucissant']) || 'missing-adoucissant',
          quantityPerUnit: 0.2 
        },
        { 
          itemId: findProductId(['eau de javel', 'javel']) || 'missing-javel',
          quantityPerUnit: 0.1 
        },
        { 
          itemId: findProductId(['sacs à linge', 'sacs', 'sac']) || 'missing-sacs',
          quantityPerUnit: 1 
        },
      ]
    },
    {
      serviceId: '5', // Repassage
      serviceName: 'Repassage',
      inventoryRequirements: [
        { 
          itemId: findProductId(['feuilles assouplissantes', 'feuilles']) || 'missing-feuilles',
          quantityPerUnit: 2 
        },
      ]
    }
  ];

  // Filtrer les exigences avec des IDs manquants
  return correctedMappings.map(mapping => ({
    ...mapping,
    inventoryRequirements: mapping.inventoryRequirements.filter(req => 
      !req.itemId.startsWith('missing-')
    )
  }));
};

// Fonction pour diagnostiquer les problèmes
export const diagnoseInventoryMappings = (inventoryItems: InventoryItem[]): {
  availableProducts: { id: string; name: string }[];
  missingProducts: string[];
  correctedMappings: ServiceInventoryMapping[];
} => {
  const availableProducts = inventoryItems.map(item => ({ id: item.id, name: item.name }));
  const correctedMappings = fixInventoryMappings(inventoryItems);
  
  // Identifier les produits manquants
  const missingProducts: string[] = [];
  const originalMappings = [
    'Lessive Standard',
    'Lessive Écologique', 
    'Adoucissant',
    'Eau de Javel',
    'Détachant',
    'Feuilles Assouplissantes',
    'Sacs à Linge'
  ];

  originalMappings.forEach(productName => {
    const found = inventoryItems.some(item => 
      item.name.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(item.name.toLowerCase())
    );
    if (!found) {
      missingProducts.push(productName);
    }
  });

  return {
    availableProducts,
    missingProducts,
    correctedMappings
  };
};
