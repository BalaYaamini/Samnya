import React, { useState, useEffect } from 'react';
import { quickMessageService } from '../services/quickMessage/quickMessageService';
import { QuickMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ttsService } from '../services/speech/ttsService';
import { FullScreenCardModal } from '../components/common/FullScreenCardModal';
import { 
  Bookmark, 
  Eye, 
  Volume2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  Check, 
  X,
  Database
} from 'lucide-react';

export const QuickMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fullscreenMessage, setFullscreenMessage] = useState<{ text: string; cat: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageCat, setNewMessageCat] = useState<QuickMessage['category']>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    const list = await quickMessageService.getMessages(user?.id);
    setMessages(list);
  };

  const handleSpeak = (text: string) => {
    ttsService.speak(text);
  };

  const handleShow = (message: QuickMessage) => {
    setFullscreenMessage({ text: message.message, cat: message.category });
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setIsSaving(true);
    try {
      const created = await quickMessageService.addCustomMessage(
        newMessageText.trim(),
        newMessageCat,
        user?.id
      );
      setMessages(prev => [created, ...prev]);
      setNewMessageText('');
      setIsAddModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    await quickMessageService.deleteCustomMessage(id, user?.id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const categories = [
    { id: 'all', label: 'All Cards' },
    { id: 'identity', label: 'Identity' },
    { id: 'communication', label: 'Communication' },
    { id: 'emergency', label: 'Urgent' },
    { id: 'navigation', label: 'Places & Exits' },
    { id: 'custom', label: 'My Custom' },
  ];

  const filteredMessages = messages.filter(m => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return m.is_custom;
    return m.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Communication Cards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Quick Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Instant cards to Show in huge text or Speak aloud anywhere.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Card</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredMessages.map((card) => (
          <div
            key={card.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 bg-white dark:bg-[#0F172A] ${
              card.category === 'emergency'
                ? 'border-red-200 dark:border-red-900/60 hover:border-red-400'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  card.category === 'emergency'
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {card.category}
                </span>

                {card.is_custom && (
                  <button
                    onClick={() => handleDeleteCustom(card.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete custom card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                "{card.message}"
              </p>
            </div>

            {/* Actions: SHOW & SPEAK */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleShow(card)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Show</span>
              </button>

              <button
                onClick={() => handleSpeak(card.message)}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Message Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Quick Communication Card
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phrase or Message
                </label>
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="e.g. Please give me vegetarian food without peanuts."
                  rows={3}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={newMessageCat}
                  onChange={(e) => setNewMessageCat(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="communication">Communication</option>
                  <option value="identity">Identity</option>
                  <option value="emergency">Emergency / Urgent</option>
                  <option value="navigation">Navigation</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Custom cards persist to Supabase & local offline storage.</span>
              </div>

              <button
                type="submit"
                disabled={isSaving || !newMessageText.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Quick Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen "SHOW" Modal */}
      <FullScreenCardModal
        message={fullscreenMessage?.text || null}
        category={fullscreenMessage?.cat}
        onClose={() => setFullscreenMessage(null)}
      />

    </div>
  );
};
