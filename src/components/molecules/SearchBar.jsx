import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ onSearch, placeholder = 'Search...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{ scale: focused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <ApperIcon name="Search" className="w-4 h-4 text-surface-400" />
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-surface-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   hover:border-surface-400 transition-all duration-200"
      />
      
      {query && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full 
                     hover:bg-surface-100 transition-colors duration-200"
        >
          <ApperIcon name="X" className="w-3 h-3 text-surface-400" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default SearchBar;