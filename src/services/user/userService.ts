// User Settings & Profile Service

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserSettings } from '../../types';

const SETTINGS_KEY = 'samnya_user_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  text_size: 'normal',
  high_contrast: false,
  vibration_enabled: true,
  sound_alerts_enabled: true,
  language: 'en'
};

export class UserService {
  public getLocalSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading local settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public async saveSettings(settings: UserSettings, userId?: string): Promise<void> {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error writing local settings:', e);
    }

    if (isSupabaseConfigured && userId && !userId.startsWith('guest-')) {
      try {
        await supabase.from('user_settings').upsert({
          user_id: userId,
          text_size: settings.text_size,
          high_contrast: settings.high_contrast,
          vibration_enabled: settings.vibration_enabled,
          sound_alerts_enabled: settings.sound_alerts_enabled,
          language: settings.language,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Error persisting settings to Supabase:', err);
      }
    }
  }

  public async fetchRemoteSettings(userId: string): Promise<UserSettings | null> {
    if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return null;
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return {
          text_size: data.text_size || 'normal',
          high_contrast: Boolean(data.high_contrast),
          vibration_enabled: data.vibration_enabled !== false,
          sound_alerts_enabled: data.sound_alerts_enabled !== false,
          language: data.language || 'en'
        };
      }
    } catch (e) {
      console.warn('Failed fetching remote settings:', e);
    }
    return null;
  }
}

export const userService = new UserService();
