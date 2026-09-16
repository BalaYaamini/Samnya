import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_PERSONAS, UserType } from '../types';
import { Logo } from '../components/common/Logo';
import { 
  ShieldCheck, 
  Users, 
  BellRing, 
  HandMetal, 
  MessageSquare, 
  Database, 
  Server, 
  ArrowLeft, 
  CheckCircle2, 
  Volume2, 
  ExternalLink,
  Search
} from 'lucide-react';

interface AdminDashboardPageProps {
  onBackToApp: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToApp }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'sounds' | 'gestures' | 'aac' | 'system'>('analytics');
  const [soundSearch, setSoundSearch] = useState('');
  const [testAlertNotice, setTestAlertNotice] = useState<string | null>(null);

  // Mock sounds database in Admin
  const soundLibrary: Array<{ id: string; name: string; category: string; severity: string; dbThreshold: number; haptic: string; active: boolean }> = [
    { id: 'snd-1', name: 'Smoke & Fire Alarm Pattern', category: 'fire_alarm', severity: 'critical', dbThreshold: 85, haptic: 'triple_pulse', active: true },
    { id: 'snd-2', name: 'Emergency Vehicle Siren (Ambulance/Police)', category: 'siren', severity: 'critical', dbThreshold: 80, haptic: 'rapid_vibe', active: true },
    { id: 'snd-3', name: 'Vehicle Horn / Traffic Danger', category: 'vehicle_horn', severity: 'warning', dbThreshold: 75, haptic: 'double_pulse', active: true },
    { id: 'snd-4', name: 'Doorbell Chime / Knocking', category: 'doorbell', severity: 'info', dbThreshold: 60, haptic: 'single_pulse', active: true },
    { id: 'snd-5', name: 'Human Speech / Shouting in Vicinity', category: 'speech', severity: 'info', dbThreshold: 65, haptic: 'gentle_wave', active: true },
    { id: 'snd-6', name: 'Glass Break / Impact Acoustic Event', category: 'other', severity: 'critical', dbThreshold: 78, haptic: 'triple_pulse', active: true }
  ];

  // Mock gestures library in Admin
  const gestureModels: Array<{ id: string; name: string; category: string; minConfidence: number; keypoints: number; trainedSamples: number; status: 'live' | 'beta' }> = [
    { id: 'gest-1', name: 'Open Hand Wave (Hello / Greeting)', category: 'greeting', minConfidence: 85, keypoints: 21, trainedSamples: 4200, status: 'live' },
    { id: 'gest-2', name: 'Hand on Chest (Thank You)', category: 'polite', minConfidence: 88, keypoints: 21, trainedSamples: 3800, status: 'live' },
    { id: 'gest-3', name: 'Raised Fist / Open Palm (Help / Urgent)', category: 'urgent', minConfidence: 92, keypoints: 21, trainedSamples: 5100, status: 'live' },
    { id: 'gest-4', name: 'Thumbs Up (Yes / Confirm)', category: 'response', minConfidence: 90, keypoints: 21, trainedSamples: 3600, status: 'live' },
    { id: 'gest-5', name: 'Thumbs Down (No / Decline)', category: 'response', minConfidence: 90, keypoints: 21, trainedSamples: 3400, status: 'live' },
    { id: 'gest-6', name: 'W-Handshape to Chin (Water)', category: 'need', minConfidence: 82, keypoints: 21, trainedSamples: 2900, status: 'live' },
    { id: 'gest-7', name: 'Crossed Arms (Emergency / Medical)', category: 'urgent', minConfidence: 94, keypoints: 21, trainedSamples: 4800, status: 'live' }
  ];

  const userDistribution: Array<{ type: UserType; count: number; percentage: number; color: string }> = [
    { type: 'deaf', count: 1420, percentage: 38, color: 'bg-blue-600' },
    { type: 'non_speaking', count: 910, percentage: 24, color: 'bg-teal-500' },
    { type: 'speech_impaired', count: 610, percentage: 16, color: 'bg-purple-500' },
    { type: 'hard_of_hearing', count: 530, percentage: 14, color: 'bg-amber-500' },
    { type: 'hearing_speaking', count: 310, percentage: 8, color: 'bg-cyan-500' }
  ];

  const triggerTestAlert = (soundName: string) => {
    setTestAlertNotice(`Triggered simulated environmental alert broadcast: "${soundName}"`);
    setTimeout(() => setTestAlertNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#070D1E]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to User Experience View"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Logo variant="combo" size="sm" badge="ADMIN PORTAL" showSubtitle={true} subtitleText="Platform Operations & Accessibility Intelligence" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Switch to User View</span>
            </button>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Banner with Admin Profile */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0C1733] to-[#132347] p-6 rounded-3xl border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>SAMNYA Administrative Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Accessibility Engine Telemetry & Governance
            </h1>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-teal-300">{user?.name || 'Administrator'}</strong> ({user?.email}) • Role: Full Admin Authority
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>AI Models Online</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/70 border border-blue-800/80 text-blue-300 text-xs font-bold">
              <Server className="w-3.5 h-3.5" />
              <span>5 Personas Active</span>
            </div>
          </div>
        </div>

        {/* Global Alert Notification if triggered */}
        {testAlertNotice && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{testAlertNotice}</span>
            </div>
            <button onClick={() => setTestAlertNotice(null)} className="text-amber-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Active Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">3,780</div>
            <div className="text-[11px] text-teal-400 font-medium mt-1">Across all 5 accessibility types</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Sound AI Triggers</span>
              <BellRing className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">14,290</div>
            <div className="text-[11px] text-amber-300 font-medium mt-1">Environmental acoustic alerts</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Gesture Core ML</span>
              <HandMetal className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">94.8%</div>
            <div className="text-[11px] text-purple-300 font-medium mt-1">Mean landmark tracking accuracy</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">AAC Syntheses</span>
              <Volume2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">28.4k</div>
            <div className="text-[11px] text-teal-300 font-medium mt-1">Spoken voice outputs generated</div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
          {[
            { id: 'analytics', label: '5-User Accessibility Demographics', icon: Users },
            { id: 'sounds', label: 'Sound Recognition Library', icon: BellRing },
            { id: 'gestures', label: 'Sign Language ML Core', icon: HandMetal },
            { id: 'aac', label: 'AAC Quick Phrases & Flashcards', icon: MessageSquare },
            { id: 'system', label: 'Infrastructure & Security Logs', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 5-User Demographics & Persona Breakdown */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 5 User Type Grid */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>The 5 Core SAMNYA User Personas — Demographics & Utilization</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Detailed distribution and communication preferences across the 5 accessibility profiles.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Total Managed Users: 3,780
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex">
                  {userDistribution.map((item) => (
                    <div
                      key={item.type}
                      className={`${item.color} h-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                      title={`${USER_PERSONAS[item.type].title}: ${item.percentage}% (${item.count} users)`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  {userDistribution.map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-semibold text-slate-300">{USER_PERSONAS[item.type].emoji} {USER_PERSONAS[item.type].title}</span>
                      <span className="text-slate-500 font-mono">({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed 5 Personas Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {(Object.keys(USER_PERSONAS) as UserType[]).map((typeKey) => {
                  const persona = USER_PERSONAS[typeKey];
                  const stat = userDistribution.find(d => d.type === typeKey);
                  return (
                    <div key={typeKey} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{persona.emoji}</span>
                            <div>
                              <h3 className="font-extrabold text-sm text-white">{persona.title}</h3>
                              <p className="text-[11px] text-slate-400">{persona.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {stat?.count} users
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {persona.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Capabilities:</div>
                          <ul className="space-y-1 text-xs text-slate-400">
                            {persona.keyCapabilities.slice(0, 3).map((cap, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                                <span>{cap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono text-[11px]">{persona.demoUser.email}</span>
                        <span className="text-xs font-bold text-teal-400">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Sound Recognition Library */}
        {activeTab === 'sounds' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-400" />
                    <span>Environmental Sound Awareness Trigger Matrix</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Acoustic event classifier library for Hard-of-Hearing and Deaf user safety.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={soundSearch}
                      onChange={(e) => setSoundSearch(e.target.value)}
                      placeholder="Search sound frequency..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sound Triggers Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Sound Profile</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">dB Threshold</th>
                      <th className="p-3.5">Haptic Pattern</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {soundLibrary
                      .filter(s => s.name.toLowerCase().includes(soundSearch.toLowerCase()))
                      .map((snd) => (
                        <tr key={snd.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 text-white font-bold">{snd.name}</td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">{snd.category}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              snd.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                              snd.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {snd.severity}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 font-mono">{snd.dbThreshold} dB</td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">{snd.haptic}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => triggerTestAlert(snd.name)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors"
                            >
                              Test Trigger
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Sign Language ML Core */}
        {activeTab === 'gestures' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <HandMetal className="w-5 h-5 text-purple-400" />
                    <span>Sign-to-Text Landmark Recognition Models</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    21-Keypoint hand mesh tracking & confidence calibration weights.
                  </p>
                </div>
                <div className="text-xs font-bold text-purple-300 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
                  Engine: MediaPipe Hands v0.10 + SAMNYA Landmark Classifier
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {gestureModels.map((g) => (
                  <div key={g.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">{g.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold uppercase">
                        {g.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                      <div>Confidence: <strong className="text-slate-200">{g.minConfidence}%</strong></div>
                      <div>Samples: <strong className="text-slate-200">{g.trainedSamples}</strong></div>
                      <div>Keypoints: <strong className="text-slate-200">{g.keypoints} pts</strong></div>
                      <div>Category: <strong className="text-slate-200">{g.category}</strong></div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${g.minConfidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AAC Quick Phrases & Flashcards */}
        {activeTab === 'aac' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                    <span>AAC Communication Flashcards & Pre-Approved Phrases</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verified quick cards for Non-Speaking and Speech-Impaired users.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { cat: 'Emergency', phrase: 'I need urgent medical help. Please call 108 or an ambulance.', color: 'border-red-600/50 bg-red-950/20' },
                  { cat: 'Identity', phrase: 'I am Deaf. Please type or write your reply.', color: 'border-blue-600/50 bg-blue-950/20' },
                  { cat: 'Identity', phrase: 'I do not use speech. I communicate through this device.', color: 'border-teal-600/50 bg-teal-950/20' },
                  { cat: 'Transit', phrase: 'Could you tell me what the next station announcement was?', color: 'border-amber-600/50 bg-amber-950/20' },
                  { cat: 'Healthcare', phrase: 'Here is my prescription. Please write instructions clearly.', color: 'border-purple-600/50 bg-purple-950/20' },
                  { cat: 'Everyday', phrase: 'Thank you for your patience and clear communication.', color: 'border-emerald-600/50 bg-emerald-950/20' }
                ].map((card, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${card.color} space-y-2`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.cat}</span>
                    <p className="text-xs font-semibold text-slate-200">"{card.phrase}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: System Health & Infrastructure */}
        {activeTab === 'system' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span>Backend Infrastructure & API Diagnostics</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Database Layer</div>
                  <div className="text-sm font-bold text-teal-300">Supabase PostgreSQL Schema v1.0</div>
                  <p className="text-xs text-slate-400">
                    Tables: `profiles`, `custom_quick_messages`, `sound_alerts_log`, `emergency_contacts`.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Speech Synthesis & Recognition</div>
                  <div className="text-sm font-bold text-blue-300">Web Speech API + Simulated Fallback Stream</div>
                  <p className="text-xs text-slate-400">
                    Dual speech engines active with 100% offline fallback compatibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
