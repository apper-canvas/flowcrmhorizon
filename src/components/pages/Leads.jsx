import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { leadService, contactService, companyService } from '@/services';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedLead, setDraggedLead] = useState(null);

  const stages = [
    { id: 'New', label: 'New', color: 'bg-gray-100 text-gray-800' },
    { id: 'Contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
    { id: 'Qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
    { id: 'Won', label: 'Won', color: 'bg-green-100 text-green-800' },
    { id: 'Lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [leadsResult, contactsResult, companiesResult] = await Promise.all([
        leadService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ]);
      setLeads(leadsResult);
      setContacts(contactsResult);
      setCompanies(companiesResult);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = leads.filter(lead =>
      lead.title.toLowerCase().includes(query) ||
      getContactName(lead.contactId).toLowerCase().includes(query) ||
      getCompanyName(lead.companyId).toLowerCase().includes(query)
    );
    setFilteredLeads(filtered);
  };

  const getContactName = (contactId) => {
    if (!contactId) return 'No contact';
    const contact = contacts.find(c => c.Id === parseInt(contactId, 10));
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown contact';
  };

  const getCompanyName = (companyId) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.Id === parseInt(companyId, 10));
    return company ? company.name : 'Unknown company';
  };

  const getLeadsByStage = (stage) => {
    return filteredLeads.filter(lead => lead.stage === stage);
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedLead || draggedLead.stage === newStage) {
      setDraggedLead(null);
      return;
    }

    try {
      await leadService.update(draggedLead.Id, { ...draggedLead, stage: newStage });
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.Id === draggedLead.Id 
            ? { ...lead, stage: newStage }
            : lead
        )
      );
      
      toast.success(`Lead moved to ${newStage}`);
    } catch (error) {
      toast.error('Failed to update lead stage');
    }
    
    setDraggedLead(null);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadService.delete(leadId);
      setLeads(prev => prev.filter(l => l.Id !== leadId));
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={1} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Leads</h1>
          <p className="text-surface-600 mt-1">
            Manage your sales pipeline ({filteredLeads.length} leads)
          </p>
        </div>
        <div className="text-sm text-surface-600 bg-white px-4 py-2 rounded-lg border border-surface-200">
          Total Value: ${leads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search leads by title, contact, or company..."
        />
      </div>

      {/* Pipeline */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description={searchQuery ? "Try adjusting your search terms" : "Your sales pipeline is empty"}
          icon="TrendingUp"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[500px]">
            {stages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const stageValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

              return (
                <div
                  key={stage.id}
                  className="bg-surface-50 rounded-lg p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={stage.color}>{stage.label}</Badge>
                    <span className="text-xs text-surface-500">
                      {stageLeads.length} • ${stageValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {stageLeads.map((lead, index) => (
                      <motion.div
                        key={lead.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        className="bg-white rounded-lg p-4 shadow-sm border border-surface-200 cursor-move 
                                   hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-surface-900 text-sm truncate flex-1">
                              {lead.title}
                            </h4>
                            <button
                              onClick={() => handleDelete(lead.Id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-surface-400 hover:text-red-600 transition-all"
                            >
                              <ApperIcon name="Trash2" className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-xs text-surface-600 space-y-1">
                            <div className="truncate">
                              <ApperIcon name="Building2" className="w-3 h-3 inline mr-1" />
                              {getCompanyName(lead.companyId)}
                            </div>
                            <div className="truncate">
                              <ApperIcon name="User" className="w-3 h-3 inline mr-1" />
                              {getContactName(lead.contactId)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-accent-600">
                              ${lead.value?.toLocaleString() || '0'}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-surface-500">
                              <ApperIcon name="Target" className="w-3 h-3" />
                              <span>{lead.probability || 0}%</span>
                            </div>
                          </div>

                          {lead.expectedCloseDate && (
                            <div className="text-xs text-surface-500">
                              <ApperIcon name="Calendar" className="w-3 h-3 inline mr-1" />
                              {format(new Date(lead.expectedCloseDate), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-surface-400">
                        <ApperIcon name="Inbox" className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">No leads in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;