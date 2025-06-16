import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import CompanyForm from '@/components/organisms/CompanyForm';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { companyService, contactService } from '@/services';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
    loadContacts();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchQuery]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await companyService.getAll();
      setCompanies(result);
    } catch (err) {
      setError(err.message || 'Failed to load companies');
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const result = await contactService.getAll();
      setContacts(result);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const filterCompanies = () => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query)
    );
    setFilteredCompanies(filtered);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      await companyService.delete(companyId);
      setCompanies(prev => prev.filter(c => c.Id !== companyId));
      toast.success('Company deleted successfully');
    } catch (error) {
      toast.error('Failed to delete company');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCompany(null);
    loadCompanies();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  const getContactCount = (companyId) => {
    return contacts.filter(contact => contact.companyId === companyId).length;
  };

  const getSizeColor = (size) => {
    switch (size) {
      case 'Small (1-50)': return 'bg-blue-100 text-blue-800';
      case 'Medium (50-200)': return 'bg-yellow-100 text-yellow-800';
      case 'Large (200+)': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadCompanies}
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
            <h1 className="text-2xl font-bold text-surface-900">Companies</h1>
            <p className="text-surface-600 mt-1">
              Manage your company relationships ({filteredCompanies.length} companies)
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            icon="Building2"
          >
            Add Company
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search companies by name or industry..."
          />
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <EmptyState
            title="No companies found"
            description={searchQuery ? "Try adjusting your search terms" : "Get started by adding your first company"}
            icon="Building2"
            actionLabel={!searchQuery ? "Add Company" : undefined}
            onAction={!searchQuery ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Company Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="Building2" className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-surface-900 truncate">
                          {company.name}
                        </h3>
                        <p className="text-sm text-surface-500 truncate">
                          {company.industry || 'No industry'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-2 text-surface-400 hover:text-primary-600 transition-colors"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.Id)}
                        className="p-2 text-surface-400 hover:text-red-600 transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3">
                    {company.size && (
                      <Badge className={getSizeColor(company.size)}>
                        {company.size}
                      </Badge>
                    )}

                    {company.website && (
                      <div className="flex items-center text-sm text-surface-600">
                        <ApperIcon name="Globe" className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a 
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 transition-colors truncate"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-surface-600">
                      <ApperIcon name="Users" className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{getContactCount(company.Id)} contacts</span>
                    </div>

                    <div className="flex items-center text-sm text-surface-600">
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Added {format(new Date(company.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {company.notes && (
                    <div className="pt-3 border-t border-surface-200">
                      <p className="text-sm text-surface-600 line-clamp-2">
                        {company.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Company Form Modal */}
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
              <CompanyForm
                company={editingCompany}
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

export default Companies;