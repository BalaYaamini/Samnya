import React, { useState, useEffect, useRef } from 'react';
import { signRecognitionService, SignRecognitionResult } from '../services/sign/signService';
import { SupportedSign } from '../types';
import { useConversation } from '../contexts/ConversationContext';
import { ttsService } from '../services/speech/ttsService';
import { 
  Camera, 
  CameraOff, 
  HandMetal, 
  Sparkles, 
  Volume2, 
  Plus, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Info,
  Layers
} from 'lucide-react';

interface SignToTextPageProps {
  onNavigate: (tab: string) => void;
}

export const SignToTextPage: React.FC<SignToTextPageProps> = ({ onNavigate }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedResult, setRecognizedResult] = useState<SignRecognitionResult | null>(null);
  const [selectedPresetSign, setSelectedPresetSign] = useState<string>('help');
  const [confirmed, setConfirmed] = useState(false);
  const [added, setAdded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { addMessage } = useConversation();
  const supportedSigns = signRecognitionService.getSupportedSigns();

  useEffect(() => {
    return () => {
      signRecognitionService.stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    const res = await signRecognitionService.requestCamera();
    if (res.success && res.stream && videoRef.current) {
      videoRef.current.srcObject = res.stream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
      setCameraActive(true);
    } else {
      setCameraError(res.error || 'Unable to access camera.');
      setCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    signRecognitionService.stopCamera();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleRunDetection = async (targetSignId?: string) => {
    setIsAnalyzing(true);
    setConfirmed(false);
    try {
      const result = await signRecognitionService.detectSign(targetSignId || selectedPresetSign);
      setRecognizedResult(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleSpeak = () => {
    if (!recognizedResult) return;
    ttsService.speak(recognizedResult.sign.label);
  };

  const handleAddToMessage = () => {
    if (!recognizedResult) return;
    addMessage('user', recognizedResult.sign.label, 'sign', 'You (Sign Language)');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vision AI Prototype</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Sign → Text
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Use your camera to communicate using supported signs.
        </p>
      </div>

      {/* Honesty & AI Prototype Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Computer Vision Architecture Prototype:</p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300 leading-relaxed">
            This module illustrates SAMNYA's clean ML pipeline abstraction for 10 core gestures. It demonstrates camera viewport integration, landmark tracking simulation, and confidence scoring ready for model weights attachment.
          </p>
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Camera Access Note:</p>
            <p className="mt-0.5">{cameraError}</p>
            <p className="mt-1 font-semibold">You can still test sign recognition using the interactive simulator below!</p>
          </div>
        </div>
      )}

      {/* Main Viewport Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Top: Camera & Tracking Overlay (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Inactive Camera Placeholder */}
            {!cameraActive && (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Camera Viewport Inactive</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Turn on camera for live hand gesture tracking or run simulated detection.
                  </p>
                </div>
              </div>
            )}

            {/* Tracking Landmarks HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-black/60 text-teal-400 border border-teal-500/30">
                  {cameraActive ? 'VIDEO FEED ACTIVE' : 'SIMULATOR READY'}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/60 text-slate-300">
                  21-HAND-LANDMARKS
                </span>
              </div>

              {/* Simulated Hand Landmark Box */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-2xl border-2 border-dashed border-teal-400/60 bg-teal-500/5 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-teal-400 absolute top-2 left-2 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-teal-400 absolute top-2 right-2" />
                <div className="w-2 h-2 rounded-full bg-teal-400 absolute bottom-2 left-2" />
                <div className="w-2 h-2 rounded-full bg-teal-400 absolute bottom-2 right-2" />
                <div className="w-3 h-3 rounded-full bg-blue-400 absolute" />
                <span className="text-[10px] font-mono text-teal-300/80 bg-black/40 px-1 rounded">
                  HAND DETECTED
                </span>
              </div>

              <div className="text-[10px] text-slate-400 text-center font-mono bg-black/40 py-0.5 rounded">
                SAMNYA Gesture Core v1.0
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!cameraActive ? (
              <button
                onClick={handleStartCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Enable Camera Feed</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            )}

            <button
              onClick={() => handleRunDetection()}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <HandMetal className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Gestures...' : 'Capture & Recognize Sign'}</span>
            </button>
          </div>

        </div>

        {/* Right / Bottom: Recognition Result & Supported Signs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Recognized Expression Card */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recognized expression
              </span>
              {recognizedResult && (
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  Confidence {recognizedResult.confidence}%
                </span>
              )}
            </div>

            {recognizedResult ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center">
                  <span className="text-2xl mb-1 block">🤟</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    "{recognizedResult.sign.label}"
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {recognizedResult.sign.description}
                  </p>
                </div>

                {/* Confidence Meter Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    <span>Confidence Score</span>
                    <span>{recognizedResult.confidence}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${recognizedResult.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Specified Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleConfirm}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      confirmed 
                        ? 'bg-teal-700 text-white' 
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{confirmed ? 'Confirmed' : 'Confirm'}</span>
                  </button>

                  <button
                    onClick={() => handleRunDetection()}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={handleSpeak}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={handleAddToMessage}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{added ? 'Added' : 'Add to Message'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <HandMetal className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">
                  Select a sign from the catalogue below or tap "Capture & Recognize Sign" to test.
                </p>
              </div>
            )}
          </div>

          {/* Supported Sign Catalogue */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                10 Supported Signs (MVP)
              </span>
              <span className="text-[10px] text-teal-600 font-semibold">Tap to simulate</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {supportedSigns.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedPresetSign(s.id);
                    handleRunDetection(s.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPresetSign === s.id
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{s.hint}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
