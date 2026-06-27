import { create } from 'zustand';
import api from '../utils/api';
import { useAuthStore } from './authStore';

export const useAnalyticsStore = create((set) => ({
  analytics: null,
  insights: null,
  isLoadingAnalytics: false,
  isLoadingInsights: false,
  error: null,

  fetchAnalytics: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoadingAnalytics: true, error: null });
    try {
      const { data } = await api.get(`/analytics/${user.id}`);
      set({ analytics: data.analytics, isLoadingAnalytics: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load analytics', isLoadingAnalytics: false });
    }
  },

  fetchInsights: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoadingInsights: true, error: null });
    try {
      const { data } = await api.get(`/insights/${user.id}`);
      set({ insights: data.insight, isLoadingInsights: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load insights', isLoadingInsights: false });
    }
  },

  clearError: () => set({ error: null }),
}));
