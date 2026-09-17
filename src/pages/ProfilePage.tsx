import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { CommunicationMethod, TextSize, UserType, USER_PERSONAS } from '../types';
import { 
  LogOut, 
  Check, 
  Database, 
  ShieldCheck, 
  Globe,
  Layers
} from 'lucide-react';

interface ProfilePageProps {
  onGoToAuth: () => void;
  onGoToOnboarding: () => void;
  onGoToAdmin?: () => void;
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onGoToAuth, 
  onGoToOnboarding, 
  onGoToAdmin,
  onNavigate 
}) => {
  const { user, signOut, updateCommunicationPreferences, switchUserType } = useAuth();
  const { settings, updateSettings, setTextSize, toggleHighContrast } = useSettings();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const currentPersona = user?.userType ? USER_PERSONAS[user.userType] : USER_PERSONAS.deaf;

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
    showNotice('Communication preferences updated & synced!');
  };

  const handleSelectPersona = async (type: UserType) => {
    await switchUserType(type);
    showNotice(`Switched active accessibility persona to ${USER_PERSONAS[type].title}!`);
  };

  const showNotice = (msg: string) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Profile & Accessibility Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize your accessibility persona, communication bridge, typography, and alerts.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2 justify-center animate-fadeIn shadow-sm">
          <Check className="w-4 h-4 text-teal-500" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
            {user?.role === 'admin' ? '🛡️' : currentPersona.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.name || 'SAMNYA User'}
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                user?.role === 'admin'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
              }`}>
                {user?.role === 'admin' ? 'Admin Portal Authority' : 'Active Account'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email || 'user@samnya.local'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {user?.role === 'admin' && onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={signOut}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 5 ACCESSIBILITY PERSONAS SWITCHER */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Accessibility Profile (The 5 User Types)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch anytime to instantly recalibrate SAMNYA for your exact communication needs:
            </p>
          </div>
          <button
            onClick={onGoToAuth}
            className="text-xs text-blue-600 dark:text-teal-400 font-bold hover:underline hidden sm:inline"
          >
            Switch in Login Page
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(USER_PERSONAS) as UserType[]).map((typeKey) => {
            const persona = USER_PERSONAS[typeKey];
            const isCurrent = user?.userType === typeKey;

            return (
              <button
                key={typeKey}
                onClick={() => handleSelectPersona(typeKey)}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all ${
                  isCurrent
                    ? 'border-blue-600 dark:border-teal-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{persona.emoji}</span>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600 dark:bg-teal-500 text-white">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium group-hover:text-blue-500">
                      Switch →
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {persona.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {persona.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Communication Methods
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize active bridge modalities for real-time conversation:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {communicationOptions.map((opt) => {
            const isSelected = user?.communicationPreferences?.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handleTogglePreference(opt.id)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-bold">{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility & Display Adjustments */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Accessibility & Readability
        </h3>

        {/* Text Sizing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Text Display Scale</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Increase font sizes across the entire bridge</div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
              <button
                key={size}
                onClick={() => { setTextSize(size); showNotice(`Text size set to ${size}`); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.text_size === size
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {size === 'normal' ? 'Normal' : size === 'large' ? 'Large (A+)' : 'Extra (A++)'}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">High Contrast & Visual Assistance</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Deep blacks, sharp text, and high-visibility borders</div>
          </div>
          <button
            onClick={() => { toggleHighContrast(); showNotice('High Contrast mode toggled'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              settings.high_contrast
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {settings.high_contrast ? 'Active' : 'Off'}
          </button>
        </div>

        {/* Haptic Vibration Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Haptic Vibration Signals</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Vibrate on speech detection and emergency safety alerts</div>
          </div>
          <button
            onClick={() => {
              updateSettings({ vibration_enabled: !settings.vibration_enabled });
              showNotice(`Haptic feedback ${!settings.vibration_enabled ? 'enabled' : 'disabled'}`);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              settings.vibration_enabled
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {settings.vibration_enabled ? 'Active' : 'Muted'}
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
            : '⚡ Running in zero-friction Local Offline Mode. You can connect to your Supabase project at any time by configuring VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and running the included supabase/schema.sql migration.'}
        </p>
      </div>

      {/* About SAMNYA Card */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
        <div className="flex justify-center">
          <img src="/samnya-icon.png" alt="SAMNYA Logo" className="w-12 h-12 object-contain drop-shadow-md" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">SAMNYA</h3>
          <p className="text-xs font-semibold text-blue-600 dark:text-teal-400">Every voice. Every expression.</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          AI-powered accessibility bridging Deaf, hard-of-hearing, non-speaking, and speech-impaired individuals with conventional speakers into one seamless shared understanding.
        </p>
      </div>

    </div>
  );
};
