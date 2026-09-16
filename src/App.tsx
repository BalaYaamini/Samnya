import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { EmergencyModal } from './components/common/EmergencyModal';

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
  const { user, isLoading } = useAuth();
  
  // High-level navigation state: 'landing' | 'onboarding' | 'auth' | 'app' | 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'auth' | 'app' | 'admin'>('auth');
  // App active tab: 'home' | 'communicate' | 'speech-to-text' | 'text-to-speech' | 'sign-to-text' | 'awareness' | 'understand' | 'quick-messages' | 'profile'
  const [currentTab, setCurrentTab] = useState<string>('home');
  // Emergency full-screen modal
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

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
        onGetStarted={() => setViewMode('auth')}
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
        onComplete={() => setViewMode('app')}
        onGoToAuth={() => setViewMode('auth')}
      />
    );
  }

  // 3. Auth Page Flow (User & Admin Portals with Admin Credentials Ready)
  if (viewMode === 'auth' || !user) {
    return (
      <AuthPage
        onSuccess={(role) => {
          if (role === 'admin') {
            setViewMode('admin');
          } else {
            setViewMode('app');
          }
        }}
        onBack={() => setViewMode('app')}
      />
    );
  }

  // 4. Admin Dashboard View
  if (viewMode === 'admin') {
    return (
      <AdminDashboardPage
        onBackToApp={() => setViewMode('app')}
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
