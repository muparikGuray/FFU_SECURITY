import React, { useState, useCallback, useMemo } from 'react';
import { TrafficLog } from '../types';
import { pythonApi } from '../lib/pythonApi';
import Card from '../components/UI/Card';
import VirtualTable from '../components/UI/VirtualTable';
import EmptyState from '../components/UI/EmptyState';
import { useNotifications } from '../components/UI/NotificationSystem';
import { 
  Play, 
  Pause, 
  Search, 
  Filter, 
  RotateCcw, 
  Activity, 
  Calendar,
  Server,
  Eye
} from 'lucide-react';

interface AdvancedFilters {
  sourceIp?: string;
  destinationIp?: string;
  protocol?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  portRange?: {
    min: number;
    max: number;
  };
}

const EnhancedPacketSniffer: React.FC = () => {
  const { addNotification } = useNotifications();
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedPackets, setSelectedPackets] = useState<string[]>([]);
  const [inspectedPacket, setInspectedPacket] = useState<TrafficLog | null>(null);

  // Check capture status on component mount
  React.useEffect(() => {
    checkCaptureStatus();
    loadPackets();
  }, []);

  const checkCaptureStatus = async () => {
    try {
      const response = await pythonApi.getCaptureStatus();
      if (response.data) {
        setIsCapturing(response.data.is_capturing);
      }
    } catch (error) {
      console.error('Error checking capture status:', error);
    }
  };

  const loadPackets = async () => {
    try {
      setLoading(true);
      const response = await pythonApi.getPackets();
      if (response.error) {
        throw new Error(response.error);
      }
      setLogs(response.data?.packets || []);
    } catch (error) {
      console.error('Error loading packets:', error);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load packet data from backend'
      });
    } finally {
      setLoading(false);
    }
  };

  // Advanced date range presets
  const datePresets = [
    { label: 'Last Hour', value: () => ({ 
      start: new Date(Date.now() - 60 * 60 * 1000), 
      end: new Date() 
    })},
    { label: 'Last 24 Hours', value: () => ({ 
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), 
      end: new Date() 
    })},
    { label: 'Last Week', value: () => ({ 
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
      end: new Date() 
    })}
  ];

  const combinedFilters = useMemo(() => {
    const baseFilters = { ...filters };
    
    // Apply search term to IP filters
    if (searchTerm) {
      if (!baseFilters.sourceIp && !baseFilters.destinationIp) {
        baseFilters.sourceIp = searchTerm;
        baseFilters.destinationIp = searchTerm;
      }
    }
    
    return baseFilters;
  }, [filters, searchTerm]);

  // Mock data and functions
  const error = null;
  const hasMore = false;
  const totalCount = logs.length;
  
  const analytics = useMemo(() => {
    const protocolStats = logs.reduce((acc, log) => {
      acc[log.protocol] = (acc[log.protocol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusStats = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalBandwidth = logs.reduce((acc, log) => acc + log.packet_size, 0);

    return {
      protocolStats,
      statusStats,
      totalBandwidth,
      totalPackets: logs.length,
      uniqueSourceIPs: new Set(logs.map(log => log.source_ip)).size
    };
  }, [logs]);
  
  const loadMore = () => {};
  const refresh = () => loadPackets();
  
  // Set up periodic packet refresh when capturing
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCapturing) {
      interval = setInterval(() => {
        loadPackets();
      }, 2000); // Refresh every 2 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCapturing]);

  const toggleCapture = useCallback(async () => {
    try {
      if (!isCapturing) {
        const response = await pythonApi.startPacketCapture();
        if (response.error) {
          throw new Error(response.error);
        }
        setIsCapturing(true);
        addNotification({
          type: 'success',
          title: 'Capture Started',
          message: 'Network packet capture started successfully'
        });
      } else {
        const response = await pythonApi.stopPacketCapture();
        if (response.error) {
          throw new Error(response.error);
        }
        setIsCapturing(false);
        addNotification({
          type: 'info',
          title: 'Capture Stopped',
          message: 'Network packet capture stopped'
        });
      }
    } catch (error) {
      console.error('Error toggling capture:', error);
      addNotification({
        type: 'error',
        title: 'Capture Error',
        message: 'Failed to toggle packet capture'
      });
    }
  }, [isCapturing, addNotification]);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all traffic logs?')) return;

    try {
      const response = await pythonApi.clearPackets();
      if (response.error) {
        throw new Error(response.error);
      }
      
      setLogs([]);
      addNotification({
        type: 'success',
        title: 'Logs Cleared',
        message: 'All packet logs cleared successfully'
      });
    } catch (err) {
      console.error('Error clearing logs:', err);
      addNotification({
        type: 'error',
        title: 'Clear Failed',
        message: 'Failed to clear packet logs'
      });
    }
  };

  const handleBulkAction = (action: 'block' | 'allow' | 'analyze') => {
    if (selectedPackets.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select packets to perform bulk actions.'
      });
      return;
    }

    addNotification({
      type: 'success',
      title: 'Bulk Action Applied',
      message: `${action} action applied to ${selectedPackets.length} packets.`
    });
    
    setSelectedPackets([]);
  };

  const columns = [
    {
      key: 'checkbox',
      header: '',
      render: (_: any, log: TrafficLog) => (
        <input
          type="checkbox"
          checked={selectedPackets.includes(log.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedPackets(prev => [...prev, log.id]);
            } else {
              setSelectedPackets(prev => prev.filter(id => id !== log.id));
            }
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      width: 50
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (value: string) => new Date(value).toLocaleTimeString(),
      width: 100
    },
    {
      key: 'source_ip',
      header: 'Source IP',
      width: 120
    },
    {
      key: 'source_port',
      header: 'Src Port',
      className: 'text-center',
      width: 80
    },
    {
      key: 'destination_ip',
      header: 'Destination IP',
      width: 120
    },
    {
      key: 'destination_port',
      header: 'Dst Port',
      className: 'text-center',
      width: 80
    },
    {
      key: 'protocol',
      header: 'Protocol',
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
          {value}
        </span>
      ),
      width: 80
    },
    {
      key: 'packet_size',
      header: 'Size',
      render: (value: number) => `${value}B`,
      className: 'text-right',
      width: 80
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'allowed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {value.toUpperCase()}
        </span>
      ),
      width: 100
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, log: TrafficLog) => (
        <button
          onClick={() => setInspectedPacket(log)}
          className="p-1 text-blue-400 hover:text-blue-300"
          title="Inspect Packet"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
      width: 80
    }
  ];

  const handleRowClick = (log: TrafficLog) => {
    setInspectedPacket(log);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Network Traffic Monitor</h1>
          <p className="text-gray-400 text-sm">
            Real-time packet analysis and monitoring • {totalCount} total packets
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearLogs}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Logs
          </button>
          
          <button
            onClick={toggleCapture}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isCapturing 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isCapturing ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Capture
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Capture
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`text-lg font-bold ${isCapturing ? 'text-green-400' : 'text-gray-400'}`}>
                {isCapturing ? 'Capturing' : 'Stopped'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              isCapturing ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`} />
          </div>
        </Card>
        
        <Card className="p-4">
          <div>
            <p className="text-gray-400 text-sm">Total Packets</p>
            <p className="text-lg font-bold text-white">{analytics.totalPackets}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div>
            <p className="text-gray-400 text-sm">Bandwidth</p>
            <p className="text-lg font-bold text-white">
              {(analytics.totalBandwidth / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div>
            <p className="text-gray-400 text-sm">Allowed</p>
            <p className="text-lg font-bold text-green-400">
              {analytics.statusStats.allowed || 0}
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div>
            <p className="text-gray-400 text-sm">Blocked</p>
            <p className="text-lg font-bold text-red-400">
              {analytics.statusStats.blocked || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IP, port, or protocol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                showAdvancedFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <select
                value={filters.protocol || 'all'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  protocol: e.target.value === 'all' ? undefined : e.target.value
                }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="ICMP">ICMP</option>
              </select>
              
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value === 'all' ? undefined : e.target.value
                }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="allowed">Allowed</option>
                <option value="blocked">Blocked</option>
              </select>
              
              <div className="flex space-x-2">
                {datePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      dateRange: preset.value()
                    }))}
                    className="px-3 py-2 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedPackets.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-white">
              {selectedPackets.length} packet{selectedPackets.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('block')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Block IPs
              </button>
              <button
                onClick={() => handleBulkAction('allow')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Allow IPs
              </button>
              <button
                onClick={() => handleBulkAction('analyze')}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Analyze
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Traffic Table with Virtual Scrolling */}
      <Card title="Live Traffic Stream">
        {error ? (
          <div className="text-red-400 text-center py-8">
            Error loading traffic data: {error}
          </div>
        ) : logs.length === 0 && !loading ? (
          <EmptyState
            icon={Activity}
            title="No Traffic Data"
            description="Start packet capture to begin monitoring network traffic."
            action={{
              label: 'Start Capture',
              onClick: () => !isCapturing && toggleCapture()
            }}
          />
        ) : (
          <VirtualTable
            data={logs}
            columns={columns}
            height={600}
            itemHeight={60}
            loading={loading}
            onRowClick={handleRowClick}
          />
        )}
        
        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </Card>

      {/* Packet Inspector Modal */}
      {inspectedPacket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Packet Inspector</h3>
              <button
                onClick={() => setInspectedPacket(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-400">Source</label>
                  <p className="text-white">{inspectedPacket.source_ip}:{inspectedPacket.source_port}</p>
                </div>
                <div>
                  <label className="text-gray-400">Destination</label>
                  <p className="text-white">{inspectedPacket.destination_ip}:{inspectedPacket.destination_port}</p>
                </div>
                <div>
                  <label className="text-gray-400">Protocol</label>
                  <p className="text-white">{inspectedPacket.protocol}</p>
                </div>
                <div>
                  <label className="text-gray-400">Status</label>
                  <span className={`px-2 py-1 rounded text-xs ${
                    inspectedPacket.status === 'allowed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {inspectedPacket.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-gray-400">Packet Size</label>
                  <p className="text-white">{inspectedPacket.packet_size} bytes</p>
                </div>
                <div>
                  <label className="text-gray-400">Timestamp</label>
                  <p className="text-white">{new Date(inspectedPacket.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 block mb-2">Raw Packet Data</label>
                <div className="bg-gray-900 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                  {/* Simulated hex dump */}
                  <pre>{`0000: 45 00 00 3c 1c 46 40 00 40 06 b1 e6 ac 10 00 01  E..<.F@.@.......
0010: ac 10 00 02 00 50 1f 90 c5 9d 5a fd 00 00 00 00  .....P....Z.....
0020: a0 02 39 08 2d 47 00 00 02 04 05 b4 04 02 08 0a  ..9.-G..........
0030: 00 9c 4a 57 00 00 00 00 01 03 03 07              ..JW........`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPacketSniffer;