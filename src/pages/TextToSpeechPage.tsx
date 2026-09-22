import React, { useState } from 'react';
import { ttsService } from '../services/speech/ttsService';
import { useConversation } from '../contexts/ConversationContext';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Send, 
  Plus, 
  Check, 
  CornerDownLeft 
} from 'lucide-react';

interface TextToSpeechPageProps {
  onNavigate: (tab: string) => void;
}

export const TextToSpeechPage: React.FC<TextToSpeechPageProps> = ({ onNavigate }) => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);
  const [added, setAdded] = useState(false);
  const { addMessage } = useConversation();

  const quickPhrases = [
    'Thank you.',
    'Please wait.',
    'I need help.',
    'Please type your response.',
    "I don't understand.",
    'Please repeat that.',
    'I am Deaf.',
    'I am non-speaking.'
  ];

  const handleSpeak = () => {
    if (!text.trim()) return;

    setIsSpeaking(true);
    ttsService.speak(text.trim(), {
      rate,
      pitch,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleStop = () => {
    ttsService.stop();
    setIsSpeaking(false);
  };

  const handlePhraseClick = (phrase: string) => {
    setText(phrase);
  };

  const handleAddToBridge = () => {
    if (!text.trim()) return;
    addMessage('user', text.trim(), 'typing', 'You');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Voice</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Text → Speech
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Type what you want to say. SAMNYA speaks it for you.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div>
          <label htmlFor="tts-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Type what you want to say...
          </label>
          <textarea
            id="tts-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you want to say..."
            rows={4}
            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Big Speak Button */}
        <div className="pt-2">
          {isSpeaking ? (
            <button
              onClick={handleStop}
              className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <VolumeX className="w-6 h-6" />
              <span>Stop Speaking</span>
            </button>
          ) : (
            <button
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            >
              <Volume2 className="w-6 h-6" />
              <span>Speak</span>
            </button>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {text && (
              <button
                onClick={() => setText('')}
                className="px-3 py-3 rounded-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
                title="Clear text"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <button
            onClick={handleAddToBridge}
            disabled={!text.trim()}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {added ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4" />}
            <span>{added ? 'Added' : 'Add to Conversation'}</span>
          </button>
        </div>

        {/* Sliders Accordion */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold mb-1">
              <span>Speed Rate: {rate}x</span>
              <span className="text-[10px] text-slate-400">Clear & Articulate</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold mb-1">
              <span>Voice Pitch: {pitch}</span>
              <span className="text-[10px] text-slate-400">Natural</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Quick Phrases */}
      <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Quick Phrases:
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tap any phrase to immediately populate the speech input:
        </p>

        <div className="flex flex-wrap gap-2">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handlePhraseClick(phrase)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors active:scale-95"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
