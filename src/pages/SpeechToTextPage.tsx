import React, { useState, useEffect } from 'react';
import { speechService } from '../services/speech/speechService';
import { useConversation } from '../contexts/ConversationContext';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Volume2, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';
import { ttsService } from '../services/speech/ttsService';

interface SpeechToTextPageProps {
  onNavigate: (tab: string) => void;
}

export const SpeechToTextPage: React.FC<SpeechToTextPageProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { addMessage } = useConversation();

  const isWebSpeechSupported = speechService.checkSupport();

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      speechService.start(
        (text, isFinal) => {
          setTranscript(text);
        },
        (error) => {
          setErrorMessage(error);
          setIsListening(false);
        },
        (status) => {
          setIsListening(status);
        }
      );
    }
  };

  const handleClear = () => {
    speechService.stop();
    setIsListening(false);
    setTranscript('');
    setErrorMessage(null);
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToConversation = () => {
    if (!transcript) return;
    addMessage('speaker', transcript, 'speech', 'Speech to Text');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSpeakAloud = () => {
    if (!transcript) return;
    ttsService.speak(transcript);
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Captions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Speech → Text
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Convert spoken words into instant readable text. Designed for clear visibility and effortless communication.
        </p>
      </div>

      {/* Graceful fallback banner if Web Speech not supported */}
      {!isWebSpeechSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Notice on Browser Speech Support:</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              Web Speech Recognition is not natively exposed in this browser environment. SAMNYA has activated the <strong>Simulated mode for testing</strong> so you can fully test the transcription workflow, copy features, and conversation timeline.
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Large Microphone Control Hub */}
      <div className="bg-white dark:bg-[#0F172A] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-6">
        
        {/* Pulsing Mic Circle */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-blue-500/20 animate-ping-slow pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-blue-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={handleToggleListening}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/40'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </button>
        </div>

        {/* State description */}
        <div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {isListening ? 'Listening...' : 'Ready'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isListening ? 'Speak naturally into your microphone' : 'Tap the microphone to start transcribing'}
          </p>
        </div>

        {/* Live transcription display */}
        <div className="w-full min-h-[160px] p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col justify-between text-left">
          {transcript ? (
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
              "{transcript}"
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-400 italic my-auto text-center">
              Transcribed speech will appear here in large high-contrast text...
            </p>
          )}

          {/* Action Bar */}
          {transcript && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={handleSpeakAloud}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Read Aloud</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={handleAddToConversation}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{added ? 'Added' : 'Add to Conversation'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shortcut to full two-way bridge */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate('communicate')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Two-Way Communicate →
          </button>
        </div>

      </div>
    </div>
  );
};
