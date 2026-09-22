// Authentication Service integrating Supabase Auth, persistent Local Account Registry, Email OTP Verification, and rich accessibility persona support

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

export interface StoredAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  userType: UserType;
  role: UserRole;
  communicationPreferences: CommunicationMethod[];
  isGoogleAccount?: boolean;
  createdAt: string;
}

interface PendingOtp {
  email: string;
  otp: string;
  expiresAt: number;
}

const ACTIVE_SESSION_KEY = 'samnya_guest_session';
const ACCOUNTS_REGISTRY_KEY = 'samnya_registered_accounts';
const PENDING_OTP_KEY = 'samnya_pending_otps';

export class AuthService {
  constructor() {
    this.ensureDefaultAccountsSeeded();
  }

  public isOnline(): boolean {
    return isSupabaseConfigured;
  }

  private ensureDefaultAccountsSeeded(): void {
    try {
      const existing = this.getStoredAccounts();
      const accountsMap = new Map(existing.map(a => [a.email.toLowerCase(), a]));

      // 1. Seed Admin account
      if (!accountsMap.has('admin@samnya.org')) {
        accountsMap.set('admin@samnya.org', {
          id: 'admin-samnya-01',
          email: 'admin@samnya.org',
          password: '2026',
          name: 'Dr. Evelyn Reed (Lead Accessibility Architect)',
          role: 'admin',
          userType: 'hearing_speaking',
          communicationPreferences: ['speech', 'typing'],
          createdAt: new Date().toISOString()
        });
      }

      // 2. Seed Google Verified User account
      if (!accountsMap.has('user.google@samnya.org')) {
        accountsMap.set('user.google@samnya.org', {
          id: 'google-samnya-01',
          email: 'user.google@samnya.org',
          name: 'Google Verified User',
          role: 'user',
          userType: 'deaf',
          communicationPreferences: ['typing', 'sign'],
          isGoogleAccount: true,
          createdAt: new Date().toISOString()
        });
      }

      // 3. Seed the 5 Demo Personas
      (Object.keys(USER_PERSONAS) as UserType[]).forEach(typeKey => {
        const p = USER_PERSONAS[typeKey];
        const email = p.demoUser.email.toLowerCase();
        if (!accountsMap.has(email)) {
          accountsMap.set(email, {
            id: 'demo-' + typeKey,
            email: p.demoUser.email,
            password: '2026',
            name: p.demoUser.name,
            role: 'user',
            userType: typeKey,
            communicationPreferences: p.recommendedMethods,
            createdAt: new Date().toISOString()
          });
        }
      });

      localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(Array.from(accountsMap.values())));
    } catch (e) {
      console.warn('Error seeding accounts:', e);
    }
  }

  public getStoredAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading accounts registry:', e);
    }
    return [];
  }

  public saveStoredAccount(account: StoredAccount): void {
    try {
      const accounts = this.getStoredAccounts();
      const cleanEmail = account.email.toLowerCase().trim();
      const index = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
      if (index >= 0) {
        accounts[index] = { ...accounts[index], ...account };
      } else {
        accounts.push(account);
      }
      localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Error saving account to registry:', e);
    }
  }

  public findStoredAccount(email: string): StoredAccount | null {
    const cleanEmail = email.toLowerCase().trim();
    const accounts = this.getStoredAccounts();
    return accounts.find(a => a.email.toLowerCase() === cleanEmail) || null;
  }

  // Fetch all accounts combining local account registry and Supabase profiles table
  public async fetchAllAccounts(): Promise<StoredAccount[]> {
    this.ensureDefaultAccountsSeeded();
    const localAccounts = this.getStoredAccounts();
    const accountMap = new Map<string, StoredAccount>();

    localAccounts.forEach(acc => {
      accountMap.set(acc.email.toLowerCase().trim(), acc);
    });

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && Array.isArray(data)) {
          data.forEach((p: any) => {
            const email = (p.email || `${p.id}@samnya.user`).toLowerCase().trim();
            const existing = accountMap.get(email);
            accountMap.set(email, {
              id: p.id || existing?.id || 'sp-' + Math.random().toString(36).substring(2, 9),
              email: p.email || existing?.email || email,
              password: existing?.password,
              name: p.name || existing?.name || 'User',
              userType: (p.user_type as UserType) || existing?.userType || 'deaf',
              role: (p.role as UserRole) || existing?.role || 'user',
              communicationPreferences: p.communication_preferences || existing?.communicationPreferences || ['typing'],
              isGoogleAccount: existing?.isGoogleAccount,
              createdAt: p.created_at || existing?.createdAt || new Date().toISOString()
            });
          });

          // Sync back to local storage
          const merged = Array.from(accountMap.values());
          localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('Supabase fetch profiles warning:', err);
      }
    }

    return Array.from(accountMap.values());
  }

  public async adminCreateAccount(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    userType: UserType;
    communicationPreferences?: CommunicationMethod[];
  }): Promise<{ success: boolean; account?: StoredAccount; error?: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!data.name.trim()) {
      return { success: false, error: 'User name is required.' };
    }

    const existing = this.findStoredAccount(cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const prefs = data.communicationPreferences || USER_PERSONAS[data.userType]?.recommendedMethods || ['typing'];
    const newAccount: StoredAccount = {
      id: newId,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || '2026',
      role: data.role,
      userType: data.userType,
      communicationPreferences: prefs,
      createdAt: new Date().toISOString()
    };

    this.saveStoredAccount(newAccount);

    if (isSupabaseConfigured) {
      try {
        await this.upsertProfile(newId, newAccount.name, newAccount.email, newAccount.userType, newAccount.role, newAccount.communicationPreferences);
      } catch (e) {
        console.warn('Supabase sync warning for adminCreateAccount:', e);
      }
    }

    return { success: true, account: newAccount };
  }

  public async updateAccount(updated: StoredAccount): Promise<boolean> {
    this.saveStoredAccount(updated);

    if (isSupabaseConfigured) {
      try {
        await this.upsertProfile(
          updated.id,
          updated.name,
          updated.email,
          updated.userType,
          updated.role,
          updated.communicationPreferences
        );
      } catch (e) {
        console.warn('Supabase profile update warning:', e);
      }
    }
    return true;
  }

  public async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    const accounts = this.getStoredAccounts();
    const account = accounts.find(a => a.id === userId);

    if (!account) {
      return { success: false, error: 'User account not found.' };
    }

    if (account.email.toLowerCase() === 'admin@samnya.org' || account.id === 'admin-samnya-01') {
      return { success: false, error: 'Cannot delete primary root administrator account.' };
    }

    const filtered = accounts.filter(a => a.id !== userId);
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (e) {
        console.warn('Supabase profile delete warning:', e);
      }
    }

    return { success: true };
  }

  // Check email registration status to prevent duplicate accounts
  public checkEmailRegistration(email: string): { 
    exists: boolean; 
    isGoogleAccount: boolean; 
    hasPassword: boolean; 
    name?: string 
  } {
    const cleanEmail = email.toLowerCase().trim();
    const account = this.findStoredAccount(cleanEmail);
    if (!account) {
      return { exists: false, isGoogleAccount: false, hasPassword: false };
    }
    return {
      exists: true,
      isGoogleAccount: Boolean(account.isGoogleAccount),
      hasPassword: Boolean(account.password && account.password.length > 0),
      name: account.name
    };
  }

  // --- OTP Verification Methods ---
  public getPendingOtps(): Record<string, PendingOtp> {
    try {
      const raw = localStorage.getItem(PENDING_OTP_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading pending OTPs:', e);
    }
    return {};
  }

  public async sendEmailOtp(email: string): Promise<{ success: boolean; error?: string; otpPreview?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // Generate 6-digit numeric verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const pending = this.getPendingOtps();
    pending[cleanEmail] = { email: cleanEmail, otp, expiresAt };
    localStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pending));

    // If live Supabase is configured, trigger Supabase OTP as well
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: false
          }
        });
      } catch (err) {
        console.warn('Supabase OTP trigger notice:', err);
      }
    }

    return { success: true, otpPreview: otp };
  }

  public verifyEmailOtp(email: string, enteredOtp: string): { success: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = enteredOtp.trim();

    const pending = this.getPendingOtps();
    const item = pending[cleanEmail];

    // Master test bypass or local validation
    if (cleanOtp === '123456' || cleanOtp === '202600') {
      return { success: true };
    }

    if (!item) {
      return { success: false, error: 'No verification code found. Please click Resend Code.' };
    }

    if (Date.now() > item.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (item.otp !== cleanOtp) {
      return { success: false, error: 'Incorrect 6-digit verification code. Please check and try again.' };
    }

    return { success: true };
  }

  public async registerAccountWithOtp(data: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    preferences?: CommunicationMethod[];
    otp: string;
  }): Promise<{ user?: AuthSessionUser; error?: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    
    // 1. Verify OTP first
    const verifyRes = this.verifyEmailOtp(cleanEmail, data.otp);
    if (!verifyRes.success) {
      return { error: verifyRes.error || 'Invalid verification code.' };
    }

    // 2. Check if an account already exists (Prevent duplicate accounts)
    const existing = this.findStoredAccount(cleanEmail);
    if (existing) {
      // If previously created with Google, safely link the password to that account
      if (existing.isGoogleAccount) {
        existing.password = data.password;
        existing.name = data.name || existing.name;
        existing.userType = data.userType || existing.userType;
        existing.communicationPreferences = data.preferences || existing.communicationPreferences;
        this.saveStoredAccount(existing);

        const authUser: AuthSessionUser = {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          isGuest: false,
          role: existing.role,
          userType: existing.userType,
          communicationPreferences: existing.communicationPreferences
        };
        this.setGuestUser(authUser);
        this.clearPendingOtp(cleanEmail);
        return { user: authUser };
      }

      // If already has password
      if (existing.password) {
        return { error: 'An account with this email is already registered. Please Sign In instead.' };
      }
    }

    // 3. Register fresh account
    const signUpRes = await this.signUp(
      cleanEmail,
      data.password,
      data.name,
      data.userType,
      data.preferences
    );

    if (signUpRes.user) {
      this.clearPendingOtp(cleanEmail);
    }

    return signUpRes;
  }

  private clearPendingOtp(email: string): void {
    const pending = this.getPendingOtps();
    delete pending[email.toLowerCase().trim()];
    localStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pending));
  }

  public getGuestUser(): AuthSessionUser | null {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading guest storage:', e);
    }
    return null;
  }

  public setGuestUser(user: AuthSessionUser): void {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Error setting active user session:', e);
    }
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
    this.setGuestUser(guestUser);
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
    this.setGuestUser(demoUser);
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
    this.setGuestUser(adminUser);
    return adminUser;
  }

  public async getCurrentSession(): Promise<AuthSessionUser | null> {
    // 1. If returning from OAuth redirect with access_token in URL fragment
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      try {
        const hashStr = window.location.hash.replace(/^#/, '');
        const params = new URLSearchParams(hashStr);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          if (isSupabaseConfigured && refreshToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
            } catch (e) {
              console.warn('supabase.auth.setSession warning:', e);
            }
          }
        }
      } catch (err) {
        console.warn('Error parsing OAuth hash in getCurrentSession:', err);
      }
    }

    // 2. Check Supabase session if configured (prioritize live OAuth session over cached guest)
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession warning:', error);
        }
        if (session?.user) {
          const profile = await this.fetchProfile(session.user.id);
          const email = session.user.email || '';
          const role: UserRole = email.includes('admin') ? 'admin' : (profile?.role || 'user');
          const userType: UserType = profile?.user_type || (session.user.user_metadata?.user_type as UserType) || 'deaf';
          const name = profile?.name || 
            session.user.user_metadata?.full_name || 
            session.user.user_metadata?.name || 
            session.user.user_metadata?.user_name || 
            (email ? email.split('@')[0] : 'User');
          const communicationPreferences = profile?.communication_preferences || 
            USER_PERSONAS[userType]?.recommendedMethods || 
            ['typing'];

          const authUser: AuthSessionUser = {
            id: session.user.id,
            email,
            name,
            isGuest: false,
            role,
            userType,
            communicationPreferences
          };

          // Clean URL hash now that session is successfully established
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }

          // Save/update in local accounts registry for seamless unified account
          const existingStored = this.findStoredAccount(email);
          this.saveStoredAccount({
            id: session.user.id,
            email,
            password: existingStored?.password,
            name,
            role,
            userType,
            communicationPreferences,
            isGoogleAccount: true,
            createdAt: existingStored?.createdAt || new Date().toISOString()
          });

          this.setGuestUser(authUser);

          // If profile didn't exist in Supabase DB yet, create it in background
          if (!profile) {
            this.upsertProfile(session.user.id, name, email, userType, role, communicationPreferences).catch(console.warn);
          }

          return authUser;
        }
      } catch (err) {
        console.warn('Error fetching Supabase session:', err);
      }
    }

    // 3. Check active local / guest / persona session
    const active = this.getGuestUser();
    if (active) return active;

    return null;
  }

  public async signUp(
    email: string, 
    password: string, 
    name: string, 
    userType: UserType = 'deaf',
    preferences?: CommunicationMethod[]
  ): Promise<{ user?: AuthSessionUser; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const defaultPrefs = preferences || USER_PERSONAS[userType]?.recommendedMethods || ['typing'];
    const role: UserRole = cleanEmail.includes('admin') ? 'admin' : 'user';

    // 1. Check if account already exists locally
    const existing = this.findStoredAccount(cleanEmail);
    if (existing) {
      if (existing.password === password) {
        const authUser: AuthSessionUser = {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          isGuest: false,
          role: existing.role,
          userType: existing.userType,
          communicationPreferences: existing.communicationPreferences
        };
        this.setGuestUser(authUser);
        return { user: authUser };
      }
      if (existing.isGoogleAccount) {
        return { error: 'An account with this email is already registered via Google. Please Sign In with your email and password, or use Continue with Google.' };
      }
      return { error: 'An account with this email already exists. Please sign in or use a different email.' };
    }

    // 2. Prepare user ID
    let userId = 'user-' + Math.random().toString(36).substring(2, 9);

    // 3. Try Supabase signUp if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name, user_type: userType, role, communication_preferences: defaultPrefs }
          }
        });

        if (data?.user?.id) {
          userId = data.user.id;
          this.upsertProfile(userId, name, cleanEmail, userType, role, defaultPrefs).catch(console.warn);
        } else if (error) {
          console.warn('Supabase signup notice:', error.message);
          if (error.message.toLowerCase().includes('already registered')) {
            return { error: 'An account with this email already exists in Supabase. Please sign in.' };
          }
        }
      } catch (err: any) {
        console.warn('Supabase signup error fallback:', err);
      }
    }

    // 4. Save account in local registry for reliable authentication
    const newStoredAccount: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password,
      name,
      userType,
      role,
      communicationPreferences: defaultPrefs,
      createdAt: new Date().toISOString()
    };
    this.saveStoredAccount(newStoredAccount);

    // 5. Establish active session
    const newUser: AuthSessionUser = {
      id: userId,
      email: cleanEmail,
      name,
      isGuest: false,
      role,
      userType,
      communicationPreferences: defaultPrefs
    };
    this.setGuestUser(newUser);

    return { user: newUser };
  }

  public async signIn(
    email: string, 
    password: string,
    forcedRole?: UserRole
  ): Promise<{ user?: AuthSessionUser; error?: string; isGoogleAccount?: boolean }> {
    const cleanEmail = email.toLowerCase().trim();
    const isSpecialAdmin = cleanEmail === 'admin@samnya.org' || forcedRole === 'admin';

    // 1. Admin authentication check
    if (isSpecialAdmin) {
      if (password === '2026' || password === 'admin2026' || password === 'samnya2026') {
        return { user: this.createAdminSession() };
      }
      return { error: 'Incorrect password. Please check your administrator security PIN (Default: 2026).' };
    }

    // 2. Direct check against live Supabase Auth if configured
    let supabaseErrorMsg: string | null = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          const profile = await this.fetchProfile(data.user.id);
          const role: UserRole = profile?.role || 'user';
          const userType: UserType = profile?.user_type || (data.user.user_metadata?.user_type as UserType) || 'deaf';
          const name = profile?.name || 
            data.user.user_metadata?.name || 
            data.user.user_metadata?.full_name || 
            cleanEmail.split('@')[0] || 
            'User';
          const communicationPreferences = profile?.communication_preferences || 
            USER_PERSONAS[userType]?.recommendedMethods || 
            ['typing'];

          const authUser: AuthSessionUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name,
            isGuest: false,
            role,
            userType,
            communicationPreferences
          };

          this.saveStoredAccount({
            id: data.user.id,
            email: cleanEmail,
            password,
            name,
            role,
            userType,
            communicationPreferences,
            createdAt: new Date().toISOString()
          });

          this.setGuestUser(authUser);
          return { user: authUser };
        } else if (error) {
          supabaseErrorMsg = error.message;
        }
      } catch (err: any) {
        supabaseErrorMsg = err?.message || 'Authentication error';
      }
    }

    // 3. Check Account Registry (Local Vault)
    const stored = this.findStoredAccount(cleanEmail);
    if (stored) {
      // If it's a Google account without a password set (e.g. user clicked Skip)
      if (stored.isGoogleAccount && (!stored.password || stored.password.length === 0)) {
        return { 
          error: 'No password has been set for this Google account. Please use "Continue with Google" above to sign in or set a password.',
          isGoogleAccount: true 
        };
      }

      // If account has a password (either regular account or Google account with reset password)
      if (stored.password === password) {
        const authUser: AuthSessionUser = {
          id: stored.id,
          email: stored.email,
          name: stored.name,
          isGuest: false,
          role: stored.role,
          userType: stored.userType,
          communicationPreferences: stored.communicationPreferences
        };
        this.setGuestUser(authUser);
        return { user: authUser };
      } else {
        return { error: 'Incorrect password. Please check your password and try again.' };
      }
    }

    // 4. Check Demo Persona Accounts
    for (const pKey of Object.keys(USER_PERSONAS) as UserType[]) {
      const p = USER_PERSONAS[pKey];
      if (p.demoUser.email.toLowerCase() === cleanEmail) {
        if (password === '2026' || password === 'demo123' || password === 'samnya2026' || password === '123456') {
          return { user: this.createDemoPersonaSession(pKey) };
        }
        return { error: 'Incorrect password for this demo persona. (Use passcode: 2026)' };
      }
    }

    // 5. If Supabase gave "Invalid login credentials", clearly report incorrect password
    if (supabaseErrorMsg) {
      if (
        supabaseErrorMsg.toLowerCase().includes('invalid login credentials') || 
        supabaseErrorMsg.toLowerCase().includes('invalid grant') || 
        supabaseErrorMsg.toLowerCase().includes('incorrect') ||
        supabaseErrorMsg.toLowerCase().includes('invalid')
      ) {
        return { error: 'Incorrect password. Please check your password and try again.' };
      }
      return { error: supabaseErrorMsg };
    }

    // 6. Account not found
    return { error: 'No account found with this email. Please check your spelling or switch to Create Account.' };
  }

  // 1. Frictionless Google OAuth - Direct auto-create or login with zero passwords and zero OTP
  public async signInWithGoogle(userType: UserType = 'deaf'): Promise<{ user?: AuthSessionUser; error?: string }> {
    if (!isSupabaseConfigured) {
      const googleEmail = 'user.google@samnya.org';
      const existing = this.findStoredAccount(googleEmail);

      const googleUser: AuthSessionUser = {
        id: existing?.id || 'google-' + Math.random().toString(36).substring(2, 9),
        email: googleEmail,
        name: existing?.name || 'Google Verified User',
        isGuest: false,
        role: existing?.role || 'user',
        userType: existing?.userType || userType,
        communicationPreferences: existing?.communicationPreferences || USER_PERSONAS[userType]?.recommendedMethods || ['typing']
      };

      // Safely link or create in registry without duplicate
      this.saveStoredAccount({
        id: googleUser.id,
        email: googleUser.email,
        password: existing?.password,
        name: googleUser.name,
        role: googleUser.role,
        userType: googleUser.userType,
        communicationPreferences: googleUser.communicationPreferences,
        isGoogleAccount: true,
        createdAt: existing?.createdAt || new Date().toISOString()
      });

      this.setGuestUser(googleUser);
      return { user: googleUser };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Google sign in failed.' };
    }
  }

  public async signOut(): Promise<void> {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
  }

  public async setPasswordForAccount(email: string, newPassword: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    const stored = this.findStoredAccount(cleanEmail);
    if (stored) {
      stored.password = newPassword;
      this.saveStoredAccount(stored);
    } else {
      this.saveStoredAccount({
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        password: newPassword,
        name: cleanEmail.split('@')[0],
        role: 'user',
        userType: 'deaf',
        communicationPreferences: ['typing', 'sign'],
        createdAt: new Date().toISOString()
      });
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (e) {
        console.warn('Supabase password update note:', e);
      }
    }
    return true;
  }

  public async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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


