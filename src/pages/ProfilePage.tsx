import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { CommunicationMethod, TextSize } from '../types';
import { 
  User, 
  Settings, 
  Eye, 
  Vibrate, 
  Bell, 
  Globe, 
  LogOut, 
  Check, 
  Database, 
  ShieldCheck, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface ProfilePageProps {
  onGoToAuth: () => void;
  onGoToOnboarding: () => void;
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onGoToAuth, onGoToOnboarding, onNavigate }) => {
  const { user, signOut, updateCommunicationPreferences } = useAuth();
  const { settings, updateSettings, setTextSize, toggleHighContrast } = useSettings();
  const [saveNotice, setSaveNotice] = useState(false);

  const communicationOptions: { id: CommunicationMethod; label: string; emoji: string }[] = [
    { id: 'speech', label: 'Speech', emoji: '🗣️' },
    { id: 'typing', label: 'Typing', emoji: '⌨️' },
    { id: 'sign', label: 'Sign Language', emoji: '🤟' },
    { id: 'no_speech', label: 'Non-Speaking', emoji: '🔇' },
  ];

  const languages = [
    { code: 'en', label: 'English (Default)', ready: true },
    { code: 'hi', label: 'हिन्दी (Hindi)', ready: false },
    { code: 'te', label: 'తెలుగు (Telugu)', ready: false },
    { code: 'ta', label: 'தமிழ் (Tamil)', ready: false },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', ready: false },
  ];

  const handleTogglePreference = (id: CommunicationMethod) => {
    const current = user?.communicationPreferences || ['typing'];
    let updated: CommunicationMethod[];
    if (current.includes(id)) {
      if (current.length > 1) {
        updated = current.filter(item => item !== id);
      } else {
        return;
      }
    } else {
      updated = [...current, id];
    }
    updateCommunicationPreferences(updated);
    showNotice();
  };

  const showNotice = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize your accessibility, typography, alerts, and communication bridge.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2 justify-center animate-fadeIn">
          <Check className="w-4 h-4 text-teal-500" />
          <span>Preferences updated & synced!</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {user?.name?.[0] || 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.name || 'Guest Explorer'}
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                user?.isGuest 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                  : 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
              }`}>
                {user?.isGuest ? 'Guest Session' : 'Supabase User'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email || 'guest@samnya.local'}
            </p>
          </div>
        </div>

        <div>
          {user?.isGuest ? (
            <button
              onClick={onGoToAuth}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Sign In / Sync Account
            </button>
          ) : (
            <button
              onClick={signOut}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            How You Communicate
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your preferred expression methods to tailor defaults in Communication Mode:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {communicationOptions.map((opt) => {
            const isSelected = user?.communicationPreferences?.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handleTogglePreference(opt.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs">{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility & Display Settings */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Accessibility & Display Tokens
        </h3>

        {/* Text Size */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Text Size Scale:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Default (100%)', sample: 'Aa' },
              { id: 'large', label: 'Large (115%)', sample: 'Aa+' },
              { id: 'xlarge', label: 'Extra Large (130%)', sample: 'Aa++' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setTextSize(size.id as TextSize)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  settings.text_size === size.id
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-sm font-extrabold">{size.sample}</div>
                <div className="text-[11px] mt-0.5">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              <span>High Contrast Mode</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enhance edge boundaries, borders, and readability.
            </p>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              settings.high_contrast ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle high contrast"
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.high_contrast ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Vibration Alerts */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-blue-500" />
              <span>Vibration / Haptic Alerts</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vibrate device upon critical emergency or sound awareness alerts.
            </p>
          </div>
          <button
            onClick={() => updateSettings({ vibration_enabled: !settings.vibration_enabled })}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              settings.vibration_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle vibration"
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.vibration_enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Sound Awareness alerts */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-500" />
              <span>Environmental Sound Alerts</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Display high-visibility visual banners for detected alarms and horns.
            </p>
          </div>
          <button
            onClick={() => updateSettings({ sound_alerts_enabled: !settings.sound_alerts_enabled })}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              settings.sound_alerts_enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle sound alerts"
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.sound_alerts_enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </div>

      {/* Language Selection Architecture */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Language Preparation</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Architecture prepared for multi-regional speech and sign localized dictionaries:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => updateSettings({ language: lang.code as any })}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.language === lang.code
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-xs">{lang.label}</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                lang.ready 
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {lang.ready ? 'Active' : 'Prepared'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Backend & Supabase Status info */}
      <div className="bg-slate-100 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Database className="w-4 h-4 text-teal-500" />
          <span>Supabase Infrastructure Status</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          {isSupabaseConfigured
            ? '✅ Connected to live Supabase Auth and PostgreSQL instance.'
            : '⚡ Running in zero-friction Local Guest Mode. You can connect to your Supabase project at any time by configuring VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and running the included supabase/schema.sql migration.'}
        </p>
      </div>

    </div>
  );
};
