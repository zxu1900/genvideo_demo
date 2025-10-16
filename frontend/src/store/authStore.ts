import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  register: (user: User) => void;
  logout: () => void;
  updateTokens: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  register: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateTokens: (amount) => set((state) => ({
    user: state.user ? { ...state.user, tokens: state.user.tokens + amount } : null
  })),
}));
