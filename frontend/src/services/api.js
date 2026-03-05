import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Auth API ---
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getProfile: () => api.get('/api/user/me'),
    updateBudget: (monthly_budget) => api.put('/api/user/budget', { monthly_budget }),
};

// --- Expense API ---
export const expenseAPI = {
    getAll: (params) => api.get('/api/expenses', { params }),
    create: (data) => api.post('/api/expenses', data),
    update: (id, data) => api.put(`/api/expenses/${id}`, data),
    delete: (id) => api.delete(`/api/expenses/${id}`),
    getSummary: (year, month) => api.get('/api/expenses/summary', { params: { year, month } }),
};

// --- EMI API ---
export const emiAPI = {
    getAll: (params) => api.get('/api/emis', { params }),
    create: (data) => api.post('/api/emis', data),
    update: (id, data) => api.put(`/api/emis/${id}`, data),
    delete: (id) => api.delete(`/api/emis/${id}`),
    getUpcoming: () => api.get('/api/emis/upcoming'),
};

// --- Notification API ---
export const notificationAPI = {
    getAll: (params) => api.get('/api/notifications', { params }),
    getUnreadCount: () => api.get('/api/notifications/unread-count'),
    markRead: (id) => api.put(`/api/notifications/${id}/read`),
    markAllRead: () => api.put('/api/notifications/read-all'),
};

export default api;
