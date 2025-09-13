import React, { useState, useEffect, useMemo } from 'react';
import { DashboardMetrics, ChartData } from '../types';
import { pythonApi } from '../lib/pythonApi';
import MetricCard from '../components/UI/MetricCard';
import Card from '../components/UI/Card';
import AdvancedChart from '../components/UI/AdvancedChart';
import { MetricCardSkeleton, ChartSkeleton } from '../components/UI/LoadingSkeleton';
import { useNotifications } from '../components/UI/NotificationSystem';
import { 
  Activity, 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp, 
  Download,
  AlertTriangle,
  Users,
  Server,
  Globe
} from 'lucide-react';

const EnhancedDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBandwidth: 0,
    activeConnections: 0,
    blockedThreats: 0,
    uptime: '99.9%'
  });
  
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [bandwidthData, setBandwidthData] = useState<ChartData[]>([]);
  const [protocolData, setProtocolData] = useState<ChartData[]>([]);
  const [threatTrends, setThreatTrends] = useState<ChartData[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Set up periodic data refresh since real-time subscriptions are disabled
    const interval = setInterval(() => {
      loadDashboardData();
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [timeRange, addNotification]);

  const getTimeRangeHours = (range: string) => {
    switch (range) {
      case '7d': return 168;
      case '30d': return 720;
      default: return 24;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real metrics from Python backend
      const metricsResponse = await pythonApi.getDashboardMetrics();
      if (metricsResponse.error) {
        throw new Error(metricsResponse.error);
      }
      
      if (metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }
      
      // Generate mock bandwidth data
      const mockBandwidthData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 100) + 20,
        label: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString()
      }));
      setBandwidthData(mockBandwidthData);
      
      // Generate mock protocol data
      const mockProtocolData = [
        { timestamp: '', value: 45, label: 'HTTP' },
        { timestamp: '', value: 30, label: 'HTTPS' },
        { timestamp: '', value: 15, label: 'TCP' },
        { timestamp: '', value: 8, label: 'UDP' },
        { timestamp: '', value: 2, label: 'ICMP' }
      ];
      setProtocolData(mockProtocolData);
      
      // Generate mock threat trends
      const mockThreatTrends = Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toDateString(),
        value: Math.floor(Math.random() * 5),
        label: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
      setThreatTrends(mockThreatTrends);

      // Simulate system health updates
      setSystemHealth({
        cpu: Math.floor(Math.random() * 30) + 40,
        memory: Math.floor(Math.random() * 40) + 50,
        disk: Math.floor(Math.random() * 20) + 20,
        network: Math.floor(Math.random() * 20) + 80
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Data Loading Error',
        message: 'Failed to load dashboard data from backend',
        actions: [{
          label: 'Retry',
          action: loadDashboardData
        }]
      });
      
      // Fallback to mock data if backend fails
      setMetrics({
        totalBandwidth: 0,
        activeConnections: 0,
        blockedThreats: 0,
        uptime: '99.9%'
      });
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], hours: number): ChartData[] => {
    const interval = hours <= 24 ? 1 : hours <= 168 ? 6 : 24; // hourly, 6-hourly, or daily
    const buckets: { [key: string]: number } = {};
    
    data.forEach(log => {
      const date = new Date(log.timestamp);
      const bucketKey = new Date(
        Math.floor(date.getTime() / (interval * 60 * 60 * 1000)) * interval * 60 * 60 * 1000
      ).toISOString();
      
      buckets[bucketKey] = (buckets[bucketKey] || 0) + log.packet_size;
    });

    return Object.entries(buckets)
      .map(([timestamp, value]) => ({
        timestamp,
        value: Math.round(value / 1024 / 1024), // Convert to MB
        label: new Date(timestamp).toLocaleString()
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-24); // Last 24 data points
  };

  const processProtocolDistribution = (data: any[]): ChartData[] => {
    const protocolStats: { [key: string]: number } = {};
    
    data.forEach(log => {
      protocolStats[log.protocol] = (protocolStats[log.protocol] || 0) + 1;
    });

    return Object.entries(protocolStats).map(([label, value]) => ({
      timestamp: '',
      value,
      label
    }));
  };

  const processThreatTrends = (data: any[]): ChartData[] => {
    const dailyThreats: { [key: string]: number } = {};
    
    data.forEach(alert => {
      const date = new Date(alert.detection_time).toDateString();
      dailyThreats[date] = (dailyThreats[date] || 0) + 1;
    });

    return Object.entries(dailyThreats)
      .map(([date, value]) => ({
        timestamp: date,
        value,
        label: new Date(date).toLocaleDateString()
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const exportReport = async () => {
    try {
      const reportData = {
        metrics,
        bandwidthData,
        protocolData,
        threatTrends,
        systemHealth,
        timeRange,
        generatedAt: new Date().toISOString(),
        lastUpdated: lastUpdated.toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-dashboard-report-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Report Exported',
        message: 'Dashboard report has been downloaded successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export report. Please try again.'
      });
    }
  };

  const healthStatus = useMemo(() => {
    const avgHealth = (systemHealth.cpu + systemHealth.memory + systemHealth.disk + systemHealth.network) / 4;
    if (avgHealth >= 80) return { status: 'Excellent', color: 'text-green-400' };
    if (avgHealth >= 60) return { status: 'Good', color: 'text-blue-400' };
    if (avgHealth >= 40) return { status: 'Warning', color: 'text-yellow-400' };
    return { status: 'Critical', color: 'text-red-400' };
  }, [systemHealth]);

  if (loading && bandwidthData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <ChartSkeleton />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Last updated: {lastUpdated.toLocaleString()} • System Status: {' '}
            <span className={healthStatus.color}>{healthStatus.status}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Bandwidth Usage"
          value={`${metrics.totalBandwidth} MB`}
          icon={TrendingUp}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Active Connections"
          value={metrics.activeConnections}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Blocked Threats"
          value={metrics.blockedThreats}
          icon={Shield}
          color="red"
          trend={{ value: 8, isPositive: false }}
        />
        <MetricCard
          title="System Uptime"
          value={metrics.uptime}
          icon={Clock}
          color="green"
        />
      </div>

      {/* System Health Overview */}
      <Card title="System Health">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'CPU Usage', value: systemHealth.cpu, icon: Activity, color: 'blue' },
            { name: 'Memory', value: systemHealth.memory, icon: Server, color: 'green' },
            { name: 'Disk Space', value: systemHealth.disk, icon: Zap, color: 'yellow' },
            { name: 'Network', value: systemHealth.network, icon: Globe, color: 'purple' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-full flex items-center justify-center mx-auto mb-2`}>
                <item.icon className={`h-6 w-6 text-${item.color}-400`} />
              </div>
              <h3 className="font-semibold text-white text-sm">{item.name}</h3>
              <p className="text-2xl font-bold text-white">{item.value}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Bandwidth Usage (${timeRange})`}>
          <AdvancedChart
            data={bandwidthData}
            type="area"
            height={300}
            color="#3b82f6"
            showGrid={true}
            animate={true}
          />
        </Card>

        <Card title="Protocol Distribution">
          <div className="space-y-4">
            {protocolData.map((protocol, index) => {
              const total = protocolData.reduce((sum, p) => sum + p.value, 0);
              const percentage = total > 0 ? (protocol.value / total) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{protocol.label}</span>
                    <span className="text-gray-400">{protocol.value} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Threat Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Threat Detection Trends">
            <AdvancedChart
              data={threatTrends}
              type="line"
              height={250}
              color="#ef4444"
              showGrid={true}
            />
          </Card>
        </div>
        
        <Card title="Recent Alerts">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {/* Sample recent alerts */}
            {[
              { type: 'Port Scan', severity: 'high', time: '2 min ago' },
              { type: 'Malware Detection', severity: 'critical', time: '15 min ago' },
              { type: 'Failed Login', severity: 'medium', time: '1 hour ago' }
            ].map((alert, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-700 rounded-md">
                <AlertTriangle className={`h-4 w-4 mr-3 ${
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{alert.type}</p>
                  <p className="text-gray-400 text-xs">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;