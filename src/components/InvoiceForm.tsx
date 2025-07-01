import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Package, Eye, Save } from 'lucide-react';
import { Invoice, InvoiceItem, Client, Product, PrintFormat } from '../types/invoice';
import { 
  calculateItemSubtotal, 
  calculateSubtotal, 
  calculateTaxAmount, 
  calculateDiscountAmount, 
  calculateTotal,
  generateInvoiceNumber,
  formatCurrency 
} from '../utils/calculations';
import { getSettings, getNextInvoiceNumber, getClients, getProducts, saveInvoice } from '../utils/storage';
import ClientModal from './ClientModal';
import ProductModal from './ProductModal';
import InvoicePreview from './InvoicePreview';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave }) => {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    id: invoice?.id || crypto.randomUUID(),
    invoiceNumber: invoice?.invoiceNumber || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    poNumber: invoice?.poNumber || '',
    currency: invoice?.currency || 'PKR',
    client: invoice?.client || undefined,
    items: invoice?.items || [],
    subtotal: invoice?.subtotal || 0,
    taxRate: invoice?.taxRate || 0,
    taxAmount: invoice?.taxAmount || 0,
    discountType: invoice?.discountType || 'percentage',
    discountValue: invoice?.discountValue || 0,
    discountAmount: invoice?.discountAmount || 0,
    total: invoice?.total || 0,
    notes: invoice?.notes || '',
    terms: invoice?.terms || '',
    status: invoice?.status || 'draft',
    createdAt: invoice?.createdAt || new Date().toISOString(),
    updatedAt: invoice?.updatedAt || new Date().toISOString(),
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<PrintFormat>('a4');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      const settings = getSettings();
      if (!invoice) {
        const nextNumber = getNextInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(settings.invoicePrefix, nextNumber),
          taxRate: settings.defaultTaxRate,
          currency: settings.defaultCurrency,
          notes: settings.defaultNotes,
          terms: settings.defaultTerms,
        }));
      }
      
      try {
        const [clientsData, productsData] = await Promise.all([
          getClients(),
          getProducts()
        ]);
        setClients(clientsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    initializeForm();
  }, [invoice]);

  useEffect(() => {
    // Recalculate totals whenever items, tax, or discount change
    const items = formData.items || [];
    const subtotal = calculateSubtotal(items);
    const taxAmount = calculateTaxAmount(subtotal, formData.taxRate || 0);
    const discountAmount = calculateDiscountAmount(subtotal, formData.discountType || 'percentage', formData.discountValue || 0);
    const total = calculateTotal({ subtotal, taxAmount, discountAmount });

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discountAmount,
      total,
    }));
  }, [formData.items, formData.taxRate, formData.discountType, formData.discountValue]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.subtotal = calculateItemSubtotal(updatedItem.quantity, updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id),
    }));
  };

  const selectProduct = (product: Product) => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: product.description,
      quantity: 1,
      unitPrice: product.price,
      subtotal: product.price,
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const handleSave = async (status: Invoice['status'] = 'draft') => {
    if (!formData.client || (formData.items || []).length === 0) {
      alert('Please add a client and at least one item before saving.');
      return;
    }

    setLoading(true);
    try {
      const invoiceToSave: Invoice = {
        ...formData,
        client: formData.client!,
        items: formData.items!,
        subtotal: formData.subtotal!,
        taxRate: formData.taxRate!,
        taxAmount: formData.taxAmount!,
        discountType: formData.discountType!,
        discountValue: formData.discountValue!,
        discountAmount: formData.discountAmount!,
        total: formData.total!,
        notes: formData.notes!,
        terms: formData.terms!,
        status: status,
        createdAt: formData.createdAt!,
        updatedAt: new Date().toISOString(),
      } as Invoice;

      await saveInvoice(invoiceToSave);
      onSave(invoiceToSave);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error refreshing clients:', error);
    }
  };

  const refreshProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-orange-100 text-orange-800' },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save as Draft</span>
                <span className="sm:hidden">Draft</span>
              </button>
              <button
                onClick={() => handleSave('sent')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save & Send</span>
                <span className="sm:hidden">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number (Optional)
            </label>
            <input
              type="text"
              value={formData.poNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, poNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="PKR">PKR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Badge */}
        {formData.status && (
          <div className="mt-4">
            <span className={`inline-block px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
              statusOptions.find(opt => opt.value === formData.status)?.color || 'bg-gray-100 text-gray-800'
            }`}>
              {statusOptions.find(opt => opt.value === formData.status)?.label || 'Draft'}
            </span>
          </div>
        )}
      </div>

      {/* Client Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
          >
            <Users className="h-4 w-4" />
            <span>Select Client</span>
          </button>
        </div>

        {formData.client ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{formData.client.name}</h4>
            <p className="text-gray-600 text-sm sm:text-base">{formData.client.email}</p>
            <p className="text-gray-600 text-sm sm:text-base">{formData.client.phone}</p>
            <div className="text-gray-600 text-sm mt-2">
              <p>{formData.client.address.street}</p>
              <p>{formData.client.address.city}, {formData.client.address.state} {formData.client.address.zipCode}</p>
              <p>{formData.client.address.country}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm sm:text-base">No client selected</p>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base"
            >
              <Package className="h-4 w-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={addItem}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Description</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700 w-20 sm:w-24 text-sm">Qty</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700 w-24 sm:w-32 text-sm">Unit Price</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700 w-24 sm:w-32 text-sm">Subtotal</th>
                <th className="w-10 sm:w-12"></th>
              </tr>
            </thead>
            <tbody>
              {(formData.items || []).map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-sm">
                    {formatCurrency(item.subtotal, formData.currency)}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(formData.items || []).length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
            No items added yet. Click "Add Item" or "Add Product" to get started.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tax & Discount</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(formData.subtotal || 0, formData.currency)}</span>
              </div>
              
              {(formData.taxAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(formData.taxAmount || 0, formData.currency)}</span>
                </div>
              )}
              
              {(formData.discountAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(formData.discountAmount || 0, formData.currency)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(formData.total || 0, formData.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Additional notes for the client..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Payment terms and conditions..."
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showClientModal && (
        <ClientModal
          clients={clients}
          onSelect={(client) => {
            setFormData(prev => ({ ...prev, client }));
            setShowClientModal(false);
          }}
          onClose={() => setShowClientModal(false)}
          onClientSaved={refreshClients}
        />
      )}

      {showProductModal && (
        <ProductModal
          products={products}
          onSelect={(product) => {
            selectProduct(product);
            setShowProductModal(false);
          }}
          onClose={() => setShowProductModal(false)}
          onProductSaved={refreshProducts}
        />
      )}

      {showPreview && formData.client && (formData.items || []).length > 0 && (
        <InvoicePreview
          invoice={formData as Invoice}
          format={previewFormat}
          onFormatChange={setPreviewFormat}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default InvoiceForm;