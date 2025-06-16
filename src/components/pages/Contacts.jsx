import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ContactForm from '@/components/organisms/ContactForm';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { contactService, companyService } from '@/services';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  useEffect(() => {
    loadContacts();
    loadCompanies();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contactService.getAll();
      setContacts(result);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const result = await companyService.getAll();
      setCompanies(result);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.position?.toLowerCase().includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.delete(contactId);
      setContacts(prev => prev.filter(c => c.Id !== contactId));
      setSelectedContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingContact(null);
    loadContacts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const getCompanyName = (companyId) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.Id === parseInt(companyId, 10));
    return company ? company.name : 'Unknown company';
  };

  const toggleSelectContact = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.Id)));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadContacts}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Contacts</h1>
            <p className="text-surface-600 mt-1">
              Manage your contact relationships ({filteredContacts.length} contacts)
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            icon="UserPlus"
          >
            Add Contact
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search contacts by name, email, or position..."
            />
          </div>
          {selectedContacts.size > 0 && (
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(`Delete ${selectedContacts.size} selected contacts?`)) {
                  Promise.all(
                    Array.from(selectedContacts).map(id => contactService.delete(id))
                  ).then(() => {
                    loadContacts();
                    setSelectedContacts(new Set());
                    toast.success('Selected contacts deleted');
                  }).catch(() => {
                    toast.error('Failed to delete some contacts');
                  });
                }
              }}
              icon="Trash2"
            >
              Delete ({selectedContacts.size})
            </Button>
          )}
        </div>

        {/* Contacts Table */}
        {filteredContacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description={searchQuery ? "Try adjusting your search terms" : "Get started by adding your first contact"}
            icon="Users"
            actionLabel={!searchQuery ? "Add Contact" : undefined}
            onAction={!searchQuery ? () => setShowForm(true) : undefined}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-primary-500 border-surface-300 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {filteredContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.Id)}
                          onChange={() => toggleSelectContact(contact.Id)}
                          className="w-4 h-4 text-primary-500 border-surface-300 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 font-medium text-sm">
                              {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-surface-900 truncate">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-sm text-surface-500 truncate">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-surface-900">
                          {getCompanyName(contact.companyId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-surface-900">
                          {contact.position || 'No position'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {contact.phone && (
                            <div className="flex items-center text-sm text-surface-600">
                              <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                              {contact.phone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-surface-600">
                            <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                            {contact.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-surface-500">
                          {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="p-2 text-surface-400 hover:text-primary-600 transition-colors"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.Id)}
                            className="p-2 text-surface-400 hover:text-red-600 transition-colors"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => handleFormCancel()}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ContactForm
                contact={editingContact}
                onSave={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Contacts;