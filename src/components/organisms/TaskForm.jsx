import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { taskService, contactService, companyService, leadService } from '@/services';

const TaskForm = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    relatedTo: '',
    relatedId: ''
  });
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const priorityOptions = ['Low', 'Medium', 'High'];
  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  const relatedToOptions = ['Contact', 'Company', 'Lead'];

  useEffect(() => {
    loadRelatedData();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        relatedTo: task.relatedTo || '',
        relatedId: task.relatedId || ''
      });
    }
  }, [task]);

  const loadRelatedData = async () => {
    try {
      const [contactsResult, companiesResult, leadsResult] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        leadService.getAll()
      ]);
      setContacts(contactsResult);
      setCompanies(companiesResult);
      setLeads(leadsResult);
    } catch (error) {
      toast.error('Failed to load related data');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
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
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (task) {
        await taskService.update(task.Id, dataToSubmit);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(dataToSubmit);
        toast.success('Task created successfully');
      }
      
      onSave?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save task');
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

  const getRelatedOptions = () => {
    switch (formData.relatedTo) {
      case 'Contact':
        return contacts.map(contact => ({
          value: contact.Id.toString(),
          label: `${contact.firstName} ${contact.lastName}`
        }));
      case 'Company':
        return companies.map(company => ({
          value: company.Id.toString(),
          label: company.name
        }));
      case 'Lead':
        return leads.map(lead => ({  
          value: lead.Id.toString(),
          label: lead.title
        }));
      default:
        return [];
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
          {task ? 'Edit Task' : 'Add New Task'}
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
          label="Task Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          icon="CheckSquare"
          required
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       hover:border-surface-400 transition-all duration-200 resize-none"
            placeholder="Task description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Due Date *
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Related To
            </label>
            <select
              value={formData.relatedTo}
              onChange={(e) => {
                handleChange('relatedTo', e.target.value);
                handleChange('relatedId', ''); // Reset related ID when changing type
              }}
              className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         hover:border-surface-400 transition-all duration-200"
            >
              <option value="">Select type</option>
              {relatedToOptions.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          {formData.relatedTo && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Related {formData.relatedTo}
              </label>
              <select
                value={formData.relatedId}
                onChange={(e) => handleChange('relatedId', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-surface-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           hover:border-surface-400 transition-all duration-200"
              >
                <option value="">Select {formData.relatedTo.toLowerCase()}</option>
                {getRelatedOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm;