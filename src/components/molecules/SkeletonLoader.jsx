import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  const shimmer = {
    animate: {
      x: ['-100%', '100%'],
    },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  };

  const CardSkeleton = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-surface-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-200 rounded w-3/4"></div>
            <div className="h-3 bg-surface-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-surface-200 rounded"></div>
          <div className="h-3 bg-surface-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden">
      <div className="p-4 border-b border-surface-200">
        <div className="h-4 bg-surface-200 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-surface-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-surface-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-200 rounded w-1/3"></div>
                <div className="h-3 bg-surface-200 rounded w-1/4"></div>
              </div>
              <div className="h-3 bg-surface-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {type === 'card' ? <CardSkeleton /> : <TableSkeleton />}
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;