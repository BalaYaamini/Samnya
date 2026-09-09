// Quick Messages Service for saved communication cards
// Syncs with Supabase quick_messages table with local storage cache fallback

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { QuickMessage } from '../../types';
import { DEFAULT_QUICK_MESSAGES } from '../../data/mockData';

const LOCAL_STORAGE_KEY = 'samnya_custom_messages';

export class QuickMessageService {
  public async getMessages(userId?: string): Promise<QuickMessage[]> {
    let customMessages: QuickMessage[] = [];

    // 1. Try Supabase if authenticated and configured
    if (isSupabaseConfigured && userId && !userId.startsWith('guest-')) {
      try {
        const { data, error } = await supabase
          .from('quick_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          customMessages = data as QuickMessage[];
        }
      } catch (err) {
        console.warn('Could not fetch quick messages from Supabase:', err);
      }
    }

    // 2. Supplement with local custom messages if any
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local) as QuickMessage[];
        // Merge without duplicates
        const existingIds = new Set(customMessages.map(m => m.id));
        for (const item of parsed) {
          if (!existingIds.has(item.id)) {
            customMessages.push(item);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading local quick messages:', e);
    }

    return [...DEFAULT_QUICK_MESSAGES, ...customMessages];
  }

  public async addCustomMessage(message: string, category: QuickMessage['category'] = 'general', userId?: string): Promise<QuickMessage> {
    const newMessage: QuickMessage = {
      id: 'qm-' + Date.now().toString(),
      user_id: userId,
      message: message.trim(),
      category,
      is_custom: true,
      created_at: new Date().toISOString()
    };

    // Save locally
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed: QuickMessage[] = local ? JSON.parse(local) : [];
      parsed.unshift(newMessage);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed saving to local storage:', e);
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured && userId && !userId.startsWith('guest-')) {
      try {
        await supabase.from('quick_messages').insert({
          user_id: userId,
          message: newMessage.message,
          category: newMessage.category,
          is_custom: true
        });
      } catch (err) {
        console.warn('Failed syncing custom message to Supabase:', err);
      }
    }

    return newMessage;
  }

  public async deleteCustomMessage(id: string, userId?: string): Promise<boolean> {
    // Remove locally
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed: QuickMessage[] = JSON.parse(local);
        const filtered = parsed.filter(m => m.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Failed deleting from local storage:', e);
    }

    // Remove from Supabase if configured
    if (isSupabaseConfigured && userId && !userId.startsWith('guest-')) {
      try {
        await supabase.from('quick_messages').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.warn('Failed deleting from Supabase:', err);
      }
    }

    return true;
  }
}

export const quickMessageService = new QuickMessageService();
