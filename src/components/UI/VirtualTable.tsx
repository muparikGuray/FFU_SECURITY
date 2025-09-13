import React, { useMemo } from 'react';
import { useVirtualList } from '../../hooks/useVirtualList';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  width?: number;
}

interface VirtualTableProps {
  data: any[];
  columns: Column[];
  itemHeight?: number;
  height?: number;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
}

const VirtualTable: React.FC<VirtualTableProps> = ({
  data,
  columns,
  itemHeight = 60,
  height = 400,
  loading,
  onRowClick,
  className = ''
}) => {
  const {
    virtualItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollElementRef
  } = useVirtualList({
    items: data,
    itemHeight,
    containerHeight: height
  });

  const headerHeight = 48;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-700 rounded-t mb-2" />
        {Array.from({ length: Math.floor(height / itemHeight) }, (_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded mb-1" />
        ))}
      </div>
    );
  }

  return (
    <div className={`border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Fixed Header */}
      <div 
        className="bg-gray-700 border-b border-gray-600 sticky top-0 z-10"
        style={{ height: headerHeight }}
      >
        <div className="flex items-center px-4 h-full">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`flex-1 text-xs font-medium text-gray-300 uppercase tracking-wider ${column.className || ''}`}
              style={{ width: column.width }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollElementRef}
        className="overflow-auto bg-gray-800"
        style={{ height: height - headerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {virtualItems.map((item) => (
              <div
                key={item.id || item.index}
                className={`flex items-center px-4 border-b border-gray-700 transition-colors ${
                  onRowClick ? 'hover:bg-gray-750 cursor-pointer' : ''
                }`}
                style={{ height: itemHeight }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`flex-1 text-sm text-gray-300 ${column.className || ''}`}
                    style={{ width: column.width }}
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default VirtualTable;