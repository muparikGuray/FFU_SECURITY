const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class PythonApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Firewall API methods
  async getFirewallRules() {
    return this.request<{ rules: any[] }>('/api/firewall/rules');
  }

  async createFirewallRule(rule: any) {
    return this.request<{ rule: any; message: string }>('/api/firewall/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateFirewallRule(ruleId: string, updates: any) {
    return this.request<{ message: string }>(`/api/firewall/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFirewallRule(ruleId: string) {
    return this.request<{ message: string }>(`/api/firewall/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  // Packet Sniffer API methods
  async startPacketCapture() {
    return this.request<{ message: string; status: string }>('/api/sniffer/start', {
      method: 'POST',
    });
  }

  async stopPacketCapture() {
    return this.request<{ message: string; status: string }>('/api/sniffer/stop', {
      method: 'POST',
    });
  }

  async getCaptureStatus() {
    return this.request<{ is_capturing: boolean; packet_count: number }>('/api/sniffer/status');
  }

  async getPackets() {
    return this.request<{ packets: any[] }>('/api/sniffer/packets');
  }

  async clearPackets() {
    return this.request<{ message: string }>('/api/sniffer/packets', {
      method: 'DELETE',
    });
  }

  // IP Lookup API methods
  async lookupIP(ip: string) {
    return this.request<{ ip: string; info: any }>('/api/lookup/ip', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }

  // Network Scanner API methods
  async scanNetwork(ip: string) {
    return this.request<{ ip: string; open_ports: any[] }>('/api/scanner/scan', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }

  // Dashboard API methods
  async getDashboardMetrics() {
    return this.request<{
      totalBandwidth: number;
      activeConnections: number;
      blockedThreats: number;
      uptime: string;
    }>('/api/dashboard/metrics');
  }

  // Security Alerts API methods
  async getSecurityAlerts() {
    return this.request<{ alerts: any[] }>('/api/alerts');
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const pythonApi = new PythonApiClient();