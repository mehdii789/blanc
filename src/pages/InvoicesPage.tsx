import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { InvoicesList } from '../components/invoices/InvoicesList';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { Invoice } from '../types';

const InvoicesPage: React.FC = () => {
  const { invoices, customers, addInvoice, updateInvoice, deleteInvoice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Le stockage localStorage est maintenant géré dans AppContext

  const handleSave = (formData: any) => {
    if (currentInvoice) {
      // Mise à jour d'une facture existante
      const updatedInvoice: Invoice = {
        ...formData,
        id: currentInvoice.id,
        createdAt: currentInvoice.createdAt,
        updatedAt: new Date(),
        status: formData.status || currentInvoice.status
      };
      updateInvoice(updatedInvoice);
    } else {
      // Création d'une nouvelle facture
      addInvoice(formData);
    }
    setShowForm(false);
    setCurrentInvoice(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        deleteInvoice(id);
        console.log('Facture supprimée avec succès:', id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la facture');
      }
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setCurrentInvoice(null);
  };

  if (showForm || currentInvoice) {
    return (
      <div className="container mx-auto px-4 py-6">
        <InvoiceForm
          invoice={currentInvoice || undefined}
          onSave={handleSave}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <InvoicesList
        invoices={invoices}
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onGeneratePdf={() => console.log('PDF generation not implemented yet')}
        onCreateNew={() => setShowForm(true)}
      />
    </div>
  );
};

export default InvoicesPage;
