import React, { useEffect, useState, useCallback } from 'react';
import {
    ArrowRightLeft, CheckCircle2, AlertTriangle, Clock, ShieldCheck,
    RefreshCw, ChevronRight, X, Car, Hash, Landmark, Timer
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
    EXIT_PAID: { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', label: 'Paid', icon: CheckCircle2 },
    ENTRY_RECORDED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'In Transit', icon: Clock },
    HELD_INSUFFICIENT_FUNDS: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', label: 'Held – Insufficient', icon: AlertTriangle },
    OVERRIDDEN: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Overridden', icon: ShieldCheck },
    EXIT_PENDING_PAYMENT: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'Pending Payment', icon: Clock },
};

const Badge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: status, icon: Clock };
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.65rem',
            borderRadius: '20px', color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap'
        }}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
};

const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-PH', {
        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
};

// --- Trip Detail Modal ---
const TripModal = ({ trip, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/trips/${trip.id}`).then(r => setDetail(r.data)).finally(() => setLoading(false));
    }, [trip.id]);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem' }}>Trip Audit Trail</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{trip.id}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit data...</div>
                ) : (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Summary row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {[
                                { label: 'Plate', value: trip.plate_number, icon: Car },
                                { label: 'Vehicle Type', value: trip.vehicle_type, icon: Car },
                                { label: 'Status', custom: <Badge status={trip.status} /> },
                            ].map(({ label, value, custom, icon: Icon }) => (
                                <div key={label} style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</p>
                                    {custom || <p style={{ fontWeight: '700' }}>{value}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Timeline */}
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Event Timeline</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {/* Entry Event */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white', boxShadow: '0 0 0 2px var(--success)', flexShrink: 0 }}></div>
                                        <div style={{ width: '2px', height: '40px', background: 'var(--border)' }}></div>
                                    </div>
                                    <div style={{ paddingBottom: '1rem' }}>
                                        <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Vehicle Entry — {trip.entry_lane ?? '—'}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{formatTime(trip.entry_time)}</p>
                                        {detail?.trip?.entry_event_id && (
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Event ID: {detail.trip.entry_event_id}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Exit Event */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: trip.status === 'EXIT_PAID' ? 'var(--primary)' : (trip.status === 'HELD_INSUFFICIENT_FUNDS' ? 'var(--danger)' : '#94a3b8'), border: '2px solid white', boxShadow: `0 0 0 2px ${trip.status === 'EXIT_PAID' ? 'var(--primary)' : '#94a3b8'}`, flexShrink: 0 }}></div>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                            {trip.exit_lane ? `Vehicle Exit — ${trip.exit_lane}` : 'Exit Not Yet Recorded'}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{formatTime(trip.exit_time)}</p>
                                        {detail?.trip?.exit_event_id && (
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Event ID: {detail.trip.exit_event_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ledger Entry */}
                        {detail?.ledger && (
                            <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '8px', padding: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Landmark size={12} /> Immutable Ledger Record
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    {[
                                        ['Ledger ID', detail.ledger.id?.substring(0, 18) + '...'],
                                        ['Category', detail.ledger.category],
                                        ['Amount', `₱${(detail.ledger.amount_minor / 100).toFixed(2)}`],
                                        ['Type', detail.ledger.type],
                                        ['Idempotency Key', detail.ledger.idempotency_key?.substring(0, 18) + '...'],
                                        ['Timestamp', formatTime(detail.ledger.created_at)],
                                    ].map(([k, v]) => (
                                        <div key={k}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{k}</p>
                                            <p style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '0.78rem' }}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        {trip.duration_seconds !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <Timer size={14} />
                                Total Duration: <strong>{formatDuration(trip.duration_seconds)}</strong>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page ---
const Transactions = () => {
    const { role } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchTrips = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await api.get(`/trips?mock_role=${role}`);
            setTrips(resp.data.trips || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    const filtered = trips.filter(t => {
        const matchStatus = filter === 'ALL' || t.status === filter;
        const matchSearch = !search || t.plate_number.includes(search.toUpperCase());
        return matchStatus && matchSearch;
    });

    const totalFees = trips.filter(t => t.status === 'EXIT_PAID').reduce((acc, t) => acc + t.fee_minor, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>Transaction Audit Log</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full immutable record of all vehicle trips and fee deductions</p>
                </div>
                <button
                    onClick={fetchTrips}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', fontWeight: '600', fontSize: '0.875rem' }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div className="tour-transactions-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Trips', value: trips.length, color: 'var(--primary)' },
                    { label: 'Completed (Paid)', value: trips.filter(t => t.status === 'EXIT_PAID').length, color: 'var(--success)' },
                    { label: 'In Transit', value: trips.filter(t => t.status === 'ENTRY_RECORDED').length, color: '#f59e0b' },
                    { label: 'Held / Exception', value: trips.filter(t => t.status === 'HELD_INSUFFICIENT_FUNDS').length, color: 'var(--danger)' },
                    { label: 'Total Collected', value: `₱${(totalFees / 100).toFixed(2)}`, color: 'var(--success)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.label}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="tour-transactions-filter" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search plate number..."
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '200px' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'EXIT_PAID', 'ENTRY_RECORDED', 'HELD_INSUFFICIENT_FUNDS'].map(f => (
                        <button key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                border: '1px solid var(--border)',
                                background: filter === f ? 'var(--primary)' : 'white',
                                color: filter === f ? 'white' : 'var(--text-muted)'
                            }}>
                            {f === 'ALL' ? 'All' : f === 'EXIT_PAID' ? 'Paid' : f === 'ENTRY_RECORDED' ? 'In Transit' : 'Held'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card tour-transactions-table" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit data...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ArrowRightLeft size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                        <p>No trip records found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    {['Plate / Type', 'Status', 'Entry', 'Exit', 'Duration', 'Fee', 'Ledger', ''].map(h => (
                                        <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(trip => (
                                    <tr key={trip.id}
                                        onClick={() => setSelectedTrip(trip)}
                                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{trip.plate_number}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{trip.vehicle_type}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}><Badge status={trip.status} /></td>
                                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: '600' }}>{trip.entry_lane ?? '—'}</div>
                                            <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{formatTime(trip.entry_time)}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: '600' }}>{trip.exit_lane ?? '—'}</div>
                                            <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{formatTime(trip.exit_time)}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {trip.duration_seconds !== null && <Timer size={12} />}
                                                {formatDuration(trip.duration_seconds)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', fontSize: '0.95rem', color: trip.fee_minor > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                            {trip.fee_display}
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            {trip.debit_confirmed ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: '600' }}>
                                                    <ShieldCheck size={13} /> Confirmed
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <ChevronRight size={16} color="var(--text-muted)" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Trip Detail Modal */}
            {selectedTrip && <TripModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
        </div>
    );
};

export default Transactions;
