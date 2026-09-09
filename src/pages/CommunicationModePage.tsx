import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '../contexts/ConversationContext';
import { speechService } from '../services/speech/speechService';
import { ttsService } from '../services/speech/ttsService';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare,
  ArrowDown,
  Info
} from 'lucide-react';

export const CommunicationModePage: React.FC = () => {
  const { messages, addMessage, clearMessages } = useConversation();
  
  // Speaker state (Person A)
  const [isListening, setIsListening] = useState(false);
  const [speakerTranscript, setSpeakerTranscript] = useState('');
  const [speakerError, setSpeakerError] = useState<string | null>(null);

  // User response state (Person B)
  const [userText, setUserText] = useState('');
  const [isSpeakingOutLoud, setIsSpeakingOutLoud] = useState(false);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
      ttsService.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      setSpeakerError(null);
      speechService.start(
        (transcript, isFinal) => {
          setSpeakerTranscript(transcript);
          if (isFinal) {
            // Auto add to conversation
            addMessage('speaker', transcript, 'speech', 'Speaker (Voice)');
            setSpeakerTranscript('');
            speechService.stop();
            setIsListening(false);
          }
        },
        (error) => {
          setSpeakerError(error);
          setIsListening(false);
        },
        (status) => {
          setIsListening(status);
        }
      );
    }
  };

  const handleSpeakerPreset = (presetText: string) => {
    addMessage('speaker', presetText, 'speech', 'Speaker (Voice)');
    setSpeakerTranscript('');
  };

  const handleUserSend = (speakAloud: boolean = false) => {
    if (!userText.trim()) return;

    const textToSend = userText.trim();
    addMessage('user', textToSend, 'typing', 'You (Text/Sign)');

    if (speakAloud) {
      setIsSpeakingOutLoud(true);
      ttsService.speak(textToSend, {
        onEnd: () => setIsSpeakingOutLoud(false),
        onError: () => setIsSpeakingOutLoud(false)
      });
    }

    setUserText('');
  };

  const handleQuickPhrase = (phrase: string) => {
    setUserText(phrase);
  };

  const playMessageAloud = (text: string) => {
    ttsService.speak(text);
  };

  const handleCopyTranscript = () => {
    const textLog = messages
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${m.senderName}: ${m.text}`)
      .join('\n');
    navigator.clipboard.writeText(textLog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Communication Mode
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Live Bridge
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Two-way bridge: Conventional speech is converted to text; typed or signed thoughts are spoken aloud.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopyTranscript}
            disabled={messages.length === 0}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Copy conversation transcript"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Log'}</span>
          </button>
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* SPEAKER SECTION (Person A) */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-3xl border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
            <span className="text-lg">🗣️</span>
            <span>Person A (Speaking)</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-ping' : 'bg-blue-500'}`} />
            {isListening ? 'Listening...' : 'Microphone Ready'}
          </span>
        </div>

        {speakerError && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{speakerError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Big Mic Button */}
          <button
            onClick={toggleListening}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? 'Stop Listening' : 'Start Listening to Speaker'}</span>
          </button>

          {/* Quick preset simulations for judges/testing */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium hidden sm:inline">
              Simulate speech:
            </span>
            <button
              onClick={() => handleSpeakerPreset("Your appointment is scheduled at 3:00 PM.")}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 text-[11px] font-medium transition-colors"
            >
              "Appointment at 3 PM"
            </button>
            <button
              onClick={() => handleSpeakerPreset("The total bill is 450 rupees. Would you like a receipt?")}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 text-[11px] font-medium transition-colors"
            >
              "Total bill 450"
            </button>
          </div>
        </div>

        {speakerTranscript && (
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-300 dark:border-blue-800">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
              Live Transcription:
            </span>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              "{speakerTranscript}"
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  addMessage('speaker', speakerTranscript, 'speech', 'Speaker (Voice)');
                  setSpeakerTranscript('');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Conversation</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CONVERSATION TIMELINE */}
      <section className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Conversation Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {messages.length} messages
          </span>
        </div>

        <div className="space-y-4 min-h-[160px] max-h-[380px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Conversation is empty
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tap "Start Listening to Speaker" or type a response below to begin communicating.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSpeaker = msg.sender === 'speaker';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSpeaker ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`p-4 rounded-3xl max-w-[90%] sm:max-w-[80%] shadow-sm ${
                    isSpeaker
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-slate-900 dark:text-white rounded-tl-sm border border-blue-200 dark:border-blue-900/60'
                      : 'bg-teal-600 text-white rounded-tr-sm'
                  }`}>
                    <p className="text-base sm:text-lg font-medium leading-relaxed">
                      {msg.text}
                    </p>

                    <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${
                      isSpeaker 
                        ? 'border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'border-teal-500 text-teal-100'
                    }`}>
                      <span className="capitalize text-[11px] font-bold tracking-wider">
                        Method: {msg.method}
                      </span>
                      <button
                        onClick={() => playMessageAloud(msg.text)}
                        className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                          isSpeaker 
                            ? 'hover:bg-blue-100 dark:hover:bg-blue-900' 
                            : 'hover:bg-teal-700'
                        }`}
                        title="Speak this message aloud"
                        aria-label="Speak message"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Speak</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* USER RESPONSE SECTION (Person B) */}
      <section className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
            <span className="text-lg">⌨️</span>
            <span>Your Response (Typing / Sign)</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Will be spoken aloud or displayed to Speaker
          </span>
        </div>

        {/* Input box */}
        <div className="relative">
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserSend(true);
              }
            }}
            placeholder="Type what you want to say to the other person..."
            rows={3}
            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Quick phrase shortcuts */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleQuickPhrase("Can I change it to tomorrow?")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            "Can I change it to tomorrow?"
          </button>
          <button
            onClick={() => handleQuickPhrase("Thank you, I understand.")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            "Thank you, I understand"
          </button>
          <button
            onClick={() => handleQuickPhrase("Please write it down.")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            "Please write it down"
          </button>
          <button
            onClick={() => handleQuickPhrase("Where is Room 2B?")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            "Where is Room 2B?"
          </button>
        </div>

        {/* Send Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Press Enter to Send & Speak
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleUserSend(false)}
              disabled={!userText.trim()}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all disabled:opacity-40"
            >
              Add to Stream Only
            </button>
            <button
              onClick={() => handleUserSend(true)}
              disabled={!userText.trim() || isSpeakingOutLoud}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeakingOutLoud ? 'Speaking...' : 'Speak & Send'}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
