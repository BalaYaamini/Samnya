import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Eye, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenEmergency }) => {
  const { settings, setTextSize, toggleHighContrast } = useSettings();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 text-left group focus:outline-none"
          aria-label="SAMNYA Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="font-bold text-lg tracking-wider">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                SAMNYA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                MVP
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden xs:block">
              Every voice. Every expression.
            </p>
          </div>
        </button>

        {/* Accessibility Quick Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Text Size Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTextSize('normal')}
              className={`px-2 py-1 text-xs font-semibold rounded ${settings.text_size === 'normal' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
              title="Normal text size"
              aria-label="Set text size to normal"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-2 py-1 text-sm font-bold rounded ${settings.text_size === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
              title="Large text size"
              aria-label="Set text size to large"
            >
              A+
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`px-2 py-1 text-base font-extrabold rounded ${settings.text_size === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
              title="Extra large text size"
              aria-label="Set text size to extra large"
            >
              A++
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`p-2 rounded-lg border transition-all ${settings.high_contrast ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
            title="Toggle High Contrast Mode"
            aria-label="Toggle High Contrast Mode"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Emergency Fast Access */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/30 transition-colors"
            aria-label="Open Emergency Mode"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">HELP</span>
          </button>

          {/* Profile / User Badge */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${currentTab === 'profile' ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
            aria-label="View user profile"
          >
            <UserIcon className="w-3.5 h-3.5 text-blue-500" />
            <span className="max-w-[70px] truncate hidden md:inline">
              {user?.name || 'Guest'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
