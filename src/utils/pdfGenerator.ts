import { jsPDF } from 'jspdf';
import { Invoice } from '../types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const generatePdf = async (
  invoice: Invoice, 
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
    phone: string;
    siret: string;
  }, 
  customer: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    email?: string;
    phone?: string;
  }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPos = 30;

  // En-tête
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', margin, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;

  // Coordonnées de l'entreprise
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, margin, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, margin, yPos);
  yPos += 5;
  doc.text(`${company.postalCode} ${company.city}`, margin, yPos);
  yPos += 5;
  doc.text(`SIRET: ${company.siret}`, margin, yPos);
  yPos += 5;
  doc.text(`Tél: ${company.phone}`, margin, yPos);
  yPos += 5;
  doc.text(`Email: ${company.email}`, margin, yPos);
  yPos += 15;

  // Coordonnées du client
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', margin, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, margin, yPos);
  yPos += 5;
  doc.text(customer.address, margin, yPos);
  yPos += 5;
  doc.text(`${customer.postalCode} ${customer.city}`, margin, yPos);
  yPos += 5;
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, margin, yPos);
    yPos += 5;
  }
  if (customer.phone) {
    doc.text(`Tél: ${customer.phone}`, margin, yPos);
    yPos += 5;
  }
  yPos += 10;

  // Dates
  doc.text(`Date d'émission: ${formatDate(invoice.issueDate)}`, margin, yPos);
  yPos += 5;
  doc.text(`Date d'échéance: ${formatDate(invoice.dueDate)}`, margin, yPos);
  yPos += 15;

  // En-tête du tableau
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPos, maxWidth, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 2, yPos + 7);
  doc.text('Qté', pageWidth - margin - 60, yPos + 7, { align: 'right' });
  doc.text('Prix unitaire', pageWidth - margin - 30, yPos + 7, { align: 'right' });
  doc.text('Total', pageWidth - margin, yPos + 7, { align: 'right' });
  yPos += 12;

  // Lignes des articles
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.text(item.description, margin + 2, yPos + 7, { maxWidth: maxWidth - 80 });
    
    // Vérifier si la description est trop longue et ajuster yPos si nécessaire
    const descLines = doc.splitTextToSize(item.description, maxWidth - 80);
    const lineHeight = 7;
    
    doc.text(item.quantity.toString(), pageWidth - margin - 60, yPos + 7, { align: 'right' });
    doc.text(formatCurrency(item.unitPrice), pageWidth - margin - 30, yPos + 7, { align: 'right' });
    doc.text(formatCurrency(item.quantity * item.unitPrice), pageWidth - margin, yPos + 7, { align: 'right' });
    
    yPos += Math.max(descLines.length * lineHeight, 10);
  });

  // Totaux
  yPos += 10;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.text('Sous-total:', pageWidth - margin - 40, yPos, { align: 'right' });
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, yPos, { align: 'right' });
  yPos += 7;

  doc.text('TVA (20%):', pageWidth - margin - 40, yPos, { align: 'right' });
  doc.text(formatCurrency(invoice.tax), pageWidth - margin, yPos, { align: 'right' });
  yPos += 7;

  if (invoice.discount > 0) {
    doc.text('Remise:', pageWidth - margin - 40, yPos, { align: 'right' });
    doc.text(`-${formatCurrency(invoice.discount)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 100, yPos + 3, pageWidth - margin, yPos + 3);
  yPos += 10;
  
  doc.text('TOTAL:', pageWidth - margin - 40, yPos, { align: 'right' });
  doc.text(formatCurrency(invoice.total), pageWidth - margin, yPos, { align: 'right' });

  // Notes
  if (invoice.notes) {
    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Notes:', margin, yPos);
    yPos += 5;
    const notes = doc.splitTextToSize(invoice.notes, maxWidth);
    doc.text(notes, margin, yPos);
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} sur ${pageCount}`, 
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
    
    // Ligne de séparation
    doc.setLineWidth(0.1);
    doc.line(
      margin,
      doc.internal.pageSize.getHeight() - 15,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 15
    );
    
    // Coordonnées en bas de page
    doc.setFontSize(7);
    doc.text(
      `${company.name} - ${company.address} - ${company.postalCode} ${company.city} - Tél: ${company.phone} - SIRET: ${company.siret}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Téléchargement du PDF
  doc.save(`facture-${invoice.invoiceNumber}.pdf`);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
