import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: () => {
    try {
      const token = localStorage.getItem('tl_token');
      const user = JSON.parse(localStorage.getItem('tl_user') || 'null');
      if (token && user) {
        set({ token, user, isAuthenticated: true });
      }
    } catch {
      set({ isAuthenticated: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('tl_token', data.token);
      localStorage.setItem('tl_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('tl_token', data.token);
      localStorage.setItem('tl_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('tl_token');
    localStorage.removeItem('tl_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
