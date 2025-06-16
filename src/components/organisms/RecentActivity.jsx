import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'contact_created': return 'UserPlus';
      case 'contact_updated': return 'UserCheck';
      case 'company_created': return 'Building2';
      case 'lead_created': return 'TrendingUp';
      case 'lead_updated': return 'Edit';
      case 'task_completed': return 'CheckCircle';
      case 'task_created': return 'Plus';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    if (type.includes('created')) return 'success';
    if (type.includes('updated') || type.includes('completed')) return 'primary';
    return 'default';
  };

  // Mock recent activities if none provided
  const mockActivities = [
    {
      id: 1,
      type: 'contact_created',
      title: 'New contact added',
      description: 'Sarah Johnson from TechCorp Solutions',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'lead_updated',
      title: 'Lead stage updated',
      description: 'CRM Implementation moved to Qualified',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'task_completed',
      title: 'Task completed',
      description: 'Follow up call with Michael Chen',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      type: 'company_created',
      title: 'New company added',
      description: 'Creative Design Studio',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900">Recent Activity</h3>
        <Badge variant="primary">Live</Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {displayActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-${getActivityColor(activity.type) === 'success' ? 'green' : getActivityColor(activity.type) === 'primary' ? 'blue' : 'gray'}-100 to-${getActivityColor(activity.type) === 'success' ? 'green' : getActivityColor(activity.type) === 'primary' ? 'blue' : 'gray'}-200 rounded-full flex items-center justify-center flex-shrink-0`}>
              <ApperIcon 
                name={getActivityIcon(activity.type)} 
                className={`w-5 h-5 text-${getActivityColor(activity.type) === 'success' ? 'green' : getActivityColor(activity.type) === 'primary' ? 'blue' : 'gray'}-600`} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-surface-500 flex-shrink-0 ml-2">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-surface-600 truncate mt-1">
                {activity.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;