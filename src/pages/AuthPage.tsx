import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  RefreshCw,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: (role?: UserRole) => void;
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { 
    signIn, 
    signInWithGoogle, 
    setPasswordForAccount,
    sendEmailOtp, 
    registerAccountWithOtp, 
    checkEmailRegistration,
    signInAsDemoPersona, 
    signInAsAdmin, 
    isLoading 
  } = useAuth();
  const { settings, setTextSize, toggleHighContrast } = useSettings();

  // Authentication Portals: 'user' | 'admin'
  const [authPortal, setAuthPortal] = useState<'user' | 'admin'>('user');
  
  // User Mode: 'login' | 'signup'
  const [userMode, setUserMode] = useState<'login' | 'signup'>('login');
  
  // Selected Accessibility Persona for sign up / guest
  const [selectedPersona, setSelectedPersona] = useState<UserType>('deaf');

  // Toggle for Demo / Testing Logins
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  // Form states for User
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth Password Setup Modal State
  const [googleSetup, setGoogleSetup] = useState<{ isOpen: boolean; email: string; name: string } | null>(null);
  const [googlePass, setGooglePass] = useState('');
  const [googleConfirmPass, setGoogleConfirmPass] = useState('');
  const [showGooglePass, setShowGooglePass] = useState(false);
  const [showGoogleConfirmPass, setShowGoogleConfirmPass] = useState(false);
  const [googleSetupError, setGoogleSetupError] = useState<string | null>(null);

  // OTP Verification States for Account Creation
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  // Form states for Admin
  const [adminEmail, setAdminEmail] = useState('admin@samnya.org');
  const [adminPassword, setAdminPassword] = useState('2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Duplicate detection banner state
  const [isGoogleDuplicate, setIsGoogleDuplicate] = useState(false);

  const [copiedCreds, setCopiedCreds] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePersonaConfig = USER_PERSONAS[selectedPersona];

  // OTP Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isVerifyingOtp && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVerifyingOtp, otpTimer]);

  // Quick fill form when persona changes in signup
  const handlePersonaChange = (type: UserType) => {
    setSelectedPersona(type);
    if (userMode === 'signup' && !userName) {
      setUserName(USER_PERSONAS[type].demoUser.name);
    }
  };

  // 1. Submit User Login or Request Email OTP for Account Creation
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleDuplicate(false);

    const cleanEmail = userEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password security validation (minimum 6 characters)
    if (userPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long for account security.');
      return;
    }

    // Signup validation & duplicate check
    if (userMode === 'signup') {
      if (confirmPassword && confirmPassword !== userPassword) {
        setErrorMsg('Passwords do not match. Please ensure both passwords match.');
        return;
      }

      // Check if account already exists with password
      const regCheck = checkEmailRegistration(cleanEmail);
      if (regCheck.exists && regCheck.hasPassword) {
        setErrorMsg('An account with this email already exists. Please Sign In with your password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const otpRes = await sendEmailOtp(cleanEmail);
        if (otpRes.success) {
          setIsVerifyingOtp(true);
          setOtpTimer(60);
          setOtpPreview(otpRes.otpPreview || null);
          setSuccessMsg(`Verification code sent to ${cleanEmail}`);
        } else {
          setErrorMsg(otpRes.error || 'Failed to send verification code. Please try again.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error generating email verification code.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign In Flow
    setIsSubmitting(true);
    try {
      const res = await signIn(cleanEmail, userPassword, 'user');
      if (res.success) {
        onSuccess('user');
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please check your email and password.');
        if (res.isGoogleAccount) {
          setIsGoogleDuplicate(true);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit OTP Code to finalize Account Creation
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanName = userName.trim() || activePersonaConfig.demoUser.name;
      const res = await registerAccountWithOtp({
        email: cleanEmail,
        password: userPassword,
        name: cleanName,
        userType: selectedPersona,
        preferences: activePersonaConfig.recommendedMethods,
        otp: cleanOtp
      });

      if (res.user) {
        setIsVerifyingOtp(false);
        onSuccess('user');
      } else {
        setErrorMsg(res.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2b. Resend OTP
  const handleResendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const cleanEmail = userEmail.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await sendEmailOtp(cleanEmail);
      if (res.success) {
        setOtpTimer(60);
        setOtpPreview(res.otpPreview || null);
        setSuccessMsg(`A new verification code was sent to ${cleanEmail}`);
      } else {
        setErrorMsg(res.error || 'Could not resend verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Continue with Google OAuth Login & Prompt Password Setup
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleDuplicate(false);
    setIsSubmitting(true);

    try {
      // For Supabase OAuth, set a flag BEFORE the redirect so it survives the page reload
      if (isSupabaseConfigured) {
        localStorage.setItem('google_needs_password_setup', 'true');
      }

      const res = await signInWithGoogle(selectedPersona);
      if (res.success) {
        if (isSupabaseConfigured && !res.user) {
          // Supabase OAuth will redirect — the modal will be shown in App.tsx after reload
          return;
        }
        // Offline mode: open modal immediately since there's no redirect
        setGoogleSetup({
          isOpen: true,
          email: res.user?.email || 'user.google@samnya.org',
          name: res.user?.name || 'Google Verified User'
        });
        setGooglePass('');
        setGoogleConfirmPass('');
        setGoogleSetupError(null);
      } else if (res.error) {
        localStorage.removeItem('google_needs_password_setup');
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      localStorage.removeItem('google_needs_password_setup');
      setErrorMsg(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3b. Save Password from Google modal
  const handleSaveGooglePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSetup) return;
    setGoogleSetupError(null);

    if (googlePass.length < 6) {
      setGoogleSetupError('Password must be at least 6 characters long.');
      return;
    }

    if (googlePass !== googleConfirmPass) {
      setGoogleSetupError('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setPasswordForAccount(googleSetup.email, googlePass);
      setGoogleSetup(null);
      onSuccess('user');
    } catch (err: any) {
      setGoogleSetupError(err.message || 'Failed to save password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3c. Skip password setup (Enters account now, but email/password sign-in won't work until reset)
  const handleSkipGooglePassword = () => {
    if (!googleSetup) return;
    setGoogleSetup(null);
    onSuccess('user');
  };

  // 4. Submit Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(adminEmail.trim(), adminPassword, 'admin');
      if (res.success) {
        onSuccess('admin');
      } else {
        setErrorMsg(res.error || 'Admin credentials invalid. Please check email and passcode.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Quick 1-Click Demo Sign In for any of the 5 Personas
  const handleQuickDemoPersona = (type: UserType) => {
    signInAsDemoPersona(type);
    onSuccess('user');
  };

  // 6. Quick 1-Click Admin Demo Login
  const handleQuickAdminDemo = () => {
    signInAsAdmin();
    onSuccess('admin');
  };

  const handleCopyAdminCreds = () => {
    navigator.clipboard.writeText('Email: admin@samnya.org | Password/PIN: 2026');
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col justify-between px-4 py-6 sm:py-8">
      
      {/* Top Accessibility Bar */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-end pb-4">
        {/* Accessibility Quick Toggles */}
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
      <div className="max-w-xl mx-auto w-full bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors my-auto space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <Logo variant="full" size="lg" glow={true} />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">
            Every voice. Every expression.
          </p>
        </div>

        {/* Portal Switcher Tabs: User Access vs Admin Portal */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-sm mx-auto border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setAuthPortal('user'); setErrorMsg(null); setSuccessMsg(null); setIsVerifyingOtp(false); }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              authPortal === 'user'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>User Portal</span>
          </button>

          <button
            onClick={() => { setAuthPortal('admin'); setErrorMsg(null); setSuccessMsg(null); setIsVerifyingOtp(false); }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              authPortal === 'admin'
                ? 'bg-slate-900 dark:bg-blue-950 text-amber-400 dark:text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Success / Info Message */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/70 border-2 border-red-300 dark:border-red-800 text-xs sm:text-sm text-red-700 dark:text-red-200 flex flex-col gap-2 animate-fadeIn shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-bold leading-snug">{errorMsg}</span>
            </div>

            {/* If error is about Google account duplicate/no password, provide direct Google Sign In button */}
            {isGoogleDuplicate && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click here to Sign In with Google</span>
                </button>
              </div>
            )}

            {userMode === 'login' && !isGoogleDuplicate && (errorMsg.toLowerCase().includes('no account') || errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('not exist')) && (
              <div className="pl-8 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setUserMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-blue-600 dark:text-teal-400 font-bold underline hover:text-blue-700 dark:hover:text-teal-300 text-xs text-left inline-flex items-center gap-1"
                >
                  <span>First time here? Click here to Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PORTAL 1: CLEAN USER AUTHENTICATION                       */}
        {/* ========================================================= */}
        {authPortal === 'user' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* If in OTP Verification Mode for Account Creation */}
            {isVerifyingOtp ? (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Top Back / Header */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyingOtp(false);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to edit details</span>
                  </button>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-teal-400">
                    Step 2 of 2
                  </span>
                </div>

                <div className="text-center space-y-1.5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-teal-400 mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Verify Your Email
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Please enter the 6-digit verification code sent to <strong className="text-slate-800 dark:text-slate-200 font-bold">{userEmail}</strong>
                  </p>
                </div>

                {/* Demo OTP Assistant Banner */}
                {otpPreview && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Verification Code:</span>
                      <div className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-300 tracking-wider">
                        {otpPreview}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(otpPreview)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Fill</span>
                    </button>
                  </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleOtpSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full py-3 text-center font-mono text-2xl font-black tracking-[0.5em] rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <span>Verify & Activate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0 || isSubmitting}
                      className="text-xs font-bold text-blue-600 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:no-underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              /* Normal Sign In / Sign Up Form */
              <>
                {/* User Mode Tabs: Sign In vs Create Account */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2">
                  <button
                    type="button"
                    onClick={() => { setUserMode('login'); setErrorMsg(null); setSuccessMsg(null); setIsGoogleDuplicate(false); }}
                    className={`flex-1 pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                      userMode === 'login'
                        ? 'border-blue-600 text-blue-600 dark:text-teal-400 dark:border-teal-400'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserMode('signup'); setErrorMsg(null); setSuccessMsg(null); setIsGoogleDuplicate(false); }}
                    className={`flex-1 pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                      userMode === 'signup'
                        ? 'border-blue-600 text-blue-600 dark:text-teal-400 dark:border-teal-400'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* 1. Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-600 active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex items-center my-2">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    or with email
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Form for Login & Signup Initiation */}
                <form onSubmit={handleUserSubmit} className="space-y-3">
                  
                  {userMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Your Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="e.g. Aarav Mehta"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                            required={userMode === 'signup'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Accessibility Profile
                        </label>
                        <select
                          value={selectedPersona}
                          onChange={(e) => handlePersonaChange(e.target.value as UserType)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white cursor-pointer"
                        >
                          {(Object.keys(USER_PERSONAS) as UserType[]).map((typeKey) => {
                            const p = USER_PERSONAS[typeKey];
                            return (
                              <option key={typeKey} value={typeKey}>
                                {p.emoji} {p.title} — {p.subtitle}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      {userMode === 'signup' && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Min. 6 characters
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {userMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                          required={userMode === 'signup'}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full mt-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <span>{userMode === 'signup' ? 'Verify Email & Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* PORTAL 2: CLEAN ADMIN LOGIN                              */}
        {/* ========================================================= */}
        {authPortal === 'admin' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Restricted Administrator Portal</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Access platform operations, ML models & system telemetry.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@samnya.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Security Passcode / PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showAdminPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Open Admin Dashboard</span>
              </button>
            </form>

          </div>
        )}

        {/* ========================================================= */}
        {/* TOGGLE BUTTON: HIDE / UNHIDE DEMO LOGINS & TEST ACCOUNTS  */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowDemoLogins(!showDemoLogins)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-teal-500" />
              <span>{showDemoLogins ? 'Hide Demo Logins' : 'Show Demo Logins & Testing Tools'}</span>
            </div>
            {showDemoLogins ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Collapsible Demo Logins Section */}
          {showDemoLogins && (
            <div className="mt-3.5 space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-fadeIn">
              
              {/* 5 Persona 1-Click Demo Logins */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  1-Click Login as Persona:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(USER_PERSONAS) as UserType[]).map((pKey) => {
                    const p = USER_PERSONAS[pKey];
                    return (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => handleQuickDemoPersona(pKey)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-teal-400">
                              {p.demoUser.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.title}
                            </div>
                          </div>
                        </div>
                        <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Backend & Status footer */}
        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-teal-500" />
            <span>
              {isSupabaseConfigured ? 'Supabase Connected' : 'Offline Ready'}
            </span>
          </div>
          <span className="font-mono text-[10px]">SAMNYA v1.0</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* GOOGLE ACCOUNT PASSWORD SETUP / RESET MODAL               */}
      {/* ========================================================= */}
      {googleSetup?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-teal-400 shadow-sm mx-auto mb-1">
                <KeyRound className="w-7 h-7 text-blue-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Set Account Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You're authenticated as <strong className="text-blue-600 dark:text-teal-400 font-bold">{googleSetup.email}</strong>. Set a password below so you can sign in directly with your email and password without clicking Google.
              </p>
            </div>

            {/* Error in modal */}
            {googleSetupError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{googleSetupError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleSaveGooglePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showGooglePass ? 'text' : 'password'}
                    value={googlePass}
                    onChange={(e) => setGooglePass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    required
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePass(!showGooglePass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showGooglePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showGoogleConfirmPass ? 'text' : 'password'}
                    value={googleConfirmPass}
                    onChange={(e) => setGoogleConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleConfirmPass(!showGoogleConfirmPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showGoogleConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Save Password & Enter Account</span>
                </button>

                <div className="flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleSkipGooglePassword}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Skip for now (Continue with Google only)
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
