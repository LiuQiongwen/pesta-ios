import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from './constants';

const configured = Boolean(APP_CONFIG.SUPABASE_URL && APP_CONFIG.SUPABASE_ANON_KEY);

export const supabase = createClient(
  APP_CONFIG.SUPABASE_URL  || 'https://placeholder.supabase.co',
  APP_CONFIG.SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      storage:            AsyncStorage,
      autoRefreshToken:   configured,
      persistSession:     configured,
      detectSessionInUrl: false, // React Native 必须关闭
    },
  }
);

export { configured as supabaseConfigured };

export type { Session, User } from '@supabase/supabase-js';
