import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_PERSONAS } from '../types';
import { 
  Mic, 
  HandMetal, 
  Keyboard, 
  Bookmark,
  BellRing, 
  FileText, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenEmergency }) => {
  const { user } = useAuth();
  const currentPersona = user?.userType ? USER_PERSONAS[user.userType] : USER_PERSONAS.deaf;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      
      {/* Compact Greeting Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            What do you need right now?
          </p>
        </div>
        
        {user && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300">
            <span className="text-base">{user.role === 'admin' ? '🛡️' : currentPersona.emoji}</span>
            <span>{user.role === 'admin' ? 'Admin Mode' : `${currentPersona.title} Mode`}</span>
          </div>
        )}
      </section>

      {/* Primary Action Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <button
          onClick={() => onNavigate('speech-to-text')}
          className="p-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 text-left flex flex-col justify-between group active:scale-98 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              <span>Someone is speaking to me</span>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              Get live captions
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('sign-to-text')}
          className="p-6 rounded-3xl bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 text-left flex flex-col justify-between group active:scale-98 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HandMetal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              <span>I want to sign</span>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-teal-100 mt-1">
              Sign → Text / Voice
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('text-to-speech')}
          className="p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 text-left flex flex-col justify-between group active:scale-98 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Keyboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              <span>I want to type</span>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-indigo-100 mt-1">
              Type and let SAMNYA speak
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('quick-messages')}
          className="p-6 rounded-3xl bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-800/30 text-left flex flex-col justify-between group active:scale-98 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              <span>Quick Message</span>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Show or speak common phrases instantly
            </p>
          </div>
        </button>

      </section>

      {/* Secondary Tools */}
      <section className="space-y-3 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Secondary Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={() => onNavigate('awareness')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm transition-all text-left flex items-center gap-4 group active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
              <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sound Alerts
              </h3>
            </div>
          </button>

          <button
            onClick={() => onNavigate('understand')}
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm transition-all text-left flex items-center gap-4 group active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Understand a Document
              </h3>
            </div>
          </button>

          <button
            onClick={onOpenEmergency}
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-500 shadow-sm transition-all text-left flex items-center gap-4 group active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                Emergency Help
              </h3>
            </div>
          </button>

        </div>
      </section>

    </div>
  );
};
