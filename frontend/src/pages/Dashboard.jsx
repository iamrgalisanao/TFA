import React, { useState, useEffect } from 'react';
import { Activity, Car, Wallet, ArrowUpRight, ArrowDownRight, Clock, Loader2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminPortal from '../components/portals/AdminPortal';
import StaffPortal from '../components/portals/StaffPortal';
import OperatorPortal from '../components/portals/OperatorPortal';

const api = axios.create({
    baseURL: 'http://localhost:8001/api/v1',
    headers: { 'Accept': 'application/json' }
});

const Dashboard = () => {
    const { role, isOperator, isAdmin, isStaff } = useAuth();
    const [statsData, setStatsData] = useState({ balance: 0, vehicles: 0, transactions: [], events: [] });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const endpoints = [
                api.get(`/lane/events?mock_role=${role}`),
            ];

            if (isOperator || isAdmin) {
                endpoints.push(api.get(`/wallet?mock_role=${role}`));
                endpoints.push(api.get(`/vehicles?mock_role=${role}`));
                endpoints.push(api.get(`/trips?mock_role=${role}`));
            }

            if (isStaff || isAdmin) {
                endpoints.push(api.get(`/lanes?mock_role=${role}`));
            }

            const results = await Promise.all(endpoints);
            const eventsResp = results[0];

            let walletResp = { data: { balance_minor: 0, transactions: [], stats: {} } };
            let vehicleResp = { data: [] };
            let tripsResp = { data: { trips: [] } };
            let lanesResp = { data: [] };

            let nextIdx = 1;
            if (isOperator || isAdmin) {
                walletResp = results[nextIdx++];
                vehicleResp = results[nextIdx++];
                tripsResp = results[nextIdx++];
            }
            if (isStaff || isAdmin) {
                lanesResp = results[nextIdx++];
            }

            setStatsData({
                balance: walletResp.data.balance_minor / 100,
                vehicles: vehicleResp.data.length,
                transactions: walletResp.data.transactions || [],
                events: eventsResp.data || [],
                lanes: lanesResp.data || [],
                walletFull: walletResp.data,
                trips: tripsResp.data.trips || []
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [role]);

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Initializing {role} environment...</p>
            </div>
        );
    }

    return (
        <>
            {isAdmin && <AdminPortal statsData={statsData} />}
            {isStaff && <StaffPortal statsData={statsData} />}
            {isOperator && <OperatorPortal statsData={statsData} />}
        </>
    );
};

export default Dashboard;
