import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, TextSize } from '../types';
import { userService, DEFAULT_SETTINGS } from '../services/user/userService';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setTextSize: (size: TextSize) => void;
  toggleHighContrast: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => userService.getLocalSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Apply text size class to root
    const root = document.documentElement;
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${settings.text_size}`);

    // Apply high contrast class
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.text_size, settings.high_contrast]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      userService.saveSettings(updated);
      return updated;
    });
  };

  const setTextSize = (size: TextSize) => {
    updateSettings({ text_size: size });
  };

  const toggleHighContrast = () => {
    const newVal = !settings.high_contrast;
    updateSettings({ high_contrast: newVal });
    setToastMessage(newVal ? 'High Contrast enabled' : 'High Contrast disabled');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setTextSize, toggleHighContrast }}>
      {children}
      {/* Non-intrusive Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
