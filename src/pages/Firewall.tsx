import React, { useState, useEffect } from 'react';
import { FirewallRule } from '../types';
import { pythonApi } from '../lib/pythonApi';
import { useNotifications } from '../components/UI/NotificationSystem';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Plus, Edit, Trash2, Search, Filter, ToggleLeft, ToggleRight } from 'lucide-react';

const Firewall: React.FC = () => {
  const { addNotification } = useNotifications();
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterProtocol, setFilterProtocol] = useState<string>('all');

  useEffect(() => {
    loadRules();
  }, []);

  useEffect(() => {
    filterRules();
  }, [rules, searchTerm, filterAction, filterProtocol]);

  const loadRules = async () => {
    try {
      const response = await pythonApi.getFirewallRules();
      if (response.error) {
        throw new Error(response.error);
      }
      setRules(response.data?.rules || []);
      addNotification({
        type: 'success',
        title: 'Rules Loaded',
        message: `Loaded ${response.data?.rules?.length || 0} firewall rules`
      });
    } catch (error) {
      console.error('Error loading firewall rules:', error);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load firewall rules from backend'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRules = () => {
    let filtered = rules;

    if (searchTerm) {
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.source_ip.includes(searchTerm) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(rule => rule.action === filterAction);
    }

    if (filterProtocol !== 'all') {
      filtered = filtered.filter(rule => rule.protocol === filterProtocol);
    }

    setFilteredRules(filtered);
  };

  const handleSaveRule = async (ruleData: Omit<FirewallRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (editingRule) {
        const response = await pythonApi.updateFirewallRule(editingRule.id, ruleData);
        if (response.error) {
          throw new Error(response.error);
        }
        addNotification({
          type: 'success',
          title: 'Rule Updated',
          message: 'Firewall rule updated successfully'
        });
      } else {
        const response = await pythonApi.createFirewallRule(ruleData);
        if (response.error) {
          throw new Error(response.error);
        }
        addNotification({
          type: 'success',
          title: 'Rule Created',
          message: 'New firewall rule created successfully'
        });
      }
      
      // Reload rules to get updated data
      await loadRules();
      setShowModal(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Error saving firewall rule:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save firewall rule'
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await pythonApi.deleteFirewallRule(ruleId);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Reload rules to get updated data
      await loadRules();
      addNotification({
        type: 'success',
        title: 'Rule Deleted',
        message: 'Firewall rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting firewall rule:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete firewall rule'
      });
    }
  };

  const handleToggleRule = async (rule: FirewallRule) => {
    try {
      const response = await pythonApi.updateFirewallRule(rule.id, { enabled: !rule.enabled });
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Reload rules to get updated data
      await loadRules();
      addNotification({
        type: 'info',
        title: 'Rule Updated',
        message: `Rule ${rule.enabled ? 'disabled' : 'enabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling firewall rule:', error);
      addNotification({
        type: 'error',
        title: 'Toggle Failed',
        message: 'Failed to toggle firewall rule'
      });
    }
  };

  const columns = [
    {
      key: 'priority',
      header: 'Priority',
      className: 'w-20'
    },
    {
      key: 'name',
      header: 'Rule Name'
    },
    {
      key: 'action',
      header: 'Action',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'allow' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'source_ip',
      header: 'Source IP'
    },
    {
      key: 'port_range',
      header: 'Port Range'
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
      key: 'enabled',
      header: 'Status',
      render: (value: boolean, rule: FirewallRule) => (
        <button
          onClick={() => handleToggleRule(rule)}
          className="flex items-center space-x-1"
        >
          {value ? (
            <ToggleRight className="h-5 w-5 text-green-400" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
          <span className={`text-xs ${value ? 'text-green-400' : 'text-gray-400'}`}>
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, rule: FirewallRule) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingRule(rule);
              setShowModal(true);
            }}
            className="p-1 text-blue-400 hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteRule(rule.id)}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Firewall Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="allow">Allow</option>
            <option value="block">Block</option>
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

      {/* Rules Table */}
      <Card title={`Firewall Rules (${filteredRules.length})`}>
        <Table data={filteredRules} columns={columns} loading={loading} />
      </Card>

      {/* Rule Modal */}
      <RuleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />
    </div>
  );
};

const RuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: any) => void;
  editingRule: FirewallRule | null;
}> = ({ isOpen, onClose, onSave, editingRule }) => {
  const [formData, setFormData] = useState({
    name: '',
    action: 'allow' as 'allow' | 'block',
    source_ip: '',
    destination_ip: '',
    port_range: '',
    protocol: 'TCP' as 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'ICMP',
    priority: 1,
    enabled: true,
    description: ''
  });

  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        action: editingRule.action,
        source_ip: editingRule.source_ip,
        destination_ip: editingRule.destination_ip || '',
        port_range: editingRule.port_range,
        protocol: editingRule.protocol,
        priority: editingRule.priority,
        enabled: editingRule.enabled,
        description: editingRule.description || ''
      });
    } else {
      setFormData({
        name: '',
        action: 'allow',
        source_ip: '',
        destination_ip: '',
        port_range: '',
        protocol: 'TCP',
        priority: 1,
        enabled: true,
        description: ''
      });
    }
  }, [editingRule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? 'Edit Firewall Rule' : 'Add Firewall Rule'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Action *
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value as 'allow' | 'block' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="allow">Allow</option>
              <option value="block">Block</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Source IP *
            </label>
            <input
              type="text"
              required
              value={formData.source_ip}
              onChange={(e) => setFormData({ ...formData, source_ip: e.target.value })}
              placeholder="192.168.1.0/24 or 192.168.1.100"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Destination IP
            </label>
            <input
              type="text"
              value={formData.destination_ip}
              onChange={(e) => setFormData({ ...formData, destination_ip: e.target.value })}
              placeholder="Any or specific IP"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Port Range *
            </label>
            <input
              type="text"
              required
              value={formData.port_range}
              onChange={(e) => setFormData({ ...formData, port_range: e.target.value })}
              placeholder="80, 443, 8000-8100"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Protocol *
            </label>
            <select
              value={formData.protocol}
              onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority *
            </label>
            <input
              type="number"
              required
              min="1"
              max="100"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 text-sm text-gray-300">
            Enable this rule
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {editingRule ? 'Update Rule' : 'Add Rule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Firewall;