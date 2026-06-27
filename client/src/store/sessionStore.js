import { create } from 'zustand';
import api from '../utils/api';
import { useAuthStore } from './authStore';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  currentSessionId: null,
  lastSessionId: null,
  experimentNumber: null,
  isLoading: false,
  error: null,

  startSession: async (context) => {
    try {
      const { data } = await api.post('/sessions/start', context);
      set({ currentSessionId: data.sessionId, experimentNumber: data.experimentNumber });
      return data.sessionId;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to start session' });
      return null;
    }
  },

  endSession: async (actualSeconds, estimatedSeconds) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    try {
      await api.post('/sessions/end', { sessionId: currentSessionId, actualSeconds, estimatedSeconds });
      set({ currentSessionId: null, lastSessionId: currentSessionId });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to end session' });
    }
  },

  saveReflection: async (reflection) => {
    const { lastSessionId } = get();
    if (!lastSessionId) return;
    try {
      await api.post('/sessions/reflection', { sessionId: lastSessionId, reflection });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to save reflection' });
    }
  },

  fetchSessions: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get(`/sessions/user/${user.id}`);
      set({ sessions: data.sessions, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load sessions', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
