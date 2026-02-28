import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import KioskAdStandby from './KioskAdStandby';

const IDLE_TIMEOUT_MS = 60000; // 60 seconds of inactivity triggers standby

const KioskLayout = () => {
    const [isIdle, setIsIdle] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const idleTimerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Don't restart the timer if the kiosk is offline (it should stay in maintenance mode)
        if (!isOnline) return;

        idleTimerRef.current = setTimeout(() => {
            setIsIdle(true);
        }, IDLE_TIMEOUT_MS);
    }, [isOnline]);

    const handleWake = useCallback(() => {
        setIsIdle(false);
        resetIdleTimer();
        // If they wake it up from a sub-page, bump them back to the start to clear previous user data
        if (location.pathname !== '/kiosk') {
            navigate('/kiosk');
        }
    }, [navigate, location, resetIdleTimer]);

    const checkInternetConnection = useCallback(async () => {
        try {
            // Fail fast if the OS explicitly knows we are offline
            if (!navigator.onLine) {
                throw new Error('OS reported offline');
            }

            // Actively ping a standard connectivity-check URL to bypass virtual network adapter false positives
            // Google's generate_204 endpoint is standard practice for captive portal/connectivity checks
            // Appending a timestamp guarantees we don't hit an OS-level or browser-level DNS/fetch cache
            const url = `https://clients3.google.com/generate_204?cb=${Date.now()}`;

            // NOTE: When actually offline, browsers will inherently log a red "net::ERR_EMPTY_RESPONSE" 
            // or "failed to fetch" error to the console. This is a browser security/networking feature 
            // and cannot be suppressed by JavaScript. We expect this error to happen when offline!
            await fetch(url, {
                mode: 'no-cors',
                cache: 'no-store',
                method: 'HEAD'
            });

            // If the fetch succeeds (even opaque response due to no-cors), we have a route out.
            setIsOnline(prev => {
                if (!prev) resetIdleTimer();
                return true;
            });
        } catch (error) {
            // Fetch promise rejected, meaning true offline state (or captive portal blocking)
            setIsOnline(prev => {
                if (prev) {
                    setIsIdle(true); // Force standby overlay on offline
                    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
                }
                return false;
            });
        }
    }, [resetIdleTimer]);

    useEffect(() => {
        // Network Connectivity Listeners (Immediate reaction if supported)
        const handleOnline = () => checkInternetConnection();
        const handleOffline = () => {
            setIsOnline(false);
            setIsIdle(true);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Active Polling (Fallback for Windows/Virtual Adapters missing the 'offline' event)
        const pollInterval = setInterval(checkInternetConnection, 5000); // Check every 5 seconds

        // Activity Listeners (Touch, Mouse, Keyboard)
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            if (!isIdle && isOnline) {
                resetIdleTimer();
            }
        };

        activityEvents.forEach(evt => window.addEventListener(evt, handleActivity));

        // Initial setup
        checkInternetConnection();
        resetIdleTimer();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(pollInterval);
            activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isIdle, isOnline, resetIdleTimer, checkInternetConnection]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-main)', // Same dark/light theme standard
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px', // Restrict max width for ultrawide panels but let it fill most screens
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <header style={{
                    padding: '2rem 3rem',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>PITX Express Kiosk</h1>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', opacity: 0.9 }}>Terminal Fee Top-up</div>
                </header>

                <main style={{ flex: 1, padding: '3rem', position: 'relative' }}>
                    <Outlet />
                </main>

                <footer style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'var(--bg-main)',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    borderTop: '1px solid var(--border)'
                }}>
                    Powered by TFA System Core • Need Help? Ask our Terminal Staff
                </footer>
            </div>

            {/* Render the Full-Screen Video / Maintenance overlay on top of everything if idle or offline */}
            {(isIdle || !isOnline) && (
                <KioskAdStandby onWake={handleWake} isOnline={isOnline} />
            )}
        </div>
    );
};

export default KioskLayout;
