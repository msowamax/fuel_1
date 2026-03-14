import axios from 'axios';

const getBaseURL = () => {
    let raw = process.env.NEXT_PUBLIC_API_URL;

    // Fallback for local development if NEXT_PUBLIC_API_URL is not set in .env
    if (!raw && process.env.NODE_ENV !== 'production') {
        raw = 'http://127.0.0.1:5000/api';
    } else if (!raw) {
        console.warn("⚠️ NEXT_PUBLIC_API_URL is not defined. API calls might fail. Please set it in Vercel.");
        return '/api/';
    }

    // Remove trailing slash if exists
    let baseUrl = raw.endsWith('/') ? raw.slice(0, -1) : raw;
    // Add /api if missing
    baseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    // CRITICAL: Always end with / so that paths starting with / don't replace the /api part
    return `${baseUrl}/`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
});

console.log("🚀 API Base URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
