import React, { useState } from 'react';
import { Activity, ShieldAlert, MonitorPlay, CheckCircle2, AlertCircle, Lock, Unlock, Settings2, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const StaffPortal = ({ statsData }) => {
    const { role } = useAuth();
    const [selectedLane, setSelectedLane] = useState(null);
    const [overrideAction, setOverrideAction] = useState('FORCE_OPEN');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleOverride = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            const resp = await api.post(`/lanes/${selectedLane.id}/override?mock_role=${role}`, {
                action: overrideAction,
                reason: reason
            });
            setMessage({ type: 'success', text: resp.data.message });
            setTimeout(() => {
                setSelectedLane(null);
                setMessage(null);
                setReason('');
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Override failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Staff Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Alerts</p>
                    <h2 style={{ fontSize: '1.75rem', color: 'var(--danger)' }}>0</h2>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Lanes Online</p>
                    <h2 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>
                        {statsData.lanes?.filter(l => l.status === 'ACTIVE').length} / {statsData.lanes?.length}
                    </h2>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Barrier Status</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {statsData.lanes?.map(lane => (
                            <div key={lane.id} title={`${lane.id}: ${lane.barrier_status}`} style={{
                                width: '12px', height: '12px', borderRadius: '2px',
                                background: lane.barrier_status === 'OPEN' ? 'var(--success)' : 'var(--danger)'
                            }}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Traffic Feed */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="pulse" style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%' }}></div>
                            <h3 style={{ fontSize: '1.125rem' }}>Live Terminal Feed</h3>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Plate / Lane</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Action</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statsData.events.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Waiting for traffic...</td></tr>
                                ) : (
                                    statsData.events.map((evt) => (
                                        <tr key={evt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: '700' }}>{evt.plate_number}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{evt.lane_id}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '4px',
                                                    background: evt.direction === 'exit' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: evt.direction === 'exit' ? 'var(--primary)' : '#d97706',
                                                    fontWeight: '700'
                                                }}>
                                                    {evt.direction?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                                                {new Date(evt.event_timestamp || evt.created_at).toLocaleTimeString()}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                                                    <CheckCircle2 size={14} /> Successful
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lane Status Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem' }}>Lane Control</h3>
                            <Settings2 size={18} color="var(--text-muted)" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {statsData.lanes?.map(lane => (
                                <div key={lane.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{lane.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                                            <span>{lane.id}</span>
                                            <span style={{ color: lane.barrier_status === 'OPEN' ? 'var(--success)' : 'var(--text-muted)' }}>• {lane.barrier_status}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLane(lane)}
                                        style={{
                                            padding: '0.4rem 0.6rem',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border)',
                                            background: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        OVERRIDE
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={18} /> Exception Queue
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No critical exceptions found.</p>
                    </div>
                </div>
            </div>

            {/* Override Modal */}
            {selectedLane && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Manual Override: {selectedLane.id}</h3>
                            <button onClick={() => setSelectedLane(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setOverrideAction('FORCE_OPEN')}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: overrideAction === 'FORCE_OPEN' ? 'var(--success)' : 'white',
                                        color: overrideAction === 'FORCE_OPEN' ? 'white' : 'var(--text-main)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
                                    }}
                                >
                                    <Unlock size={20} /> Force Open
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOverrideAction('FORCE_CLOSE')}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: overrideAction === 'FORCE_CLOSE' ? 'var(--danger)' : 'white',
                                        color: overrideAction === 'FORCE_CLOSE' ? 'white' : 'var(--text-main)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
                                    }}
                                >
                                    <Lock size={20} /> Force Close
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Reason for Override</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Sensor malfunction, Emergency vehicle, Payment clearance..."
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        minHeight: '80px',
                                        fontSize: '0.875rem'
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

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button" onClick={() => setSelectedLane(null)}
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
                                    {isSubmitting ? 'Sending...' : 'Confirm Override'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPortal;
