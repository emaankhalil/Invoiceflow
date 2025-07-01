import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Copy, FileText, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { Invoice } from '../types/invoice';
import { getInvoices, deleteInvoice, saveInvoice } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';
import InvoicePreview from './InvoicePreview';

interface InvoiceHistoryProps {
  onEditInvoice: (invoice: Invoice) => void;
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ onEditInvoice }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'thermal' | 'a4' | 'a3'>('a4');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const loadedInvoices = await getInvoices();
      const sortedInvoices = loadedInvoices.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInvoices(sortedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice. Please try again.');
      }
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const duplicatedInvoice: Invoice = {
        ...invoice,
        id: crypto.randomUUID(),
        invoiceNumber: `${invoice.invoiceNumber}-COPY`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await saveInvoice(duplicatedInvoice);
      await loadInvoices();
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Error duplicating invoice. Please try again.');
    }
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
    try {
      const updatedInvoice = {
        ...invoice,
        status: newStatus as Invoice['status'],
        updatedAt: new Date().toISOString(),
      };
      
      await saveInvoice(updatedInvoice);
      await loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Error updating invoice status. Please try again.');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-3 w-3" />;
      case 'sent':
        return <Send className="h-3 w-3" />;
      case 'paid':
        return <CheckCircle className="h-3 w-3" />;
      case 'overdue':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <Clock className="h-3 w-3" />;
      default:
        return <Edit className="h-3 w-3" />;
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice History</h2>
          <div className="text-sm text-gray-500">
            {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria.'
                : 'Create your first invoice to get started.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Due Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600 text-sm">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{invoice.client.name}</p>
                          <p className="text-xs text-gray-500">{invoice.client.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-sm">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                          </span>
                          <select
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(invoice, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setPreviewInvoice(invoice)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEditInvoice(invoice)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(invoice)}
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-blue-600 text-sm">{invoice.invoiceNumber}</h3>
                      <p className="font-medium text-gray-900 text-sm">{invoice.client.name}</p>
                      <p className="text-xs text-gray-500">{invoice.client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(invoice.total, invoice.currency)}</p>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                    <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(invoice)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          format={previewFormat}
          onFormatChange={setPreviewFormat}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceHistory;