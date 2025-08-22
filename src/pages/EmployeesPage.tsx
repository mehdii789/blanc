import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, User, Edit, Trash2, Plus } from 'lucide-react';
import { EmployeeForm } from '../components/employees/EmployeeForm';
import { Employee } from '../types';

const getRoleLabel = (role: string) => {
  switch (role.toLowerCase()) {
    case 'gerant':
      return 'Gérant';
    case 'operateur':
      return 'Opérateur';
    case 'comptoir':
      return 'Comptoir';
    case 'livreur':
      return 'Livreur';
    default:
      return role;
  }
};

export const EmployeesPage: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
    console.log('Saving employee data:', employeeData);
    if (currentEmployee) {
      console.log('Updating existing employee:', currentEmployee.id);
      updateEmployee({ ...currentEmployee, ...employeeData });
    } else {
      console.log('Adding new employee');
      addEmployee(employeeData);
    }
    setIsFormOpen(false);
    setCurrentEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    console.log('Editing employee:', employee.id);
    setCurrentEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Request to delete employee:', id);
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      console.log('Confirming deletion of employee:', showDeleteConfirm);
      deleteEmployee(showDeleteConfirm);
      setShowDeleteConfirm(null);
    } else {
      console.log('No employee ID to delete');
    }
  };

  // Fonction pour obtenir la couleur du badge en fonction du rôle
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gerant':
        return 'bg-purple-100 text-purple-800';
      case 'operateur':
        return 'bg-blue-100 text-blue-800';
      case 'comptoir':
        return 'bg-green-100 text-green-800';
      case 'livreur':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gestion des employés</h2>
        <button 
          onClick={() => {
            setCurrentEmployee(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <Plus size={16} />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {isFormOpen && (
        <EmployeeForm
          employee={currentEmployee || undefined}
          onSave={handleSaveEmployee}
          onClose={() => {
            setIsFormOpen(false);
            setCurrentEmployee(null);
          }}
        />
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Version mobile */}
      <div className="md:hidden space-y-3">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div key={employee.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <User size={16} className="mr-2 text-gray-500" />
                    {employee.name}
                  </h3>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {getRoleLabel(employee.role)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(employee);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(employee.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span>{employee.phone || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun employé enregistré
          </div>
        )}
      </div>
      
      {/* Version desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={18} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{employee.email}</div>
                    <div className="text-sm text-gray-500">{employee.phone || 'Non renseigné'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit size={16} className="inline mr-1" />
                        <span>Modifier</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="inline mr-1" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Aucun employé enregistré
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};