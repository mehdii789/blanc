import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Invoice } from '../../types';

interface InvoicePDFProps {
  invoice: Invoice;
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
    phone: string;
    siret: string;
  };
  customer: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    email?: string;
    phone?: string;
  };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, customer }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facture</h1>
          <p className="text-gray-500">N° {invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{company.name}</h2>
          <p className="text-sm text-gray-600">{company.address}</p>
          <p className="text-sm text-gray-600">
            {company.postalCode} {company.city}
          </p>
          <p className="text-sm text-gray-600">SIRET: {company.siret}</p>
        </div>
      </div>

      {/* Informations client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Facturé à</h3>
          <p className="font-medium">{customer.name}</p>
          <p className="text-gray-600">{customer.address}</p>
          <p className="text-gray-600">
            {customer.postalCode} {customer.city}
          </p>
          {customer.email && (
            <p className="text-gray-600">{customer.email}</p>
          )}
          {customer.phone && (
            <p className="text-gray-600">{customer.phone}</p>
          )}
        </div>
        <div className="md:text-right">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Date d'émission</h3>
            <p>{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">Date d'échéance</h3>
            <p>{formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Détails de la facture */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 text-sm font-medium text-gray-500 uppercase">Description</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-500 uppercase">Qté</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-500 uppercase">Prix unitaire</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">{item.description}</td>
                <td className="text-right py-3">{item.quantity}</td>
                <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-3 font-medium">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="ml-auto max-w-xs">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Sous-total</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">TVA (20%)</span>
          <span>{formatCurrency(invoice.tax)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Remise</span>
            <span>-{formatCurrency(invoice.discount)}</span>
          </div>
        )}
        <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200 mt-2 pt-3">
          <span>Total</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Pied de page */}
      <div className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>{company.name} - {company.address} - {company.postalCode} {company.city}</p>
        <p>Tél: {company.phone} - Email: {company.email} - SIRET: {company.siret}</p>
      </div>
    </div>
  );
};

export default InvoicePDF;
