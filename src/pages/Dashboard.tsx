import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardMetrics, ChartData } from '../types';
import MetricCard from '../components/UI/MetricCard';
import Card from '../components/UI/Card';
import { Activity, Shield, Zap, Clock, TrendingUp, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBandwidth: 0,
    activeConnections: 0,
    blockedThreats: 0,
    uptime: '99.9%'
  });
  const [bandwidthData, setBandwidthData] = useState<ChartData[]>([]);
  const [protocolData, setProtocolData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const trafficSubscription = supabase
      .channel('traffic_logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'traffic_logs' },
        () => loadDashboardData()
      )
      .subscribe();

    const alertsSubscription = supabase
      .channel('security_alerts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'security_alerts' },
        () => loadDashboardData()
      )
      .subscribe();

    return () => {
      trafficSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get traffic metrics
      const { data: trafficData } = await supabase
        .from('traffic_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get security alerts
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('status', 'active');

      if (trafficData) {
        const totalBandwidth = trafficData.reduce((sum, log) => sum + log.packet_size, 0);
        const activeConnections = new Set(trafficData.map(log => log.source_ip)).size;
        const blockedThreats = trafficData.filter(log => log.status === 'blocked').length;

        setMetrics({
          totalBandwidth: Math.round(totalBandwidth / 1024 / 1024), // MB
          activeConnections,
          blockedThreats,
          uptime: '99.9%'
        });

        // Process bandwidth data for chart
        const hourlyData = processHourlyBandwidth(trafficData);
        setBandwidthData(hourlyData);

        // Process protocol distribution
        const protocols = processProtocolDistribution(trafficData);
        setProtocolData(protocols);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processHourlyBandwidth = (data: any[]): ChartData[] => {
    const hourlyStats: { [key: string]: number } = {};
    
    data.forEach(log => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      hourlyStats[hour] = (hourlyStats[hour] || 0) + log.packet_size;
    });

    return Object.entries(hourlyStats)
      .map(([timestamp, value]) => ({
        timestamp,
        value: Math.round(value / 1024 / 1024) // Convert to MB
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-24); // Last 24 hours
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

  const exportReport = () => {
    const reportData = {
      metrics,
      bandwidthData,
      protocolData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
        <button
          onClick={exportReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Bandwidth (24h)"
          value={`${metrics.totalBandwidth} MB`}
          icon={TrendingUp}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Active Connections"
          value={metrics.activeConnections}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Blocked Threats"
          value={metrics.blockedThreats}
          icon={Shield}
          color="red"
        />
        <MetricCard
          title="System Uptime"
          value={metrics.uptime}
          icon={Clock}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bandwidth Usage (Last 24 Hours)">
          <div className="h-64 flex items-end space-x-2">
            {bandwidthData.map((point, index) => (
              <div key={index} className="flex-1 bg-blue-600 rounded-t" style={{ height: `${Math.max(point.value / Math.max(...bandwidthData.map(p => p.value)) * 100, 5)}%` }}>
                <div className="text-xs text-center text-white p-1">
                  {point.value}MB
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-400 text-center">
            Hourly bandwidth consumption
          </div>
        </Card>

        <Card title="Protocol Distribution">
          <div className="space-y-4">
            {protocolData.map((protocol, index) => {
              const percentage = (protocol.value / protocolData.reduce((sum, p) => sum + p.value, 0)) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{protocol.label}</span>
                    <span className="text-gray-400">{protocol.value} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Status Overview */}
      <Card title="System Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">Firewall</h3>
            <p className="text-green-400 text-sm">Active</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">IDS</h3>
            <p className="text-green-400 text-sm">Monitoring</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">VPN</h3>
            <p className="text-blue-400 text-sm">Connected</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;