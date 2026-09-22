import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { USER_PERSONAS, UserType, TextSize } from '../types';
import { 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Server, 
  Wifi, 
  Check, 
  Globe, 
  Type, 
  Eye, 
  Vibrate, 
  MonitorSmartphone,
  Info,
  Accessibility,
  MessageSquare
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
  onGoToAuth?: () => void;
  onGoToOnboarding?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onGoToAdmin }) => {
  const { user, signOut, switchUserType } = useAuth();
  const { settings, updateSettings, setTextSize, toggleHighContrast } = useSettings();
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePersonaChange = async (type: UserType) => {
    setIsUpdating(true);
    await switchUserType(type);
    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  const currentPersona = user.userType ? USER_PERSONAS[user.userType] : USER_PERSONAS.deaf;

  // Group personas for rendering
  const primaryUsers: UserType[] = ['deaf', 'non_speaking'];
  const accessibilityVariants: UserType[] = ['hard_of_hearing', 'speech_impaired'];
  const communicationPartner: UserType[] = ['hearing_speaking'];

  const renderPersonaButton = (id: UserType) => {
    const persona = USER_PERSONAS[id];
    const isActive = user.userType === id;
    return (
      <button
        key={persona.id}
        onClick={() => handlePersonaChange(id)}
        disabled={isUpdating}
        className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
          isActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-[#0F172A]'
        }`}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            isActive ? 'bg-blue-100 dark:bg-blue-900/60' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            {persona.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold ${isActive ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                {persona.title}
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Selected
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
              {persona.subtitle}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br ${currentPersona.accentColor} opacity-5 blur-3xl pointer-events-none`} />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm">
              {currentPersona.emoji}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                You
              </span>
              {user.role === 'admin' && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {user.role === 'admin' && (
        <button
          onClick={onGoToAdmin}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-between group transition-transform active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-lg">Admin Settings</h3>
              <p className="text-xs text-amber-100 font-medium">Manage users and mock configurations</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="font-bold">→</span>
          </div>
        </button>
      )}

      {/* Accessibility Persona Configuration */}
      <div className="bg-slate-50 dark:bg-[#0A1128] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
          <div className="flex items-center gap-2 mb-1">
            <Accessibility className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Accessibility Profile
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your profile to optimize SAMNYA's interface for your needs.
          </p>
        </div>
        
        <div className="p-5 sm:p-6 space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Primary Users
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryUsers.map(renderPersonaButton)}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accessibility Variants
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accessibilityVariants.map(renderPersonaButton)}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Communication Partner
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {communicationPartner.map(renderPersonaButton)}
            </div>
          </div>

        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Settings & Preferences
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* Text Size */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                <Type className="w-4 h-4 text-slate-400" />
                <span>Text Size</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Adjust the size of text throughout the application.
              </p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    settings.text_size === size
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* High Contrast */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>High Contrast</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Increase contrast and border thickness.
                </p>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.high_contrast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.high_contrast ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Vibration */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                  <Vibrate className="w-4 h-4 text-slate-400" />
                  <span>Vibration Alerts</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Haptic feedback for emergency and sound alerts.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ vibration_enabled: !settings.vibration_enabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.vibration_enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.vibration_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                  <MonitorSmartphone className="w-4 h-4 text-slate-400" />
                  <span>Reduced Motion</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimize UI animations and transitions.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ reduced_motion: !settings.reduced_motion })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.reduced_motion ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.reduced_motion ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Visual Alerts */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Visual Alerts</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Flash screen for critical sound alerts.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ visual_alerts: !settings.visual_alerts })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.visual_alerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.visual_alerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>

          {/* Language Selection */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Language</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                How do you prefer to communicate?
              </p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
              className="p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="en">English (US)</option>
              <option value="hi">Hindi (India)</option>
              <option value="te">Telugu (India)</option>
              <option value="ta">Tamil (India)</option>
              <option value="gu">Gujarati (India)</option>
            </select>
          </div>

        </div>
      </div>

      {/* System Status / About */}
      <div className="bg-slate-50 dark:bg-[#0A1128] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Server className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connection Status</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Connected & Synced
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-center sm:text-right">
          <p className="text-xs font-bold text-slate-400">SAMNYA v1.0.0-MVP</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Deaf-first Communication Platform</p>
        </div>
      </div>

    </div>
  );
};
