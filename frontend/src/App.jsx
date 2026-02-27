import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Wallet from './pages/Wallet';

// Placeholder pages
const Transactions = () => <div className="card"><h3>Transaction History</h3><p style={{ color: 'var(--text-muted)' }}>Full audit log of all trip fees and top-ups.</p></div>;
const Settings = () => <div className="card"><h3>System Settings</h3><p style={{ color: 'var(--text-muted)' }}>Configure your account and notification preferences.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
