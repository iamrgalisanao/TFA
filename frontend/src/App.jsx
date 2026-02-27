import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landmark, Settings as SettingsIcon, MonitorPlay } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Operators from './pages/Operators';
import AuditLogs from './pages/AuditLogs';
import ComingSoon from './components/ComingSoon';

// ─── Coming Soon pages ───────────────────────────────────────────────────────
const Remittances = () => (
  <ComingSoon
    title="DOTr Remittance Reports"
    description="Automated daily/monthly remittance batching and submission to the Department of Transportation (DOTr). Includes bank API integration, PDF report generation, and digital signature workflows."
    icon={Landmark}
    eta="Phase 3 — Pending DOTr banking partner API specifications"
  />
);

const Lanes = () => (
  <ComingSoon
    title="Lane Control Center"
    description="Dedicated real-time lane monitoring dashboard with historical barrier events, camera feed health status, and advanced override audit trail."
    icon={MonitorPlay}
    eta="Phase 3 — Pending hardware provisioning"
  />
);

const Settings = () => (
  <ComingSoon
    title="System Settings"
    description="Account configuration, notification preferences, fee schedule management, HMAC key rotation, and role management."
    icon={SettingsIcon}
    eta="Phase 3 — After core features are stabilized"
  />
);

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="operators" element={<Operators />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="lanes" element={<Lanes />} />
          <Route path="remittances" element={<Remittances />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
