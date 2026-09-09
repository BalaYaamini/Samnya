// Authentication Service integrating Supabase Auth and seamless Guest Mode fallback

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile, CommunicationMethod } from '../../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
  communicationPreferences: CommunicationMethod[];
}

const GUEST_STORAGE_KEY = 'samnya_guest_session';

export class AuthService {
  public isOnline(): boolean {
    return isSupabaseConfigured;
  }

  public getGuestUser(): AuthSessionUser | null {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading guest storage:', e);
    }
    return null;
  }

  public createGuestSession(preferences: CommunicationMethod[] = ['typing']): AuthSessionUser {
    const guestUser: AuthSessionUser = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@samnya.local',
      name: 'Guest Explorer',
      isGuest: true,
      communicationPreferences: preferences
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  }

  public async getCurrentSession(): Promise<AuthSessionUser | null> {
    // 1. Check active guest session first
    const guest = this.getGuestUser();
    if (guest) return guest;

    // 2. Check Supabase session if configured
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await this.fetchProfile(session.user.id);
          return {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.user_metadata?.name || 'User',
            isGuest: false,
            communicationPreferences: profile?.communication_preferences || ['typing']
          };
        }
      } catch (err) {
        console.warn('Error fetching Supabase session:', err);
      }
    }

    return null;
  }

  public async signUp(email: string, password: string, name: string, preferences: CommunicationMethod[] = ['typing']): Promise<{ user?: AuthSessionUser; error?: string }> {
    if (!isSupabaseConfigured) {
      // Offline fallback: create simulated verified user
      const offlineUser: AuthSessionUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        name,
        isGuest: false,
        communicationPreferences: preferences
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(offlineUser));
      return { user: offlineUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, communication_preferences: preferences }
        }
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Upsert profile record
        await this.upsertProfile(data.user.id, name, email, preferences);

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            isGuest: false,
            communicationPreferences: preferences
          }
        };
      }

      return { error: 'Failed to create user account.' };
    } catch (err: any) {
      return { error: err.message || 'Signup error occurred.' };
    }
  }

  public async signIn(email: string, password: string): Promise<{ user?: AuthSessionUser; error?: string }> {
    if (!isSupabaseConfigured) {
      // Offline fallback
      const offlineUser: AuthSessionUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0] || 'User',
        isGuest: false,
        communicationPreferences: ['typing']
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(offlineUser));
      return { user: offlineUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        const profile = await this.fetchProfile(data.user.id);
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.name || data.user.user_metadata?.name || 'User',
            isGuest: false,
            communicationPreferences: profile?.communication_preferences || ['typing']
          }
        };
      }

      return { error: 'Invalid sign in response.' };
    } catch (err: any) {
      return { error: err.message || 'Login error occurred.' };
    }
  }

  public async signOut(): Promise<void> {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
  }

  public async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as UserProfile;
    } catch (e) {
      return null;
    }
  }

  public async upsertProfile(userId: string, name: string, email: string, preferences: CommunicationMethod[]): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name,
        email,
        communication_preferences: preferences,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (e) {
      console.warn('Profile upsert warning:', e);
      return false;
    }
  }
}

export const authService = new AuthService();
