import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isAfter, startOfToday, isSameDay } from 'date-fns';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import TaskForm from '@/components/organisms/TaskForm';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { taskService, contactService, companyService, leadService } from '@/services';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tasksResult, contactsResult, companiesResult, leadsResult] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        companyService.getAll(),
        leadService.getAll()
      ]);
      setTasks(tasksResult);
      setContacts(contactsResult);
      setCompanies(companiesResult);
      setLeads(leadsResult);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Sort by due date (overdue first, then by date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });

    setFilteredTasks(filtered);
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    try {
      await taskService.update(task.Id, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => 
        t.Id === task.Id ? { ...t, status: newStatus } : t
      ));
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTask(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const getRelatedEntity = (task) => {
    if (!task.relatedTo || !task.relatedId) return 'No relation';
    
    const id = parseInt(task.relatedId, 10);
    
    switch (task.relatedTo) {
      case 'Contact':
        const contact = contacts.find(c => c.Id === id);
        return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown contact';
      case 'Company':
        const company = companies.find(c => c.Id === id);
        return company ? company.name : 'Unknown company';
      case 'Lead':
        const lead = leads.find(l => l.Id === id);
        return lead ? lead.title : 'Unknown lead';
      default:
        return 'No relation';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    return isAfter(startOfToday(), new Date(dueDate));
  };

  const isDueToday = (dueDate) => {
    return isSameDay(new Date(dueDate), startOfToday());
  };

  const groupTasksByDate = (tasks) => {
    const today = startOfToday();
    const groups = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: []
    };

    tasks.forEach(task => {
      if (task.status === 'Completed') {
        groups.completed.push(task);
      } else if (isOverdue(task.dueDate, task.status)) {
        groups.overdue.push(task);
      } else if (isDueToday(task.dueDate)) {
        groups.today.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
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
          onRetry={loadData}
        />
      </div>
    );
  }

  const taskGroups = groupTasksByDate(filteredTasks);

  return (
    <>
      <div className="p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
            <p className="text-surface-600 mt-1">
              Stay organized and track your activities ({filteredTasks.length} tasks)
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            icon="Plus"
          >
            Add Task
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search tasks by title or description..."
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm bg-white border border-surface-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={searchQuery ? "Try adjusting your search terms" : "Get started by adding your first task"}
            icon="CheckSquare"
            actionLabel={!searchQuery ? "Add Task" : undefined}
            onAction={!searchQuery ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="space-y-6">
            {/* Overdue Tasks */}
            {taskGroups.overdue.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-red-700">Overdue ({taskGroups.overdue.length})</h2>
                </div>
                <div className="space-y-3">
                  {taskGroups.overdue.map((task, index) => (
                    <TaskCard 
                      key={task.Id} 
                      task={task} 
                      index={index}
                      isOverdue={true}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getRelatedEntity={getRelatedEntity}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {taskGroups.today.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="Clock" className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-orange-700">Due Today ({taskGroups.today.length})</h2>
                </div>
                <div className="space-y-3">
                  {taskGroups.today.map((task, index) => (
                    <TaskCard 
                      key={task.Id} 
                      task={task} 
                      index={index}
                      isDueToday={true}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getRelatedEntity={getRelatedEntity}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tasks */}
            {taskGroups.upcoming.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="Calendar" className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-blue-700">Upcoming ({taskGroups.upcoming.length})</h2>
                </div>
                <div className="space-y-3">
                  {taskGroups.upcoming.map((task, index) => (
                    <TaskCard 
                      key={task.Id} 
                      task={task} 
                      index={index}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getRelatedEntity={getRelatedEntity}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {taskGroups.completed.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-green-700">Completed ({taskGroups.completed.length})</h2>
                </div>
                <div className="space-y-3">
                  {taskGroups.completed.map((task, index) => (
                    <TaskCard 
                      key={task.Id} 
                      task={task} 
                      index={index}
                      isCompleted={true}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getRelatedEntity={getRelatedEntity}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
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
              <TaskForm
                task={editingTask}
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

const TaskCard = ({ 
  task, 
  index, 
  isOverdue, 
  isDueToday, 
  isCompleted,
  onToggleComplete,
  onEdit,
  onDelete,
  getRelatedEntity,
  getPriorityColor,
  getStatusColor
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-lg p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
        isOverdue ? 'border-red-200 bg-red-50' : 
        isDueToday ? 'border-orange-200 bg-orange-50' :
        isCompleted ? 'border-green-200 bg-green-50' :
        'border-surface-200'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.status === 'Completed' 
              ? 'bg-green-500 border-green-500' 
              : 'border-surface-300 hover:border-primary-500'
          }`}
        >
          {task.status === 'Completed' && (
            <ApperIcon name="Check" className="w-3 h-3 text-white" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-surface-900 truncate ${
                task.status === 'Completed' ? 'line-through text-surface-500' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-surface-600 mt-1 line-clamp-2 break-words">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-surface-400 hover:text-primary-600 transition-colors"
              >
                <ApperIcon name="Edit2" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.Id)}
                className="p-2 text-surface-400 hover:text-red-600 transition-colors"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>

            <div className="flex items-center text-sm text-surface-600">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
              <span>
                {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
              </span>
            </div>

            {task.relatedTo && (
              <div className="flex items-center text-sm text-surface-600">
                <ApperIcon 
                  name={task.relatedTo === 'Contact' ? 'User' : task.relatedTo === 'Company' ? 'Building2' : 'TrendingUp'} 
                  className="w-4 h-4 mr-1" 
                />
                <span className="truncate max-w-32">
                  {getRelatedEntity(task)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;