-- SAMNYA Database Schema for Supabase
-- Run this script in the Supabase SQL Editor to set up tables, RLS, and triggers.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  communication_preferences TEXT[] DEFAULT ARRAY['typing']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUICK MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.quick_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  text_size TEXT DEFAULT 'normal' CHECK (text_size IN ('normal', 'large', 'xlarge')),
  high_contrast BOOLEAN DEFAULT false,
  vibration_enabled BOOLEAN DEFAULT true,
  sound_alerts_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: PROFILES
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS POLICIES: QUICK MESSAGES
CREATE POLICY "Users can view own quick messages" 
  ON public.quick_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick messages" 
  ON public.quick_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick messages" 
  ON public.quick_messages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick messages" 
  ON public.quick_messages FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS POLICIES: USER SETTINGS
CREATE POLICY "Users can view own settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'User'));

  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);

  -- Seed initial quick messages
  INSERT INTO public.quick_messages (user_id, message, category, is_custom)
  VALUES
    (new.id, 'I am Deaf.', 'identity', false),
    (new.id, 'I am non-speaking.', 'identity', false),
    (new.id, 'Please type your response.', 'communication', false),
    (new.id, 'Please speak slowly.', 'communication', false),
    (new.id, 'I need medical help.', 'emergency', false),
    (new.id, 'Where is the emergency exit?', 'navigation', false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
