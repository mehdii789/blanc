import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InvoicesList } from '../components/invoices/InvoicesList';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { Invoice } from '../types';

const InvoicesPage: React.FC = () => {
  const { invoices, customers, setInvoices, generatePdf } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Sauvegarder les factures dans le stockage local à chaque modification
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleSave = (formData: any) => {
    if (currentInvoice) {
      // Mise à jour d'une facture existante
      setInvoices(
        invoices.map((inv) =>
          inv.id === currentInvoice.id
            ? { ...formData, id: currentInvoice.id, updatedAt: new Date() }
            : inv
        )
      );
    } else {
      // Création d'une nouvelle facture
      const newInvoice: Invoice = {
        ...formData,
        id: `inv_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setInvoices([...invoices, newInvoice]);
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
      setInvoices(invoices.filter((inv) => inv.id !== id));
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
        onGeneratePdf={generatePdf}
        onCreateNew={() => setShowForm(true)}
      />
    </div>
  );
};

export default InvoicesPage;
