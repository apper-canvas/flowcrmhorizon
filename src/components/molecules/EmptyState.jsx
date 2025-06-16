import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title, 
  description, 
  icon = 'Package', 
  actionLabel, 
  onAction,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`text-center py-16 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-surface-100 to-surface-200 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name={icon} className="w-10 h-10 text-surface-400" />
        </div>
      </motion.div>
      
      <h3 className="text-xl font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 mb-8 max-w-md mx-auto">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} icon="Plus">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;