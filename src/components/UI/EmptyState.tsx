import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            action.variant === 'secondary'
              ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;