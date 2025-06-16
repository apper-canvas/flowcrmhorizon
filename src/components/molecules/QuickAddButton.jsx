import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const QuickAddButton = ({ onAddContact, onAddCompany, onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'Add Contact', icon: 'UserPlus', action: onAddContact, color: 'from-blue-500 to-blue-600' },
    { label: 'Add Company', icon: 'Building2', action: onAddCompany, color: 'from-green-500 to-green-600' },
    { label: 'Add Task', icon: 'Plus', action: onAddTask, color: 'from-purple-500 to-purple-600' }
  ];

  const handleAction = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleAction(action.action)}
                  className={`bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl`}
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full 
                   shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ApperIcon name="Plus" className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default QuickAddButton;