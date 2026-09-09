import React, { useState, useEffect } from 'react';
import { soundDetectionService } from '../services/sound/soundService';
import { DetectedSound } from '../types';
import { DEMO_SOUND_SCENARIOS } from '../data/mockData';
import { 
  BellRing, 
  Volume2, 
  Flame, 
  Car, 
  Bell, 
  UserCheck, 
  AlertTriangle, 
  Vibrate, 
  X, 
  Info,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const SoundAwarenessPage: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentDecibels, setCurrentDecibels] = useState(38);
  const [freqData, setFreqData] = useState<number[]>([12, 24, 45, 30, 60, 25, 18, 33]);
  const [activeAlert, setActiveAlert] = useState<DetectedSound | null>(null);
  const [alertHistory, setAlertHistory] = useState<DetectedSound[]>(DEMO_SOUND_SCENARIOS);

  useEffect(() => {
    // Start acoustic monitor automatically
    handleStartMonitor();

    // Subscribe to sound alerts
    const unsubscribe = soundDetectionService.subscribeAlerts((alert: DetectedSound) => {
      setActiveAlert(alert);
      setAlertHistory(prev => [alert, ...prev]);
    });

    return () => {
      unsubscribe();
      soundDetectionService.stopListening();
    };
  }, []);

  const handleStartMonitor = async () => {
    const res = await soundDetectionService.startListening((db: number, audioArray: Uint8Array) => {
      setCurrentDecibels(db);
      // Sample 8 frequency buckets for UI
      const sampled = Array.from(audioArray.slice(0, 8)) as number[];
      setFreqData(sampled);
    });
    setIsMonitoring(res.success);
  };

  const handleToggleMonitor = () => {
    if (isMonitoring) {
      soundDetectionService.stopListening();
      setIsMonitoring(false);
    } else {
      handleStartMonitor();
    }
  };

  const handleTriggerDemo = (scenarioId: string) => {
    soundDetectionService.triggerSoundAlert(scenarioId);
  };

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
          <BellRing className="w-3.5 h-3.5" />
          <span>Acoustic Safety Guardian</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Sound Awareness
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          SAMNYA helps you stay aware of important sounds around you.
        </p>
      </div>

      {/* Honest Prototype AI Disclosure */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Sound Classification Architecture (Demo Mode):</p>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300 leading-relaxed">
            Real environmental sound recognition requires edge acoustic neural networks. For the MVP, this screen demonstrates real-time Web Audio API decibel metering, device haptic vibration, and immediate visual strobe dispatch for safety alerts.
          </p>
        </div>
      </div>

      {/* Acoustic Meter Hub */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isMonitoring ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Environmental Acoustic Monitor
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${isMonitoring ? 'bg-green-500 animate-ping' : 'bg-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isMonitoring ? 'Actively sampling ambient noise level' : 'Monitoring paused'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleMonitor}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isMonitoring
                ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
            }`}
          >
            {isMonitoring ? 'Pause Monitor' : 'Resume Monitor'}
          </button>
        </div>

        {/* Real-time Decibel Bar & Graphic */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Ambient Volume
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {currentDecibels} <span className="text-xs text-slate-400 font-normal">dB</span>
            </span>
          </div>

          {/* Equalizer Frequency Visualization */}
          <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
            {freqData.map((val, i) => {
              const heightPct = Math.min(100, Math.max(12, (val / 255) * 100));
              return (
                <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all duration-150"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Trigger Sound Alert (Demo Mode buttons) */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Simulate Sound Classification (Demo Triggers):
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap a scenario below to test the full visual strobe alert, device haptic vibration, and action advice:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <button
            onClick={() => handleTriggerDemo('snd-fire')}
            className="p-4 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/80 text-left transition-all flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-900 dark:text-red-200">
                  🚨 Fire Alarm
                </div>
                <div className="text-[11px] text-red-700 dark:text-red-400">
                  High-pitch 85dB oscillating siren
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded">
              Critical
            </span>
          </button>

          <button
            onClick={() => handleTriggerDemo('snd-horn')}
            className="p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 border border-orange-200 dark:border-orange-900/80 text-left transition-all flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-600 text-white">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-orange-900 dark:text-orange-200">
                  📢 Vehicle Horn
                </div>
                <div className="text-[11px] text-orange-700 dark:text-orange-400">
                  Sudden acoustic traffic burst
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded">
              Warning
            </span>
          </button>

          <button
            onClick={() => handleTriggerDemo('snd-doorbell')}
            className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-900/80 text-left transition-all flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  🔔 Doorbell Chime
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400">
                  Front entrance guest visitor
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
              Info
            </span>
          </button>

          <button
            onClick={() => handleTriggerDemo('snd-speech')}
            className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-950/60 border border-teal-200 dark:border-teal-900/80 text-left transition-all flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-teal-900 dark:text-teal-200">
                  🗣️ Important Speech
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400">
                  Elevated voice calling your name
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded">
              Attention
            </span>
          </button>

        </div>
      </div>

      {/* Detection Log */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Recent Sound Awareness Log:
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {alertHistory.map((item, idx) => (
            <div key={idx} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span>{item.name}</span>
                  {item.decibels && (
                    <span className="text-[10px] text-slate-400 font-mono">({item.decibels} dB)</span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                <p className="text-teal-600 dark:text-teal-400 font-semibold">{item.actionAdvice}</p>
              </div>
              <span className="text-slate-400 text-[11px] whitespace-nowrap">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE EMERGENCY POPUP MODAL */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border-4 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-emergency-flash text-center">
            
            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/40">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400">
                CRITICAL SOUND DETECTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 uppercase">
                🚨 {activeAlert.name}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-left space-y-2">
              <p className="text-sm font-semibold text-red-950 dark:text-red-100">
                {activeAlert.description}
              </p>
              <div className="pt-2 border-t border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-200">
                <strong>Recommended Action:</strong> {activeAlert.actionAdvice}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Timestamp: {activeAlert.timestamp}</span>
              <span className="flex items-center gap-1">
                <Vibrate className="w-4 h-4 text-red-500" />
                <span>Vibration Alert Dispatched</span>
              </span>
            </div>

            <button
              onClick={dismissAlert}
              className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              I Understand / Acknowledge Alert
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
