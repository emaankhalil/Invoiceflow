import React, { useState, useEffect } from 'react';
import { Save, Building2, CreditCard, FileText, Globe, Download, Upload, Trash2 } from 'lucide-react';
import { Settings as SettingsType } from '../types/invoice';
import { getSettings, saveSettings, exportData, importData, clearAllData } from '../utils/storage';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>(getSettings());
  const [activeSection, setActiveSection] = useState('company');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoiceflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        alert('Data imported successfully! Please refresh the page to see the changes.');
        window.location.reload();
      } else {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      alert('All data has been cleared. The page will now refresh.');
      window.location.reload();
    }
  };

  const sections = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'payment', label: 'Payment Info', icon: CreditCard },
    { id: 'defaults', label: 'Defaults', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Download },
  ];

  const renderCompanySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={settings.company.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={settings.company.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={settings.company.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={settings.company.website}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, website: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID
            </label>
            <input
              type="text"
              value={settings.company.taxId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, taxId: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Company Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={settings.company.address.street}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  address: { ...prev.company.address, street: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={settings.company.address.city}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  address: { ...prev.company.address, city: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province *
            </label>
            <input
              type="text"
              value={settings.company.address.state}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  address: { ...prev.company.address, state: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP/Postal Code *
            </label>
            <input
              type="text"
              value={settings.company.address.zipCode}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  address: { ...prev.company.address, zipCode: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={settings.company.address.country}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  address: { ...prev.company.address, country: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Prefix
            </label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="INV-"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Number
            </label>
            <input
              type="number"
              value={settings.invoiceStartNumber}
              onChange={(e) => setSettings(prev => ({ ...prev, invoiceStartNumber: parseInt(e.target.value) || 1 }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="PKR">PKR - Pakistani Rupee</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Tax Rate (%)
        </label>
        <input
          type="number"
          value={settings.defaultTaxRate}
          onChange={(e) => setSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
          min="0"
          max="100"
          step="0.01"
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={settings.company.bankDetails.accountName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  bankDetails: { ...prev.company.bankDetails, accountName: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={settings.company.bankDetails.accountNumber}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  bankDetails: { ...prev.company.bankDetails, accountNumber: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.company.bankDetails.bankName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  bankDetails: { ...prev.company.bankDetails, bankName: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={settings.company.bankDetails.iban}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  bankDetails: { ...prev.company.bankDetails, iban: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="GB29 NWBK 6016 1331 9268 19"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Values</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Notes
            </label>
            <textarea
              value={settings.defaultNotes}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Thank you for your business!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Terms & Conditions
            </label>
            <textarea
              value={settings.defaultTerms}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultTerms: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Payment is due within 30 days..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Export your data for backup or import data from a previous backup. All data is stored locally in your browser.
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Export Data</h4>
            <p className="text-blue-700 text-sm mb-3">
              Download all your invoices, clients, products, and settings as a JSON file.
            </p>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Import Data</h4>
            <p className="text-green-700 text-sm mb-3">
              Import data from a previously exported JSON file. This will replace all current data.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm sm:text-base"
              >
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
              </label>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Clear All Data</h4>
            <p className="text-red-700 text-sm mb-3">
              Permanently delete all invoices, clients, products, and settings. This action cannot be undone.
            </p>
            <button
              onClick={handleClearAllData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'company':
        return renderCompanySection();
      case 'invoice':
        return renderInvoiceSection();
      case 'payment':
        return renderPaymentSection();
      case 'defaults':
        return renderDefaultsSection();
      case 'data':
        return renderDataSection();
      default:
        return renderCompanySection();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600 text-sm sm:text-base">Configure your invoice generator preferences</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r">
            <nav className="p-4">
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;