import React, { useEffect, useState, useCallback } from 'react';
import {
    ShieldAlert, Camera, Landmark, ShieldCheck,
    AlertTriangle, Info, CheckCircle2, RefreshCw, Filter
} from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { Accept: 'application/json' }
});

const CATEGORY_CONFIG = {
    OVERRIDE: { label: 'Lane Override', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: ShieldCheck },
    LEDGER: { label: 'Ledger / Finance', color: 'var(--primary)', bg: 'rgba(37,99,235,0.08)', icon: Landmark },
    TRAFFIC: { label: 'ANPR Traffic', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', icon: Camera },
};

const SEVERITY_CONFIG = {
    WARNING: { color: '#f59e0b', icon: AlertTriangle },
    INFO: { color: '#64748b', icon: Info },
    SUCCESS: { color: 'var(--success)', icon: CheckCircle2 },
};

const CategoryBadge = ({ category }) => {
    const cfg = CATEGORY_CONFIG[category] || { label: category, color: '#64748b', bg: '#f1f5f9', icon: Info };
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem',
            borderRadius: '20px', color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap'
        }}>
            <Icon size={10} />{cfg.label}
        </span>
    );
};

const SeverityDot = ({ severity }) => {
    const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;
    return <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: '4px' }} />;
};

const formatTime = (ts) =>
    new Date(ts).toLocaleString('en-PH', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const AuditLogs = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get(`/audit-logs?category=${category}&limit=200`);
            setEntries(r.data.entries || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [category]);

    useEffect(() => { fetch(); }, [fetch]);

    const filtered = entries.filter(e =>
        !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.actor?.toLowerCase().includes(search.toLowerCase())
    );

    const counts = {
        ALL: entries.length,
        TRAFFIC: entries.filter(e => e.category === 'TRAFFIC').length,
        LEDGER: entries.filter(e => e.category === 'LEDGER').length,
        OVERRIDE: entries.filter(e => e.category === 'OVERRIDE').length,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>System Audit Logs</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Immutable unified log of all lane, financial, and traffic events</p>
                </div>
                <button onClick={fetch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Events', value: counts.ALL, color: 'var(--primary)', icon: ShieldAlert },
                    { label: 'Traffic / ANPR', value: counts.TRAFFIC, color: '#8b5cf6', icon: Camera },
                    { label: 'Ledger Events', value: counts.LEDGER, color: 'var(--success)', icon: Landmark },
                    { label: 'Lane Overrides', value: counts.OVERRIDE, color: '#f59e0b', icon: ShieldCheck },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <Icon size={14} color={s.color} />
                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{s.label}</p>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search events..."
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', width: '220px' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'TRAFFIC', 'LEDGER', 'OVERRIDE'].map(f => (
                        <button key={f} onClick={() => setCategory(f)}
                            style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid var(--border)', cursor: 'pointer', background: category === f ? 'var(--primary)' : 'white', color: category === f ? 'white' : 'var(--text-muted)' }}>
                            {f === 'ALL' ? `All (${counts.ALL})` : f === 'TRAFFIC' ? `ANPR (${counts.TRAFFIC})` : f === 'LEDGER' ? `Ledger (${counts.LEDGER})` : `Overrides (${counts.OVERRIDE})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline Feed */}
            <div className="card" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading audit entries...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <ShieldAlert size={32} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No audit entries found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {filtered.map((entry, idx) => (
                            <div key={entry.id} style={{ display: 'flex', gap: '1rem', paddingBottom: idx < filtered.length - 1 ? '1rem' : 0, marginBottom: idx < filtered.length - 1 ? '1rem' : 0, borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                {/* Severity dot + vertical line */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
                                    <SeverityDot severity={entry.severity} />
                                    {idx < filtered.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <CategoryBadge category={entry.category} />
                                            <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{entry.title}</span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                                            {formatTime(entry.timestamp)}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{entry.description}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        <span>Actor: <strong style={{ color: 'var(--text)' }}>{entry.actor}</strong></span>
                                        <span style={{ textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{entry.actor_role}</span>
                                        {entry.metadata?.idempotency_key && (
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>
                                                Key: {entry.metadata.idempotency_key.substring(0, 16)}...
                                            </span>
                                        )}
                                        {entry.metadata?.event_uuid && (
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>
                                                UUID: {entry.metadata.event_uuid.substring(0, 16)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
