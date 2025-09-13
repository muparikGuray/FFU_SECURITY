import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Activity, 
  AlertTriangle, 
  BookOpen, 
  Settings,
  X,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Firewall', href: '/firewall', icon: Shield },
  { name: 'Packet Sniffer', href: '/sniffer', icon: Activity },
  { name: 'IDS Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Dictionary', href: '/dictionary', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out
        ${isOpen || !window.matchMedia('(max-width: 768px)').matches ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">SecureDash</h1>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;