export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface FirewallRule {
  id: string;
  name: string;
  action: 'allow' | 'block';
  source_ip: string;
  destination_ip?: string;
  port_range: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'ICMP';
  priority: number;
  enabled: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TrafficLog {
  id: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'ICMP';
  packet_size: number;
  status: 'allowed' | 'blocked';
  timestamp: string;
  firewall_rule_id?: string;
}

export interface SecurityAlert {
  id: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  detection_time: string;
  resolved_time?: string;
  recommended_action: string;
  user_id: string;
}

export interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'protocols' | 'threats' | 'tools' | 'concepts';
  examples?: string;
  related_terms?: string[];
  bookmarked: boolean;
  created_at: string;
  user_id: string;
}

export interface DashboardMetrics {
  totalBandwidth: number;
  activeConnections: number;
  blockedThreats: number;
  uptime: string;
}

export interface ChartData {
  timestamp: string;
  value: number;
  label?: string;
}