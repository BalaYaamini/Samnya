import React, { useState, useEffect } from 'react';
import { QuickMessage } from '../types';
import { quickMessageService } from '../services/quickMessage/quickMessageService';
import { FullScreenCardModal } from '../components/common/FullScreenCardModal';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Maximize2, 
  Volume2, 
  Check, 
  Filter,
  Info,
  Star
} from 'lucide-react';
import { ttsService } from '../services/speech/ttsService';

export const QuickMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<QuickMessage['category']>('general');
  const [fullScreenMsg, setFullScreenMsg] = useState<{message: string, category: string} | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const data = await quickMessageService.getMessages();
    
    // Check local storage for pinned statuses and merge
    try {
      const pinnedDataStr = localStorage.getItem('samnya_pinned_cards');
      if (pinnedDataStr) {
        const pinnedIds = JSON.parse(pinnedDataStr) as string[];
        const mergedData = data.map(msg => ({
          ...msg,
          is_pinned: pinnedIds.includes(msg.id)
        }));
        
        // Sort: Pinned first, then by creation date or ID
        mergedData.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return 0;
        });
        
        setMessages(mergedData);
      } else {
        setMessages(data);
      }
    } catch (e) {
      setMessages(data);
    }
  };

  const togglePin = (msgId: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, is_pinned: !msg.is_pinned };
      }
      return msg;
    });
    
    // Sort again
    updatedMessages.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
    
    setMessages(updatedMessages);
    
    // Save to local storage
    const pinnedIds = updatedMessages.filter(m => m.is_pinned).map(m => m.id);
    localStorage.setItem('samnya_pinned_cards', JSON.stringify(pinnedIds));
  };

  const categories = [
    { id: 'all', label: 'All Cards' },
    { id: 'pinned', label: 'Pinned ⭐' },
    { id: 'identity', label: 'Identity' },
    { id: 'communication', label: 'Communication' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'general', label: 'General' }
  ];

  const filteredMessages = messages.filter(m => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'pinned') return m.is_pinned;
    return m.category === activeCategory;
  });

  const handleAdd = async () => {
    if (!newMessage.trim()) return;
    
    const success = await quickMessageService.addCustomMessage(
      newMessage.trim(), 
      newCategory
    );

    if (success) {
      setNewMessage('');
      setShowAddModal(false);
      loadMessages();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await quickMessageService.deleteCustomMessage(id);
    if (success) {
      loadMessages();
    }
  };

  const handleShowFullScreen = (msg: QuickMessage) => {
    setFullScreenMsg({ message: msg.message, category: msg.category });
  };

  const handleSpeakAloud = (text: string) => {
    ttsService.speak(text);
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Quick Cards
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              1-Tap
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Show or speak common phrases instantly without typing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Add Custom Card</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">Your custom cards are saved automatically.</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Check className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Synced</span>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex overflow-x-auto pb-2 no-scrollbar gap-2 snap-x">
        <div className="flex items-center justify-center pl-1 pr-2">
          <Filter className="w-4 h-4 text-slate-400" />
        </div>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all snap-start ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMessages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            No cards found in this category.
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div 
              key={msg.id}
              className={`p-5 rounded-3xl bg-white dark:bg-[#0F172A] border shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden ${
                msg.category === 'emergency' 
                  ? 'border-red-200 dark:border-red-900/60' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {msg.is_custom && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-bl-[40px] flex items-start justify-end p-2 opacity-50">
                  <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                    msg.category === 'emergency'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {msg.category}
                  </span>
                  
                  <div className="flex items-center gap-1 relative z-10">
                    <button
                      onClick={() => togglePin(msg.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        msg.is_pinned 
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
                      }`}
                      aria-label={msg.is_pinned ? "Unpin card" : "Pin card"}
                    >
                      <Star className={`w-4 h-4 ${msg.is_pinned ? 'fill-amber-500' : ''}`} />
                    </button>
                    
                    {msg.is_custom && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                        aria-label="Delete custom card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-6">
                  "{msg.message}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => handleShowFullScreen(msg)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Show</span>
                </button>
                <button
                  onClick={() => handleSpeakAloud(msg.message)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Speak</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl overflow-hidden animate-fadeIn border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Custom Card
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Message Text
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g., I am allergic to peanuts."
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white transition-colors"
                >
                  <option value="identity">Identity</option>
                  <option value="communication">Communication</option>
                  <option value="emergency">Emergency</option>
                  <option value="navigation">Navigation</option>
                  <option value="general">General</option>
                </select>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newMessage.trim()}
                className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Display Modal */}
      <FullScreenCardModal
        message={fullScreenMsg?.message || null}
        category={fullScreenMsg?.category}
        onClose={() => setFullScreenMsg(null)}
      />

    </div>
  );
};
