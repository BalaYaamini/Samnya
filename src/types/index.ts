export type CommunicationMethod = 'speech' | 'typing' | 'sign' | 'no_speech';

export type UserType = 
  | 'deaf' 
  | 'non_speaking' 
  | 'speech_impaired' 
  | 'hard_of_hearing' 
  | 'hearing_speaking';

export type UserRole = 'user' | 'admin';

export interface PersonaConfig {
  id: UserType;
  emoji: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  keyCapabilities: string[];
  recommendedMethods: CommunicationMethod[];
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  demoUser: {
    name: string;
    email: string;
  };
}

export const USER_PERSONAS: Record<UserType, PersonaConfig> = {
  deaf: {
    id: 'deaf',
    emoji: '🧏',
    title: 'Deaf Users',
    subtitle: 'Sign language, typing & visual communication',
    tagline: 'Visual-first accessibility with sign language ML and live caption displays',
    description: 'May use sign language, typing, or visual communication. Tailored for camera gesture capture, instant full-screen visual message display, and vibration alerts.',
    keyCapabilities: [
      'Sign-to-Text gesture recognition with camera tracking',
      'Real-time speech-to-text transcriptions with speaker turns',
      'Full-screen large card display for quick visual show-and-tell',
      'Visual notification flash & haptic alert feedback'
    ],
    recommendedMethods: ['sign', 'typing'],
    accentColor: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/70',
    badgeText: 'text-blue-700 dark:text-blue-300',
    demoUser: {
      name: 'Aarav Mehta',
      email: 'aarav.deaf@samnya.local'
    }
  },
  non_speaking: {
    id: 'non_speaking',
    emoji: '🔇',
    title: 'Non-Speaking Users',
    subtitle: 'Typing, sign language, or text-to-speech',
    tagline: 'Instant AAC voice vocalizer, quick situational flashcards & gesture translation',
    description: 'Cannot or prefer not to communicate through speech. Equipped with high-fidelity Text-to-Speech output, rapid 1-tap emergency & daily phrase cards, and custom phrase banks.',
    keyCapabilities: [
      'Natural-sounding Text-to-Speech vocalizer with speed/pitch tuning',
      '1-Tap situational quick message cards & urgent phrase builders',
      'Sign-to-voice and text-to-voice instant conversion',
      'Saved emergency cards & medical ID broadcast'
    ],
    recommendedMethods: ['no_speech', 'typing', 'sign'],
    accentColor: 'from-teal-600 to-emerald-600',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/70',
    badgeText: 'text-teal-700 dark:text-teal-300',
    demoUser: {
      name: 'Priya Sharma',
      email: 'priya.nonspeaking@samnya.local'
    }
  },
  speech_impaired: {
    id: 'speech_impaired',
    emoji: '🗣️',
    title: 'Speech-Impaired Users',
    subtitle: 'Alternative communication & speech augmentation',
    tagline: 'Speech augmentation, alternative communication & phrase articulation',
    description: 'Have difficulty producing clear speech. Uses SAMNYA as a reliable expressive bridge with dual voice synthesis, gesture confirmation, and assisted phrase completion.',
    keyCapabilities: [
      'Speech augmentation and dual-mode spoken voice synthesis',
      'Typing to clear speech with repeat and broadcast modes',
      'Predictive quick phrases for transit, shopping, and healthcare',
      'Emergency audio beacon with auto-spoken emergency messages'
    ],
    recommendedMethods: ['typing', 'speech', 'no_speech'],
    accentColor: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
    badgeText: 'text-purple-700 dark:text-purple-300',
    demoUser: {
      name: 'Rohan Patel',
      email: 'rohan.speechassist@samnya.local'
    }
  },
  hard_of_hearing: {
    id: 'hard_of_hearing',
    emoji: '👂',
    title: 'Hard-of-Hearing Users',
    subtitle: 'Live captions & ambient sound alerts',
    tagline: 'High-visibility live transcription & safety sound recognition alerts',
    description: 'May have partial hearing and benefit from real-time live captions and intelligent sound awareness alerts (fire alarms, sirens, doorbells, honking).',
    keyCapabilities: [
      'Continuous Speech-to-Text transcription with adjustable extra-large text',
      'Environmental Sound Awareness (Fire alarm, vehicle horn, doorbell, speech)',
      'Multi-severity sound alerts with visual flashing cues',
      'High-contrast readability mode for busy environments'
    ],
    recommendedMethods: ['speech', 'typing'],
    accentColor: 'from-amber-600 to-orange-600',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-800 dark:text-amber-300',
    demoUser: {
      name: 'Ananya Verma',
      email: 'ananya.hoh@samnya.local'
    }
  },
  hearing_speaking: {
    id: 'hearing_speaking',
    emoji: '👤',
    title: 'Hearing & Speaking Users',
    subtitle: 'Two-way bridge with Deaf & non-speaking friends',
    tagline: 'Speak naturally to transcribe for Deaf peers, listen to synthesized replies',
    description: 'People communicating with Deaf/non-speaking users. Can speak naturally → SAMNYA converts speech to text, or listen as SAMNYA vocalizes text and signs from peers.',
    keyCapabilities: [
      'Two-way conversational split screen (Speaker top, Peer bottom)',
      'High-clarity microphone input with instant visual transcription',
      'Simultaneous text-to-speech player for partner response',
      'Official document & medical form accessible simplifier (Understand module)'
    ],
    recommendedMethods: ['speech'],
    accentColor: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/70',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    demoUser: {
      name: 'Vikram Joshi',
      email: 'vikram.partner@samnya.local'
    }
  }
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
  role: UserRole;
  communication_preferences: CommunicationMethod[];
  created_at?: string;
  updated_at?: string;
}

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface UserSettings {
  text_size: TextSize;
  high_contrast: boolean;
  vibration_enabled: boolean;
  sound_alerts_enabled: boolean;
  language: 'en' | 'hi' | 'te' | 'ta' | 'gu';
  reduced_motion?: boolean;
  visual_alerts?: boolean;
}

export interface QuickMessage {
  id: string;
  user_id?: string;
  message: string;
  category: 'identity' | 'communication' | 'emergency' | 'navigation' | 'general';
  is_custom: boolean;
  is_pinned?: boolean;
  created_at?: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'speaker' | 'user';
  senderName: string;
  method: 'speech' | 'typing' | 'sign';
  text: string;
  timestamp: number;
}

export interface SupportedSign {
  id: string;
  label: string;
  description: string;
  hint: string;
  defaultConfidence: number;
  category: 'greeting' | 'polite' | 'need' | 'response' | 'urgent';
  /**
   * Reflects the actual state of real webcam-based recognition.
   * - 'supported'    : classified by real geometric rules; genuinely works
   * - 'experimental' : classifier included but may be ambiguous in practice
   * - 'unavailable'  : requires motion / Z-depth / not yet implemented
   */
  recognitionStatus?: 'supported' | 'experimental' | 'unavailable';
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface DetectedSound {
  id: string;
  name: string;
  category: 'fire_alarm' | 'vehicle_horn' | 'doorbell' | 'speech' | 'other';
  severity: AlertSeverity;
  description: string;
  actionAdvice: string;
  timestamp: string;
  decibels?: number;
}

export interface DocumentDeadline {
  date: string;
  description: string;
}

export interface DocumentImportantDetails {
  location?: string;
  fees?: string;
  contact?: string;
  eligibility?: string;
}

export interface DocumentAnalysisResult {
  title: string;
  documentType: string;
  simpleExplanation: string;
  keyPoints: string[];
  deadlines: DocumentDeadline[];
  requiredDocuments: string[];
  requiredActions: string[];
  importantDetails: DocumentImportantDetails;
  warnings: string[];
}

export interface DocumentQAEntry {
  question: string;
  answer: string;
  timestamp: number;
}

