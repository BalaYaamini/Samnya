import { SupportedSign, QuickMessage, DetectedSound } from '../types';

export const SUPPORTED_SIGNS: SupportedSign[] = [
  // ─── Tier 1: Fully Supported — classified by real geometric rules ───────────
  {
    id: 'help', label: 'Help',
    description: 'Closed fist with thumb pointing UP (classic thumbs-up)',
    hint: 'Make a thumbs-up — fist closed, thumb pointing straight up',
    defaultConfidence: 95, category: 'urgent', recognitionStatus: 'supported',
  },
  {
    id: 'stop', label: 'Stop',
    description: 'Flat open hand, all 4 fingers extended and held together',
    hint: 'Open flat hand, fingers together (not spread), palm forward',
    defaultConfidence: 99, category: 'urgent', recognitionStatus: 'supported',
  },
  {
    id: 'water', label: 'Water',
    description: 'W-handshape: index, middle, and ring fingers extended; pinky curled',
    hint: 'Extend index + middle + ring fingers (W shape), curl pinky',
    defaultConfidence: 91, category: 'need', recognitionStatus: 'supported',
  },
  {
    id: 'no', label: 'No',
    description: 'Index and middle fingers extended (V/scissors shape), rest curled',
    hint: 'Extend index + middle only (peace/scissors sign), curl ring + pinky',
    defaultConfidence: 93, category: 'response', recognitionStatus: 'supported',
  },
  {
    id: 'food', label: 'Food / Eat',
    description: 'All five fingertips clustered closely together (pinch/bunch gesture)',
    hint: 'Bring all fingertips together in a tight pinch toward mouth',
    defaultConfidence: 95, category: 'need', recognitionStatus: 'supported',
  },
  // ─── Tier 2: Experimental — classifier exists but may overlap in some poses ─
  {
    id: 'yes', label: 'Yes',
    description: 'Closed fist (all fingers curled), thumb alongside — NOT pointing up',
    hint: 'Make a fist with thumb resting against the side, not raised',
    defaultConfidence: 98, category: 'response', recognitionStatus: 'experimental',
  },
  {
    id: 'hello', label: 'Hello',
    description: 'Open hand wave, all 5 fingers extended AND spread wide apart',
    hint: 'Fully open hand with fingers spread wide (more spread than Stop)',
    defaultConfidence: 96, category: 'greeting', recognitionStatus: 'experimental',
  },
  // ─── Tier 3: Unavailable — requires motion or Z-depth not reliably measurable
  {
    id: 'thank_you', label: 'Thank you',
    description: 'Fingertips touch chin then move forward — requires motion',
    hint: 'Touch chin and bring hand open outward',
    defaultConfidence: 94, category: 'polite', recognitionStatus: 'unavailable',
  },
  {
    id: 'emergency', label: 'Emergency',
    description: 'Shaking E-handshape — requires motion; static pose too ambiguous',
    hint: 'Shake closed fingers side to side rapidly',
    defaultConfidence: 97, category: 'urgent', recognitionStatus: 'unavailable',
  },
  {
    id: 'please', label: 'Please',
    description: 'Flat palm rubbing chest — requires Z-depth (palm facing body)',
    hint: 'Rub flat palm gently clockwise over chest',
    defaultConfidence: 92, category: 'polite', recognitionStatus: 'unavailable',
  },
];

export const DEFAULT_QUICK_MESSAGES: QuickMessage[] = [
  { id: 'qm-1', message: 'I am Deaf.', category: 'identity', is_custom: false },
  { id: 'qm-2', message: 'I am non-speaking.', category: 'identity', is_custom: false },
  { id: 'qm-3', message: 'Please type your response.', category: 'communication', is_custom: false },
  { id: 'qm-4', message: 'Please speak slowly so I can read.', category: 'communication', is_custom: false },
  { id: 'qm-5', message: 'I need assistance.', category: 'emergency', is_custom: false },
  { id: 'qm-6', message: 'I need medical help immediately.', category: 'emergency', is_custom: false },
  { id: 'qm-7', message: 'Where is the restroom?', category: 'navigation', is_custom: false },
  { id: 'qm-8', message: 'Where is the emergency exit?', category: 'navigation', is_custom: false },
  { id: 'qm-9', message: 'Please call my family or contact.', category: 'emergency', is_custom: false },
  { id: 'qm-10', message: 'Thank you for your patience.', category: 'general', is_custom: false },
  { id: 'qm-11', message: 'I communicate via text and sign.', category: 'identity', is_custom: false },
  { id: 'qm-12', message: 'Could you write that down?', category: 'communication', is_custom: false },
  { id: 'qm-13', message: 'Please write this down.', category: 'communication', is_custom: false },
  { id: 'qm-14', message: 'Please call my emergency contact.', category: 'emergency', is_custom: false },
];

export const DEMO_SOUND_SCENARIOS: DetectedSound[] = [
  {
    id: 'snd-fire',
    name: 'Fire Alarm Siren',
    category: 'fire_alarm',
    severity: 'critical',
    description: 'Fire alarm detected nearby.',
    actionAdvice: 'Move immediately to the nearest marked emergency exit. Do not use elevators.',
    timestamp: 'Just now',
    decibels: 92
  },
  {
    id: 'snd-horn',
    name: 'Vehicle Horn / Traffic Alert',
    category: 'vehicle_horn',
    severity: 'warning',
    description: 'Vehicle horn detected.',
    actionAdvice: 'Look around before stepping or crossing the road.',
    timestamp: '2 mins ago',
    decibels: 86
  },
  {
    id: 'snd-doorbell',
    name: 'Front Doorbell Chime',
    category: 'doorbell',
    severity: 'info',
    description: 'Someone is at your door.',
    actionAdvice: 'Someone is at your door. Check intercom or visitor screen.',
    timestamp: '5 mins ago',
    decibels: 68
  },
  {
    id: 'snd-speech',
    name: 'Urgent Voice / Name Called',
    category: 'speech',
    severity: 'warning',
    description: 'Someone nearby is calling for your attention.',
    actionAdvice: 'Someone nearby may be attempting to get your attention.',
    timestamp: '12 mins ago',
    decibels: 74
  }
];

