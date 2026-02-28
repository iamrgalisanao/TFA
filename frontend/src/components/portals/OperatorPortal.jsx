import React, { useState } from 'react';
import { Car, Wallet, ArrowUpRight, ArrowDownRight, Clock, Activity, CreditCard, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const OperatorPortal = ({ statsData }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const usageMonthly = statsData.walletFull?.stats?.usage_monthly_minor ? (statsData.walletFull.stats.usage_monthly_minor / 100) : 0;
    const stats = [
        { name: 'My Registered Vehicles', value: statsData.vehicles, icon: Car, trend: 'Active', color: 'var(--primary)' },
        { name: 'Last Month Fees', value: `₱${usageMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Activity, trend: 'Usage', color: 'var(--danger)' },
        { name: 'Available Balance', value: `₱${statsData.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, trend: 'Stable', color: 'var(--primary)' },
    ];

    const filteredTrips = (statsData.trips || []).filter(t => {
        const matchSearch = !search || String(t.plate_number).toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {stats.map((stat) => (
                    <div key={stat.name} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '10px', background: `${stat.color}10`, color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: stat.trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.name}</p>
                            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Recent Fleet Activity</h3>
                        <Link to="/transactions" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
                    </div>

                    {/* Table Filters */}
                    {statsData.trips?.length > 0 && (
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-main)' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search plate number..."
                                    style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%' }}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '0.5rem 1.5rem 0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white', color: 'var(--text-main)', fontSize: '0.875rem' }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="EXIT_PAID">Paid</option>
                                <option value="ENTRY_RECORDED">In Transit</option>
                                <option value="HELD_INSUFFICIENT_FUNDS">Held</option>
                            </select>
                        </div>
                    )}

                    {/* Traffic Feed Table for Operator */}
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                        {(!statsData.trips || statsData.trips.length === 0) ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Clock size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <p>No recent trips for your vehicles.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead style={{ background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Plate</th>
                                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Entry Time</th>
                                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'right' }}>Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTrips.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matches found.</td>
                                        </tr>
                                    ) : (
                                        filteredTrips.slice(0, 10).map((trip) => (
                                            <tr key={trip.id} className="table-row">
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Car size={16} color="var(--primary)" />
                                                        {trip.plate_number}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                        background: trip.status === 'EXIT_PAID' ? 'rgba(16, 185, 129, 0.1)' :
                                                            trip.status.includes('HELD') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: trip.status === 'EXIT_PAID' ? 'var(--success)' :
                                                            trip.status.includes('HELD') ? 'var(--danger)' : 'var(--warning)'
                                                    }}>
                                                        {trip.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                                    {trip.entry_time ? new Date(trip.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>
                                                    {trip.fee_display}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CreditCard size={24} />
                        <h3 style={{ color: 'white' }}>Quick Top-up</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1.5rem' }}>Reload your wallet instantly to ensure uninterrupted passage for your fleet.</p>
                    <Link to="/wallet" style={{
                        display: 'block',
                        width: '100%',
                        background: 'white',
                        color: 'var(--primary)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textAlign: 'center',
                        textDecoration: 'none'
                    }}>
                        Reload Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorPortal;
