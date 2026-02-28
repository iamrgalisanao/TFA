import React, { useEffect, useState, useCallback } from 'react';
import {
    Building2, Plus, Wallet, Car, ArrowRightLeft, TrendingUp,
    AlertTriangle, CheckCircle2, RefreshCw, X, ChevronRight,
    Phone, Mail, ShieldCheck, Edit2, DollarSign
} from 'lucide-react';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = status === 'ACTIVE'
        ? { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', label: 'Active' }
        : { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', label: 'Low Balance' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.65rem',
            borderRadius: '20px', color: cfg.color, background: cfg.bg
        }}>
            {status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
            {cfg.label}
        </span>
    );
};

const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            required={required}
            style={{ padding: '0.6rem 0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '100%' }} />
    </div>
);

// ─── Create Operator Modal ─────────────────────────────────────────────────────
const CreateModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ name: '', email: '', contact_number: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const f = (field) => (val) => setForm(p => ({ ...p, [field]: val }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/operators', form);
            onCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create operator.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem' }}>Register New Operator</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>A wallet will be auto-created with ₱0.00 balance</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
                    <InputField label="Company / Operator Name" value={form.name} onChange={f('name')} placeholder="e.g. PITX Transport Services" required />
                    <InputField label="Email" type="email" value={form.email} onChange={f('email')} placeholder="ops@example.com" required />
                    <InputField label="Contact Number" value={form.contact_number} onChange={f('contact_number')} placeholder="09XX XXX XXXX" required />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating...' : 'Create Operator'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Top-up Modal ─────────────────────────────────────────────────────────────
const TopupModal = ({ operator, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const PRESETS = [500, 1000, 2000, 5000, 10000];

    const submit = async (e) => {
        e.preventDefault();
        const minor = Math.round(parseFloat(amount) * 100);
        if (!minor || minor < 100) { setError('Minimum top-up is ₱1.00'); return; }
        setLoading(true); setError('');
        try {
            const resp = await api.post(`/operators/${operator.id}/topup`, { amount_minor: minor, note });
            onSuccess(resp.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Top-up failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem' }}>Admin Wallet Top-up</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{operator.name}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Current Balance */}
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Balance</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{operator.balance_display}</span>
                    </div>
                    {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
                    {/* Preset amounts */}
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick amounts</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {PRESETS.map(p => (
                                <button key={p} type="button" onClick={() => setAmount(p.toString())}
                                    style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: '600', background: amount === p.toString() ? 'var(--primary)' : 'white', color: amount === p.toString() ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
                                    ₱{p.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <InputField label="Amount (PHP)" type="number" value={amount} onChange={setAmount} placeholder="e.g. 1000" required />
                    <InputField label="Internal Note (optional)" value={note} onChange={setNote} placeholder="Cash deposit, bank transfer ref..." />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--success)', color: 'white', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Processing...' : 'Confirm Top-up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Operator Detail Panel ────────────────────────────────────────────────────
const OperatorDetail = ({ operator, onClose, onTopup }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/operators/${operator.id}`).then(r => setDetail(r.data)).finally(() => setLoading(false));
    }, [operator.id]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '700px', padding: 0, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={18} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem' }}>{operator.name}</h3>
                            <StatusBadge status={operator.status} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} />{operator.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={12} />{operator.contact_number}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => onTopup(operator)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius)', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                            <DollarSign size={13} /> Top-up
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                </div>

                <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p> : (<>
                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {[
                                { label: 'Wallet Balance', value: operator.balance_display, icon: Wallet, color: 'var(--primary)' },
                                { label: 'Total Vehicles', value: operator.vehicle_count, icon: Car, color: '#8b5cf6' },
                                { label: 'Total Trips', value: detail?.stats?.total_trips ?? 0, icon: ArrowRightLeft, color: '#f59e0b' },
                                { label: 'Total Fees Paid', value: detail?.stats?.total_collected ?? '₱0.00', icon: TrendingUp, color: 'var(--success)' },
                            ].map(s => {
                                const Icon = s.icon;
                                return (
                                    <div key={s.label} style={{ background: 'var(--bg-main)', borderRadius: '10px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Icon size={14} color={s.color} />
                                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{s.label}</p>
                                        </div>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Vehicles */}
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Registered Vehicles</p>
                            {detail?.vehicles?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No vehicles registered yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {detail?.vehicles?.map(v => (
                                        <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Car size={16} color="var(--text-muted)" />
                                                <div>
                                                    <p style={{ fontWeight: '700' }}>{v.plate_number}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.vehicle_type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Trips */}
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Recent Trips (Last 20)</p>
                            {detail?.recent_trips?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No trip history.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {detail?.recent_trips?.map(t => (
                                        <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center', padding: '0.65rem 1rem', background: 'var(--bg-main)', borderRadius: '8px', fontSize: '0.82rem' }}>
                                            <span style={{ fontWeight: '700' }}>{t.plate_number}</span>
                                            <span style={{ color: t.status === 'EXIT_PAID' ? 'var(--success)' : t.status === 'HELD_INSUFFICIENT_FUNDS' ? 'var(--danger)' : '#f59e0b', fontWeight: '600', fontSize: '0.72rem' }}>
                                                {t.status === 'EXIT_PAID' ? 'Paid' : t.status === 'ENTRY_RECORDED' ? 'In Transit' : 'Held'}
                                            </span>
                                            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                                {new Date(t.created_at).toLocaleString('en-PH', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Operators = () => {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedOp, setSelectedOp] = useState(null);
    const [topupTarget, setTopupTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    const fetchOperators = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/operators');
            setOperators(r.data.operators || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchOperators(); }, [fetchOperators]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleTopupSuccess = (data) => {
        showToast(`✅ Top-up successful! New balance: ${data.balance_after_display}`);
        fetchOperators();
        if (selectedOp && selectedOp.id === topupTarget?.id) {
            setSelectedOp(prev => ({ ...prev, balance_display: data.balance_after_display, balance_minor: data.balance_after_minor }));
        }
    };

    const filtered = operators.filter(o =>
        !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.email.includes(search)
    );

    const totalBalance = operators.reduce((s, o) => s + o.balance_minor, 0);
    const lowBalance = operators.filter(o => o.status === 'LOW_BALANCE').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', padding: '0.875rem 1.25rem', background: 'var(--success)', color: 'white', borderRadius: '10px', fontWeight: '600', zIndex: 999, fontSize: '0.875rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                    {toast}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>Operator Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage registered transport operators, wallets, and vehicle fleets</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={fetchOperators} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button className="tour-operators-add" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                        <Plus size={14} /> Register Operator
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="tour-operators-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Operators', value: operators.length, color: 'var(--primary)', icon: Building2 },
                    { label: 'Total AUM (Wallets)', value: `₱${(totalBalance / 100).toFixed(2)}`, color: 'var(--success)', icon: Wallet },
                    { label: 'Active', value: operators.filter(o => o.status === 'ACTIVE').length, color: '#10b981', icon: CheckCircle2 },
                    { label: 'Low Balance Alert', value: lowBalance, color: lowBalance > 0 ? 'var(--danger)' : 'var(--text-muted)', icon: AlertTriangle },
                    { label: 'Total Vehicles', value: operators.reduce((s, o) => s + o.vehicle_count, 0), color: '#8b5cf6', icon: Car },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Icon size={14} color={s.color} />
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{s.label}</p>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by operator name or email..."
                style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '280px' }} />

            {/* Operator Cards Grid */}
            {loading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading operators...</p>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Building2 size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No operators found.</p>
                </div>
            ) : (
                <div className="tour-operators-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {filtered.map(op => (
                        <div key={op.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                            onClick={() => setSelectedOp(op)}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Building2 size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{op.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{op.email}</p>
                                    </div>
                                </div>
                                <StatusBadge status={op.status} />
                            </div>

                            {/* Stats Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {[
                                    { label: 'Balance', value: op.balance_display, color: op.status === 'LOW_BALANCE' ? 'var(--danger)' : 'var(--primary)' },
                                    { label: 'Vehicles', value: op.vehicle_count, color: '#8b5cf6' },
                                    { label: 'Trips', value: op.trip_count, color: '#f59e0b' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '0.75rem' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{s.label}</p>
                                        <p style={{ fontSize: '1rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Action Row */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={e => { e.stopPropagation(); setTopupTarget(op); }}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--success)', background: 'rgba(16,185,129,0.05)', color: 'var(--success)', fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer' }}>
                                    <DollarSign size={13} /> Top-up Wallet
                                </button>
                                <button onClick={e => { e.stopPropagation(); setSelectedOp(op); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>
                                    View <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchOperators} />}
            {selectedOp && <OperatorDetail operator={selectedOp} onClose={() => setSelectedOp(null)} onTopup={(op) => { setTopupTarget(op); }} />}
            {topupTarget && <TopupModal operator={topupTarget} onClose={() => setTopupTarget(null)} onSuccess={handleTopupSuccess} />}
        </div>
    );
};

export default Operators;
