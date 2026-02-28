import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Smartphone, CarFront, ArrowRight } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const KioskHome = () => {
    const navigate = useNavigate();
    const [plateNumber, setPlateNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if the plate resolves to an active wallet in the system
            const resp = await api.get(`/kiosk/lookup-wallet?plate=${plateNumber}`);
            if (resp.data.data) {
                // Pass wallet details to the next step
                navigate('/kiosk/topup', { state: { wallet: resp.data.data, plate: plateNumber } });
            } else {
                setError('Vehicle not found. Please verify your plate number.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error communicating with server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '3rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Enter Plate Number</h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Tap the field below to enter your registered vehicle plate number and reload your terminal fee balance.
                </p>
            </div>

            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <CarFront size={32} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input
                        type="text"
                        required
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. ABC 1234"
                        style={{
                            width: '100%',
                            padding: '1.5rem 1.5rem 1.5rem 4.5rem',
                            fontSize: '2rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            borderRadius: '16px',
                            border: '3px solid var(--border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            textTransform: 'uppercase',
                            transition: 'border-color 0.2s',
                            letterSpacing: '2px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', textAlign: 'center', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!plateNumber || loading}
                    style={{
                        padding: '1.5rem',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        borderRadius: '16px',
                        background: (!plateNumber || loading) ? 'var(--text-muted)' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        cursor: (!plateNumber || loading) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        transition: 'background 0.2s, transform 0.1s'
                    }}
                    onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {loading ? 'Searching...' : 'Continue'}
                    {!loading && <ArrowRight size={28} />}
                </button>
            </form>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                    <Smartphone size={24} /> Digital E-Wallets Supported
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                    <QrCode size={24} /> Bills Accepted
                </div>
            </div>
        </div>
    );
};

export default KioskHome;
