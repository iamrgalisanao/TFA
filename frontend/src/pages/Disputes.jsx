import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const Disputes = () => {
    const { role } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [type, setType] = useState('INCORRECT_DEDUCTION');
    const [refTxId, setRefTxId] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const resp = await api.get('/disputes');
            setDisputes(resp.data);
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'operator') {
            fetchDisputes();
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            await api.post('/disputes', {
                type,
                ledger_transaction_id: refTxId || null,
                description
            });
            setShowModal(false);
            setDescription('');
            setRefTxId('');
            fetchDisputes();
        } catch (error) {
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                setFormError(errorMessages);
            } else {
                setFormError('Failed to submit dispute. ' + (error.response?.data?.message || 'Unknown error.'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (role !== 'operator') {
        return <div style={{ padding: '2rem' }}>Only accessible to operators.</div>;
    }

    return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="var(--primary)" />
                        Support & Disputes
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your support tickets and transaction disputes.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'center',
                        background: 'var(--primary)', color: 'white', padding: '0.6rem 1.2rem',
                        borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontWeight: '500'
                    }}
                >
                    <Plus size={18} /> File Dispute
                </button>
            </div>

            {loading ? (
                <p>Loading your disputes...</p>
            ) : disputes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                    No disputes filed yet.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem' }}>Reference</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Resolution Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{d.reference_code}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleString()}</td>
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
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {d.resolution_notes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--bg-card)', width: '500px', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>File a Dispute</h3>
                            <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Dispute Type</label>
                                <select
                                    value={type} onChange={e => setType(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                >
                                    <option value="INCORRECT_DEDUCTION">Incorrect Fee Deduction</option>
                                    <option value="MISSING_TOPUP">Missing Wallet Top-Up</option>
                                    <option value="OTHER">Other Issue</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Transaction ID (Optional)</label>
                                <input
                                    type="text" placeholder="UUID of the disputed ledger transaction"
                                    value={refTxId} onChange={e => setRefTxId(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description (Required)</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Please describe the issue in detail..."
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: '500' }}>
                                    {submitting ? 'Submitting...' : 'Submit Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Disputes;
