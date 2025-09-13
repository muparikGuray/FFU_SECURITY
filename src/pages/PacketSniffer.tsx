import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrafficLog } from '../types';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import { Play, Pause, Search, Filter, RotateCcw } from 'lucide-react';

const PacketSniffer: React.FC = () => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TrafficLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProtocol, setFilterProtocol] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(50);

  useEffect(() => {
    loadTrafficLogs();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('traffic_logs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'traffic_logs' },
        (payload) => {
          setLogs(prev => [payload.new as TrafficLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filterStatus, filterProtocol]);

  const loadTrafficLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('traffic_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading traffic logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.source_ip.includes(searchTerm) ||
        log.destination_ip.includes(searchTerm) ||
        log.source_port.toString().includes(searchTerm) ||
        log.destination_port.toString().includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    if (filterProtocol !== 'all') {
      filtered = filtered.filter(log => log.protocol === filterProtocol);
    }

    setFilteredLogs(filtered);
  };

  const toggleCapture = async () => {
    setIsCapturing(!isCapturing);
    
    if (!isCapturing) {
      // Simulate real-time traffic generation
      const interval = setInterval(() => {
        generateSimulatedTraffic();
      }, 2000);

      // Store interval ID for cleanup
      (window as any).trafficInterval = interval;
    } else {
      // Stop traffic generation
      if ((window as any).trafficInterval) {
        clearInterval((window as any).trafficInterval);
      }
    }
  };

  const generateSimulatedTraffic = async () => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'];
    const statuses = ['allowed', 'blocked'];
    const sourceIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.10'];
    const destIPs = ['8.8.8.8', '1.1.1.1', '192.168.1.1', '10.0.0.1'];

    const simulatedLog = {
      source_ip: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
      destination_ip: destIPs[Math.floor(Math.random() * destIPs.length)],
      source_port: Math.floor(Math.random() * 65535),
      destination_port: Math.floor(Math.random() * 65535),
      protocol: protocols[Math.floor(Math.random() * protocols.length)] as any,
      packet_size: Math.floor(Math.random() * 1500) + 64,
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      timestamp: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('traffic_logs')
        .insert([simulatedLog]);

      if (error) throw error;
    } catch (error) {
      console.error('Error inserting simulated traffic:', error);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all traffic logs?')) return;

    try {
      const { error } = await supabase
        .from('traffic_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (value: string) => new Date(value).toLocaleTimeString()
    },
    {
      key: 'source_ip',
      header: 'Source IP'
    },
    {
      key: 'source_port',
      header: 'Src Port',
      className: 'w-20'
    },
    {
      key: 'destination_ip',
      header: 'Destination IP'
    },
    {
      key: 'destination_port',
      header: 'Dst Port',
      className: 'w-20'
    },
    {
      key: 'protocol',
      header: 'Protocol',
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'packet_size',
      header: 'Size (bytes)',
      className: 'w-24'
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
      )
    }
  ];

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Packet Sniffer</h1>
        <div className="flex space-x-3">
          <button
            onClick={clearLogs}
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

      {/* Status */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              isCapturing ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`}></div>
            <p className="text-sm text-gray-400">
              Status: {isCapturing ? 'Capturing' : 'Stopped'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{logs.length}</p>
            <p className="text-sm text-gray-400">Total Packets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {logs.filter(log => log.status === 'allowed').length}
            </p>
            <p className="text-sm text-gray-400">Allowed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {logs.filter(log => log.status === 'blocked').length}
            </p>
            <p className="text-sm text-gray-400">Blocked</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search IP, port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="HTTP">HTTP</option>
            <option value="HTTPS">HTTPS</option>
            <option value="ICMP">ICMP</option>
          </select>
        </div>
      </Card>

      {/* Traffic Table */}
      <Card title={`Live Traffic (${filteredLogs.length} packets)`}>
        <Table data={currentLogs} columns={columns} loading={loading} />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PacketSniffer;