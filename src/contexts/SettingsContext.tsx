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
    updateSettings({ high_contrast: !settings.high_contrast });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setTextSize, toggleHighContrast }}>
      {children}
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
