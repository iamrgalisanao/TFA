import React from 'react';
import { Landmark, Users, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

const AdminPortal = ({ statsData }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Revenue (MTD)</p>
                            <h2 style={{ fontSize: '1.75rem' }}>₱1,250,400.00</h2>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '10px' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Registered Operators</p>
                            <h2 style={{ fontSize: '1.75rem' }}>12</h2>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending Remittances</p>
                            <h2 style={{ fontSize: '1.75rem' }}>₱45,000.00</h2>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '10px' }}>
                            <Landmark size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>System Health & Audit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { msg: 'System integrity check passed', status: 'success', time: '10m ago' },
                            { msg: 'Operator "PITX SVC" topped up ₱50,000', status: 'info', time: '1h ago' },
                            { msg: 'Manual override executed on LANE-EX-01', status: 'warning', time: '2h ago' },
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius)' }}>
                                <div style={{
                                    width: '8px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    background: log.status === 'success' ? 'var(--success)' : (log.status === 'warning' ? '#f59e0b' : 'var(--primary)')
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{log.msg}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Quick Exports</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <FileText size={16} /> Daily Revenue Report
                        </button>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <Landmark size={16} /> DOTr Remittance Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPortal;
