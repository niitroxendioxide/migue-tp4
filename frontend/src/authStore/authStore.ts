import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';


interface AuthState {
    user: User | null;
    setUser: (u: User | null) => void;
    updateBalance: (balance: number) => void;
    clear: () => void;
    isAuthenticated: boolean;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist((set): AuthState => ({
        user: null,
        setUser: (u: User | null) => set({ user: u, isAuthenticated: u !== null }),
        updateBalance: (balance: number) => set((state) => ({ user: state.user ? { ...state.user, balance } : state.user })),
        clear: () => set({ user: null, isAuthenticated: false }),
        // Avoid calling get() during init (persist may call this before store is ready)
        isAuthenticated: false,
        logout: () => set(() => {
            console.log('Logging out...');
            localStorage.removeItem('authToken');
            const navigate = useNavigate();
            navigate('/');
            return { user: null, isAuthenticated: false };
        }),
    }), {
        name: 'auth-user-storage', // localStorage key
    })
);

export const getUser = () => useAuthStore.getState().user;
export const setUser = (u: User | null) => useAuthStore.getState().setUser(u);
export const updateBalance = (b: number) => useAuthStore.getState().updateBalance(b);
