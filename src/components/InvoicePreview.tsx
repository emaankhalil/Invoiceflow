import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Invoice, PrintFormat } from '../types/invoice';
import { formatCurrency } from '../utils/calculations';
import { getSettings } from '../utils/storage';

interface InvoicePreviewProps {
  invoice: Invoice;
  format: PrintFormat;
  onFormatChange: (format: PrintFormat) => void;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  format, 
  onFormatChange, 
  onClose 
}) => {
  const settings = getSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real application, you would use a library like jsPDF or html2pdf
    // For now, we'll just trigger the print dialog
    window.print();
  };

  const ThermalLayout = () => (
    <div className="thermal-receipt max-w-sm mx-auto bg-white p-4 text-sm font-mono">
      <div className="text-center mb-4">
        <h1 className="font-bold text-lg">{settings.company.name}</h1>
        <p className="text-xs">{settings.company.address.street}</p>
        <p className="text-xs">{settings.company.address.city}, {settings.company.address.state}</p>
        <p className="text-xs">{settings.company.phone}</p>
      </div>
      
      <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
        <div className="flex justify-between">
          <span>Invoice:</span>
          <span>{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(invoice.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-2">
        <p className="font-bold">Bill To:</p>
        <p className="text-xs">{invoice.client.name}</p>
        <p className="text-xs">{invoice.client.email}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
        {invoice.items.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between">
              <span className="text-xs truncate pr-2">{item.description}</span>
              <span className="text-xs">{formatCurrency(item.subtotal, invoice.currency)}</span>
            </div>
            <div className="text-xs text-gray-600">
              {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 pt-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        {invoice.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
        )}
        {invoice.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t border-dashed border-gray-400 pt-1">
          <span>Total:</span>
          <span>{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-4 text-xs">
          <p className="font-bold">Notes:</p>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="text-center mt-4 text-xs">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );

  const A4Layout = () => (
    <div className="a4-invoice bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings.company.name}</h1>
          <div className="text-gray-600">
            <p>{settings.company.address.street}</p>
            <p>{settings.company.address.city}, {settings.company.address.state} {settings.company.address.zipCode}</p>
            <p>{settings.company.address.country}</p>
            <p className="mt-2">{settings.company.phone}</p>
            <p>{settings.company.email}</p>
            {settings.company.website && <p>{settings.company.website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">INVOICE</h2>
          <div className="text-gray-600">
            <p><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</p>
            <p><span className="font-semibold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            {invoice.poNumber && <p><span className="font-semibold">PO #:</span> {invoice.poNumber}</p>}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold text-gray-900">{invoice.client.name}</p>
          <p className="text-gray-600">{invoice.client.email}</p>
          <p className="text-gray-600">{invoice.client.phone}</p>
          <div className="text-gray-600 mt-2">
            <p>{invoice.client.address.street}</p>
            <p>{invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.zipCode}</p>
            <p>{invoice.client.address.country}</p>
          </div>
          {invoice.client.taxId && (
            <p className="text-gray-600 mt-2"><span className="font-semibold">Tax ID:</span> {invoice.client.taxId}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-800">{item.description}</td>
                <td className="py-3 px-4 text-center text-gray-800">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-800">{formatCurrency(item.subtotal, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-semibold">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
          )}
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg mt-2">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {invoice.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
            <p className="text-gray-600 text-sm">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
            <p className="text-gray-600 text-sm">{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Information:</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-semibold">Account Name:</span> {settings.company.bankDetails.accountName}</p>
              <p><span className="font-semibold">Account Number:</span> {settings.company.bankDetails.accountNumber}</p>
            </div>
            <div>
              <p><span className="font-semibold">Bank Name:</span> {settings.company.bankDetails.bankName}</p>
              <p><span className="font-semibold">IBAN:</span> {settings.company.bankDetails.iban}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const A3Layout = () => (
    <div className="a3-invoice bg-white p-12 max-w-6xl mx-auto">
      {/* Similar to A4 but with more spacing and larger fonts */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{settings.company.name}</h1>
          <div className="text-gray-600 text-lg">
            <p>{settings.company.address.street}</p>
            <p>{settings.company.address.city}, {settings.company.address.state} {settings.company.address.zipCode}</p>
            <p>{settings.company.address.country}</p>
            <p className="mt-3">{settings.company.phone}</p>
            <p>{settings.company.email}</p>
            {settings.company.website && <p>{settings.company.website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">INVOICE</h2>
          <div className="text-gray-600 text-lg">
            <p><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</p>
            <p><span className="font-semibold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            {invoice.poNumber && <p><span className="font-semibold">PO #:</span> {invoice.poNumber}</p>}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bill To:</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="font-semibold text-gray-900 text-lg">{invoice.client.name}</p>
          <p className="text-gray-600">{invoice.client.email}</p>
          <p className="text-gray-600">{invoice.client.phone}</p>
          <div className="text-gray-600 mt-3">
            <p>{invoice.client.address.street}</p>
            <p>{invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.zipCode}</p>
            <p>{invoice.client.address.country}</p>
          </div>
          {invoice.client.taxId && (
            <p className="text-gray-600 mt-3"><span className="font-semibold">Tax ID:</span> {invoice.client.taxId}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
              <th className="text-center py-4 px-6 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 px-6 text-gray-800">{item.description}</td>
                <td className="py-4 px-6 text-center text-gray-800">{item.quantity}</td>
                <td className="py-4 px-6 text-right text-gray-800">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="py-4 px-6 text-right font-semibold text-gray-800">{formatCurrency(item.subtotal, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-80">
          <div className="flex justify-between py-3 border-b border-gray-200 text-lg">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-3 border-b border-gray-200 text-lg">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-semibold">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
          )}
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-3 border-b border-gray-200 text-lg">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 bg-blue-50 px-6 rounded-lg mt-3">
            <span className="text-xl font-bold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {invoice.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">Notes:</h4>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">Terms & Conditions:</h4>
            <p className="text-gray-600">{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="border-t border-gray-200 pt-8">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Payment Information:</h4>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><span className="font-semibold">Account Name:</span> {settings.company.bankDetails.accountName}</p>
              <p><span className="font-semibold">Account Number:</span> {settings.company.bankDetails.accountNumber}</p>
            </div>
            <div>
              <p><span className="font-semibold">Bank Name:</span> {settings.company.bankDetails.bankName}</p>
              <p><span className="font-semibold">IBAN:</span> {settings.company.bankDetails.iban}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => onFormatChange('thermal')}
                className={`px-3 py-1 text-sm rounded ${
                  format === 'thermal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Thermal
              </button>
              <button
                onClick={() => onFormatChange('a4')}
                className={`px-3 py-1 text-sm rounded ${
                  format === 'a4' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                A4
              </button>
              <button
                onClick={() => onFormatChange('a3')}
                className={`px-3 py-1 text-sm rounded ${
                  format === 'a3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                A3
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {format === 'thermal' && <ThermalLayout />}
          {format === 'a4' && <A4Layout />}
          {format === 'a3' && <A3Layout />}
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          .thermal-receipt {
            width: 80mm;
            font-size: 12px;
            line-height: 1.2;
          }
          
          .a4-invoice {
            width: 210mm;
            min-height: 297mm;
            font-size: 12px;
          }
          
          .a3-invoice {
            width: 297mm;
            min-height: 420mm;
            font-size: 14px;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;