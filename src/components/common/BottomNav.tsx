import React from 'react';
import { Home, MessageSquare, Volume2, FileText, Bookmark, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'communicate', label: 'Communicate', icon: MessageSquare },
    { id: 'awareness', label: 'Awareness', icon: Volume2 },
    { id: 'understand', label: 'Understand', icon: FileText },
    { id: 'quick-messages', label: 'Quick Cards', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 safe-area-bottom transition-colors"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5 animate-scaleUp" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
