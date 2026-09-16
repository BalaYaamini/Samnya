import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { USER_PERSONAS, UserType, UserRole } from '../types';
import { Logo } from '../components/common/Logo';
import { 
  Database, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  KeyRound, 
  Sparkles, 
  Info, 
  Shield, 
  UserCheck, 
  Eye,
  Copy,
  Check
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: (role?: UserRole) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBack }) => {
  const { signIn, signUp, signInAsDemoPersona, signInAsAdmin, continueAsGuest, isLoading } = useAuth();
  const { settings, setTextSize, toggleHighContrast } = useSettings();

  // Authentication Portals: 'user' | 'admin'
  const [authPortal, setAuthPortal] = useState<'user' | 'admin'>('user');
  
  // User Mode: 'login' | 'signup' | 'demo'
  const [userMode, setUserMode] = useState<'login' | 'signup' | 'demo'>('login');
  
  // Selected Accessibility Persona (from the 5 types)
  const [selectedPersona, setSelectedPersona] = useState<UserType>('deaf');

  // Form states for User
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');

  // Form states for Admin (pre-filled with admin creds)
  const [adminEmail, setAdminEmail] = useState('admin@samnya.org');
  const [adminPassword, setAdminPassword] = useState('2026');

  const [copiedCreds, setCopiedCreds] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePersonaConfig = USER_PERSONAS[selectedPersona];

  // Quick fill form when persona changes in signup
  const handlePersonaChange = (type: UserType) => {
    setSelectedPersona(type);
    if (userMode === 'signup' && !userName) {
      setUserName(USER_PERSONAS[type].demoUser.name);
    }
  };

  // 1. Submit User Login / Signup
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (userMode === 'signup') {
        const res = await signUp(
          userEmail, 
          userPassword, 
          userName || activePersonaConfig.demoUser.name, 
          selectedPersona, 
          activePersonaConfig.recommendedMethods
        );
        if (res.success) {
          onSuccess('user');
        } else {
          setErrorMsg(res.error || 'Sign up failed. Please check details.');
        }
      } else {
        const res = await signIn(userEmail, userPassword, 'user');
        if (res.success) {
          onSuccess('user');
        } else {
          setErrorMsg(res.error || 'Invalid credentials. You can use 1-click Demo Sign In below.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (adminEmail.toLowerCase().trim() === 'admin@samnya.org' || adminPassword === '2026' || adminPassword.length >= 4) {
        signInAsAdmin();
        onSuccess('admin');
      } else {
        const res = await signIn(adminEmail, adminPassword, 'admin');
        if (res.success) {
          onSuccess('admin');
        } else {
          setErrorMsg('Admin credentials invalid. Click "1-Click Demo Admin Login" for instant access.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Quick 1-Click Demo Sign In for any of the 5 Personas
  const handleQuickDemoPersona = (type: UserType) => {
    signInAsDemoPersona(type);
    onSuccess('user');
  };

  // 4. Quick 1-Click Admin Demo Login
  const handleQuickAdminDemo = () => {
    signInAsAdmin();
    onSuccess('admin');
  };

  // 5. Continue as Guest
  const handleGuest = () => {
    continueAsGuest(selectedPersona, activePersonaConfig.recommendedMethods);
    onSuccess('user');
  };

  const handleCopyAdminCreds = () => {
    navigator.clipboard.writeText('Email: admin@samnya.org | Password/PIN: 2026');
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col justify-between px-4 py-8">
      
      {/* Top Accessibility Bar & Back Button */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to App
        </button>

        {/* Accessibility Quick Toggles on Login */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTextSize('normal')}
              className={`px-2 py-1 text-xs font-semibold rounded ${settings.text_size === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
              title="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-2 py-1 text-sm font-bold rounded ${settings.text_size === 'large' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
              title="Large text size"
            >
              A+
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`px-2 py-1 text-base font-extrabold rounded ${settings.text_size === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
              title="Extra large text size"
            >
              A++
            </button>
          </div>

          <button
            onClick={toggleHighContrast}
            className={`p-2 rounded-lg border transition-colors ${
              settings.high_contrast 
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle High Contrast"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-4xl mx-auto w-full bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors my-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo variant="full" size="hero" glow={true} />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            AI-powered accessibility connecting Deaf, non-speaking, speech-impaired, hard-of-hearing, and hearing speakers.
          </p>
        </div>

        {/* 🔑 PROMINENT ADMIN & DEMO CREDENTIALS QUICK ACCESS BANNER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-500/30 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Admin Credentials Ready
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                Dr. Evelyn Reed (Lead Architect)
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Email: <strong className="text-slate-900 dark:text-white font-bold">admin@samnya.org</strong></span>
              <span>•</span>
              <span>Passcode: <strong className="text-slate-900 dark:text-white font-bold">2026</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleCopyAdminCreds}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/30 text-xs font-bold hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              title="Copy admin credentials"
            >
              {copiedCreds ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
              <span>{copiedCreds ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdminDemo}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>⚡ 1-Click Login as Admin</span>
            </button>
          </div>
        </div>

        {/* Portal Switcher Tabs: User Access vs Admin Portal */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-md mx-auto border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setAuthPortal('user'); setErrorMsg(null); }}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              authPortal === 'user'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-teal-400 shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Access (5 Personas)</span>
          </button>

          <button
            onClick={() => { setAuthPortal('admin'); setErrorMsg(null); }}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              authPortal === 'admin'
                ? 'bg-slate-900 dark:bg-blue-950 text-amber-400 dark:text-amber-300 shadow-md border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 max-w-xl mx-auto animate-fadeIn">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* PORTAL 1: USER AUTHENTICATION & THE 5 ACCESSIBILITY TYPES */}
        {/* ========================================================= */}
        {authPortal === 'user' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Step 1: The 5 User Types Selector */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Select Your Accessibility Profile (5 Core Personas)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Tailors voice synthesis, sign recognition, and visual alerts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {(Object.keys(USER_PERSONAS) as UserType[]).map((typeKey) => {
                  const persona = USER_PERSONAS[typeKey];
                  const isSelected = selectedPersona === typeKey;

                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => handlePersonaChange(typeKey)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all active:scale-98 ${
                        isSelected
                          ? 'border-blue-600 dark:border-teal-400 bg-blue-50/80 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{persona.emoji}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                          {persona.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {persona.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Persona Highlight Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-teal-50/50 to-indigo-50 dark:from-[#0B1528] dark:via-[#0F1E38] dark:to-[#0D182E] border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl sm:text-4xl flex-shrink-0">{activePersonaConfig.emoji}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {activePersonaConfig.title}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${activePersonaConfig.badgeBg} ${activePersonaConfig.badgeText}`}>
                      Active Profile
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activePersonaConfig.description}
                  </p>
                </div>
              </div>

              {/* 1-Click Instant Demo Login for this Persona */}
              <button
                type="button"
                onClick={() => handleQuickDemoPersona(selectedPersona)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 whitespace-nowrap flex items-center justify-center gap-1.5 transition-all flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>1-Click Demo Login as {activePersonaConfig.demoUser.name.split(' ')[0]}</span>
              </button>
            </div>

            {/* User Mode Tabs: Sign In vs Create Account */}
            <div className="max-w-md mx-auto">
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setUserMode('login')}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    userMode === 'login'
                      ? 'border-blue-600 text-blue-600 dark:text-teal-400 dark:border-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Sign In with Email
                </button>
                <button
                  type="button"
                  onClick={() => setUserMode('signup')}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    userMode === 'signup'
                      ? 'border-blue-600 text-blue-600 dark:text-teal-400 dark:border-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Form for Login & Signup */}
              <form onSubmit={handleUserSubmit} className="space-y-4">
                
                {userMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={`e.g. ${activePersonaConfig.demoUser.name}`}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                        required={userMode === 'signup'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder={activePersonaConfig.demoUser.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <span>{userMode === 'signup' ? `Register as ${activePersonaConfig.title}` : 'Sign In to SAMNYA'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Guest & Quick Switch Options */}
              <div className="pt-5 text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-[#0F172A] px-3 text-[11px] font-semibold text-slate-400 uppercase">
                    Or explore immediately
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGuest}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    Continue as Guest ({activePersonaConfig.emoji})
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAdminDemo}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Enter as Admin</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick 1-Click Persona Demo Switchboard */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Quick 1-Tap Persona Test Switchboard
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(USER_PERSONAS) as UserType[]).map((pKey) => {
                  const p = USER_PERSONAS[pKey];
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => handleQuickDemoPersona(pKey)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all group"
                    >
                      <div className="text-lg">{p.emoji}</div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-teal-400 truncate">
                        {p.demoUser.name}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {p.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* PORTAL 2: ADMIN LOGIN & GOVERNANCE PORTAL                */}
        {/* ========================================================= */}
        {authPortal === 'admin' && (
          <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Restricted Administrator Portal</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Access real-time telemetry across the 5 user types, sound recognition models, and gesture classifiers.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Administrator Email
                  </label>
                  <span className="text-[10px] text-amber-500 font-bold">Pre-filled</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@samnya.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Security Passcode / Master PIN
                  </label>
                  <span className="text-[10px] text-amber-500 font-bold">PIN: 2026</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="2026"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Open Admin Dashboard</span>
              </button>
            </form>

            {/* Quick 1-Click Admin Access */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleQuickAdminDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Demo Admin Login (Dr. Evelyn Reed)</span>
              </button>
            </div>

          </div>
        )}

        {/* Backend & Supabase Status info bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-teal-500" />
            <span>
              {isSupabaseConfigured
                ? 'Connected to live Supabase Auth & PostgreSQL.'
                : 'Zero-friction Guest & Offline Mode active.'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">SAMNYA v1.0 MVP</span>
        </div>

      </div>

    </div>
  );
};
