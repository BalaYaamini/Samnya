import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, Flame, Shield, HelpCircle, X, Volume2, VolumeX, Eye } from 'lucide-react';
import { ttsService } from '../../services/speech/ttsService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    {
      id: 'medical',
      label: 'Medical Emergency',
      subtext: 'I need an ambulance or doctor urgently.',
      icon: AlertTriangle,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      speech: 'Emergency! I need medical help immediately. Please call an ambulance.'
    },
    {
      id: 'fire',
      label: 'Fire Emergency',
      subtext: 'Smoke or fire detected. Need fire brigade.',
      icon: Flame,
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      speech: 'Emergency! There is a fire. Please evacuate and call the fire service.'
    },
    {
      id: 'police',
      label: 'Police / Safety',
      subtext: 'In danger. Need police protection.',
      icon: Shield,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      speech: 'Emergency! I need police assistance immediately.'
    },
    {
      id: 'lost',
      label: 'I Am Lost / Stranded',
      subtext: 'Cannot navigate or reach family.',
      icon: HelpCircle,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      speech: 'I am lost and need assistance contacting my emergency contact.'
    },
    {
      id: 'assistance',
      label: 'General Urgent Assistance',
      subtext: 'Please stop and assist me.',
      icon: ShieldAlert,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      speech: 'Excuse me. I cannot hear or speak clearly. I need your assistance.'
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
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

          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Emergency Type:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {emergencyOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between text-left shadow transition-all active:scale-98 ${opt.color}`}
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
                  <PhoneCall className="w-5 h-5 opacity-70" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              ℹ️ MVP Demonstration Notice:
            </p>
            <p className="mt-0.5">
              This screen assists users in conveying urgency visually and verbally to nearby first responders or bystanders. It does not initiate an external emergency telephone call.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
