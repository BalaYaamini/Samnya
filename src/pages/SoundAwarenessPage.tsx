import React, { useState, useEffect } from 'react';
import { soundDetectionService } from '../services/sound/soundService';
import { DetectedSound, AlertSeverity } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { DEMO_SOUND_SCENARIOS } from '../data/mockData';
import { 
  BellRing, 
  VolumeX, 
  Flame, 
  Car, 
  Bell, 
  MessageCircle, 
  AlertTriangle,
  History,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export const SoundAwarenessPage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(20).fill(0));
  const [recentAlerts, setRecentAlerts] = useState<DetectedSound[]>([]);
  const [activeAlert, setActiveAlert] = useState<DetectedSound | null>(null);
  
  const { settings } = useSettings();

  useEffect(() => {
    // We start the monitor by default if permitted
    startMonitor();
    const unsubscribe = soundDetectionService.subscribeAlerts(handleNewAlert);
    return () => {
      soundDetectionService.stopListening();
      unsubscribe();
    };
  }, []);

  const startMonitor = () => {
    setIsActive(true);
    soundDetectionService.startListening(
      (db, freqs) => {
        setDecibels(Math.round(db));
        setFrequencies(Array.from(freqs));
      }
    );
  };

  const handleNewAlert = (alert: DetectedSound) => {
    setActiveAlert(alert);
    setRecentAlerts(prev => [alert, ...prev].slice(0, 5));
    
    // Trigger haptic vibration if supported and enabled
    if (settings.vibration_enabled && 'vibrate' in navigator) {
      if (alert.severity === 'critical') {
        navigator.vibrate([200, 100, 200, 100, 200]); // SOS pattern
      } else if (alert.severity === 'warning') {
        navigator.vibrate([300, 200, 300]);
      } else {
        navigator.vibrate([200]);
      }
    }
  };

  const getSeverityColors = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500 shadow-red-600/40';
      case 'warning': return 'bg-amber-500 text-slate-900 border-amber-400 shadow-amber-500/40';
      case 'info': return 'bg-blue-500 text-white border-blue-400 shadow-blue-500/40';
      default: return 'bg-slate-200 text-slate-800 border-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fire_alarm': return <Flame className="w-5 h-5" />;
      case 'vehicle_horn': return <Car className="w-5 h-5" />;
      case 'doorbell': return <Bell className="w-5 h-5" />;
      case 'speech': return <MessageCircle className="w-5 h-5" />;
      default: return <BellRing className="w-5 h-5" />;
    }
  };

  const triggerDemo = (scenario: DetectedSound) => {
    soundDetectionService.triggerSoundAlert(scenario.id);
  };

  return (
    <div className={`space-y-6 pb-28 max-w-4xl mx-auto transition-colors duration-300 ${activeAlert?.severity === 'critical' ? 'animate-emergency-flash' : ''}`}>
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sound Alerts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Listening for important sounds...
        </h1>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Demo Mode: Sound alerts are simulated for this prototype. Tap a scenario below to see how alerts work.</p>
        </div>
      </div>

      {/* Main Visualizer Card */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3 ${isActive ? '' : 'opacity-50'}`}>
              {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-teal-500' : 'bg-slate-400'}`}></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isActive ? 'Microphone Active' : 'Microphone Paused'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {decibels}
              <span className="text-base text-slate-400 ml-1">dB</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Sound Level</div>
          </div>
        </div>

        {/* Frequency Bars Visualization */}
        <div className="h-32 flex items-end justify-between gap-1 opacity-80">
          {frequencies.map((val, i) => (
            <div 
              key={i} 
              className="w-full bg-amber-500 dark:bg-amber-400 rounded-t-sm transition-all duration-75"
              style={{ height: `${Math.max(4, (val / 255) * 100)}%`, opacity: 0.3 + (val / 255) * 0.7 }}
            />
          ))}
        </div>
      </div>

      {/* Active Alert Modal Overlay */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 ${getSeverityColors(activeAlert.severity)} animate-scaleUp`}>
            
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center animate-pulse-subtle">
                {getCategoryIcon(activeAlert.category)}
              </div>
              
              <div>
                <div className="text-xs font-black uppercase tracking-widest opacity-90 mb-2">
                  {activeAlert.severity === 'critical' ? '⚠️ SOUND ALERT' : 'Notice'}
                </div>
                <h2 className="text-3xl font-black leading-tight drop-shadow-md">
                  {activeAlert.name}
                </h2>
                <p className="mt-3 font-semibold opacity-95 text-lg">
                  {activeAlert.description}
                </p>
                <div className="mt-4 p-4 rounded-xl bg-black/20 text-sm font-bold">
                  {activeAlert.actionAdvice}
                </div>
              </div>

              <button
                onClick={() => setActiveAlert(null)}
                className="mt-6 w-full py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-lg transition-colors backdrop-blur-sm"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Demo Triggers (Left) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <VolumeX className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Test Sound Alerts (Demo)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {DEMO_SOUND_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => triggerDemo(scenario)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between group transition-all hover:-translate-y-0.5 shadow-sm ${
                  scenario.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 hover:border-red-400' :
                  scenario.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:border-amber-400' :
                  'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    scenario.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' :
                    scenario.severity === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' :
                    'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  }`}>
                    {getCategoryIcon(scenario.category)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {scenario.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {scenario.decibels} dB
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">
                  Test
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent History (Right) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Alerts
            </h2>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm font-medium">
                No recent alerts detected.
              </div>
            ) : (
              recentAlerts.map((alert, idx) => (
                <div key={`${alert.id}-${idx}`} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className={`mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`}>
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {alert.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Just now
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
