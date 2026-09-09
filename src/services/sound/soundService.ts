// Sound Awareness Service with Web Audio API Analyser & Vibration triggers
// Prototype sound recognition engine with live microphone decibel visualizer

import { DetectedSound } from '../../types';
import { DEMO_SOUND_SCENARIOS } from '../../data/mockData';

type SoundAlertCallback = (alert: DetectedSound) => void;
type DecibelCallback = (decibels: number, audioData: Uint8Array) => void;

export class SoundDetectionService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  private onAlertCallbacks: Set<SoundAlertCallback> = new Set();
  private onDecibelCallback: DecibelCallback | null = null;

  public async startListening(onDecibels?: DecibelCallback): Promise<{ success: boolean; error?: string }> {
    this.onDecibelCallback = onDecibels || null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.isListening = true;
        this.startSimulatedDecibels();
        return { success: true };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.isListening = true;
      this.pollAudioStream();
      return { success: true };
    } catch (err: any) {
      console.warn('Microphone access for sound awareness unavailable, entering simulated visualizer:', err);
      this.isListening = true;
      this.startSimulatedDecibels();
      return { 
        success: true, 
        error: 'Microphone permission was not granted. Switched to simulated acoustic monitor.' 
      };
    }
  }

  private pollAudioStream() {
    if (!this.analyser || !this.isListening) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const update = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Compute average decibels
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Map 0-255 to ~30-95 dB
      const estimatedDb = Math.round(35 + (avg / 255) * 60);

      this.onDecibelCallback?.(estimatedDb, dataArray);
      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private startSimulatedDecibels() {
    let baseDb = 42;
    const interval = setInterval(() => {
      if (!this.isListening) {
        clearInterval(interval);
        return;
      }
      const variance = Math.floor(Math.random() * 14) - 7;
      const db = Math.max(35, Math.min(85, baseDb + variance));
      const simulatedArray = new Uint8Array(32).map(() => Math.floor(Math.random() * (db * 2.5)));
      this.onDecibelCallback?.(db, simulatedArray);
    }, 150);
  }

  public stopListening() {
    this.isListening = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  public triggerSoundAlert(scenarioId?: string): DetectedSound {
    let alert: DetectedSound;
    if (scenarioId) {
      alert = DEMO_SOUND_SCENARIOS.find(s => s.id === scenarioId) || DEMO_SOUND_SCENARIOS[0];
    } else {
      const idx = Math.floor(Math.random() * DEMO_SOUND_SCENARIOS.length);
      alert = DEMO_SOUND_SCENARIOS[idx];
    }

    const instance: DetectedSound = {
      ...alert,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Trigger Device Vibration API if supported
    this.vibrateDevice(alert.severity);

    // Notify listeners
    this.onAlertCallbacks.forEach(cb => cb(instance));
    return instance;
  }

  public vibrateDevice(severity: 'critical' | 'warning' | 'info') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (severity === 'critical') {
          // Urgent pattern: 400ms on, 100ms off, 400ms on, 100ms off, 800ms on
          navigator.vibrate([400, 100, 400, 100, 800]);
        } else if (severity === 'warning') {
          navigator.vibrate([250, 150, 250]);
        } else {
          navigator.vibrate(200);
        }
      } catch (e) {
        console.warn('Vibration not permitted or supported:', e);
      }
    }
  }

  public subscribeAlerts(cb: SoundAlertCallback): () => void {
    this.onAlertCallbacks.add(cb);
    return () => this.onAlertCallbacks.delete(cb);
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const soundDetectionService = new SoundDetectionService();
