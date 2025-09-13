import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrafficLog } from '../types';

interface TrafficFilters {
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

export const useTrafficLogs = (filters: TrafficFilters = {}) => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 100;

  const loadLogs = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate mock data for demonstration
      const mockData: TrafficLog[] = [];
      const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'];
      const statuses = ['allowed', 'blocked'];
      const sourceIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.10'];
      const destIPs = ['8.8.8.8', '1.1.1.1', '192.168.1.1', '10.0.0.1'];
      
      for (let i = 0; i < pageSize; i++) {
        mockData.push({
          id: (Date.now() + i).toString(),
          source_ip: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
          destination_ip: destIPs[Math.floor(Math.random() * destIPs.length)],
          source_port: Math.floor(Math.random() * 65535) + 1,
          destination_port: Math.floor(Math.random() * 65535) + 1,
          protocol: protocols[Math.floor(Math.random() * protocols.length)] as any,
          packet_size: Math.floor(Math.random() * 1500) + 64,
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          firewall_rule_id: undefined
        });
      }
      
      if (resetPage) {
        setLogs(mockData);
        setPage(1);
      } else {
        setLogs(prev => page === 1 ? mockData : [...prev, ...mockData]);
      }
      
      setTotalCount(500); // Mock total count
      setHasMore(mockData.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load traffic logs');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    loadLogs(true);
  }, [filters]);

  useEffect(() => {
    if (page > 1) {
      loadLogs(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const refresh = useCallback(() => {
    setPage(1);
    loadLogs(true);
  }, [loadLogs]);

  const generateSampleTraffic = useCallback(async () => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP'];
    const statuses = ['allowed', 'blocked'];
    const sourceIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.10'];
    const destIPs = ['8.8.8.8', '1.1.1.1', '192.168.1.1', '10.0.0.1'];

    const sampleLog: TrafficLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      source_ip: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
      destination_ip: destIPs[Math.floor(Math.random() * destIPs.length)],
      source_port: Math.floor(Math.random() * 65535) + 1,
      destination_port: Math.floor(Math.random() * 65535) + 1,
      protocol: protocols[Math.floor(Math.random() * protocols.length)] as any,
      packet_size: Math.floor(Math.random() * 1500) + 64,
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      timestamp: new Date().toISOString(),
      firewall_rule_id: undefined
    };

    // Add to local state instead of database
    setLogs(prev => [sampleLog, ...prev.slice(0, pageSize - 1)]);
    setTotalCount(prev => prev + 1);
  }, []);

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

  return {
    logs,
    loading,
    error,
    hasMore,
    totalCount,
    analytics,
    loadMore,
    refresh,
    generateSampleTraffic
  };
};