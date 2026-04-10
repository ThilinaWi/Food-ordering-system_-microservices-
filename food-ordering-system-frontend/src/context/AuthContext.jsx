import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const persistUser = (nextUser) => {
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
        localStorage.setItem('userId', nextUser.id);
        if (nextUser.role) {
            localStorage.setItem('role', nextUser.role);
        }
    };

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('token');
        const storedUserString = localStorage.getItem('user');
        
        if (token && storedUserString) {
            try {
                setUser(JSON.parse(storedUserString));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        const { token, user: serverUser } = response.data;
        
        // Decode token to get user ID, ideally user info is returned,
        // For MVP, we'll store basic mock user info or decode generic JWT.
        // Assuming we decode token basic info manually:
        const payload = JSON.parse(atob(token.split('.')[1]));
        const loggedUser = serverUser || { id: payload.id, email: payload.email, role: payload.role, name: payload.name };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        localStorage.setItem('userId', loggedUser.id);
        if (loggedUser.role) {
            localStorage.setItem('role', loggedUser.role);
        }
        
        persistUser(loggedUser);
        
        // Ensure api service uses the new token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return loggedUser;
    };

    const register = async (name, email, password) => {
        return await api.post('/users/register', { name, email, password });
    };

    const updateUser = (nextUser) => {
        persistUser(nextUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
