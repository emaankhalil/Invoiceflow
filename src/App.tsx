import React, { useState } from 'react';
import Layout from './components/Layout';
import InvoiceForm from './components/InvoiceForm';
import InvoiceHistory from './components/InvoiceHistory';
import ClientManagement from './components/ClientManagement';
import ProductManagement from './components/ProductManagement';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'create':
        return <InvoiceForm onSave={() => setActiveTab('history')} />;
      case 'history':
        return <InvoiceHistory onEditInvoice={() => setActiveTab('create')} />;
      case 'clients':
        return <ClientManagement />;
      case 'products':
        return <ProductManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <InvoiceForm onSave={() => setActiveTab('history')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;