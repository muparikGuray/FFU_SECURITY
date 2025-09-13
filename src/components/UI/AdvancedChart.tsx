import React, { useMemo } from 'react';
import { ChartData } from '../../types';

interface AdvancedChartProps {
  data: ChartData[];
  type?: 'bar' | 'line' | 'area';
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  className?: string;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  type = 'bar',
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showTooltip = true,
  animate = true,
  className = ''
}) => {
  const { chartData, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) {
      return { chartData: [], maxValue: 0, minValue: 0 };
    }

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    const chartData = data.map((item, index) => ({
      ...item,
      x: (index / (data.length - 1)) * 100,
      y: max > 0 ? ((item.value - min) / (max - min)) * 100 : 0,
      normalizedValue: max > 0 ? (item.value / max) * 100 : 0
    }));

    return { chartData, maxValue: max, minValue: min };
  }, [data]);

  const renderBar = (item: any, index: number) => (
    <div
      key={index}
      className={`relative flex-1 rounded-t transition-all duration-500 ${animate ? 'hover:opacity-80' : ''}`}
      style={{
        height: `${item.normalizedValue}%`,
        backgroundColor: color,
        minHeight: '4px'
      }}
      title={showTooltip ? `${item.label || item.timestamp}: ${item.value}` : undefined}
    >
      {showTooltip && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 opacity-0 hover:opacity-100 transition-opacity">
          {item.value}
        </div>
      )}
    </div>
  );

  const renderLine = () => {
    if (chartData.length < 2) return null;

    const pathData = chartData
      .map((item, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${item.x} ${100 - item.y}`;
      })
      .join(' ');

    return (
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {showGrid && (
          <g stroke="currentColor" strokeWidth="0.1" opacity="0.2">
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} />
            ))}
          </g>
        )}
        
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className={animate ? 'transition-all duration-500' : ''}
        />
        
        {type === 'area' && (
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        
        {chartData.map((item, index) => (
          <circle
            key={index}
            cx={item.x}
            cy={100 - item.y}
            r="1"
            fill={color}
            className={animate ? 'hover:r-2 transition-all' : ''}
          >
            {showTooltip && (
              <title>{`${item.label || item.timestamp}: ${item.value}`}</title>
            )}
          </circle>
        ))}
      </svg>
    );
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {showGrid && type === 'bar' && (
        <div className="absolute inset-0 flex flex-col justify-between text-gray-500 text-xs">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((value, index) => (
            <div key={index} className="border-b border-gray-700 border-opacity-30 flex items-center">
              <span className="absolute -left-12 text-right w-10">
                {Math.round(value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="h-full flex items-end relative">
        {type === 'bar' ? (
          <div className="w-full h-full flex items-end space-x-1">
            {chartData.map(renderBar)}
          </div>
        ) : (
          <div className="w-full h-full relative">
            {renderLine()}
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{data[0]?.label || 'Start'}</span>
          <span>{data[data.length - 1]?.label || 'End'}</span>
        </div>
      )}
    </div>
  );
};

export default AdvancedChart;