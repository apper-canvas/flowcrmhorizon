import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { isAfter, startOfToday } from 'date-fns';
import DashboardStats from '@/components/organisms/DashboardStats';
import RecentActivity from '@/components/organisms/RecentActivity';
import LeadPipeline from '@/components/organisms/LeadPipeline';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import QuickAddButton from '@/components/molecules/QuickAddButton';
import ContactForm from '@/components/organisms/ContactForm';
import CompanyForm from '@/components/organisms/CompanyForm';
import TaskForm from '@/components/organisms/TaskForm';
import { contactService, companyService, leadService, taskService } from '@/services';
import { AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [contacts, companies, leads, tasks] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        leadService.getAll(),
        taskService.getAll()
      ]);

      // Calculate stats
      const activeLeads = leads.filter(lead => 
        !['Won', 'Lost'].includes(lead.stage)
      ).length;

      const pipelineValue = leads
        .filter(lead => !['Won', 'Lost'].includes(lead.stage))
        .reduce((sum, lead) => sum + (lead.value || 0), 0);

      const today = startOfToday();
      const tasksDue = tasks.filter(task => 
        task.status !== 'Completed' && 
        task.dueDate &&
        !isAfter(new Date(task.dueDate), today)
      ).length;

      setStats({
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        activeLeads,
        pipelineValue,
        tasksDue
      });

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowContactForm(false);
    setShowCompanyForm(false);
    setShowTaskForm(false);
    loadDashboardData(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={1} type="card" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={1} type="card" />
          <SkeletonLoader count={1} type="card" />
        </div>
        <SkeletonLoader count={1} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
            <p className="text-surface-600 mt-1">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardStats stats={stats} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <RecentActivity />
          </motion.div>

          {/* Pipeline Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <LeadPipeline />
          </motion.div>
        </div>
      </div>

      {/* Quick Add Button */}
      <QuickAddButton
        onAddContact={() => setShowContactForm(true)}
        onAddCompany={() => setShowCompanyForm(true)}
        onAddTask={() => setShowTaskForm(true)}
      />

      {/* Forms */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ContactForm
                onSave={handleFormSuccess}
                onCancel={() => setShowContactForm(false)}
              />
            </div>
          </motion.div>
        )}

        {showCompanyForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompanyForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <CompanyForm
                onSave={handleFormSuccess}
                onCancel={() => setShowCompanyForm(false)}
              />
            </div>
          </motion.div>
        )}

        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTaskForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <TaskForm
                onSave={handleFormSuccess}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;