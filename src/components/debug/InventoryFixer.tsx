import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { ServiceInventoryMapping } from '../../utils/inventorySync';
import { diagnoseInventoryMappings, fixInventoryMappings } from '../../utils/fixInventoryMappings';
import { WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface InventoryFixerProps {
  inventoryItems: InventoryItem[];
  onFixMappings: (mappings: ServiceInventoryMapping[]) => void;
}

export const InventoryFixer: React.FC<InventoryFixerProps> = ({
  inventoryItems,
  onFixMappings
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const diagnosis = diagnoseInventoryMappings(inventoryItems);

  const handleAutoFix = () => {
    const correctedMappings = fixInventoryMappings(inventoryItems);
    onFixMappings(correctedMappings);
    setIsFixed(true);
  };

  return (
    <div className="bg-white border border-orange-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600" />
        <h3 className="text-lg font-medium text-gray-900">
          🔧 Réparation Automatique des Mappings
        </h3>
      </div>

      <div className="space-y-4">
        {/* Diagnostic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="font-medium text-green-800 mb-2">
              ✅ Produits Disponibles ({diagnosis.availableProducts.length})
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              {diagnosis.availableProducts.map(product => (
                <li key={product.id}>
                  • {product.name} (ID: {product.id})
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-medium text-red-800 mb-2">
              ❌ Produits Manquants ({diagnosis.missingProducts.length})
            </h4>
            {diagnosis.missingProducts.length > 0 ? (
              <ul className="text-sm text-red-700 space-y-1">
                {diagnosis.missingProducts.map(product => (
                  <li key={product}>• {product}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700">Tous les produits sont disponibles !</p>
            )}
          </div>
        </div>

        {/* Mappings corrigés */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            🔄 Mappings Corrigés
          </h4>
          <div className="space-y-2">
            {diagnosis.correctedMappings.map(mapping => (
              <div key={mapping.serviceId} className="text-sm">
                <strong className="text-blue-900">{mapping.serviceName}:</strong>
                <ul className="ml-4 text-blue-700">
                  {mapping.inventoryRequirements.map(req => {
                    const product = inventoryItems.find(i => i.id === req.itemId);
                    return (
                      <li key={req.itemId}>
                        • {product?.name || `ID: ${req.itemId}`} ({req.quantityPerUnit} {product?.unit || 'unités'})
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de réparation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {isFixed ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Mappings corrigés avec succès !
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Des corrections sont nécessaires
              </div>
            )}
          </div>
          
          {!isFixed && (
            <button
              onClick={handleAutoFix}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              🔧 Corriger Automatiquement
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h5 className="text-sm font-medium text-yellow-800 mb-1">
            💡 Comment ça marche
          </h5>
          <p className="text-xs text-yellow-700">
            Cette fonction analyse vos produits d'inventaire existants et corrige automatiquement 
            les mappings des services pour utiliser les bons IDs. Cliquez sur "Corriger Automatiquement" 
            pour résoudre les problèmes de "Produit inconnu".
          </p>
        </div>
      </div>
    </div>
  );
};
