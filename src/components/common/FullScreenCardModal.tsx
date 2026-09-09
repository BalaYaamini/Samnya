import React from 'react';
import { X, Volume2, RotateCw } from 'lucide-react';
import { ttsService } from '../../services/speech/ttsService';

interface FullScreenCardModalProps {
  message: string | null;
  category?: string;
  onClose: () => void;
}

export const FullScreenCardModal: React.FC<FullScreenCardModalProps> = ({ message, category, onClose }) => {
  if (!message) return null;

  const handleSpeak = () => {
    ttsService.speak(message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070D1E] text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white">
            {category || 'Quick Card'}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Turn phone toward other person to read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSpeak}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-sm shadow-lg shadow-teal-600/30 transition-all"
            aria-label="Speak message aloud"
          >
            <Volume2 className="w-5 h-5" />
            <span>Speak</span>
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Close full-screen card"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Huge Text Display */}
      <div className="my-auto text-center px-4 py-8">
        <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-md">
          "{message}"
        </p>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs font-semibold text-slate-400 tracking-wide">
        SAMNYA — Communication Bridge
      </div>
    </div>
  );
};
