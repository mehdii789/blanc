export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  // Utiliser 'fr-FR' pour le format français
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long', // Utiliser 'long' pour avoir le mois en toutes lettres
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Utiliser le format 24h
  }).format(date);
};

export const formatPhoneNumber = (phone: string): string => {
  // Simple formatter for a variety of phone formats
  // This is a basic implementation and might need to be adjusted
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  // If it doesn't match expected formats, return as is
  return phone;
};