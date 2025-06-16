import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts || 0,
      icon: 'Users',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Active Leads',
      value: stats.activeLeads || 0,
      icon: 'TrendingUp',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Pipeline Value',
      value: `$${(stats.pipelineValue || 0).toLocaleString()}`,
      icon: 'DollarSign',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Tasks Due',
      value: stats.tasksDue || 0,
      icon: 'Clock',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-surface-200 p-6"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50`} />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">{stat.title}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;