import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// ─── Users ───────────────────────────────────────────────
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getMe: () => api.get('/users/me'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// ─── Trainings ───────────────────────────────────────────
export const trainingsAPI = {
    getAll: (params) => api.get('/trainings', { params }),
    getById: (id) => api.get(`/trainings/${id}`),
    getByTrainer: (trainerId) => api.get(`/trainings/trainer/${trainerId}`),
    getStats: () => api.get('/trainings/stats'),
    create: (data) => api.post('/trainings', data),
    update: (id, data) => api.put(`/trainings/${id}`, data),
    delete: (id) => api.delete(`/trainings/${id}`),
};

// ─── Enrollments ─────────────────────────────────────────
export const enrollmentsAPI = {
    enroll: (data) => api.post('/attendance/enrollments', data),
    getAll: () => api.get('/attendance/enrollments'),
    getByTraining: (trainingId) => api.get(`/attendance/enrollments/training/${trainingId}`),
    getMy: () => api.get('/attendance/enrollments/my'),
    updateProgress: (id, progress) => api.patch(`/attendance/enrollments/${id}/progress`, { progress }),
    unenroll: (id) => api.delete(`/attendance/enrollments/${id}`),
    getStats: () => api.get('/attendance/enrollments/stats'),
};

// ─── Attendance ──────────────────────────────────────────
export const attendanceAPI = {
    mark: (data) => api.post('/attendance/attendance/mark', data),
    getByTraining: (trainingId, date) => api.get(`/attendance/attendance/training/${trainingId}`, { params: { date } }),
    getMy: () => api.get('/attendance/attendance/my'),
    getReport: (trainingId) => api.get(`/attendance/attendance/report/${trainingId}`),
};

export default api;
