import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const KioskAdStandby = ({ onWake, isOnline }) => {
    const videoRef = useRef(null);

    // We use the local video path as instructed. Fallback to pixabay if missing is possible but let's stick to local.
    const adVideoUrl = "/videos/kiosk-ad.mp4";

    // We want audio, so we remove the programmatic muting. 
    // WARNING: Modern browsers strongly restrict unmuted autoplay unless the user has already interacted 
    // with the DOM on the same domain (e.g. clicking around the website before it goes idle).
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.warn("Audio autoplay blocked by browser policy until user interaction occurs.", err);
            });
        }
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999, // Super high z-index to overlay everything
            background: 'black',
            cursor: isOnline ? 'pointer' : 'not-allowed', // Hint interactivity
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        }}
            onClick={() => {
                // Only wake up the kiosk if it's currently online and able to process transactions
                if (isOnline) {
                    onWake();
                }
            }}>

            {/* Ad Container (Flex top section) */}
            <div style={{
                flex: 1,
                width: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#000'
            }}>
                <video
                    ref={videoRef}
                    src={adVideoUrl}
                    autoPlay
                    loop
                    playsInline
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // Ensure the ad isn't clipped
                        opacity: isOnline ? 1 : 0.6, // Dim the video if the machine is offline
                        transition: 'opacity 0.5s'
                    }}
                />
            </div>

            {/* Tap to Start Prompt Section (Only when Online) */}
            {isOnline && (
                <div style={{
                    minHeight: '20vh',
                    width: '100%',
                    background: '#050505',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTop: '1px solid #222'
                }}>
                    <div className="animate-pulse" style={{
                        padding: '1.5rem 4rem',
                        borderRadius: '100px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                        <span style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Tap Anywhere to Start</span>
                    </div>
                </div>
            )}

            {/* Offline / Maintenance Overlay */}
            {!isOnline && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(239, 68, 68, 0.95)', // Strong red banner
                    color: 'white',
                    padding: '4rem 6rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '4px solid white',
                    backdropFilter: 'blur(10px)'
                }}>
                    <AlertTriangle size={120} color="white" />
                    <div>
                        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', margin: 0, lineHeight: 1, letterSpacing: '2px' }}>MAINTENANCE MODE</h1>
                        <p style={{ fontSize: '2rem', fontWeight: '600', marginTop: '1rem', opacity: 0.9 }}>This kiosk is currently offline.</p>
                        <p style={{ fontSize: '1.25rem', marginTop: '0.5rem', opacity: 0.8 }}>Please use the Public Portal or proceed to the terminal staff desk to top up your wallet.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KioskAdStandby;
