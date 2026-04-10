import axios from 'axios';

// Use API Gateway on port 3000 for all requests
// This provides a single entry point and handles routing to all microservices
const base = import.meta.env?.VITE_API_BASE || 'http://localhost:3000/api';

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
