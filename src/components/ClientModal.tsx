import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { Client } from '../types/invoice';
import { saveClient, deleteClient } from '../utils/storage';

interface ClientModalProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onClose: () => void;
  onClientSaved: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ 
  clients, 
  onSelect, 
  onClose, 
  onClientSaved 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    taxId: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      taxId: '',
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in the required fields (Name and Email).');
      return;
    }

    setLoading(true);
    try {
      const clientToSave: Client = {
        id: editingClient?.id || crypto.randomUUID(),
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone!,
        address: formData.address!,
        taxId: formData.taxId,
      };

      await saveClient(clientToSave);
      
      // Refresh the client list
      await onClientSaved();
      
      // If this is a new client and we're in selection mode, auto-select it
      if (!editingClient && onSelect) {
        onSelect(clientToSave);
        onClose();
        return;
      }
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId);
        onClientSaved();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client. Please try again.');
      }
    }
  };

  const handleClientSelect = (client: Client) => {
    onSelect(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {showForm ? (editingClient ? 'Edit Client' : 'Add New Client') : 'Select Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Choose an existing client or add a new one.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Client</span>
                </button>
              </div>

              <div className="space-y-3">
                {clients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No clients found. Add your first client to get started.
                  </div>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer" 
                          onClick={() => handleClientSelect(client)}
                        >
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-gray-600">{client.email}</p>
                          <p className="text-gray-500 text-sm">{client.phone}</p>
                          <div className="text-gray-500 text-sm mt-1">
                            <p>{client.address.street}</p>
                            <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(client);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit client"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(client.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete client"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company or individual name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tax identification number"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address?.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, street: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address?.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Karachi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.address?.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sindh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.address?.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, zipCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="75500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.address?.country}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, country: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pakistan"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      {editingClient ? 'Update Client' : 'Save & Select Client'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientModal;