import { create } from 'zustand';
import api from '../api/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  education?: any[];
  experience?: any[];
  projects?: any[];
  skills?: string[];
  certifications?: string[];
  resumeText?: string;
  isOnboarded?: boolean;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (profile: Partial<UserProfile>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth-token'),
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth-token', token);
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;

      localStorage.setItem('auth-token', token);
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/profile');
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Failed to load user session', error);
      get().logout();
      set({ isLoading: false });
    }
  },

  updateUser: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/auth/profile', profileData);
      set({ 
        user: response.data, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      set({ error: message, isLoading: false });
      return false;
    }
  }
}));
