import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CommunicationMethod } from '../types';
import { ArrowRight, Check } from 'lucide-react';
import { Logo } from '../components/common/Logo';

interface OnboardingPageProps {
  onComplete: () => void;
  onGoToAuth: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete, onGoToAuth }) => {
  const { continueAsGuest, updateCommunicationPreferences } = useAuth();
  const [selectedMethods, setSelectedMethods] = useState<CommunicationMethod[]>(['typing']);

  const options: { id: CommunicationMethod; emoji: string; label: string; desc: string }[] = [
    { id: 'speech', emoji: '🗣️', label: 'Speech', desc: 'I speak and listen conventionally' },
    { id: 'typing', emoji: '⌨️', label: 'Typing', desc: 'I prefer text and on-screen typing' },
    { id: 'sign', emoji: '🤟', label: 'Sign language', desc: 'I communicate using sign gestures' },
    { id: 'no_speech', emoji: '🔇', label: "I don't use speech", desc: 'I use visual cards, gestures, or text' },
  ];

  const toggleOption = (id: CommunicationMethod) => {
    if (selectedMethods.includes(id)) {
      if (selectedMethods.length > 1) {
        setSelectedMethods(selectedMethods.filter(m => m !== id));
      }
    } else {
      setSelectedMethods([...selectedMethods, id]);
    }
  };

  const handleFinish = (asGuest: boolean) => {
    if (asGuest) {
      continueAsGuest('deaf', selectedMethods);
    } else {
      updateCommunicationPreferences(selectedMethods);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Logo and Brand */}
        <div className="mb-6">
          <Logo variant="combo" size="sm" showSubtitle={true} glow={true} />
        </div>

        {/* Question Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            How do you communicate?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select all ways you prefer to express yourself or receive messages. We will personalize your bridge.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6" role="group" aria-label="Communication method selections">
          {options.map((opt) => {
            const isSelected = selectedMethods.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                type="button"
                className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-98 ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl" role="img" aria-hidden="true">{opt.emoji}</span>
                  <div>
                    <div className="font-bold text-base">{opt.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => handleFinish(false)}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFinish(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            Continue as Guest
          </button>
        </div>

        {/* Sign In link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onGoToAuth}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Already have an account? Sign In with Supabase
          </button>
        </div>

      </div>
    </div>
  );
};
