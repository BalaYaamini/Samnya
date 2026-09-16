import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthSessionUser } from '../services/auth/authService';
import { CommunicationMethod, UserType, UserRole, USER_PERSONAS } from '../types';

interface AuthContextType {
  user: AuthSessionUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string, forcedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, userType?: UserType, preferences?: CommunicationMethod[]) => Promise<{ success: boolean; error?: string }>;
  signInAsDemoPersona: (userType: UserType) => void;
  signInAsAdmin: () => void;
  continueAsGuest: (userType?: UserType, preferences?: CommunicationMethod[]) => void;
  signOut: () => Promise<void>;
  updateCommunicationPreferences: (preferences: CommunicationMethod[]) => Promise<void>;
  switchUserType: (userType: UserType) => Promise<void>;
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

  const signIn = async (email: string, password: string, forcedRole?: UserRole) => {
    setIsLoading(true);
    const res = await authService.signIn(email, password, forcedRole);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign in failed' };
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    userType: UserType = 'deaf',
    preferences?: CommunicationMethod[]
  ) => {
    setIsLoading(true);
    const res = await authService.signUp(email, password, name, userType, preferences);
    setIsLoading(false);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign up failed' };
  };

  const signInAsDemoPersona = (userType: UserType) => {
    const demoUser = authService.createDemoPersonaSession(userType);
    setUser(demoUser);
  };

  const signInAsAdmin = () => {
    const adminUser = authService.createAdminSession();
    setUser(adminUser);
  };

  const continueAsGuest = (userType: UserType = 'deaf', preferences?: CommunicationMethod[]) => {
    const guestUser = authService.createGuestSession(userType, preferences);
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
      await authService.upsertProfile(user.id, user.name, user.email, user.userType, user.role, preferences);
    } else {
      localStorage.setItem('samnya_guest_session', JSON.stringify(updated));
    }
  };

  const switchUserType = async (userType: UserType) => {
    if (!user) return;
    const persona = USER_PERSONAS[userType];
    const updated: AuthSessionUser = {
      ...user,
      userType,
      communicationPreferences: persona ? persona.recommendedMethods : user.communicationPreferences
    };
    setUser(updated);
    if (!user.isGuest) {
      await authService.upsertProfile(user.id, user.name, user.email, userType, user.role, updated.communicationPreferences);
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
      signInAsDemoPersona,
      signInAsAdmin,
      continueAsGuest,
      signOut,
      updateCommunicationPreferences,
      switchUserType
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
