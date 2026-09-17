import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthSessionUser } from '../services/auth/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CommunicationMethod, UserType, UserRole, USER_PERSONAS } from '../types';

interface AuthContextType {
  user: AuthSessionUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string, forcedRole?: UserRole) => Promise<{ success: boolean; error?: string; isGoogleAccount?: boolean }>;
  signUp: (email: string, password: string, name: string, userType?: UserType, preferences?: CommunicationMethod[]) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (userType?: UserType) => Promise<{ success: boolean; error?: string; user?: AuthSessionUser }>;
  setPasswordForAccount: (email: string, newPassword: string) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; error?: string; otpPreview?: string }>;
  verifyEmailOtp: (email: string, otp: string) => { success: boolean; error?: string };
  registerAccountWithOtp: (data: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    preferences?: CommunicationMethod[];
    otp: string;
  }) => Promise<{ user?: AuthSessionUser; error?: string }>;
  checkEmailRegistration: (email: string) => {
    exists: boolean;
    isGoogleAccount: boolean;
    hasPassword: boolean;
    name?: string;
  };
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
    let mounted = true;

    const initSession = async () => {
      try {
        const current = await authService.getCurrentSession();
        if (mounted) {
          setUser(current);
        }
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const current = await authService.getCurrentSession();
          if (mounted) setUser(current);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string, forcedRole?: UserRole) => {
    const res = await authService.signIn(email, password, forcedRole);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Incorrect password. Please check your credentials.', isGoogleAccount: res.isGoogleAccount };
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    userType: UserType = 'deaf',
    preferences?: CommunicationMethod[]
  ) => {
    const res = await authService.signUp(email, password, name, userType, preferences);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign up failed' };
  };

  const signInWithGoogle = async (userType: UserType = 'deaf') => {
    const res = await authService.signInWithGoogle(userType);
    if (res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  };

  const setPasswordForAccount = async (email: string, newPassword: string) => {
    return await authService.setPasswordForAccount(email, newPassword);
  };

  const sendEmailOtp = async (email: string) => {
    return await authService.sendEmailOtp(email);
  };

  const verifyEmailOtp = (email: string, otp: string) => {
    return authService.verifyEmailOtp(email, otp);
  };

  const registerAccountWithOtp = async (data: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    preferences?: CommunicationMethod[];
    otp: string;
  }) => {
    const res = await authService.registerAccountWithOtp(data);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const checkEmailRegistration = (email: string) => {
    return authService.checkEmailRegistration(email);
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
      signInWithGoogle,
      setPasswordForAccount,
      sendEmailOtp,
      verifyEmailOtp,
      registerAccountWithOtp,
      checkEmailRegistration,
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
