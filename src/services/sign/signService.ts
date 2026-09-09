// Sign Recognition Service Interface and Camera Abstraction
// Note: Initial MVP uses clean service abstraction ready for computer-vision model integration.

import { SUPPORTED_SIGNS } from '../../data/mockData';
import { SupportedSign } from '../../types';

export interface SignRecognitionResult {
  sign: SupportedSign;
  confidence: number; // e.g. 94%
  timestamp: number;
  landmarksDetected: boolean;
}

export class SignRecognitionService {
  private mediaStream: MediaStream | null = null;
  private isAnalyzing: boolean = false;

  public async requestCamera(): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { success: false, error: 'Camera access is not supported in this browser. You can still use manual gesture selection.' };
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
        message = 'Camera permission was denied. Please allow camera access in your browser settings to test Sign → Text.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera device found on this system. You can still test signs with simulated camera detection.';
      }
      return { success: false, error: message };
    }
  }

  public stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isAnalyzing = false;
  }

  public getSupportedSigns(): SupportedSign[] {
    return SUPPORTED_SIGNS;
  }

  /**
   * Prototype sign analysis step.
   * Connects to camera stream landmarks in production.
   * Clearly marked as Prototype AI Model Abstraction.
   */
  public async detectSign(preferredSignId?: string): Promise<SignRecognitionResult> {
    this.isAnalyzing = true;
    
    // Simulate real neural network inference latency (500-900ms)
    await new Promise(resolve => setTimeout(resolve, 650));

    let chosenSign: SupportedSign;
    if (preferredSignId) {
      chosenSign = SUPPORTED_SIGNS.find(s => s.id === preferredSignId) || SUPPORTED_SIGNS[0];
    } else {
      // Pick a realistic sign
      const idx = Math.floor(Math.random() * SUPPORTED_SIGNS.length);
      chosenSign = SUPPORTED_SIGNS[idx];
    }

    // Realistic confidence variance (91% - 98%)
    const variance = Math.floor(Math.random() * 6) - 2;
    const confidence = Math.min(99, Math.max(88, chosenSign.defaultConfidence + variance));

    this.isAnalyzing = false;
    return {
      sign: chosenSign,
      confidence,
      timestamp: Date.now(),
      landmarksDetected: true
    };
  }

  public getIsAnalyzing(): boolean {
    return this.isAnalyzing;
  }
}

export const signRecognitionService = new SignRecognitionService();
