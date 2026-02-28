import React from 'react';

const ComingSoon = ({ title, description, icon: Icon, eta }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem' }}>{title}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{description}</p>
            </div>

            {/* Coming Soon Card */}
            <div className="card tour-coming-soon" style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(37,99,235,0.08) 100%)',
                border: '1px dashed rgba(37,99,235,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem'
            }}>
                {/* Animated icon container */}
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '20px',
                    background: 'rgba(37,99,235,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <Icon size={36} color="var(--primary)" strokeWidth={1.5} />
                </div>

                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(37,99,235,0.1)', color: 'var(--primary)',
                        padding: '0.3rem 0.9rem', borderRadius: '20px',
                        fontSize: '0.75rem', fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        marginBottom: '0.75rem'
                    }}>
                        🚧 Under Development
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        This feature will be developed soon
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6', fontSize: '0.9rem' }}>
                        {description} This module is actively being planned and will be available in a future release of the TFA Core platform.
                    </p>
                </div>

                {eta && (
                    <div style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)'
                    }}>
                        <strong style={{ color: 'var(--text)' }}>Planned: </strong>{eta}
                    </div>
                )}
            </div>

            {/* Parked feature note */}
            <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(245,158,11,0.05)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
            }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>📋</span>
                <span>
                    This feature has been <strong>parked</strong> in the current sprint. Requirements and design specifications are being finalized. Check <code>task_plan.md</code> for the latest status.
                </span>
            </div>
        </div>
    );
};

export default ComingSoon;
