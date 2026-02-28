import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Car, Trash2, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ plate_number: '', vehicle_type: 'Bus' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const fetchVehicles = async () => {
        try {
            const resp = await api.get('/vehicles');
            setVehicles(resp.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.post('/vehicles', formData);
            setMessage({ type: 'success', text: 'Vehicle registered successfully!' });
            setFormData({ plate_number: '', vehicle_type: 'Bus' });
            await fetchVehicles();
            setTimeout(() => setShowModal(false), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.errors?.plate_number?.[0] || 'Registration failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = !searchQuery || v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) || v.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'ALL' || v.vehicle_type === filterType;
        return matchesSearch && matchesType;
    });

    const uniqueTypes = [...new Set(vehicles.map(v => v.vehicle_type))];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>Vehicle Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Register and manage your fleet for automated entry/exit.</p>
                </div>
                <button
                    className="tour-vehicles-add"
                    onClick={() => setShowModal(true)}
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
                    Register Vehicle
                </button>
            </div>

            <div className="card tour-vehicles-table" style={{ padding: 0 }}>
                <div className="tour-vehicles-search" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by plate or operator..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-main)',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white', color: 'var(--text-main)', fontSize: '0.875rem' }}
                    >
                        <option value="ALL">All Types</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Vehicle Details</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Type</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operator</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date Added</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No vehicles match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px', color: 'var(--primary)' }}>
                                                    <Car size={20} />
                                                </div>
                                                <div style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.5px' }}>{vehicle.plate_number}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{vehicle.vehicle_type}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.875rem' }}>{vehicle.operator?.name}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {new Date(vehicle.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button style={{ padding: '0.4rem', color: 'var(--text-muted)', background: 'transparent' }}><Edit2 size={16} /></button>
                                                <button style={{ padding: '0.4rem', color: 'var(--danger)', background: 'transparent' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Register New Vehicle</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Add a vehicle to the operator's fleet.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Plate Number</label>
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    placeholder="e.g. ABC 1234"
                                    value={formData.plate_number}
                                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        textTransform: 'uppercase'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Vehicle Type</label>
                                <select
                                    value={formData.vehicle_type}
                                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        background: 'white'
                                    }}
                                >
                                    <option>Bus</option>
                                    <option>Minibus</option>
                                    <option>Van</option>
                                    <option>Utility</option>
                                </select>
                            </div>

                            {message && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius)',
                                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    {message.type === 'success' && <CheckCircle2 size={16} />}
                                    {message.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: 'white',
                                        fontWeight: '600'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        flex: 2,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
