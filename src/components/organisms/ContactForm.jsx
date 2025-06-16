import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { contactService, companyService } from '@/services';

const ContactForm = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
    position: '',
    notes: ''
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCompanies();
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        companyId: contact.companyId?.toString() || '',
        position: contact.position || '',
        notes: contact.notes || ''
      });
    }
  }, [contact]);

  const loadCompanies = async () => {
    try {
      const result = await companyService.getAll();
      setCompanies(result);
    } catch (error) {
      toast.error('Failed to load companies');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId, 10) : null
      };

      if (contact) {
        await contactService.update(contact.Id, dataToSubmit);
        toast.success('Contact updated successfully');
      } else {
        await contactService.create(dataToSubmit);
        toast.success('Contact created successfully');
      }
      
      onSave?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-surface-900">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            icon="Mail"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            icon="Phone"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Company
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.Id} value={company.Id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            icon="Briefcase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       hover:border-surface-400 transition-all duration-200 resize-none"
            placeholder="Additional notes about this contact..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon="Save"
          >
            {contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactForm;