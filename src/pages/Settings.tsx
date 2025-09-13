import React, { useState } from 'react';
import Card from '../components/UI/Card';
import { User, Shield, Bell, Download, Upload, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    securityUpdates: true,
    maintenanceAlerts: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      user: user?.email,
      exportDate: new Date().toISOString(),
      message: 'Data export functionality would be implemented here'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-dashboard-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    // Mock account deletion
    alert('Account deletion would be processed here. This is a demo version.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Profile Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value="demo@securedash.com"
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Created
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Update Profile
              </button>
            </div>
          </Card>

          <Card title="Data Management">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Download all your firewall rules, alerts, and settings data.
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Password & Authentication">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          </Card>

          <Card title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                  Enable 2FA
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Session Timeout</h4>
                  <p className="text-sm text-gray-400">Automatically sign out after inactivity</p>
                </div>
                <select className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Login Notifications</h4>
                  <p className="text-sm text-gray-400">Get notified of new sign-ins</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card title="Notification Preferences">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Security Alerts</h4>
                <p className="text-sm text-gray-400">Get notified about critical security events</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({
                  ...notifications,
                  emailAlerts: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Push Notifications</h4>
                <p className="text-sm text-gray-400">Real-time notifications in your browser</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={(e) => setNotifications({
                  ...notifications,
                  pushNotifications: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Security Updates</h4>
                <p className="text-sm text-gray-400">Updates about new security features</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.securityUpdates}
                onChange={(e) => setNotifications({
                  ...notifications,
                  securityUpdates: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Maintenance Alerts</h4>
                <p className="text-sm text-gray-400">Scheduled maintenance notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.maintenanceAlerts}
                onChange={(e) => setNotifications({
                  ...notifications,
                  maintenanceAlerts: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="pt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;