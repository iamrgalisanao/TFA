import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, Plus, History, Loader2, CheckCircle2, TrendingUp, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const { role } = useAuth();
    const [data, setData] = useState({
        balance_minor: 0,
        transactions: [],
        stats: { usage_monthly_minor: 0, topups_monthly_minor: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [showTopup, setShowTopup] = useState(false);
    const [topupAmount, setTopupAmount] = useState('500');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    const fetchWalletData = async () => {
        try {
            const resp = await api.get(`/wallet?mock_role=${role}`);
            setData(resp.data);
        } catch (err) {
            console.error('Wallet fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [role]);

    const handleTopup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.post(`/wallet/topup?mock_role=${role}`, { amount_minor: parseInt(topupAmount) * 100 });
            setMessage({ type: 'success', text: 'Top-up successful!' });
            await fetchWalletData();
            setTimeout(() => setShowTopup(false), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: 'Top-up failed. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (minor) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(minor / 100);
    };

    const filteredTransactions = data.transactions.filter(tx => {
        const matchSearch = !search || String(tx.idempotency_key).toLowerCase().includes(search.toLowerCase());
        const matchType = filter === 'ALL' || tx.type === filter;
        return matchSearch && matchType;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>Wallet & Credits</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your pre-paid terminal fee credits.</p>
                </div>
                <button
                    onClick={() => setShowTopup(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <Plus size={18} />
                    Top-up Wallet
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Balance Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                                <WalletIcon size={24} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8, letterSpacing: '1px' }}>PREPAID ACCOUNT</span>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Available Balance</p>
                            <h1 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{formatCurrency(data.balance_minor)}</h1>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8 }}>
                            <span>OPERATOR: {data.operator}</span>
                            <span>ACTIVE</span>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} color="var(--primary)" />
                            Monthly Overview
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Usage this month</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{formatCurrency(data.stats?.usage_monthly_minor || 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Top-ups</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(data.stats?.topups_monthly_minor || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <History size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.125rem' }}>Ledger Activity</h3>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-main)' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search Reference ID..."
                                style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['ALL', 'CREDIT', 'DEBIT'].map(f => (
                                <button key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                        border: '1px solid var(--border)', cursor: 'pointer',
                                        background: filter === f ? 'var(--primary)' : 'white',
                                        color: filter === f ? 'white' : 'var(--text-muted)'
                                    }}>
                                    {f === 'ALL' ? 'All' : f === 'CREDIT' ? 'Credits In (+)' : 'Debits Out (-)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reference</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {tx.type === 'CREDIT' ?
                                                        <ArrowUpCircle size={18} color="var(--success)" /> :
                                                        <ArrowDownCircle size={18} color="var(--danger)" />
                                                    }
                                                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{tx.idempotency_key}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: 'var(--bg-main)',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: '600'
                                                }}>
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {new Date(tx.created_at).toLocaleString()}
                                            </td>
                                            <td style={{
                                                padding: '1.25rem 1.5rem',
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                color: tx.type === 'CREDIT' ? 'var(--success)' : 'var(--text-main)'
                                            }}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount_minor)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Topup Modal */}
            {showTopup && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Wallet Top-up</h3>

                        <form onSubmit={handleTopup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {['500', '1000', '2000'].map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setTopupAmount(amt)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            background: topupAmount === amt ? 'var(--primary)' : 'white',
                                            color: topupAmount === amt ? 'white' : 'var(--text-main)',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ₱{amt}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Custom Amount (PHP)</label>
                                <input
                                    type="number"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>

                            {message && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius)',
                                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'
                                }}>
                                    {message.type === 'success' && <CheckCircle2 size={16} />}
                                    {message.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button" onClick={() => setShowTopup(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={isSubmitting}
                                    style={{
                                        flex: 2, padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                    {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
