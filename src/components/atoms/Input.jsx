import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label, 
  type = 'text', 
  icon, 
  error, 
  helperText,
  className = '',
  required = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || '');

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(e.target.value);
  };

  const inputClasses = `
    w-full px-4 py-3 text-sm bg-white border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    ${error 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-surface-300 hover:border-surface-400'
    }
    ${icon ? 'pl-11' : ''}
  `;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${focused || hasValue 
            ? 'top-2 text-xs text-primary-600 font-medium' 
            : 'top-3.5 text-sm text-surface-500'
          }
        `}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <ApperIcon 
            name={icon} 
            className={`w-4 h-4 ${error ? 'text-red-400' : 'text-surface-400'}`} 
          />
        </div>
      )}
      
      <input
        type={type}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setHasValue(e.target.value)}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-surface-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;