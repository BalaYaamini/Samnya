import React, { useState, useEffect, useRef } from 'react';
import { signRecognitionService, SignRecognitionResult } from '../services/sign/signService';
import { SupportedSign } from '../types';
import { useConversation } from '../contexts/ConversationContext';
import { ttsService } from '../services/speech/ttsService';
import { HAND_CONNECTIONS } from '../services/sign/handClassifier';
import { 
  Camera, 
  CameraOff, 
  HandMetal, 
  Sparkles, 
  Volume2, 
  Plus, 
  Check, 
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';

interface SignToTextPageProps {
  onNavigate: (tab: string) => void;
}

export const SignToTextPage: React.FC<SignToTextPageProps> = ({ onNavigate }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Continuous recognition state
  const [recognizedResult, setRecognizedResult] = useState<SignRecognitionResult | null>(null);
  // Separate state just to hold the last valid recognized sign for the UI action buttons
  const [lastConfirmedSign, setLastConfirmedSign] = useState<SupportedSign | null>(null);
  
  const [confirmed, setConfirmed] = useState(false);
  const [added, setAdded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { addMessage } = useConversation();
  const supportedSigns = signRecognitionService.getSupportedSigns();

  useEffect(() => {
    // Register continuous callback
    signRecognitionService.setOnResult((result) => {
      setRecognizedResult(result);
      if (result.sign) {
        setLastConfirmedSign(result.sign);
        setConfirmed(false); // Reset confirmation when a new valid sign is locked
      }
      
      // Draw landmarks
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          if (result.landmarksDetected && result.rawLandmarks) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            
            ctx.strokeStyle = '#2dd4bf'; // teal-400
            ctx.fillStyle = '#60a5fa'; // blue-400
            ctx.lineWidth = 3;
            
            // Draw connections
            for (const [i, j] of HAND_CONNECTIONS) {
              const lm1 = result.rawLandmarks[i];
              const lm2 = result.rawLandmarks[j];
              ctx.beginPath();
              // Note: Mirror X axis because video is mirrored (-scale-x-100)
              ctx.moveTo((1 - lm1.x) * w, lm1.y * h);
              ctx.lineTo((1 - lm2.x) * w, lm2.y * h);
              ctx.stroke();
            }
            
            // Draw points
            for (const lm of result.rawLandmarks) {
              ctx.beginPath();
              ctx.arc((1 - lm.x) * w, lm.y * h, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      }
    });

    return () => {
      signRecognitionService.stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    
    try {
      await signRecognitionService.initializeMediaPipe();
    } catch (err: any) {
      setCameraError('Failed to load MediaPipe models. Check network connection.');
      setIsInitializing(false);
      return;
    }

    const res = await signRecognitionService.requestCamera();
    if (res.success && res.stream && videoRef.current) {
      videoRef.current.srcObject = res.stream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
      setCameraActive(true);
      
      // Set canvas size to match video resolution
      videoRef.current.onloadedmetadata = () => {
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
        signRecognitionService.startDetectionLoop(videoRef.current!);
      };
    } else {
      setCameraError(res.error || 'Unable to access camera.');
      setCameraActive(false);
    }
    
    setIsInitializing(false);
  };

  const handleStopCamera = () => {
    signRecognitionService.stopCamera();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setRecognizedResult(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleSpeak = () => {
    if (!lastConfirmedSign) return;
    ttsService.speak(lastConfirmedSign.label);
  };

  const handleAddToMessage = () => {
    if (!lastConfirmedSign) return;
    addMessage('user', lastConfirmedSign.label, 'sign', 'You (Sign Language)');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Hand Tracking</span>
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
          <p className="font-bold">MVP Implementation Active:</p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300 leading-relaxed">
            Using real-time MediaPipe geometric landmark classification. See catalogue for reliably supported signs vs experimental ones.
          </p>
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Camera Error:</p>
            <p className="mt-0.5">{cameraError}</p>
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
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />
            
            {/* Landmark Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Inactive Camera Placeholder */}
            {!cameraActive && !isInitializing && (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Camera Off</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Turn on camera for live hand gesture tracking.
                  </p>
                </div>
              </div>
            )}
            
            {isInitializing && (
               <div className="text-center p-6 space-y-3">
                 <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto" />
                 <p className="text-sm font-bold text-white">Loading MediaPipe Models...</p>
                 <p className="text-xs text-slate-400">Fetching ~5MB of WASM dependencies.</p>
               </div>
            )}

            {/* Tracking Landmarks HUD Overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-teal-400 border border-teal-500/30">
                    LIVE TRACKING ACTIVE
                  </span>
                  {recognizedResult?.landmarksDetected && (
                    <span className="px-2 py-0.5 rounded bg-black/60 text-blue-400 border border-blue-500/30">
                      HAND DETECTED
                    </span>
                  )}
                </div>
                
                {recognizedResult?.sign ? (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-teal-500/90 text-white font-black text-2xl rounded-full shadow-lg border-2 border-teal-400 backdrop-blur-sm transition-all">
                    {recognizedResult.sign.label}
                  </div>
                ) : recognizedResult?.holdingSignId ? (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500/80 text-white font-bold text-sm rounded-full shadow-lg border border-amber-400 backdrop-blur-sm transition-all animate-pulse">
                    Hold sign steady...
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {!cameraActive ? (
              <button
                onClick={handleStartCamera}
                disabled={isInitializing}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Camera className="w-5 h-5 text-teal-400" />
                <span>{isInitializing ? 'Initializing...' : 'Turn On Camera'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center gap-2 transition-all"
              >
                <CameraOff className="w-5 h-5" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>

        </div>

        {/* Right / Bottom: Recognition Result & Supported Signs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Recognized Expression Card */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Last Recognized Sign
              </span>
              {recognizedResult?.sign && (
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  Stable Confidence {recognizedResult.confidence}%
                </span>
              )}
            </div>

            {lastConfirmedSign ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-center">
                  <span className="text-2xl mb-1 block">🤟</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    "{lastConfirmedSign.label}"
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {lastConfirmedSign.description}
                  </p>
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
                    onClick={handleSpeak}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={handleAddToMessage}
                    className="col-span-2 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{added ? 'Added to Chat' : 'Add to Conversation'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <HandMetal className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">
                  Turn on the camera and perform a supported sign to begin.
                </p>
              </div>
            )}
          </div>

          {/* Supported Sign Catalogue */}
          <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Sign Catalogue
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {supportedSigns.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all
                    ${s.recognitionStatus === 'supported' ? 'border-teal-200 bg-teal-50/30 dark:border-teal-900 dark:bg-teal-900/10' : 
                      s.recognitionStatus === 'experimental' ? 'border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-900/10' : 
                      'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 opacity-70'}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{s.label}</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                      ${s.recognitionStatus === 'supported' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' : 
                        s.recognitionStatus === 'experimental' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 
                        'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}
                    `}>
                      {s.recognitionStatus}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{s.hint}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
