import { SupportedSign, QuickMessage, DetectedSound, DocumentAnalysisResult } from '../types';

export const SUPPORTED_SIGNS: SupportedSign[] = [
  { id: 'hello', label: 'Hello', description: 'Open hand wave near temple/forehead', hint: 'Wave palm outward at eye level', defaultConfidence: 96, category: 'greeting' },
  { id: 'thank_you', label: 'Thank you', description: 'Fingertips touch chin then move forward toward the other person', hint: 'Touch chin and bring hand open outward', defaultConfidence: 94, category: 'polite' },
  { id: 'help', label: 'Help', description: 'Closed fist with thumb up resting on flat opposite palm, lifted together', hint: 'Rest thumbs-up on flat open palm', defaultConfidence: 95, category: 'urgent' },
  { id: 'yes', label: 'Yes', description: 'Fist nodding up and down like a head nod', hint: 'Nod closed fist up and down twice', defaultConfidence: 98, category: 'response' },
  { id: 'no', label: 'No', description: 'Index and middle finger snap down against thumb', hint: 'Snap index and middle finger to thumb', defaultConfidence: 93, category: 'response' },
  { id: 'water', label: 'Water', description: 'W-handshape tapping near the corner of the mouth', hint: 'Tap three fingers (W) against lower lip', defaultConfidence: 91, category: 'need' },
  { id: 'food', label: 'Food / Eat', description: 'Fingertips grouped together brought to mouth repeatedly', hint: 'Bring gathered fingertips to lips', defaultConfidence: 95, category: 'need' },
  { id: 'emergency', label: 'Emergency', description: 'Shaking E-handshape side to side urgently', hint: 'Shake closed fingers side to side rapidly', defaultConfidence: 97, category: 'urgent' },
  { id: 'stop', label: 'Stop', description: 'Edge of open hand chops straight down onto flat palm', hint: 'Chop edge of one hand into palm of other', defaultConfidence: 99, category: 'urgent' },
  { id: 'please', label: 'Please', description: 'Flat palm rubbing in circular motion on chest', hint: 'Rub flat palm gently clockwise over chest', defaultConfidence: 92, category: 'polite' },
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
];

export const DEMO_SOUND_SCENARIOS: DetectedSound[] = [
  {
    id: 'snd-fire',
    name: 'Fire Alarm Siren',
    category: 'fire_alarm',
    severity: 'critical',
    description: 'Continuous high-pitch 85dB oscillating siren pattern detected.',
    actionAdvice: 'Move immediately to the nearest marked emergency exit. Do not use elevators.',
    timestamp: 'Just now',
    decibels: 92
  },
  {
    id: 'snd-horn',
    name: 'Vehicle Horn / Traffic Alert',
    category: 'vehicle_horn',
    severity: 'warning',
    description: 'Loud sudden acoustic blast detected nearby (2-3 meters).',
    actionAdvice: 'Look around before stepping or crossing the road.',
    timestamp: '2 mins ago',
    decibels: 86
  },
  {
    id: 'snd-doorbell',
    name: 'Front Doorbell Chime',
    category: 'doorbell',
    severity: 'info',
    description: 'Two-tone chime sequence detected at main entrance.',
    actionAdvice: 'Someone is at your door. Check intercom or visitor screen.',
    timestamp: '5 mins ago',
    decibels: 68
  },
  {
    id: 'snd-speech',
    name: 'Urgent Voice / Name Called',
    category: 'speech',
    severity: 'warning',
    description: 'Elevated vocal tone directed within your close acoustic field.',
    actionAdvice: 'Someone nearby may be attempting to get your attention.',
    timestamp: '12 mins ago',
    decibels: 74
  }
];

export const SAMPLE_DOCUMENTS: DocumentAnalysisResult[] = [
  {
    id: 'doc-hospital',
    title: 'Hospital Outpatient Appointment Slip',
    documentType: 'Medical Appointment',
    whatIsThis: 'National Health City Hospital Consultation Slip for Dr. S. Ramanathan (Neurology)',
    whatDoINeed: [
      'Original Aadhaar card or Government ID',
      'Previous CT Scan / MRI Medical Records',
      'Hospital Registration Slip with token #B-42'
    ],
    deadline: 'Tomorrow, 15 September at 03:00 PM',
    whatShouldIDo: 'Arrive 20 minutes early. Proceed directly to Consultation Counter 3 on the 2nd Floor.',
    confidenceScore: 97
  },
  {
    id: 'doc-rx',
    title: 'Prescription & Dosage Instructions',
    documentType: 'Medication Schedule',
    whatIsThis: 'Post-consultation medication instruction sheet for 10-day recovery cycle',
    whatDoINeed: [
      'Tab Amox-500: Take 1 tablet twice daily after meals (morning and night)',
      'Tab Paracip: Take 1 tablet only if fever exceeds 100°F',
      'Drink at least 2.5 litres of clean water daily'
    ],
    deadline: 'Course completes in 10 days (25 September)',
    whatShouldIDo: 'Purchase from hospital pharmacy at Desk G. Do not stop antibiotic course prematurely.',
    confidenceScore: 95
  },
  {
    id: 'doc-govt',
    title: 'UDID Disability Card Renewal Notice',
    documentType: 'Government Notice',
    whatIsThis: 'Official Department of Empowerment of Persons with Disabilities Verification Form',
    whatDoINeed: [
      'Current UDID Card / Certificate copy',
      'Proof of current residence',
      'Recent passport photograph (white background)'
    ],
    deadline: 'Submission due before 30 October 2026',
    whatShouldIDo: 'Upload documents online at swavlambancard.gov.in or visit District Disability Rehabilitation Centre.',
    confidenceScore: 98
  }
];
