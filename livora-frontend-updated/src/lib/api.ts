// src/lib/api.ts
// Drop-in replacement for Supabase client.
// All calls go to FastAPI backend at localhost:8000

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("livora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("livora_token");
      localStorage.removeItem("livora_user");
      window.location.href = "/signin";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, name: string, password: string) =>
    api.post("/auth/register", { email, name, password }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),

  updateMe: (data: Record<string, unknown>) => api.put("/auth/me", data),
};

// ─── Glucose ─────────────────────────────────────────────────
export const glucoseApi = {
  add: (value: number, context: string, recorded_at: string, notes?: string) =>
    api.post("/glucose/", { value, context, recorded_at, notes }),

  list: (days = 7, context?: string) =>
    api.get("/glucose/", { params: { days, context } }),

  latest: () => api.get("/glucose/latest"),

  delete: (id: number) => api.delete(`/glucose/${id}`),
};

// ─── Meals ───────────────────────────────────────────────────
export const mealsApi = {
  log: (data: {
    name?: string;
    meal_type?: string;
    carbs: number;
    protein: number;
    fat: number;
    fiber?: number;
    calories?: number;
    recorded_at: string;
  }) => api.post("/meals/", data),

  list: (days = 7) => api.get("/meals/", { params: { days } }),

  delete: (id: number) => api.delete(`/meals/${id}`),
};

// ─── Activity ────────────────────────────────────────────────
export const activityApi = {
  log: (data: {
    activity_type: string;
    duration_minutes: number;
    intensity?: string;
    calories_burned?: number;
    notes?: string;
    recorded_at: string;
  }) => api.post("/activity/", data),

  list: (days = 7) => api.get("/activity/", { params: { days } }),

  delete: (id: number) => api.delete(`/activity/${id}`),
};

// ─── Sleep ───────────────────────────────────────────────────
export const sleepApi = {
  log: (data: {
    hours: number;
    quality?: string;
    bedtime?: string;
    wake_time?: string;
    recorded_at: string;
  }) => api.post("/sleep/", data),

  list: (days = 7) => api.get("/sleep/", { params: { days } }),

  delete: (id: number) => api.delete(`/sleep/${id}`),
};

// ─── Predictions ─────────────────────────────────────────────
export const predictApi = {
  glucoseForecast: (recent_readings: number[]) =>
    api.post("/predict/glucose", { recent_readings }),

  ppgr: (data: {
    carbs: number;
    protein: number;
    fat: number;
    baseline_glucose?: number;
    activity_level?: number;
    sleep_hours?: number;
    time_since_last_meal?: number;
  }) => api.post("/predict/ppgr", data),

  recommendations: (top_n = 10) =>
    api.get("/predict/recommendations", { params: { top_n } }),
};

// ─── Alerts ──────────────────────────────────────────────────
export const alertsApi = {
  list: (unread_only = false) =>
    api.get("/alerts/", { params: { unread_only } }),

  markRead: (id: number) => api.put(`/alerts/${id}/read`),

  markAllRead: () => api.put("/alerts/mark-all-read"),
};

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get("/dashboard/"),
};

export default api;
