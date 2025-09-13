import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  lines = 1, 
  className = '', 
  variant = 'text' 
}) => {
  const getSkeletonClass = () => {
    const baseClass = 'animate-pulse bg-gray-700';
    
    switch (variant) {
      case 'circular':
        return `${baseClass} rounded-full`;
      case 'rectangular':
        return `${baseClass} rounded-md`;
      case 'text':
      default:
        return `${baseClass} rounded h-4`;
    }
  };

  if (lines === 1) {
    return <div className={`${getSkeletonClass()} ${className}`} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`${getSkeletonClass()} ${className}`} />
      ))}
    </div>
  );
};

export const TableLoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-700 rounded-t-lg mb-1" />
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 bg-gray-800 border-b border-gray-700">
        {Array.from({ length: columns }, (_, colIndex) => (
          <div key={colIndex} className="flex-1 h-4 bg-gray-700 rounded" />
        ))}
      </div>
    ))}
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24" />
        <div className="h-8 bg-gray-700 rounded w-16" />
      </div>
      <div className="w-12 h-12 bg-gray-700 rounded-lg" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 256 }) => (
  <div className="animate-pulse">
    <div className="flex items-end justify-between space-x-2" style={{ height }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="bg-gray-700 rounded-t flex-1"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
    <div className="flex justify-between mt-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-3 bg-gray-700 rounded w-16" />
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;