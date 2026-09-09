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

function AppContent() {
  const { user, isLoading } = useAuth();
  
  // High-level navigation state: 'landing' | 'onboarding' | 'auth' | 'app'
  const [viewMode, setViewMode] = useState<'landing' | 'onboarding' | 'auth' | 'app'>('app');
  // App active tab: 'home' | 'communicate' | 'speech-to-text' | 'text-to-speech' | 'sign-to-text' | 'awareness' | 'understand' | 'quick-messages' | 'profile'
  const [currentTab, setCurrentTab] = useState<string>('home');
  // Emergency full-screen modal
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
            S
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Loading SAMNYA...
          </p>
        </div>
      </div>
    );
  }

  // 1. Landing Page View
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setViewMode('onboarding')}
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

  // 3. Auth Page Flow
  if (viewMode === 'auth') {
    return (
      <AuthPage
        onSuccess={() => setViewMode('app')}
        onBack={() => setViewMode('app')}
      />
    );
  }

  // 4. Main Application View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
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
