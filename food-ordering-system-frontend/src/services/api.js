import axios from 'axios';

// Use Vite environment variable VITE_API_BASE if set (e.g. http://localhost:3000/api),
// otherwise fall back to the user-service directly for local development.
const base = import.meta.env?.VITE_API_BASE || 'http://localhost:3001';

const api = axios.create({
    baseURL: base,
});

// Interceptor to add JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
