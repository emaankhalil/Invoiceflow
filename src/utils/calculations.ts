import { InvoiceItem, Invoice } from '../types/invoice';

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
};

export const calculateItemSubtotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return (subtotal * taxRate) / 100;
};

export const calculateDiscountAmount = (
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  }
  return discountValue;
};

export const calculateTotal = (invoice: Partial<Invoice>): number => {
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.taxAmount || 0;
  const discountAmount = invoice.discountAmount || 0;
  return Math.max(0, subtotal + taxAmount - discountAmount);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyConfig = {
    'USD': { locale: 'en-US', currency: 'USD' },
    'EUR': { locale: 'de-DE', currency: 'EUR' },
    'GBP': { locale: 'en-GB', currency: 'GBP' },
    'CAD': { locale: 'en-CA', currency: 'CAD' },
    'PKR': { locale: 'en-PK', currency: 'PKR' },
  };

  const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.USD;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
};

export const generateInvoiceNumber = (prefix: string, number: number): string => {
  return `${prefix}${number.toString().padStart(4, '0')}`;
};