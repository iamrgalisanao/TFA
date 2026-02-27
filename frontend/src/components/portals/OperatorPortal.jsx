import React from 'react';
import { Car, Wallet, ArrowUpRight, ArrowDownRight, Clock, Activity, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const OperatorPortal = ({ statsData }) => {
    const stats = [
        { name: 'My Registered Vehicles', value: statsData.vehicles, icon: Car, trend: '+2', color: 'var(--primary)' },
        { name: 'Last Month Fees', value: '₱5,250.00', icon: Activity, trend: '-5%', color: 'var(--danger)' },
        { name: 'Available Balance', value: `₱${statsData.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, trend: 'Stable', color: 'var(--primary)' },
    ];

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
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Clock size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>No recent trips for your vehicles.</p>
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
