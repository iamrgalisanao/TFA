import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';

// Placeholder pages
const Settings = () => <div className="card"><h3>System Settings</h3><p style={{ color: 'var(--text-muted)' }}>Configure your account and notification preferences.</p></div>;
const Lanes = () => <div className="card"><h3>Lane Management</h3><p style={{ color: 'var(--text-muted)' }}>Dedicated lane monitoring view coming soon.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="lanes" element={<Lanes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
