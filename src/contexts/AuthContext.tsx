import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthSessionUser } from '../services/auth/authService';
import { CommunicationMethod } from '../types';

interface AuthContextType {
  user: AuthSessionUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, preferences?: CommunicationMethod[]) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: (preferences?: CommunicationMethod[]) => void;
  signOut: () => Promise<void>;
  updateCommunicationPreferences: (preferences: CommunicationMethod[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const current = await authService.getCurrentSession();
        setUser(current);
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.signIn(email, password);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign in failed' };
  };

  const signUp = async (email: string, password: string, name: string, preferences?: CommunicationMethod[]) => {
    setIsLoading(true);
    const res = await authService.signUp(email, password, name, preferences);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign up failed' };
  };

  const continueAsGuest = (preferences: CommunicationMethod[] = ['typing']) => {
    const guestUser = authService.createGuestSession(preferences);
    setUser(guestUser);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateCommunicationPreferences = async (preferences: CommunicationMethod[]) => {
    if (!user) return;
    const updated = { ...user, communicationPreferences: preferences };
    setUser(updated);
    if (!user.isGuest) {
      await authService.upsertProfile(user.id, user.name, user.email, preferences);
    } else {
      localStorage.setItem('samnya_guest_session', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      continueAsGuest,
      signOut,
      updateCommunicationPreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
