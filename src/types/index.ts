export type CommunicationMethod = 'speech' | 'typing' | 'sign' | 'no_speech';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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
}

export interface QuickMessage {
  id: string;
  user_id?: string;
  message: string;
  category: 'identity' | 'communication' | 'emergency' | 'navigation' | 'general';
  is_custom: boolean;
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

export interface DocumentAnalysisResult {
  id: string;
  title: string;
  documentType: string;
  whatIsThis: string;
  whatDoINeed: string[];
  deadline: string;
  whatShouldIDo: string;
  confidenceScore: number;
}
