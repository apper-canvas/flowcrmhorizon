import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ message, onRetry, className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`text-center py-16 ${className}`}
    >
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ApperIcon name="AlertTriangle" className="w-10 h-10 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-surface-900 mb-2">Something went wrong</h3>
      <p className="text-surface-500 mb-8 max-w-md mx-auto">{message}</p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" icon="RefreshCw">
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;