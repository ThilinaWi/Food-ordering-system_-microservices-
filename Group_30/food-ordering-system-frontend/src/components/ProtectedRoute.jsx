import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

    if (!user) return <Navigate to="/login" />;
    
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
