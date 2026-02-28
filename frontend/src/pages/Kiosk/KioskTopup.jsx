import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, QrCode, Banknote, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const KioskTopup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const walletData = location.state?.wallet;
    const plate = location.state?.plate;

    const [paymentMethod, setPaymentMethod] = useState(''); // 'GCASH', 'QRPH', 'CASH'
    const [qrData, setQrData] = useState(null);
    const [cashInsertedMinor, setCashInsertedMinor] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Simulated WebSocket listener for Cash Acceptor daemon
    useEffect(() => {
        if (paymentMethod === 'CASH') {
            const listener = (e) => {
                // In production, we would use a WebSocket connected to localhost:someport
                // For demo, we simulate key presses processing a bill: ArrowUp (+100)
                if (e.key === 'ArrowUp') {
                    setCashInsertedMinor(prev => prev + 10000); // Add 100 PHP mapped from Bill Insert Event
                    console.log("BILL ACCEPTOR: 100 PHP Read.");
                }
            };
            window.addEventListener('keydown', listener);
            return () => window.removeEventListener('keydown', listener);
        }
    }, [paymentMethod]);

    if (!walletData) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--danger)', marginBottom: '1rem' }}>Session Expired</h2>
                <button
                    onClick={() => navigate('/kiosk')}
                    style={{ padding: '1rem 2rem', fontSize: '1.25rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                >Start Over
                </button>
            </div>
        );
    }

    const startQrPayment = async (method) => {
        setPaymentMethod(method);
        setIsProcessing(true);
        setError(null);
        try {
            // Initiate topup request
            const resp = await api.post('/kiosk/generate-qr', {
                wallet_id: walletData.id,
                method: method,
                plate: plate
            });
            setQrData(resp.data.qr_url); // Could be a text string to render via QRCode library or a pre-rendered image URL
            setIsProcessing(false);

            // Start polling for payment success
            pollPaymentStatus(resp.data.transaction_id);
        } catch (err) {
            setError(err.response?.data?.message || 'Payment generation failed.');
            setIsProcessing(false);
        }
    };

    const pollPaymentStatus = async (txId) => {
        // Simple polling for the sake of the demonstration
        const interval = setInterval(async () => {
            try {
                const resp = await api.get(`/kiosk/tx-status/${txId}`);
                if (resp.data.status === 'success') {
                    clearInterval(interval);
                    setIsSuccess(true);
                    setTimeout(() => navigate('/kiosk'), 5000); // Auto-return home
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
    };

    const confirmCashPayment = async () => {
        if (cashInsertedMinor <= 0) return;
        setIsProcessing(true);
        try {
            await api.post('/kiosk/cash-deposit', {
                wallet_id: walletData.id,
                amount_minor: cashInsertedMinor,
                plate: plate
            });
            setIsSuccess(true);
            setTimeout(() => navigate('/kiosk'), 5000);
        } catch (err) {
            setError('Failed to finalize cash deposit. Contact Staff.');
            setIsProcessing(false);
        }
    };

    const formatMoney = (minor) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(minor / 100);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header info bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '2px dashed var(--border)', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '2px solid var(--primary)' }}>
                        <Wallet size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>Wallet ID: {walletData.id.slice(0, 8)}...</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>{formatMoney(walletData.balance)}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Vehicle</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '1px' }}>{plate}</div>
                </div>
            </div>

            {isSuccess ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="pulse" style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, background: 'var(--success)', borderRadius: '50%', opacity: 0.2 }}></div>
                        <CheckCircle2 size={120} color="var(--success)" style={{ position: 'relative', zIndex: 2 }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                        <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Your wallet has been topped up. Returning to home...</p>
                    </div>
                </div>
            ) : paymentMethod === '' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Select Top-up Method</h2>

                    <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '800px' }}>
                        <button
                            onClick={() => startQrPayment('GCASH')}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 2rem', borderRadius: '24px', border: '3px solid var(--border)', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <QrCode size={64} color="var(--primary)" />
                            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>E-Wallet QR</div>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('CASH')}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 2rem', borderRadius: '24px', border: '3px solid var(--border)', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.borderColor = '#d97706'; }}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Banknote size={64} color="#d97706" />
                            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>Insert Cash</div>
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/kiosk')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 2.5rem', fontSize: '1.25rem', fontWeight: '600', borderRadius: '16px', background: 'transparent', color: 'var(--text-muted)', border: '2px solid var(--border)', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} /> Cancel Transaction
                    </button>
                </div>
            ) : paymentMethod === 'CASH' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem 3rem', borderRadius: '16px', border: '2px solid rgba(245, 158, 11, 0.3)', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', color: '#d97706', textAlign: 'center', fontWeight: '800', letterSpacing: '1px' }}>EXACT AMOUNT ONLY. NO CHANGE PROVIDED.</h3>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem' }}>Amount Inserted</div>
                        <div style={{ fontSize: '4.5rem', fontWeight: '800', color: cashInsertedMinor > 0 ? 'var(--success)' : 'var(--text-main)', lineHeight: 1 }}>
                            {formatMoney(cashInsertedMinor)}
                        </div>
                    </div>

                    <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                        <button
                            onClick={confirmCashPayment}
                            disabled={cashInsertedMinor === 0 || isProcessing}
                            style={{ padding: '1.5rem', fontSize: '1.5rem', fontWeight: '700', borderRadius: '16px', background: cashInsertedMinor === 0 ? 'var(--text-muted)' : 'var(--success)', color: 'white', border: 'none', cursor: cashInsertedMinor === 0 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', boxShadow: cashInsertedMinor > 0 ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)' : 'none' }}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={28} /> : 'Complete Top-up'}
                        </button>
                        <button
                            onClick={() => { setPaymentMethod(''); setCashInsertedMinor(0); }}
                            disabled={cashInsertedMinor > 0 || isProcessing} // Cannot cancel if cash is already inside the stacker
                            style={{ padding: '1.5rem', fontSize: '1.25rem', fontWeight: '700', borderRadius: '16px', background: 'transparent', color: 'var(--text-main)', border: '2px solid var(--border)', cursor: cashInsertedMinor > 0 ? 'not-allowed' : 'pointer', opacity: cashInsertedMinor > 0 ? 0.3 : 1 }}
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <div style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</div>}
                    <div style={{ marginTop: 'auto', fontSize: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Please insert bills one by one smoothly into the acceptor slot.
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Scan with GCash/Maya</h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Open your E-Wallet app and scan the code below to pay.</p>
                    </div>

                    {isProcessing ? (
                        <div style={{ width: '300px', height: '300px', background: 'var(--bg-main)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '3px dashed var(--border)' }}>
                            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-muted)' }}>Generating QR...</div>
                        </div>
                    ) : (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '3px solid var(--primary)', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.1)' }}>
                            {/* In real life, use a QR plotting library. For MVP, we mock the UI container */}
                            <img src={qrData || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TFA-TEST'} alt="Payment QR" style={{ display: 'block', borderRadius: '12px' }} />
                        </div>
                    )}

                    <button
                        onClick={() => { setPaymentMethod(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 2.5rem', fontSize: '1.25rem', fontWeight: '600', borderRadius: '16px', background: 'transparent', color: 'var(--text-muted)', border: '2px solid var(--border)', cursor: 'pointer', marginTop: '1rem' }}
                    >
                        <ArrowLeft size={24} /> Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default KioskTopup;
