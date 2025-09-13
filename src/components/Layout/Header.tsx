import React, { useState } from 'react';
import { Menu, Search, Bell, User, X } from 'lucide-react';
import { useNotifications } from '../UI/NotificationSystem';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { notifications, removeNotification, clearAll } = useNotifications();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => n.type === 'error' || n.type === 'warning').length;

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md relative"
            >
            <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-700 rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600">
                  <h3 className="text-sm font-medium text-white">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearAll();
                        setShowNotifications(false);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block text-sm">User</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
                  Current User
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;