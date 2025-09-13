import { useState, useEffect, useCallback, useMemo } from 'react';
import { FirewallRule } from '../types';

export const useFirewallRules = () => {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterProtocol, setFilterProtocol] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'created_at'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockRules: FirewallRule[] = [
        {
          id: '1',
          name: 'Block Suspicious IPs',
          action: 'block',
          source_ip: '192.168.1.0/24',
          destination_ip: 'any',
          port_range: '80,443',
          protocol: 'HTTP',
          priority: 1,
          enabled: true,
          description: 'Block traffic from suspicious IP range',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'demo-user'
        }
      ];
      setRules(mockRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchTerm || 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.source_ip.includes(searchTerm) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = filterAction === 'all' || rule.action === filterAction;
      const matchesProtocol = filterProtocol === 'all' || rule.protocol === filterProtocol;
      
      return matchesSearch && matchesAction && matchesProtocol;
    });
  }, [rules, searchTerm, filterAction, filterProtocol]);

  const addRule = useCallback(async (ruleData: Omit<FirewallRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Mock add functionality
      const newRule: FirewallRule = {
        ...ruleData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      };
      setRules(prev => [...prev, newRule]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add rule');
    }
  }, []);

  const updateRule = useCallback(async (id: string, ruleData: Partial<FirewallRule>) => {
    try {
      // Mock update functionality
      setRules(prev => prev.map(rule => 
        rule.id === id 
          ? { ...rule, ...ruleData, updated_at: new Date().toISOString() }
          : rule
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update rule');
    }
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    try {
      // Mock delete functionality
      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  }, []);

  const bulkUpdateRules = useCallback(async (ids: string[], updates: Partial<FirewallRule>) => {
    try {
      // Mock bulk update functionality
      setRules(prev => prev.map(rule => 
        ids.includes(rule.id)
          ? { ...rule, ...updates, updated_at: new Date().toISOString() }
          : rule
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to bulk update rules');
    }
  }, []);

  const reorderRules = useCallback(async (ruleIds: string[]) => {
    try {
      const updates = ruleIds.map((id, index) => ({
        id,
        priority: index + 1
      }));

      for (const update of updates) {
        await updateRule(update.id, { priority: update.priority });
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reorder rules');
    }
  }, [updateRule]);

  return {
    rules: filteredRules,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterAction,
    setFilterAction,
    filterProtocol,
    setFilterProtocol,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addRule,
    updateRule,
    deleteRule,
    bulkUpdateRules,
    reorderRules,
    refresh: loadRules
  };
};