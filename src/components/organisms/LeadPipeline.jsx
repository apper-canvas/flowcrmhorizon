import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { leadService, contactService, companyService } from '@/services';

const LeadPipeline = () => {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsResult, contactsResult, companiesResult] = await Promise.all([
        leadService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ]);
      setLeads(leadsResult);
      setContacts(contactsResult);
      setCompanies(companiesResult);
    } catch (error) {
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
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
    return leads.filter(lead => lead.stage === stage);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-20 bg-surface-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900">Sales Pipeline</h3>
        <div className="text-sm text-surface-600">
          Total Value: ${leads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[400px]">
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

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stageLeads.map((lead, index) => (
                  <motion.div
                    key={lead.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-surface-200 cursor-move 
                               hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-surface-900 text-sm truncate">
                          {lead.title}
                        </h4>
                        <p className="text-xs text-surface-600 truncate">
                          {getCompanyName(lead.companyId)}
                        </p>
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

                      <div className="text-xs text-surface-500 truncate">
                        <ApperIcon name="User" className="w-3 h-3 inline mr-1" />
                        {getContactName(lead.contactId)}
                      </div>
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
  );
};

export default LeadPipeline;