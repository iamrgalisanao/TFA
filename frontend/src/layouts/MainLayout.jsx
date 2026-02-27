import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Wallet, FileText, Settings, LogOut, Bell, Loader2, Users, ShieldAlert, MonitorPlay, Landmark } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const MainLayout = () => {
    const location = useLocation();
    const { role, switchRole, user, isAdmin, isStaff, isOperator, loading } = useAuth();
    const [balance, setBalance] = useState(null);

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
                    <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
                    <h2 style={{ fontSize: '1.25rem' }}>TFA Core</h2>
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
                        <button style={{ color: 'var(--text-muted)', background: 'transparent' }}><Bell size={20} /></button>
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
        </div>
    );
};

export default MainLayout;
