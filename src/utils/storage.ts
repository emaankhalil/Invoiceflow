import { Invoice, Client, Product, Settings, Company } from '../types/invoice';

const STORAGE_KEYS = {
  INVOICES: 'invoiceflow_invoices',
  CLIENTS: 'invoiceflow_clients',
  PRODUCTS: 'invoiceflow_products',
  SETTINGS: 'invoiceflow_settings',
  LAST_INVOICE_NUMBER: 'invoiceflow_lastInvoiceNumber',
};

// Default settings
const DEFAULT_COMPANY: Company = {
  name: 'Your Company Name',
  email: 'contact@company.com',
  phone: '+1 (555) 123-4567',
  website: 'www.company.com',
  address: {
    street: '123 Business St',
    city: 'Business City',
    state: 'BC',
    zipCode: '12345',
    country: 'United States',
  },
  taxId: '12-3456789',
  bankDetails: {
    accountName: 'Your Company Name',
    accountNumber: '1234567890',
    bankName: 'Business Bank',
    iban: 'GB29 NWBK 6016 1331 9268 19',
  },
};

const DEFAULT_SETTINGS: Settings = {
  company: DEFAULT_COMPANY,
  defaultTaxRate: 8.5,
  defaultCurrency: 'PKR',
  invoicePrefix: 'INV-',
  invoiceStartNumber: 1,
  defaultTerms: 'Payment is due within 30 days of invoice date. Late payments may be subject to fees.',
  defaultNotes: 'Thank you for your business!',
};

// Generic storage functions
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Invoice functions
export const getInvoices = async (): Promise<Invoice[]> => {
  return getStorageItem(STORAGE_KEYS.INVOICES, []);
};

export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  const invoices = await getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push(invoice);
  }
  
  setStorageItem(STORAGE_KEYS.INVOICES, invoices);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const invoices = await getInvoices();
  const filteredInvoices = invoices.filter(inv => inv.id !== id);
  setStorageItem(STORAGE_KEYS.INVOICES, filteredInvoices);
};

// Client functions
export const getClients = async (): Promise<Client[]> => {
  return getStorageItem(STORAGE_KEYS.CLIENTS, []);
};

export const saveClient = async (client: Client): Promise<void> => {
  const clients = await getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  setStorageItem(STORAGE_KEYS.CLIENTS, clients);
};

export const deleteClient = async (id: string): Promise<void> => {
  const clients = await getClients();
  const filteredClients = clients.filter(c => c.id !== id);
  setStorageItem(STORAGE_KEYS.CLIENTS, filteredClients);
};

// Product functions
export const getProducts = async (): Promise<Product[]> => {
  return getStorageItem(STORAGE_KEYS.PRODUCTS, []);
};

export const saveProduct = async (product: Product): Promise<void> => {
  const products = await getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  setStorageItem(STORAGE_KEYS.PRODUCTS, products);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const products = await getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  setStorageItem(STORAGE_KEYS.PRODUCTS, filteredProducts);
};

// Settings functions
export const getSettings = (): Settings => {
  return getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveSettings = (settings: Settings): void => {
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);
};

// Invoice number functions
export const getNextInvoiceNumber = (): number => {
  const lastNumber = getStorageItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, 0);
  const nextNumber = lastNumber + 1;
  setStorageItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, nextNumber);
  return nextNumber;
};

// Data export/import functions for backup
export const exportData = (): string => {
  const data = {
    invoices: getStorageItem(STORAGE_KEYS.INVOICES, []),
    clients: getStorageItem(STORAGE_KEYS.CLIENTS, []),
    products: getStorageItem(STORAGE_KEYS.PRODUCTS, []),
    settings: getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    lastInvoiceNumber: getStorageItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, 0),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.invoices) setStorageItem(STORAGE_KEYS.INVOICES, data.invoices);
    if (data.clients) setStorageItem(STORAGE_KEYS.CLIENTS, data.clients);
    if (data.products) setStorageItem(STORAGE_KEYS.PRODUCTS, data.products);
    if (data.settings) setStorageItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.lastInvoiceNumber) setStorageItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, data.lastInvoiceNumber);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};