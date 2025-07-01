export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Company {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  logo?: string;
  taxId: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    iban: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  poNumber?: string;
  currency: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type PrintFormat = 'thermal' | 'a4' | 'a3';

export interface Settings {
  company: Company;
  defaultTaxRate: number;
  defaultCurrency: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  defaultTerms: string;
  defaultNotes: string;
}