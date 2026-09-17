import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { EmergencyModal } from './components/common/EmergencyModal';
import { KeyRound, Lock, Eye, EyeOff, Info } from 'lucide-react';

import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { CommunicationModePage } from './pages/CommunicationModePage';
import { SpeechToTextPage } from './pages/SpeechToTextPage';
import { TextToSpeechPage } from './pages/TextToSpeechPage';
import { SignToTextPage } from './pages/SignToTextPage';
import { SoundAwarenessPage } from './pages/SoundAwarenessPage';
import { UnderstandPage } from './pages/UnderstandPage';
import { QuickMessagesPage } from './pages/QuickMessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const { user, isLoading, setPasswordForAccount } = useAuth();
  
  // High-level navigation state: 'landing' | 'onboarding' | 'auth' | 'app' | 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'auth' | 'app' | 'admin'>(() => {
    return user ? (user.role === 'admin' ? 'admin' : 'app') : 'auth';
  });
  // App active tab: 'home' | 'communicate' | 'speech-to-text' | 'text-to-speech' | 'sign-to-text' | 'awareness' | 'understand' | 'quick-messages' | 'profile'
  const [currentTab, setCurrentTab] = useState<string>('home');
  // Emergency full-screen modal
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Google Password Setup Modal (shown after Supabase OAuth redirect)
  const [googleSetupOpen, setGoogleSetupOpen] = useState(false);
  const [googleSetupEmail, setGoogleSetupEmail] = useState('');
  const [googleSetupName, setGoogleSetupName] = useState('');
  const [googlePass, setGooglePass] = useState('');
  const [googleConfirmPass, setGoogleConfirmPass] = useState('');
  const [showGooglePass, setShowGooglePass] = useState(false);
  const [showGoogleConfirmPass, setShowGoogleConfirmPass] = useState(false);
  const [googleSetupError, setGoogleSetupError] = useState<string | null>(null);
  const [googleSetupSubmitting, setGoogleSetupSubmitting] = useState(false);

  // After Supabase OAuth redirect, check if the user needs to set a password
  useEffect(() => {
    const needsSetup = localStorage.getItem('google_needs_password_setup');
    if (needsSetup && user && !isLoading) {
      localStorage.removeItem('google_needs_password_setup');
      setGoogleSetupEmail(user.email);
      setGoogleSetupName(user.name);
      setGooglePass('');
      setGoogleConfirmPass('');
      setGoogleSetupError(null);
      setGoogleSetupOpen(true);
    }
  }, [user, isLoading]);

  const handleSaveGooglePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleSetupError(null);

    if (googlePass.length < 6) {
      setGoogleSetupError('Password must be at least 6 characters long.');
      return;
    }

    if (googlePass !== googleConfirmPass) {
      setGoogleSetupError('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setGoogleSetupSubmitting(true);
    try {
      await setPasswordForAccount(googleSetupEmail, googlePass);
      setGoogleSetupOpen(false);
    } catch (err: any) {
      setGoogleSetupError(err.message || 'Failed to save password.');
    } finally {
      setGoogleSetupSubmitting(false);
    }
  };

  const handleSkipGooglePassword = () => {
    setGoogleSetupOpen(false);
  };

  // Automatically transition to App Dashboard or Admin whenever user is authenticated
  React.useEffect(() => {
    // Clean up trailing # or dangling OAuth fragments once authenticated or mounted
    if (typeof window !== 'undefined' && window.location.hash) {
      if (window.location.hash === '#' || user || window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }

    if (user) {
      if (viewMode === 'auth' || viewMode === 'landing') {
        setViewMode(user.role === 'admin' ? 'admin' : 'app');
        setCurrentTab('home');
      }
    } else {
      if (viewMode === 'app' || viewMode === 'admin') {
        setViewMode('auth');
      }
    }
  }, [user, viewMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D1E] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-purple-500/30 to-blue-500/30 rounded-full blur-xl scale-125 animate-pulse" />
            <img
              src="/samnya-icon.png"
              alt="Loading SAMNYA"
              className="relative w-16 h-16 object-contain drop-shadow-xl animate-bounce"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold tracking-widest text-slate-200 uppercase">
              SAMNYA
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Every voice. Every expression.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Landing Page View
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setViewMode(user ? (user.role === 'admin' ? 'admin' : 'app') : 'auth');
          setCurrentTab('home');
        }}
        onTryCommunicationMode={() => {
          setViewMode('app');
          setCurrentTab('communicate');
        }}
      />
    );
  }

  // 2. Onboarding Flow
  if (viewMode === 'onboarding') {
    return (
      <OnboardingPage
        onComplete={() => {
          setViewMode('app');
          setCurrentTab('home');
        }}
        onGoToAuth={() => setViewMode('auth')}
      />
    );
  }

  // 3. Admin Dashboard View
  if (viewMode === 'admin' && user?.role === 'admin') {
    return (
      <AdminDashboardPage
        onBackToApp={() => {
          setViewMode('app');
          setCurrentTab('home');
        }}
      />
    );
  }

  // 4. Auth Page Flow (shown when user is NOT logged in or explicitly navigating to auth)
  if (!user || viewMode === 'auth') {
    return (
      <AuthPage
        onSuccess={(role) => {
          if (role === 'admin') {
            setViewMode('admin');
          } else {
            setViewMode('app');
          }
          setCurrentTab('home');
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }}
        onBack={() => setViewMode('landing')}
      />
    );
  }

  // 5. Main Application View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenAuth={() => setViewMode('auth')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}
        {currentTab === 'communicate' && <CommunicationModePage />}
        {currentTab === 'speech-to-text' && (
          <SpeechToTextPage onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'text-to-speech' && (
          <TextToSpeechPage onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'sign-to-text' && (
          <SignToTextPage onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'awareness' && <SoundAwarenessPage />}
        {currentTab === 'understand' && <UnderstandPage />}
        {currentTab === 'quick-messages' && <QuickMessagesPage />}
        {currentTab === 'profile' && (
          <ProfilePage
            onGoToAuth={() => setViewMode('auth')}
            onGoToOnboarding={() => setViewMode('onboarding')}
            onGoToAdmin={() => setViewMode('admin')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
      />

      {/* High-Urgency Emergency Overlay Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Google Password Setup Modal (post-OAuth redirect) */}
      {googleSetupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shadow-sm mx-auto mb-1">
                <KeyRound className="w-7 h-7 text-blue-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Set Account Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You're authenticated as <strong className="text-blue-600 dark:text-teal-400 font-bold">{googleSetupEmail}</strong>. Set a password below so you can sign in directly with your email and password without clicking Google.
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
                  disabled={googleSetupSubmitting}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Save Password & Enter Account</span>
                </button>

                <div className="flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleSkipGooglePassword}
                    disabled={googleSetupSubmitting}
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
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ConversationProvider>
          <AppContent />
        </ConversationProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
