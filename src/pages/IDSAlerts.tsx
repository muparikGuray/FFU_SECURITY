import React, { useState, useEffect } from 'react';
import { SecurityAlert } from '../types';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { AlertTriangle, CheckCircle, Clock, Search, Filter } from 'lucide-react';

const IDSAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, filterSeverity, filterStatus]);

  const loadAlerts = async () => {
    try {
      // Generate mock security alerts for demonstration
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          threat_type: 'Port Scan',
          severity: 'high',
          source_ip: '192.168.1.100',
          description: 'Multiple port scan attempts detected from this IP address',
          status: 'active',
          detection_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          resolved_time: undefined,
          recommended_action: 'Block the source IP address and investigate further',
          user_id: 'demo-user'
        },
        {
          id: '2',
          threat_type: 'Malware Detection',
          severity: 'critical',
          source_ip: '10.0.0.50',
          description: 'Suspicious file detected with malware signatures',
          status: 'acknowledged',
          detection_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          resolved_time: undefined,
          recommended_action: 'Quarantine the affected system and run full antivirus scan',
          user_id: 'demo-user'
        },
        {
          id: '3',
          threat_type: 'Failed Login Attempts',
          severity: 'medium',
          source_ip: '172.16.0.10',
          description: 'Multiple failed login attempts detected',
          status: 'resolved',
          detection_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          resolved_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          recommended_action: 'Monitor for continued suspicious activity',
          user_id: 'demo-user'
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.threat_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source_ip.includes(searchTerm) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus);
    }

    setFilteredAlerts(filtered);
  };

  const updateAlertStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    try {
      // Mock update functionality
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status, 
              resolved_time: status === 'resolved' ? new Date().toISOString() : alert.resolved_time 
            }
          : alert
      ));
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400';
      case 'high': return 'bg-orange-500/10 text-orange-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400';
      case 'low': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/10 text-red-400';
      case 'acknowledged': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const columns = [
    {
      key: 'detection_time',
      header: 'Detection Time',
      render: (value: string) => new Date(value).toLocaleString(),
      className: 'w-40'
    },
    {
      key: 'threat_type',
      header: 'Threat Type'
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'source_ip',
      header: 'Source IP'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, alert: SecurityAlert) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedAlert(alert);
              setShowDetailModal(true);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Details
          </button>
          {alert.status === 'active' && (
            <button
              onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button
              onClick={() => updateAlertStatus(alert.id, 'resolved')}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      )
    }
  ];

  const severityStats = {
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
    medium: alerts.filter(a => a.severity === 'medium' && a.status === 'active').length,
    low: alerts.filter(a => a.severity === 'low' && a.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Intrusion Detection System</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-400">{severityStats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-400">{severityStats.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Medium Priority</p>
              <p className="text-2xl font-bold text-yellow-400">{severityStats.medium}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved Today</p>
              <p className="text-2xl font-bold text-green-400">
                {alerts.filter(a => a.status === 'resolved' && 
                  new Date(a.resolved_time || '').toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card title={`Security Alerts (${filteredAlerts.length})`}>
        <Table data={filteredAlerts} columns={columns} loading={loading} />
      </Card>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAlert(null);
        }}
        title="Alert Details"
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Threat Type
                </label>
                <p className="text-white">{selectedAlert.threat_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Severity
                </label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Source IP
                </label>
                <p className="text-white">{selectedAlert.source_ip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Detection Time
                </label>
                <p className="text-white">{new Date(selectedAlert.detection_time).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <p className="text-white bg-gray-700 p-3 rounded">{selectedAlert.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recommended Action
              </label>
              <p className="text-white bg-gray-700 p-3 rounded">{selectedAlert.recommended_action}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              {selectedAlert.status === 'active' && (
                <button
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, 'acknowledged');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              {selectedAlert.status !== 'resolved' && (
                <button
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, 'resolved');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IDSAlerts;