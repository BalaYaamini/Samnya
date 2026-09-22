import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, StoredAccount } from '../services/auth/authService';
import { isSupabaseConfigured } from '../lib/supabase';
import { USER_PERSONAS, UserType, UserRole, CommunicationMethod } from '../types';
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
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Edit3,
  Eye,
  UserPlus,
  Shield,
  UserCheck,
  Check,
  X,
  Sparkles,
  Mail,
  Lock,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  Globe,
  Radio
} from 'lucide-react';

interface AdminDashboardPageProps {
  onBackToApp: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToApp }) => {
  const { user, signOut, signInAsDemoPersona } = useAuth();
  
  // Active Tab: 'users' | 'analytics' | 'sounds' | 'gestures' | 'aac' | 'system'
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'sounds' | 'gestures' | 'aac' | 'system'>('users');
  
  // User Registry State
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [personaFilter, setPersonaFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  // Modals and Action States
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<StoredAccount | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<StoredAccount | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [actionErrorNotice, setActionErrorNotice] = useState<string | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('2026');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserType, setNewUserType] = useState<UserType>('deaf');
  const [newUserMethods, setNewUserMethods] = useState<CommunicationMethod[]>(['sign', 'typing']);
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  // Sound and Gesture Telemetry State
  const [soundSearch, setSoundSearch] = useState('');
  const [testAlertNotice, setTestAlertNotice] = useState<string | null>(null);

  // Load all accounts on mount & provide refresh
  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await authService.fetchAllAccounts();
      setAccounts(data);
    } catch (e) {
      console.warn('Failed to load accounts in Admin:', e);
      setAccounts(authService.getStoredAccounts());
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorNotice(msg);
      setTimeout(() => setActionErrorNotice(null), 4500);
    } else {
      setActionSuccessNotice(msg);
      setTimeout(() => setActionSuccessNotice(null), 4000);
    }
  };

  // Sound Library Database in Admin
  const soundLibrary: Array<{ id: string; name: string; category: string; severity: string; dbThreshold: number; haptic: string; active: boolean }> = [
    { id: 'snd-1', name: 'Smoke & Fire Alarm Pattern', category: 'fire_alarm', severity: 'critical', dbThreshold: 85, haptic: 'triple_pulse', active: true },
    { id: 'snd-2', name: 'Emergency Vehicle Siren (Ambulance/Police)', category: 'siren', severity: 'critical', dbThreshold: 80, haptic: 'rapid_vibe', active: true },
    { id: 'snd-3', name: 'Vehicle Horn / Traffic Danger', category: 'vehicle_horn', severity: 'warning', dbThreshold: 75, haptic: 'double_pulse', active: true },
    { id: 'snd-4', name: 'Doorbell Chime / Knocking', category: 'doorbell', severity: 'info', dbThreshold: 60, haptic: 'single_pulse', active: true },
    { id: 'snd-5', name: 'Human Speech / Shouting in Vicinity', category: 'speech', severity: 'info', dbThreshold: 65, haptic: 'gentle_wave', active: true },
    { id: 'snd-6', name: 'Glass Break / Impact Acoustic Event', category: 'other', severity: 'critical', dbThreshold: 78, haptic: 'triple_pulse', active: true }
  ];

  // Gestures Library in Admin
  const gestureModels: Array<{ id: string; name: string; category: string; minConfidence: number; keypoints: number; trainedSamples: number; status: 'live' | 'beta' }> = [
    { id: 'gest-1', name: 'Open Hand Wave (Hello / Greeting)', category: 'greeting', minConfidence: 85, keypoints: 21, trainedSamples: 4200, status: 'live' },
    { id: 'gest-2', name: 'Hand on Chest (Thank You)', category: 'polite', minConfidence: 88, keypoints: 21, trainedSamples: 3800, status: 'live' },
    { id: 'gest-3', name: 'Raised Fist / Open Palm (Help / Urgent)', category: 'urgent', minConfidence: 92, keypoints: 21, trainedSamples: 5100, status: 'live' },
    { id: 'gest-4', name: 'Thumbs Up (Yes / Confirm)', category: 'response', minConfidence: 90, keypoints: 21, trainedSamples: 3600, status: 'live' },
    { id: 'gest-5', name: 'Thumbs Down (No / Decline)', category: 'response', minConfidence: 90, keypoints: 21, trainedSamples: 3400, status: 'live' },
    { id: 'gest-6', name: 'W-Handshape to Chin (Water)', category: 'need', minConfidence: 82, keypoints: 21, trainedSamples: 2900, status: 'live' },
    { id: 'gest-7', name: 'Crossed Arms (Emergency / Medical)', category: 'urgent', minConfidence: 94, keypoints: 21, trainedSamples: 4800, status: 'live' }
  ];

  // Dynamic user demographic counts calculated from real accounts
  const demographicStats = useMemo(() => {
    const total = accounts.length || 1;
    const counts: Record<UserType, number> = {
      deaf: 0,
      non_speaking: 0,
      speech_impaired: 0,
      hard_of_hearing: 0,
      hearing_speaking: 0
    };

    let adminsCount = 0;
    let googleCount = 0;

    accounts.forEach(acc => {
      if (counts[acc.userType] !== undefined) {
        counts[acc.userType]++;
      }
      if (acc.role === 'admin') adminsCount++;
      if (acc.isGoogleAccount) googleCount++;
    });

    const colors: Record<UserType, string> = {
      deaf: 'bg-blue-500',
      non_speaking: 'bg-teal-500',
      speech_impaired: 'bg-purple-500',
      hard_of_hearing: 'bg-amber-500',
      hearing_speaking: 'bg-cyan-500'
    };

    const distribution = (Object.keys(counts) as UserType[]).map(typeKey => ({
      type: typeKey,
      count: counts[typeKey],
      percentage: Math.max(Math.round((counts[typeKey] / total) * 100), counts[typeKey] > 0 ? 5 : 0),
      color: colors[typeKey]
    }));

    return {
      totalUsers: accounts.length,
      adminsCount,
      googleCount,
      counts,
      distribution
    };
  }, [accounts]);

  // Filtered accounts list for the Users directory
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      // 1. Search filter
      const searchLower = userSearch.toLowerCase().trim();
      if (searchLower) {
        const matchesName = acc.name?.toLowerCase().includes(searchLower);
        const matchesEmail = acc.email?.toLowerCase().includes(searchLower);
        const matchesId = acc.id?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      // 2. Persona filter
      if (personaFilter !== 'all' && acc.userType !== personaFilter) {
        return false;
      }

      // 3. Role filter
      if (roleFilter !== 'all' && acc.role !== roleFilter) {
        return false;
      }

      // 4. Auth filter
      if (authFilter === 'google' && !acc.isGoogleAccount) return false;
      if (authFilter === 'demo' && !acc.id.startsWith('demo-')) return false;
      if (authFilter === 'registered' && (acc.isGoogleAccount || acc.id.startsWith('demo-'))) return false;

      return true;
    });
  }, [accounts, userSearch, personaFilter, roleFilter, authFilter]);

  // Handle Adding a new user directly
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showNotification('Please provide both full name and email address.', true);
      return;
    }

    setIsSubmittingNewUser(true);
    try {
      const res = await authService.adminCreateAccount({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword || '2026',
        role: newUserRole,
        userType: newUserType,
        communicationPreferences: newUserMethods
      });

      if (res.success && res.account) {
        showNotification(`Successfully created user "${res.account.name}"!`);
        setIsAddUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('2026');
        loadAccounts();
      } else {
        showNotification(res.error || 'Failed to create user.', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error creating user.', true);
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  // Handle Editing an existing user
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      await authService.updateAccount(selectedUserForEdit);
      showNotification(`Updated profile for ${selectedUserForEdit.name}!`);
      setSelectedUserForEdit(null);
      loadAccounts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update user profile.', true);
    }
  };

  // Handle Deleting a user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await authService.deleteAccount(userToDelete.id);
      if (res.success) {
        showNotification(`Removed user "${userToDelete.name}" (${userToDelete.email}).`);
        setUserToDelete(null);
        loadAccounts();
      } else {
        showNotification(res.error || 'Cannot delete this account.', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error deleting account.', true);
    }
  };

  // Handle Exporting User List to JSON file
  const handleExportUsers = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `samnya_users_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification(`Exported ${accounts.length} user records to JSON.`);
    } catch (e) {
      showNotification('Export failed.', true);
    }
  };

  const triggerTestAlert = (soundName: string) => {
    setTestAlertNotice(`Triggered simulated environmental alert broadcast: "${soundName}"`);
    setTimeout(() => setTestAlertNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050A18]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-sm"
              title="Return to User Experience View"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Logo 
              variant="combo" 
              size="sm" 
              badge="ADMIN PORTAL" 
              showSubtitle={true} 
              subtitleText="Platform Governance & User Registry" 
            />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch to User View</span>
              <span className="sm:hidden">App View</span>
            </button>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/70 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Banner with Admin Profile & Telemetry */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0B1530] to-[#12224A] p-6 rounded-3xl border border-blue-800/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>SAMNYA Administrative Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Platform Users & Telemetry Governance</span>
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span>Logged in as <strong className="text-teal-300 font-bold">{user?.name || 'Administrator'}</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">{user?.email}</span>
              <span className="text-slate-500">•</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-700/60 font-semibold text-[10px] uppercase">
                Full Root Authority
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Vault Active'}</span>
            </div>
            <button
              onClick={loadAccounts}
              disabled={isLoadingAccounts}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm"
              title="Refresh all user accounts from registry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAccounts ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>Sync Users</span>
            </button>
          </div>
        </div>

        {/* Action / Error Toast Notifications */}
        {actionSuccessNotice && (
          <div className="p-4 rounded-2xl bg-teal-950/80 border border-teal-500/50 text-teal-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>{actionSuccessNotice}</span>
            </div>
            <button onClick={() => setActionSuccessNotice(null)} className="text-teal-400 hover:text-white ml-2">✕</button>
          </div>
        )}

        {actionErrorNotice && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{actionErrorNotice}</span>
            </div>
            <button onClick={() => setActionErrorNotice(null)} className="text-red-400 hover:text-white ml-2">✕</button>
          </div>
        )}

        {testAlertNotice && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
              <span>{testAlertNotice}</span>
            </div>
            <button onClick={() => setTestAlertNotice(null)} className="text-amber-300 hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* Quick KPI Stat Cards with Real Counts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Managed Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {isLoadingAccounts ? '...' : demographicStats.totalUsers}
            </div>
            <div className="text-[11px] text-teal-400 font-semibold mt-1">
              {demographicStats.adminsCount} Admin • {demographicStats.totalUsers - demographicStats.adminsCount} Active Users
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Deaf & Non-Speaking</span>
              <HandMetal className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {(demographicStats.counts.deaf || 0) + (demographicStats.counts.non_speaking || 0)}
            </div>
            <div className="text-[11px] text-teal-300 font-semibold mt-1">
              Sign ML & AAC Voice Users
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Speech & Hearing</span>
              <Volume2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {(demographicStats.counts.speech_impaired || 0) + (demographicStats.counts.hard_of_hearing || 0) + (demographicStats.counts.hearing_speaking || 0)}
            </div>
            <div className="text-[11px] text-purple-300 font-semibold mt-1">
              STT, Sound Alert & Partner
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Auth Security State</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {demographicStats.googleCount} Google
            </div>
            <div className="text-[11px] text-amber-300 font-semibold mt-1">
              Email OTP & PIN Verified
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto shadow-inner">
          {[
            { id: 'users', label: 'All Users Directory', icon: Users, badge: accounts.length.toString() },
            { id: 'analytics', label: 'Demographics & Personas', icon: LayoutGrid },
            { id: 'sounds', label: 'Sound Recognition Library', icon: BellRing, badge: soundLibrary.length.toString() },
            { id: 'gestures', label: 'Sign Language ML Core', icon: HandMetal, badge: gestureModels.length.toString() },
            { id: 'aac', label: 'AAC Quick Phrases & Flashcards', icon: MessageSquare },
            { id: 'system', label: 'Infrastructure & Security', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ALL USERS DIRECTORY & GOVERNANCE (PRIMARY TAB)                      */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header & Controls Bar */}
            <div className="bg-slate-950/90 p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>Registered User Accounts & Access Profiles</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search, inspect, and manage all users across all 5 SAMNYA accessibility personas with complete visibility.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportUsers}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    title="Export complete user registry as JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add New User</span>
                  </button>

                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => setViewLayout('table')}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${viewLayout === 'table' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewLayout('cards')}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${viewLayout === 'cards' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                      title="Cards View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filters Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by user name, email, ID..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Persona Filter */}
                <div className="relative">
                  <select
                    value={personaFilter}
                    onChange={(e) => setPersonaFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Personas (5 Categories)</option>
                    <option value="deaf">🧏 Deaf Users</option>
                    <option value="non_speaking">🔇 Non-Speaking Users</option>
                    <option value="speech_impaired">🗣️ Speech-Impaired Users</option>
                    <option value="hard_of_hearing">👂 Hard-of-Hearing Users</option>
                    <option value="hearing_speaking">👤 Hearing & Speaking Users</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Roles (Admin & Users)</option>
                    <option value="admin">🛡️ Administrators Only</option>
                    <option value="user">👤 Standard Users</option>
                  </select>
                </div>

                {/* Auth Type Filter */}
                <div className="relative">
                  <select
                    value={authFilter}
                    onChange={(e) => setAuthFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Auth Types</option>
                    <option value="google">🌐 Google Accounts</option>
                    <option value="demo">🎭 Demo Personas</option>
                    <option value="registered">✉️ Direct Registered Accounts</option>
                  </select>
                </div>
              </div>

              {/* Active Results Summary */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <div>
                  Showing <strong className="text-white">{filteredAccounts.length}</strong> of <strong className="text-slate-300">{accounts.length}</strong> total users
                </div>
                {(userSearch || personaFilter !== 'all' || roleFilter !== 'all' || authFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setUserSearch('');
                      setPersonaFilter('all');
                      setRoleFilter('all');
                      setAuthFilter('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* USERS LIST: TABLE VIEW */}
            {viewLayout === 'table' && (
              <div className="bg-slate-950/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">User Name & Details</th>
                        <th className="py-3.5 px-4">Accessibility Persona</th>
                        <th className="py-3.5 px-4">Role & Auth</th>
                        <th className="py-3.5 px-4">Communication Methods</th>
                        <th className="py-3.5 px-4">Account ID</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                            <Users className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="font-semibold text-sm">No users matched your search criteria.</p>
                            <p className="text-xs text-slate-500">Try modifying your search or clearing filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredAccounts.map((acc) => {
                          const persona = USER_PERSONAS[acc.userType] || USER_PERSONAS.deaf;
                          const isRootAdmin = acc.email.toLowerCase() === 'admin@samnya.org' || acc.id === 'admin-samnya-01';
                          const isCurrentActive = user?.email.toLowerCase() === acc.email.toLowerCase();

                          return (
                            <tr 
                              key={acc.id} 
                              className={`hover:bg-slate-900/60 transition-colors ${
                                isCurrentActive ? 'bg-blue-950/20' : ''
                              }`}
                            >
                              {/* 1. User Name & Avatar */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow text-xs flex-shrink-0">
                                    {acc.name ? acc.name.slice(0, 2).toUpperCase() : 'US'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-sm text-white truncate">
                                        {acc.name || 'Unnamed User'}
                                      </span>
                                      {isCurrentActive && (
                                        <span className="px-1.5 py-0.2 rounded bg-teal-900/80 text-teal-300 text-[10px] font-bold border border-teal-700/60">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px] truncate">
                                      {acc.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Accessibility Persona */}
                              <td className="py-3.5 px-4">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                                  <span className="text-sm">{persona.emoji}</span>
                                  <span className="font-bold text-slate-200">{persona.title}</span>
                                </div>
                              </td>

                              {/* 3. Role & Auth Type */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {acc.role === 'admin' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-extrabold">
                                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                                      <span>Admin</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-semibold">
                                      <span>User</span>
                                    </span>
                                  )}

                                  {acc.isGoogleAccount && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
                                      <Globe className="w-2.5 h-2.5" /> Google
                                    </span>
                                  )}
                                  {acc.id.startsWith('demo-') && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                                      Demo
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 4. Communication Methods */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {(acc.communicationPreferences || ['typing']).map((m) => (
                                    <span
                                      key={m}
                                      className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono capitalize"
                                    >
                                      {m.replace('_', ' ')}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* 5. Account ID & Creation */}
                              <td className="py-3.5 px-4">
                                <div className="text-slate-400 font-mono text-[11px]">
                                  {acc.id}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : 'Active'}
                                </div>
                              </td>

                              {/* 6. Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedUserForEdit({ ...acc })}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs transition-colors"
                                    title="Edit User Profile & Persona"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {!isRootAdmin && (
                                    <button
                                      onClick={() => setUserToDelete(acc)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-300 border border-slate-700 text-xs transition-colors"
                                      title="Delete Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS LIST: CARDS VIEW */}
            {viewLayout === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccounts.map((acc) => {
                  const persona = USER_PERSONAS[acc.userType] || USER_PERSONAS.deaf;
                  const isRootAdmin = acc.email.toLowerCase() === 'admin@samnya.org' || acc.id === 'admin-samnya-01';
                  const isCurrentActive = user?.email.toLowerCase() === acc.email.toLowerCase();

                  return (
                    <div
                      key={acc.id}
                      className={`bg-slate-950/80 p-5 rounded-3xl border ${
                        isCurrentActive ? 'border-teal-500/60 shadow-lg shadow-teal-950/40' : 'border-slate-800'
                      } space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        {/* Header with Avatar & Role */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-sm shadow">
                              {acc.name ? acc.name.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                                <span>{acc.name || 'Unnamed User'}</span>
                                {isCurrentActive && (
                                  <span className="px-1.5 py-0.2 rounded bg-teal-900/80 text-teal-300 text-[10px] font-bold">
                                    You
                                  </span>
                                )}
                              </h3>
                              <p className="text-slate-400 font-mono text-xs truncate">{acc.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {acc.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold">
                                User
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Accessibility Persona Badge */}
                        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{persona.emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-slate-200">{persona.title}</div>
                              <div className="text-[10px] text-slate-400">{persona.subtitle}</div>
                            </div>
                          </div>
                        </div>

                        {/* Preferred Communication Methods */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Communication Preferences:</div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {(acc.communicationPreferences || ['typing']).map(m => (
                              <span key={m} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono capitalize">
                                {m.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer with Metadata & Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                          {acc.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedUserForEdit({ ...acc })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {!isRootAdmin && (
                            <button
                              onClick={() => setUserToDelete(acc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 5-USER ACCESSIBILITY DEMOGRAPHICS & PERSONAS                       */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>The 5 Core SAMNYA User Personas — Demographics & Utilization</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Distribution, communication preferences, and capabilities across all 5 accessibility profiles.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Total Managed Users: {demographicStats.totalUsers}
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex">
                  {demographicStats.distribution.map((item) => (
                    <div
                      key={item.type}
                      className={`${item.color} h-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                      title={`${USER_PERSONAS[item.type].title}: ${item.count} users (${item.percentage}%)`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  {demographicStats.distribution.map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-semibold text-slate-300">{USER_PERSONAS[item.type].emoji} {USER_PERSONAS[item.type].title}</span>
                      <span className="text-slate-400 font-mono">({item.count} users • {item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed 5 Personas Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {(Object.keys(USER_PERSONAS) as UserType[]).map((typeKey) => {
                  const persona = USER_PERSONAS[typeKey];
                  const userCount = demographicStats.counts[typeKey] || 0;
                  return (
                    <div key={typeKey} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{persona.emoji}</span>
                            <div>
                              <h3 className="font-extrabold text-sm text-white">{persona.title}</h3>
                              <p className="text-[11px] text-slate-400">{persona.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                            {userCount} {userCount === 1 ? 'user' : 'users'}
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
                        <span className="text-slate-400 font-mono text-[11px]">{persona.demoUser.email}</span>
                        <button
                          onClick={() => {
                            signInAsDemoPersona(typeKey);
                            onBackToApp();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-colors"
                        >
                          Preview Persona
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SOUND RECOGNITION LIBRARY (INTACT & WORKING)                       */}
        {/* ========================================================================= */}
        {activeTab === 'sounds' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
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

        {/* ========================================================================= */}
        {/* TAB 4: SIGN LANGUAGE ML CORE (INTACT & WORKING)                           */}
        {/* ========================================================================= */}
        {activeTab === 'gestures' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
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

        {/* ========================================================================= */}
        {/* TAB 5: AAC QUICK PHRASES & FLASHCARDS (INTACT & WORKING)                  */}
        {/* ========================================================================= */}
        {activeTab === 'aac' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
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

        {/* ========================================================================= */}
        {/* TAB 6: INFRASTRUCTURE & DIAGNOSTICS (INTACT & WORKING)                    */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span>Backend Infrastructure & API Diagnostics</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Database & Auth Provider</div>
                  <div className="text-sm font-bold text-teal-300">
                    {isSupabaseConfigured ? 'Supabase PostgreSQL Cloud Schema v1.0 (Live)' : 'Local Storage Engine + Simulated Vault (Online)'}
                  </div>
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

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW USER                                                       */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-white">Create New User Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maya Deshmukh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Password</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Default: 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Account Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Accessibility Profile</label>
                  <select
                    value={newUserType}
                    onChange={(e) => {
                      const ut = e.target.value as UserType;
                      setNewUserType(ut);
                      setNewUserMethods(USER_PERSONAS[ut]?.recommendedMethods || ['typing']);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="deaf">🧏 Deaf Users</option>
                    <option value="non_speaking">🔇 Non-Speaking Users</option>
                    <option value="speech_impaired">🗣️ Speech-Impaired</option>
                    <option value="hard_of_hearing">👂 Hard-of-Hearing</option>
                    <option value="hearing_speaking">👤 Hearing & Speaking</option>
                  </select>
                </div>
              </div>

              {/* Preferred Communication Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-300">Communication Preferences:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sign', label: 'Sign Language (Camera ML)' },
                    { id: 'typing', label: 'Text & Real-time Typing' },
                    { id: 'speech', label: 'Spoken Voice & Speech' },
                    { id: 'no_speech', label: 'AAC Voice Vocalizer' }
                  ].map((m) => {
                    const checked = newUserMethods.includes(m.id as CommunicationMethod);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          if (checked) {
                            setNewUserMethods(newUserMethods.filter(item => item !== m.id));
                          } else {
                            setNewUserMethods([...newUserMethods, m.id as CommunicationMethod]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          checked
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'
                        }`}>
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewUser}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {isSubmittingNewUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER PROFILE                                                  */}
      {/* ========================================================================= */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-white">Edit User Profile</h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">User Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedUserForEdit.name}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={selectedUserForEdit.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">User Role</label>
                  <select
                    value={selectedUserForEdit.role}
                    onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Accessibility Persona</label>
                  <select
                    value={selectedUserForEdit.userType}
                    onChange={(e) => {
                      const ut = e.target.value as UserType;
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        userType: ut,
                        communicationPreferences: USER_PERSONAS[ut]?.recommendedMethods || selectedUserForEdit.communicationPreferences
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="deaf">🧏 Deaf Users</option>
                    <option value="non_speaking">🔇 Non-Speaking Users</option>
                    <option value="speech_impaired">🗣️ Speech-Impaired</option>
                    <option value="hard_of_hearing">👂 Hard-of-Hearing</option>
                    <option value="hearing_speaking">👤 Hearing & Speaking</option>
                  </select>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-300">Communication Preferences:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sign', label: 'Sign Language (Camera ML)' },
                    { id: 'typing', label: 'Text & Real-time Typing' },
                    { id: 'speech', label: 'Spoken Voice & Speech' },
                    { id: 'no_speech', label: 'AAC Voice Vocalizer' }
                  ].map((m) => {
                    const currentPrefs = selectedUserForEdit.communicationPreferences || [];
                    const checked = currentPrefs.includes(m.id as CommunicationMethod);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          if (checked) {
                            setSelectedUserForEdit({
                              ...selectedUserForEdit,
                              communicationPreferences: currentPrefs.filter(item => item !== m.id)
                            });
                          } else {
                            setSelectedUserForEdit({
                              ...selectedUserForEdit,
                              communicationPreferences: [...currentPrefs, m.id as CommunicationMethod]
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          checked
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'
                        }`}>
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to remove <strong className="text-white">"{userToDelete.name}"</strong> ({userToDelete.email}) from the SAMNYA registry?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
