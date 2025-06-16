import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { companyService } from '@/services';

const CompanyForm = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    size: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sizeOptions = [
    'Small (1-50)',
    'Medium (50-200)',
    'Large (200+)'
  ];

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        size: company.size || '',
        notes: company.notes || ''
      });
    }
  }, [company]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (company) {
        await companyService.update(company.Id, formData);
        toast.success('Company updated successfully');
      } else {
        await companyService.create(formData);
        toast.success('Company created successfully');
      }
      
      onSave?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save company');
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
          {company ? 'Edit Company' : 'Add New Company'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Company Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          icon="Building2"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            error={errors.industry}
            icon="Briefcase"
            required
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Company Size
            </label>
            <select
              value={formData.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            >
              <option value="">Select company size</option>
              {sizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Website"
          type="url"
          value={formData.website}
          onChange={(e) => handleChange('website', e.target.value)}
          icon="Globe"
          placeholder="https://company.com"
        />

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
            placeholder="Additional notes about this company..."
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
            {company ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CompanyForm;