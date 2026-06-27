import { create } from 'zustand';
import api from '../utils/api';
import { useAuthStore } from './authStore';

export const useCoachStore = create((set) => ({
  streaks: null,
  weeklyStory: null,
  coach: null,
  challenge: null,
  isLoading: false,
  error: null,

  fetchCoaching: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/coach/${user.id}`);
      set({ streaks: data.streaks, weeklyStory: data.weeklyStory, coach: data.coach, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load coaching', isLoading: false });
    }
  },

  fetchChallenge: async () => {
    try {
      const { data } = await api.get('/challenges/active');
      set({ challenge: data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load experiment' });
    }
  },

  createChallenge: async (payload) => {
    try {
      await api.post('/challenges', payload);
      const { data } = await api.get('/challenges/active');
      set({ challenge: data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to start experiment' });
    }
  },

  abandonChallenge: async () => {
    try {
      await api.post('/challenges/abandon');
      set({ challenge: { active: false } });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to stop experiment' });
    }
  },
}));
