import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './components/UI/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';

// Enhanced Pages
import EnhancedDashboard from './pages/EnhancedDashboard';
import Firewall from './pages/Firewall';
import EnhancedPacketSniffer from './pages/EnhancedPacketSniffer';
import IDSAlerts from './pages/IDSAlerts';
import Dictionary from './pages/Dictionary';
import Settings from './pages/Settings';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<EnhancedDashboard />} />
              <Route path="firewall" element={<Firewall />} />
              <Route path="sniffer" element={<EnhancedPacketSniffer />} />
              <Route path="alerts" element={<IDSAlerts />} />
              <Route path="dictionary" element={<Dictionary />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;