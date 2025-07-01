import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Client } from '../types/invoice';
import { getClients, deleteClient } from '../utils/storage';
import ClientModal from './ClientModal';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        await loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client. Please try again.');
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Client Management</h2>
            <p className="text-gray-600 text-sm sm:text-base">Manage your client database</p>
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Add your first client to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">{client.name}</h3>
                    <p className="text-gray-600 text-sm truncate">{client.email}</p>
                    <p className="text-gray-600 text-sm">{client.phone}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit client"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete client"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-600 text-sm space-y-1">
                  <p><strong>Address:</strong></p>
                  <p className="truncate">{client.address.street}</p>
                  <p className="truncate">{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                  <p className="truncate">{client.address.country}</p>
                  {client.taxId && (
                    <p className="mt-2 truncate"><strong>Tax ID:</strong> {client.taxId}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ClientModal
          clients={editingClient ? [editingClient] : []}
          onSelect={() => {}}
          onClose={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
          onClientSaved={() => {
            loadClients();
            setShowModal(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientManagement;