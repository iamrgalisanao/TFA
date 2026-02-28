import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('mock_role') || 'admin');
    const [loading, setLoading] = useState(true);


    const fetchProfile = async () => {
        setLoading(true);
        try {
            const resp = await api.get(`/me?mock_role=${role}`);
            setUser(resp.data.user);
            setRole(resp.data.role); // In case server defaults it
        } catch (err) {
            console.error('Auth fetch error:', err);
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
