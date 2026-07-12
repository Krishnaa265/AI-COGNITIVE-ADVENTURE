import axios from "axios";

// In development: http://localhost:8000
// In production: set VITE_API_URL env variable to your deployed backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30s timeout — Gemini can be slow
});

// Global error interceptor — log but don't swallow
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            // Session expired — send back to login
            localStorage.removeItem("userEmail");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
