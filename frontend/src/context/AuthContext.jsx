import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('mock_role') || 'admin');
    const [loading, setLoading] = useState(true);


    const fetchProfile = async () => {
        // Skip auth profile fetch if we are on a kiosk route.
        // Kiosks are standalone public terminals and don't need a staff/admin session.
        if (window.location.pathname.startsWith('/kiosk')) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const resp = await api.get(`/me?mock_role=${role}`);
            setUser(resp.data.user);
            setRole(resp.data.role);
        } catch (err) {
            // Silently handle auth errors on staging/production to avoid console noise
            // if the service is temporarily unavailable (503).
            if (err.response?.status !== 503) {
                console.error('Auth fetch error:', err);
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProfile();
    }, [role]);

    const switchRole = (newRole) => {
        localStorage.setItem('mock_role', newRole);
        setRole(newRole);
    };

    const value = {
        user,
        role,
        loading,
        switchRole,
        isOperator: role === 'operator',
        isStaff: role === 'staff',
        isAdmin: role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
