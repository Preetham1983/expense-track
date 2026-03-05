import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/user/me'),
    updateBudget: (monthly_budget) => api.put('/user/budget', { monthly_budget }),
};

// --- Expense API ---
export const expenseAPI = {
    getAll: (params) => api.get('/expenses', { params }),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    getSummary: (year, month) => api.get('/expenses/summary', { params: { year, month } }),
};

// --- EMI API ---
export const emiAPI = {
    getAll: (params) => api.get('/emis', { params }),
    create: (data) => api.post('/emis', data),
    update: (id, data) => api.put(`/emis/${id}`, data),
    delete: (id) => api.delete(`/emis/${id}`),
    getUpcoming: () => api.get('/emis/upcoming'),
};

// --- Notification API ---
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
