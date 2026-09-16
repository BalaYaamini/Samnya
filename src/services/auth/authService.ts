// Authentication Service integrating Supabase Auth and rich accessibility persona support

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile, CommunicationMethod, UserType, UserRole, USER_PERSONAS } from '../../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
  role: UserRole;
  userType: UserType;
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

  public createGuestSession(
    userType: UserType = 'deaf', 
    preferences?: CommunicationMethod[]
  ): AuthSessionUser {
    const persona = USER_PERSONAS[userType] || USER_PERSONAS.deaf;
    const guestUser: AuthSessionUser = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: persona.demoUser.email,
      name: `${persona.demoUser.name} (Guest)`,
      isGuest: true,
      role: 'user',
      userType: userType,
      communicationPreferences: preferences || persona.recommendedMethods
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  }

  public createDemoPersonaSession(userType: UserType): AuthSessionUser {
    const persona = USER_PERSONAS[userType] || USER_PERSONAS.deaf;
    const demoUser: AuthSessionUser = {
      id: 'demo-' + userType,
      email: persona.demoUser.email,
      name: persona.demoUser.name,
      isGuest: false,
      role: 'user',
      userType: userType,
      communicationPreferences: persona.recommendedMethods
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  public createAdminSession(): AuthSessionUser {
    const adminUser: AuthSessionUser = {
      id: 'admin-samnya-01',
      email: 'admin@samnya.org',
      name: 'Dr. Evelyn Reed (Lead Accessibility Architect)',
      isGuest: false,
      role: 'admin',
      userType: 'hearing_speaking',
      communicationPreferences: ['speech', 'typing']
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  public async getCurrentSession(): Promise<AuthSessionUser | null> {
    // 1. Check active local / guest / persona session first
    const guest = this.getGuestUser();
    if (guest) return guest;

    // 2. Check Supabase session if configured
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await this.fetchProfile(session.user.id);
          const email = session.user.email || '';
          const role: UserRole = email.includes('admin') ? 'admin' : (profile?.role || 'user');
          const userType: UserType = profile?.user_type || (session.user.user_metadata?.user_type as UserType) || 'deaf';

          return {
            id: session.user.id,
            email,
            name: profile?.name || session.user.user_metadata?.name || 'User',
            isGuest: false,
            role,
            userType,
            communicationPreferences: profile?.communication_preferences || USER_PERSONAS[userType]?.recommendedMethods || ['typing']
          };
        }
      } catch (err) {
        console.warn('Error fetching Supabase session:', err);
      }
    }

    return null;
  }

  public async signUp(
    email: string, 
    password: string, 
    name: string, 
    userType: UserType = 'deaf',
    preferences?: CommunicationMethod[]
  ): Promise<{ user?: AuthSessionUser; error?: string }> {
    const defaultPrefs = preferences || USER_PERSONAS[userType]?.recommendedMethods || ['typing'];
    const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';

    if (!isSupabaseConfigured) {
      // Offline fallback: create simulated verified user
      const offlineUser: AuthSessionUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        name,
        isGuest: false,
        role,
        userType,
        communicationPreferences: defaultPrefs
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(offlineUser));
      return { user: offlineUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, user_type: userType, role, communication_preferences: defaultPrefs }
        }
      });

      if (error) return { error: error.message };

      if (data.user) {
        await this.upsertProfile(data.user.id, name, email, userType, role, defaultPrefs);

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            isGuest: false,
            role,
            userType,
            communicationPreferences: defaultPrefs
          }
        };
      }

      return { error: 'Failed to create user account.' };
    } catch (err: any) {
      return { error: err.message || 'Signup error occurred.' };
    }
  }

  public async signIn(
    email: string, 
    password: string,
    forcedRole?: UserRole
  ): Promise<{ user?: AuthSessionUser; error?: string }> {
    const isSpecialAdmin = email.toLowerCase().trim() === 'admin@samnya.org' || forcedRole === 'admin';

    if (!isSupabaseConfigured) {
      if (isSpecialAdmin) {
        return { user: this.createAdminSession() };
      }

      // Offline fallback for any registered email
      const offlineUser: AuthSessionUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0] || 'User',
        isGuest: false,
        role: 'user',
        userType: 'deaf',
        communicationPreferences: ['sign', 'typing']
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(offlineUser));
      return { user: offlineUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        const profile = await this.fetchProfile(data.user.id);
        const role: UserRole = isSpecialAdmin ? 'admin' : (profile?.role || 'user');
        const userType: UserType = profile?.user_type || 'deaf';

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.name || data.user.user_metadata?.name || 'User',
            isGuest: false,
            role,
            userType,
            communicationPreferences: profile?.communication_preferences || USER_PERSONAS[userType]?.recommendedMethods || ['typing']
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

  public async upsertProfile(
    userId: string, 
    name: string, 
    email: string, 
    userType: UserType = 'deaf',
    role: UserRole = 'user',
    preferences: CommunicationMethod[] = ['typing']
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name,
        email,
        user_type: userType,
        role,
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
