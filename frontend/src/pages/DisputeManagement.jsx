import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const DisputeManagement = () => {
    const { role } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [status, setStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const resp = await api.get('/admin/disputes');
            setDisputes(resp.data);
        } catch (error) {
            console.error('Error fetching admin disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (['admin', 'staff'].includes(role)) {
            fetchDisputes();
        }
    }, [role]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/disputes/${selectedDispute.id}`, {
                status,
                resolution_notes: resolutionNotes
            });
            setSelectedDispute(null);
            fetchDisputes();
        } catch (error) {
            alert('Failed to update dispute. ' + (error.response?.data?.message || ''));
        } finally {
            setSaving(false);
        }
    };

    const openModal = (d) => {
        setSelectedDispute(d);
        setStatus(d.status);
        setResolutionNotes(d.resolution_notes || '');
    };

    if (!['admin', 'staff'].includes(role)) {
        return <div style={{ padding: '2rem' }}>Only accessible to admins/staff.</div>;
    }

    return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={24} color="var(--primary)" />
                    Dispute Management Central
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Review, investigate, and resolve operator disputes.</p>
            </div>

            {loading ? (
                <p>Loading global dispute queue...</p>
            ) : disputes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                    Queue is empty. No open disputes.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem' }}>Code</th>
                                <th style={{ padding: '1rem' }}>Operator</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{d.reference_code}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{d.operator?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.operator?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{d.type.replace('_', ' ')}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                                            background: d.status === 'RESOLVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            color: d.status === 'RESOLVED' ? '#166534' : '#854d0e'
                                        }}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => openModal(d)}
                                            style={{ padding: '0.5rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedDispute && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--bg-card)', width: '600px', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Review Dispute: {selectedDispute.reference_code}</h3>
                            <button onClick={() => setSelectedDispute(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Operator:</strong> {selectedDispute.operator?.name}</div>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Description:</strong></div>
                            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>{selectedDispute.description}</p>
                            {selectedDispute.ledgerTransaction && (
                                <div style={{ fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '4px' }}>
                                    <strong>Linked Tx ID:</strong> {selectedDispute.ledger_transaction_id}<br />
                                    <strong>Amount:</strong> ₱{(selectedDispute.ledgerTransaction.amount_minor / 100).toFixed(2)}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Update Status</label>
                                <select
                                    value={status} onChange={e => setStatus(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="INVESTIGATING">Investigating</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed (Won't Fix)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Resolution Notes (Visible to Operator)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Add investigation findings or resolution details..."
                                    value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setSelectedDispute(null)} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Close</button>
                                <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: '500' }}>
                                    {saving ? 'Saving...' : 'Save Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeManagement;
