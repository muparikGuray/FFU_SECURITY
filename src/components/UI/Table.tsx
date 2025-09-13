import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  className?: string;
}

const Table: React.FC<TableProps> = ({ data, columns, loading, className = '' }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-700 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${column.className || ''}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default Table;