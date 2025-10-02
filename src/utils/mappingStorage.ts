import { ServiceInventoryMapping } from './inventorySync';

const MAPPINGS_STORAGE_KEY = 'service-inventory-mappings';

// Sauvegarder les mappings dans le localStorage
export const saveMappings = (mappings: ServiceInventoryMapping[]): void => {
  try {
    localStorage.setItem(MAPPINGS_STORAGE_KEY, JSON.stringify(mappings));
    console.log('✅ Mappings sauvegardés:', mappings);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des mappings:', error);
  }
};

// Charger les mappings depuis le localStorage
export const loadMappings = (): ServiceInventoryMapping[] => {
  try {
    const stored = localStorage.getItem(MAPPINGS_STORAGE_KEY);
    if (stored) {
      const mappings = JSON.parse(stored);
      console.log('✅ Mappings chargés:', mappings);
      return mappings;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des mappings:', error);
  }
  
  // Retourner les mappings par défaut avec des produits prédéfinis
  console.log('🔧 Utilisation des mappings par défaut');
  return [
    { 
      serviceId: '1', 
      serviceName: 'Lavage & Pliage', 
      inventoryRequirements: [
        { itemId: '1', quantityPerUnit: 0.1 }, // Lessive Standard
        { itemId: '3', quantityPerUnit: 0.05 }, // Adoucissant
        { itemId: '7', quantityPerUnit: 1 } // Sacs à Linge
      ]
    },
    { 
      serviceId: '2', 
      serviceName: 'Nettoyage à sec', 
      inventoryRequirements: [
        { itemId: '5', quantityPerUnit: 0.2 }, // Détachant
        { itemId: '7', quantityPerUnit: 1 } // Sacs à Linge
      ]
    },
    { 
      serviceId: '3', 
      serviceName: 'Lavage Express', 
      inventoryRequirements: [
        { itemId: '1', quantityPerUnit: 0.15 }, // Lessive Standard
        { itemId: '3', quantityPerUnit: 0.08 }, // Adoucissant
        { itemId: '7', quantityPerUnit: 1 } // Sacs à Linge
      ]
    },
    { 
      serviceId: '4', 
      serviceName: 'Literie', 
      inventoryRequirements: [
        { itemId: '2', quantityPerUnit: 0.3 }, // Lessive Écologique
        { itemId: '3', quantityPerUnit: 0.2 }, // Adoucissant
        { itemId: '4', quantityPerUnit: 0.1 }, // Eau de Javel
        { itemId: '7', quantityPerUnit: 1 } // Sacs à Linge
      ]
    },
    { 
      serviceId: '5', 
      serviceName: 'Repassage', 
      inventoryRequirements: [
        { itemId: '6', quantityPerUnit: 2 } // Feuilles Assouplissantes
      ]
    }
  ];
};

// Mettre à jour un mapping spécifique
export const updateServiceMapping = (serviceId: string, requirements: { itemId: string; quantityPerUnit: number }[]): void => {
  const currentMappings = loadMappings();
  const updatedMappings = currentMappings.map(mapping => 
    mapping.serviceId === serviceId 
      ? { ...mapping, inventoryRequirements: requirements }
      : mapping
  );
  saveMappings(updatedMappings);
};

// Obtenir les mappings actuels (pour remplacer l'export de inventorySync.ts)
export const getCurrentMappings = (): ServiceInventoryMapping[] => {
  return loadMappings();
};

// Réinitialiser les mappings aux valeurs par défaut (utile pour les tests)
export const resetToDefaultMappings = (): void => {
  localStorage.removeItem(MAPPINGS_STORAGE_KEY);
  console.log('🔄 Mappings réinitialisés aux valeurs par défaut');
};
