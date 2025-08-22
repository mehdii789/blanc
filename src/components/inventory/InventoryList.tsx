import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { InventoryItemForm } from './InventoryItemForm';

// Composant pour afficher les données du tableau en mode mobile
const MobileInventoryItem: React.FC<{
  item: any;
  onEdit: (id: string) => void;
  getStatusIndicator: (quantity: number, reorderLevel: number) => React.ReactNode;
  deleteInventoryItem: (id: string) => void;
}> = ({ item, onEdit, getStatusIndicator, deleteInventoryItem }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-medium text-gray-900">{item.name}</h3>
      <div className="flex space-x-1">
        <button 
          onClick={() => onEdit(item.id)}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="Modifier"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${item.name}" ?`)) {
              deleteInventoryItem(item.id);
            }
          }}
          className="text-red-600 hover:text-red-900 p-1"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="text-gray-500">Quantité:</div>
      <div className="font-medium">{item.quantity} {item.unit}</div>
      
      <div className="text-gray-500">Seuil d'alerte:</div>
      <div>{item.reorderLevel}</div>
      
      <div className="text-gray-500">Statut:</div>
      <div>{getStatusIndicator(item.quantity, item.reorderLevel)}</div>
    </div>
  </div>
);

export const InventoryList: React.FC = () => {
  const { inventoryItems, deleteInventoryItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
    setShowAddForm(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${itemName}" ?`)) {
      deleteInventoryItem(itemId);
    }
  };

  const getStatusIndicator = (quantity: number, reorderLevel: number) => {
    if (quantity <= reorderLevel * 0.5) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle size={16} />
          <span className="text-xs font-medium">Critique</span>
        </div>
      );
    } else if (quantity <= reorderLevel) {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle size={16} />
          <span className="text-xs font-medium">Faible</span>
        </div>
      );
    }
    
    return (
      <span className="text-xs font-medium text-green-600">
        Suffisant
      </span>
    );
  };
  
  // Rendu du tableau pour les écrans larges
  const renderDesktopTable = () => (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Article
              </th>
              <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unité
              </th>
              <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Niveau de réappro
              </th>
              <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.unit}</div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-900">{item.reorderLevel}</div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  {getStatusIndicator(item.quantity, item.reorderLevel)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleEditItem(item.id)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Rendu pour mobile
  const renderMobileList = () => (
    <div className="space-y-3">
      {filteredItems.map((item) => (
        <MobileInventoryItem 
          key={item.id} 
          item={item} 
          onEdit={handleEditItem}
          getStatusIndicator={getStatusIndicator}
          deleteInventoryItem={deleteInventoryItem}
        />
      ))}
    </div>
  );

  return (
    <div className="px-2 sm:px-6">
      {showAddForm ? (
        <InventoryItemForm 
          itemId={editingItemId} 
          onClose={() => {
            setShowAddForm(false);
            setEditingItemId(null);
          }} 
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher dans l'inventaire..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <button
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={18} />
              <span>Ajouter un article</span>
            </button>
          </div>
          
          {isMobile ? renderMobileList() : renderDesktopTable()}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun article trouvé. Essayez de modifier vos critères de recherche.
            </div>
          )}
        </>
      )}
    </div>
  );
};