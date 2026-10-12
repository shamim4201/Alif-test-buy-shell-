import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: 'buyer' | 'seller'; bio?: string }) => Promise<void>;
  logout: () => void;
  quickSwitch: (role: 'admin' | 'seller' | 'buyer') => Promise<void>;
  refreshUser: () => Promise<void>;
  authModal: { isOpen: boolean; mode: 'login' | 'register' };
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (e) {
      console.warn('Session expired or invalid, logging out', e);
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists, otherwise auto-login as demo buyer so user can immediately experience the app
    const token = getStoredToken();
    if (token) {
      refreshUser();
    } else {
      // Default initial login as buyer for frictionless first load
      api.quickSwitch('buyer')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setAuthModal({ isOpen: false, mode: 'login' });
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const register = async (payload: { name: string; email: string; password: string; role: 'buyer' | 'seller'; bio?: string }) => {
    const res = await api.register(payload);
    setUser(res.user);
    setAuthModal({ isOpen: false, mode: 'login' });
    showToast(`Account created successfully! Welcome to ChannelTrust.`, 'success');
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  const quickSwitch = async (role: 'admin' | 'seller' | 'buyer') => {
    try {
      const res = await api.quickSwitch(role);
      setUser(res.user);
      showToast(`Switched persona to ${res.user.name} (${role.toUpperCase()})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch demo persona', 'error');
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickSwitch,
        refreshUser,
        authModal,
        openAuthModal,
        closeAuthModal,
        toast,
        showToast
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all"
          style={{
            backgroundColor:
              toast.type === 'error' ? '#991B1B' : toast.type === 'success' ? '#065F46' : '#1E293B',
            color: '#FFFFFF',
            borderColor:
              toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : '#475569'
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-white/70 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
