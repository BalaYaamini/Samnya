import React from 'react';
import { Sparkles, ArrowRight, MessageSquare, HandMetal, Volume2, ShieldCheck, Heart } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onTryCommunicationMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onTryCommunicationMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-white flex flex-col justify-between">
      
      {/* Top Simple Brand Bar */}
      <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-xl">
            S
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight">SAMNYA</span>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-20 text-center space-y-8 my-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-sm">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>Accessibility & Communication Platform</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            SAMNYA
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-teal-400">
            Every voice. Every expression.
          </h2>
        </div>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          AI-powered communication for people who communicate differently.
        </p>

        {/* The Core Concept Callout */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto text-center space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            The Central Product Idea
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Different ways of communicating <span className="text-blue-500">→</span> one shared understanding.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deaf • Hard-of-Hearing • Non-Speaking • Speech-Impaired • Hearing Speakers
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onTryCommunicationMode}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-base border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageSquare className="w-5 h-5 text-teal-500" />
            <span>Try Communication Mode</span>
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full px-6 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        SAMNYA MVP • Designed for Mobile & Web Accessibility
      </footer>

    </div>
  );
};
