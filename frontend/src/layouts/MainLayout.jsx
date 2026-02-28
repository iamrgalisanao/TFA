import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Wallet, FileText, Settings, LogOut, Bell, Loader2, Users, ShieldAlert, MonitorPlay, Landmark, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import HelpTour from '../components/HelpTour';


const MainLayout = () => {
    const location = useLocation();
    const { role, switchRole, user, isAdmin, isStaff, isOperator, loading } = useAuth();
    const [balance, setBalance] = useState(null);
    const [runTour, setRunTour] = useState(false);

    const fetchBalance = async () => {
        if (!isOperator) return;
        try {
            const resp = await api.get('/wallet' + (role === 'operator' ? `?mock_role=${role}` : ''));
            setBalance(resp.data.balance_minor / 100);
        } catch (err) {
            console.error('Balance fetch error:', err);
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [location.pathname, role]);

    const getNavItems = () => {
        const items = [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'staff', 'operator'] },
            { name: 'Vehicles', path: '/vehicles', icon: Car, roles: ['admin', 'operator'] },
            { name: 'Operators', path: '/operators', icon: Users, roles: ['admin'] },
            { name: 'Lanes', path: '/lanes', icon: MonitorPlay, roles: ['admin', 'staff'] },
            { name: 'Wallet', path: '/wallet', icon: Wallet, roles: ['operator'] },
            { name: 'Transactions', path: '/transactions', icon: FileText, roles: ['admin', 'operator'] },
            { name: 'Remittances', path: '/remittances', icon: Landmark, roles: ['admin'] },
            { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
            { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'staff', 'operator'] },
        ];
        return items.filter(item => item.roles.includes(role));
    };

    const navItems = getNavItems();

    const getTourSteps = () => {
        // Dashboard Tours
        if (location.pathname === '/') {
            if (isAdmin) return [
                { target: '.tour-admin-stats', content: 'These top cards show your live revenue generation (MTD), registered partner operators, and pending remittances queued for payout.', placement: 'bottom' },
                { target: '.tour-admin-audit', content: 'The System Health & Audit trail provides a real-time, non-reputable log of all critical system activities and lane overrides.', placement: 'left' },
                { target: '.tour-admin-exports', content: 'Export clean PDF / Excel spreadsheets of the ledger here, ready for DOTr or Finance reconciliation.', placement: 'left' },
            ];
            if (isStaff) return [
                { target: '.tour-staff-stats', content: 'Stay on top of live alerts and quickly identify if any hardware components go offline.', placement: 'bottom' },
                { target: '.tour-staff-feed', content: 'This terminal feed streams every incoming and outgoing vehicle recognized by the ANPR cameras in real-time.', placement: 'right' },
                { target: '.tour-staff-override', content: 'In case of emergency, physical sensor malfunction, or missing plates, use this panel to forcefully command the barrier to open or close.', placement: 'left' },
            ];
            if (isOperator) return [
                { target: '.tour-operator-stats', content: 'Track exactly how many vehicles you have registered in the fleet, and view the amount of toll/parking fees deducted this month.', placement: 'bottom' },
                { target: '.tour-operator-feed', content: 'A live feed of your own drivers. Watch them ping entry/exit gates and verify the exact fee deducted at that exact second.', placement: 'right' },
                { target: '.tour-operator-topup', content: 'Need a higher balance so your drivers never get stuck at a gate? Start a real-time GCash/Bank top-up here.', placement: 'left' },
            ];
        }

        // Sub-page Tours (Admin mostly requested these so far)
        if (location.pathname === '/vehicles') {
            return [
                { target: '.tour-vehicles-add', content: 'Click here to register a new vehicle into the system, binding it to a specific operator.', placement: 'bottom' },
                { target: '.tour-vehicles-search', content: 'Quickly find specific plate numbers or filter the fleet by vehicle type (e.g. Bus vs. Minibus).', placement: 'bottom' },
                { target: '.tour-vehicles-table', content: 'This table contains the master list of all authorized vehicles allowed to trigger barrier entry/exit.', placement: 'top' },
            ];
        }

        if (location.pathname === '/operators') {
            return [
                { target: '.tour-operators-add', content: 'Register a new Transport Operator. A digital wallet shadow account will be created automatically for them.', placement: 'bottom' },
                { target: '.tour-operators-summary', content: 'Monitor the Total Assets Under Management (AUM) across all operator wallets, and spot any accounts with low balances.', placement: 'bottom' },
                { target: '.tour-operators-list', content: 'Click any operator card to detailed analytics, view trip history, or process manual wallet Top-ups if they handed you cash/bank transfer.', placement: 'top' },
            ];
        }

        if (location.pathname === '/transactions') {
            return [
                { target: '.tour-transactions-summary', content: 'View aggregate revenue numbers, and quickly see how many trips are actively "In Transit" inside the terminal right now.', placement: 'bottom' },
                { target: '.tour-transactions-filter', content: 'Search by plate number, or filter explicitly for trips that are Held due to Insufficient Funds.', placement: 'bottom' },
                { target: '.tour-transactions-table', content: 'This is the immutable ledger of trips. Click any row to expand a granular timeline of exactly when the vehicle entered and exited, down to the second.', placement: 'top' },
            ];
        }

        if (location.pathname === '/audit') {
            return [
                { target: '.tour-audit-summary', content: 'This unified log captures hardware alerts, lane overrides, financial debits, and software events in one place.', placement: 'bottom' },
                { target: '.tour-audit-filter', content: 'Need to investigate a manual barrier open? Filter by "Overrides" to isolate those specific critical events.', placement: 'bottom' },
                { target: '.tour-audit-feed', content: 'Scroll through the chronological timeline. Every entry records the EXACT Actor (Admin/Staff) and the associated Idempotency key for forensic analysis.', placement: 'top' },
            ];
        }

        if (['/lanes', '/remittances', '/settings'].includes(location.pathname)) {
            return [
                { target: '.tour-coming-soon', content: 'This module is currently parked for a future sprint. Stay tuned for updates!', placement: 'bottom' }
            ];
        }

        return [];
    };

    const tourSteps = getTourSteps();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '0 0.5rem 2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/tfa.svg" alt="TFA Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <div>
                        <h2 style={{ fontSize: '1rem', lineHeight: 1.1, margin: 0 }}>Terminal Fee</h2>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Automation</p>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius)',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    background: isActive ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Role Switcher (DEV ONLY) */}
                <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Debug Mode</div>
                    <select
                        value={role}
                        onChange={(e) => switchRole(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                    >
                        <option value="admin">Admin Portal</option>
                        <option value="staff">Staff Console</option>
                        <option value="operator">Operator Portal</option>
                    </select>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius)',
                        color: 'var(--danger)',
                        background: 'transparent',
                    }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{
                    height: '70px',
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '10px', marginLeft: '0.5rem', textTransform: 'uppercase' }}>
                            {role}
                        </span>
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {isOperator && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                <Wallet size={16} color="var(--primary)" />
                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                    {balance !== null ? `₱${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <Loader2 size={14} className="animate-spin" />}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (tourSteps.length > 0) {
                                    setRunTour(true);
                                } else {
                                    alert("No interactive guide available for this page currently.");
                                }
                            }}
                            title="Start Interactive Guide"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}
                        >
                            <HelpCircle size={20} />
                        </button>
                        <button style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="desktop-only" style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isOperator ? user?.operator?.name : 'TFA Unit'}</div>
                            </div>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                                {user?.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                        </div>
                    </div>
                </header>

                <section style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--bg-main)' }}>
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </section>
            </main>

            <HelpTour steps={tourSteps} run={runTour} setRun={setRunTour} />
        </div>
    );
};

export default MainLayout;
