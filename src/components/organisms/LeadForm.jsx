import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { leadService, contactService, companyService } from '@/services';

const LeadForm = ({ lead = null, onSubmit, onCancel, isVisible }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'New',
    probability: '',
    expectedCloseDate: '',
    contactId: '',
    companyId: '',
    description: ''
  });
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});

  const stages = [
    { id: 'New', label: 'New' },
    { id: 'Contacted', label: 'Contacted' },
    { id: 'Qualified', label: 'Qualified' },
    { id: 'Proposal', label: 'Proposal' },
    { id: 'Won', label: 'Won' },
    { id: 'Lost', label: 'Lost' }
  ];

  useEffect(() => {
    if (isVisible) {
      loadDropdownData();
      if (lead) {
        setFormData({
          title: lead.title || '',
          value: lead.value || '',
          stage: lead.stage || 'New',
          probability: lead.probability || '',
          expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.split('T')[0] : '',
          contactId: lead.contactId || '',
          companyId: lead.companyId || '',
          description: lead.description || ''
        });
      } else {
        setFormData({
          title: '',
          value: '',
          stage: 'New',
          probability: '',
          expectedCloseDate: '',
          contactId: '',
          companyId: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [lead, isVisible]);

  const loadDropdownData = async () => {
    setLoadingData(true);
    try {
      const [contactsResult, companiesResult] = await Promise.all([
        contactService.getAll(),
        companyService.getAll()
      ]);
      setContacts(contactsResult);
      setCompanies(companiesResult);
    } catch (error) {
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Value must be a valid number';
    }

    if (formData.probability && (isNaN(parseInt(formData.probability)) || parseInt(formData.probability) < 0 || parseInt(formData.probability) > 100)) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : 0,
        probability: formData.probability ? parseInt(formData.probability) : 0,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        expectedCloseDate: formData.expectedCloseDate || null
      };

      let result;
      if (lead) {
        result = await leadService.update(lead.Id, submitData);
        toast.success('Lead updated successfully');
      } else {
        result = await leadService.create(submitData);
        toast.success('Lead created successfully');
      }
      
      onSubmit(result);
    } catch (error) {
      toast.error(lead ? 'Failed to update lead' : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-surface-900">
              {lead ? 'Edit Lead' : 'Create New Lead'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                    required
                  />
                </div>

                <div>
                  <FormField
                    label="Value ($)"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={handleInputChange}
                    error={errors.value}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FormField
                    label="Probability (%)"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleInputChange}
                    error={errors.probability}
                  />
                </div>

                <div>
                  <FormField
                    label="Expected Close Date"
                    name="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Contact
                  </label>
                  <select
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.Id} value={contact.Id}>
                        {contact.firstName} {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Company
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company.Id} value={company.Id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-surface-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {lead ? 'Update Lead' : 'Create Lead'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeadForm;