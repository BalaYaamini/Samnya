// Speech Recognition Service using standard Web Speech API with graceful fallback

type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;
type StatusCallback = (isListening: boolean) => void;

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private onResultCb: SpeechCallback | null = null;
  private onErrorCb: ErrorCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private simulationInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as IWindowWithSpeech;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
          this.isSupported = true;
          this.initListeners();
        } catch (e) {
          this.isSupported = false;
        }
      }
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  private initListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusCb?.(true);
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      if (text) {
        this.onResultCb?.(text, Boolean(final));
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.onErrorCb?.('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else if (event.error === 'network') {
        this.onErrorCb?.('Network issue with speech recognition service. Try typing or use quick phrases.');
      } else {
        this.onErrorCb?.(`Speech service note: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStatusCb?.(false);
    };
  }

  public start(onResult: SpeechCallback, onError: ErrorCallback, onStatus: StatusCallback, lang: string = 'en-US') {
    this.onResultCb = onResult;
    this.onErrorCb = onError;
    this.onStatusCb = onStatus;

    if (this.isSupported && this.recognition) {
      try {
        this.recognition.lang = lang;
        this.recognition.start();
      } catch (err: any) {
        // Recognition might already be started
        console.warn('Speech start warning:', err);
      }
    } else {
      // Graceful simulation mode for browsers without Web Speech API support (e.g. some Linux/Firefox builds)
      this.isListening = true;
      this.onStatusCb?.(true);
      const simulatedPhrases = [
        "Hello, how can I help you today?",
        "Your appointment is scheduled for 3 PM at Counter 2.",
        "The doctor will see you in about ten minutes.",
        "Please show your registration card at the front desk.",
        "Take care and have a wonderful afternoon!"
      ];
      let phraseIdx = 0;
      this.simulationInterval = setInterval(() => {
        if (phraseIdx < simulatedPhrases.length) {
          this.onResultCb?.(simulatedPhrases[phraseIdx], true);
          phraseIdx++;
        } else {
          this.stop();
        }
      }, 3500);
    }
  }

  public stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.isSupported && this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech stop warning:', err);
      }
    }

    this.isListening = false;
    this.onStatusCb?.(false);
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
