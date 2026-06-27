import { create } from 'zustand';
import api from '../utils/api';
import { useAuthStore } from './authStore';

export const useTrainerStore = create((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  recordRound: async (targetSeconds, actualSeconds) => {
    try {
      const { data } = await api.post('/trainer', { targetSeconds, actualSeconds });
      return data.round;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to save round' });
      return null;
    }
  },

  fetchStats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/trainer/${user.id}`);
      set({ stats: data.stats, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load stats', isLoading: false });
    }
  },
}));
