import { SUPPORTED_SIGNS } from '../../data/mockData';
import { SupportedSign } from '../../types';
import { ensureMediaPipeLoaded, createHandsInstance, MPHandsInstance, MPHandsResults } from './mediapipeLoader';
import { classifySign, NormalizedLandmark } from './handClassifier';

export interface SignRecognitionResult {
  sign: SupportedSign | null;
  confidence: number;
  timestamp: number;
  landmarksDetected: boolean;
  rawLandmarks?: NormalizedLandmark[];
  holdingSignId?: string | null; // Indicates which sign is currently being held but not yet confirmed
}

export class SignRecognitionService {
  private mediaStream: MediaStream | null = null;
  private isAnalyzing: boolean = false;
  private hands: MPHandsInstance | null = null;
  private onResultCallback: ((result: SignRecognitionResult) => void) | null = null;
  private history: { signId: string | null; time: number }[] = [];
  private loopActive = false;

  public async requestCamera(): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { success: false, error: 'Camera access is not supported in this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      this.mediaStream = stream;
      return { success: true, stream };
    } catch (err: any) {
      console.warn('Camera request error:', err);
      let message = 'Camera permission denied or camera unavailable.';
      if (err.name === 'NotAllowedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings to use Sign → Text.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera device found on this system.';
      }
      return { success: false, error: message };
    }
  }

  public stopCamera() {
    this.loopActive = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isAnalyzing = false;
  }

  public getSupportedSigns(): SupportedSign[] {
    return SUPPORTED_SIGNS;
  }

  public async initializeMediaPipe(): Promise<void> {
    if (this.hands) return; // Already initialized
    
    await ensureMediaPipeLoaded();
    this.hands = createHandsInstance();
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    this.hands.onResults((results) => this.processResults(results));
  }

  public setOnResult(cb: (r: SignRecognitionResult) => void) {
    this.onResultCallback = cb;
  }

  public async startDetectionLoop(videoElement: HTMLVideoElement) {
    if (!this.hands) {
      throw new Error("MediaPipe not initialized");
    }
    
    this.loopActive = true;
    this.isAnalyzing = true;
    
    const processFrame = async () => {
      if (!this.loopActive || !this.hands || !videoElement) {
        return;
      }
      
      if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
        try {
          await this.hands.send({ image: videoElement });
        } catch (e) {
          console.error("MediaPipe send error:", e);
        }
      }
      
      if (this.loopActive) {
        requestAnimationFrame(processFrame);
      }
    };
    
    processFrame();
  }

  private processResults(results: MPHandsResults) {
    const lms = results.multiHandLandmarks?.[0];
    const now = Date.now();
    
    if (!lms) {
       this.history = []; // clear history on hand loss
       this.onResultCallback?.({
         sign: null,
         confidence: 0,
         timestamp: now,
         landmarksDetected: false,
         holdingSignId: null
       });
       return;
    }

    const classResult = classifySign(lms);
    
    // Strict interruption: If we hit an UNKNOWN frame, clear the stability queue
    if (!classResult.signId) {
      this.history = [];
    } else {
      this.history.push({ signId: classResult.signId, time: now });
      // Keep history for the last 1 second
      this.history = this.history.filter(h => now - h.time < 1000);
    }

    let finalSignId = null;
    let holdingSignId = null;
    let finalConfidence = classResult.confidence;
    
    // Check stability
    // 3 frames (approx 100ms) -> consider it "holding"
    if (this.history.length >= 3) {
      const recentHold = this.history.slice(-3);
      const holdSame = recentHold.every(r => r.signId === classResult.signId);
      if (holdSame) {
        holdingSignId = classResult.signId;
      }
    }
    
    // 10 frames (approx 300-400ms) -> fully accepted
    if (this.history.length >= 10) {
       const recentAccept = this.history.slice(-10);
       const allSame = recentAccept.every(r => r.signId === classResult.signId);
       if (allSame && classResult.signId) {
          finalSignId = classResult.signId;
       }
    }

    let finalSign = null;
    if (finalSignId) {
       finalSign = SUPPORTED_SIGNS.find(s => s.id === finalSignId) || null;
    }

    this.onResultCallback?.({
      sign: finalSign,
      confidence: Math.round(finalConfidence * 100),
      timestamp: now,
      landmarksDetected: true,
      rawLandmarks: lms,
      holdingSignId
    });
  }

  public getIsAnalyzing(): boolean {
    return this.isAnalyzing;
  }
}

export const signRecognitionService = new SignRecognitionService();
