import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Edit, AlertTriangle } from 'lucide-react';
import { InventoryItemForm } from './InventoryItemForm';

export const InventoryList: React.FC = () => {
  const { inventoryItems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
    setShowAddForm(true);
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
  
  return (
    <div>
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
          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Rechercher dans l'inventaire..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={18} />
              <span>Ajouter un article</span>
            </button>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau de réapprovisionnement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIndicator(item.quantity, item.reorderLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditItem(item.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};