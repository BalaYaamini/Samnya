import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Flame, Shield, Users, X, Volume2, VolumeX, Eye, Maximize2 } from 'lucide-react';
import { ttsService } from '../../services/speech/ttsService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [showFullScreenMessage, setShowFullScreenMessage] = useState(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    {
      id: 'medical',
      label: 'Medical Emergency',
      subtext: 'Need ambulance or doctor urgently.',
      icon: AlertTriangle,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      speech: 'Emergency! I need medical help immediately. Please call an ambulance.'
    },
    {
      id: 'police',
      label: 'Police / Safety Help',
      subtext: 'In danger. Need police protection.',
      icon: Shield,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      speech: 'Emergency! I need police assistance immediately.'
    },
    {
      id: 'fire',
      label: 'Fire Emergency',
      subtext: 'Smoke or fire detected.',
      icon: Flame,
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      speech: 'Emergency! There is a fire. Please evacuate and call the fire service.'
    },
    {
      id: 'contact',
      label: 'Contact Family / Emergency Contact',
      subtext: 'I need assistance reaching my family.',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      speech: 'I need assistance contacting my family or emergency contact. Please help me.'
    }
  ];

  const handleSelect = (opt: typeof emergencyOptions[0]) => {
    setSelectedEmergency(opt.label);
    ttsService.speak(opt.speech);
  };

  const toggleBeacon = () => {
    setIsBeaconActive(!isBeaconActive);
  };

  const toggleSiren = () => {
    if (!isSirenActive) {
      setIsSirenActive(true);
      ttsService.speak('Emergency alert! Assistance requested! Emergency alert!');
    } else {
      setIsSirenActive(false);
      ttsService.stop();
    }
  };

  const handleSpeakFullScreen = () => {
    ttsService.speak("I am Deaf. I need medical help. Please communicate with me through text.");
  };

  // Full Screen Emergency Overlay
  if (showFullScreenMessage) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070D1E] text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white animate-pulse">
              EMERGENCY
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSpeakFullScreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
              aria-label="Speak message aloud"
            >
              <Volume2 className="w-5 h-5" />
              <span>Speak</span>
            </button>
            <button
              onClick={() => setShowFullScreenMessage(false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Close full-screen message"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Huge Text Display */}
        <div className="my-auto text-left py-8 max-w-4xl mx-auto space-y-6 sm:space-y-10">
          <p className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight text-white drop-shadow-md border-l-8 border-red-600 pl-6 sm:pl-8">
            I AM DEAF.
          </p>
          <p className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight text-red-500 drop-shadow-md border-l-8 border-red-600 pl-6 sm:pl-8">
            I NEED MEDICAL HELP.
          </p>
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-slate-300 drop-shadow-md border-l-8 border-blue-600 pl-6 sm:pl-8 mt-12 sm:mt-16">
            PLEASE COMMUNICATE WITH ME THROUGH TEXT.
          </p>
        </div>
      </div>
    );
  }

  // Standard Emergency Modal
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isBeaconActive ? 'animate-emergency-flash' : 'bg-black/80 backdrop-blur-md'}`}>
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border-4 border-red-500 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl animate-pulse">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase">
                I NEED HELP
              </h1>
              <p className="text-xs text-red-100 font-medium">
                Show this screen or tap an option to broadcast
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              ttsService.stop();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-red-50 dark:bg-red-950/40 px-4 py-2.5 border-b border-red-200 dark:border-red-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBeacon}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isBeaconActive ? 'bg-amber-400 text-slate-950' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-500" />
              <span>{isBeaconActive ? 'Beacon ON' : 'Visual Beacon'}</span>
            </button>
            <button
              onClick={toggleSiren}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isSirenActive ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-500" />}
              <span>{isSirenActive ? 'Stop Audio' : 'Audio Alert'}</span>
            </button>
          </div>
          <span className="text-[11px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
            Demo Mode
          </span>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Big SHOW EMERGENCY MESSAGE button */}
          <button
            onClick={() => setShowFullScreenMessage(true)}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-sm uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Maximize2 className="w-5 h-5" />
            <span>Show Emergency Message</span>
          </button>

          {selectedEmergency && (
            <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/80 border-2 border-red-500 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-300">
                Broadcasting Emergency:
              </span>
              <p className="text-2xl font-black text-red-900 dark:text-red-100 mt-1">
                {selectedEmergency}
              </p>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                "I cannot hear or speak conventionally. Please assist me immediately."
              </p>
            </div>
          )}

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
            Select Emergency Type:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {emergencyOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between text-left shadow-sm transition-all active:scale-98 border border-transparent hover:border-white/50 ${opt.color}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg">{opt.label}</div>
                      <div className="text-xs opacity-90 font-normal">{opt.subtext}</div>
                    </div>
                  </div>
                  <Volume2 className="w-5 h-5 opacity-70" />
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
