import React from 'react';
import { 
  MessageSquare, 
  Mic, 
  HandMetal, 
  Volume2, 
  BellRing, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Bookmark,
  ShieldAlert,
  Repeat
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenEmergency }) => {
  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      
      {/* Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1128] via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Accessibility Bridge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            SAMNYA
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-300">
            Every voice. Every expression.
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
            AI-powered communication for people who communicate differently. Bridging Deaf, hard-of-hearing, non-speaking, and conventional speakers into one shared understanding.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('communicate')}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 flex items-center gap-2.5 transition-all active:scale-98"
            >
              <span>Start Communication Mode</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('quick-messages')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Bookmark className="w-4 h-4 text-teal-400" />
              <span>Quick Cards</span>
            </button>
          </div>
        </div>
      </section>

      {/* The Core Concept Pipeline Banner */}
      <section className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
          <Repeat className="w-4 h-4 text-blue-500" />
          <span>How The Bridge Works</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="text-xl mb-1">🗣️</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Person A Speaks</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Conventional voice input</div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
            <div className="text-xl mb-1">⚡</div>
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300">SAMNYA Transcribes</div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400">High-visibility readable text</div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
            <div className="text-xl mb-1">⌨️ 🤟</div>
            <div className="text-xs font-bold text-teal-900 dark:text-teal-300">User Responds</div>
            <div className="text-[11px] text-teal-700 dark:text-teal-400">Types or signs with camera</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="text-xl mb-1">🔊</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">SAMNYA Speaks</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Clear speech synthesis</div>
          </div>
        </div>
      </section>

      {/* Main Action Cards Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Core Communication Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Speech -> Text */}
          <button
            onClick={() => onNavigate('speech-to-text')}
            className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-98"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Speech → Text</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Convert spoken conversation into large, clear readable text instantly for Deaf and hard-of-hearing users.
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Live Web Speech API • Continuous
            </div>
          </button>

          {/* 2. Sign -> Text */}
          <button
            onClick={() => onNavigate('sign-to-text')}
            className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-98"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HandMetal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Sign → Text</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Use your camera to recognize supported sign gestures (Hello, Thank you, Help, Water, Emergency).
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              Camera Gesture Engine • 10 Core Signs
            </div>
          </button>

          {/* 3. Text -> Speech */}
          <button
            onClick={() => onNavigate('text-to-speech')}
            className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-98"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Text → Speech</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Turn typed thoughts, phrases, or quick responses into clear, natural spoken voice for non-speaking users.
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              Natural SpeechSynthesis • Quick Phrases
            </div>
          </button>

          {/* 4. Sound Awareness */}
          <button
            onClick={() => onNavigate('awareness')}
            className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-98"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Sound Awareness</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Detect important environmental sounds (fire alarm, vehicle horn, doorbell, urgent speech) with visual & haptic alerts.
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Acoustic Monitor • Visual Strobe & Vibration
            </div>
          </button>

        </div>
      </section>

      {/* Understand Something Section */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/30 via-slate-900/40 to-blue-900/30 border border-teal-500/20 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Understand Documents</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Understand Something?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Upload or photograph a complex hospital form, prescription, or notice. SAMNYA breaks it down: What is this? What do I need? What should I do?
            </p>
          </div>
          <button
            onClick={() => onNavigate('understand')}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 flex-shrink-0 transition-all active:scale-98"
          >
            <span>Simplify Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Fast Emergency Banner */}
      <section className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-red-900 dark:text-red-200">
              Immediate Assistance Needed?
            </span>
            <p className="text-[11px] text-red-700 dark:text-red-300">
              One-tap screen with visual strobe and emergency broadcast.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenEmergency}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition-all active:scale-98 flex-shrink-0"
        >
          Open Help
        </button>
      </section>

    </div>
  );
};
