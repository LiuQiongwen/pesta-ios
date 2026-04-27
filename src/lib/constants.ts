import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const APP_CONFIG = {
  WEB_URL:           extra.WEB_URL           ?? 'https://your-pesta-site.com',
  SUPABASE_URL:      extra.SUPABASE_URL      ?? '',
  SUPABASE_ANON_KEY: extra.SUPABASE_ANON_KEY ?? '',
};

export const COLORS = {
  bg:        '#01040d',
  surface:   '#080e1e',
  border:    'rgba(102,240,255,0.15)',
  accent:    '#66f0ff',
  accentDim: 'rgba(102,240,255,0.25)',
  text:      'rgba(225,235,255,0.92)',
  textDim:   'rgba(160,180,220,0.55)',
  error:     '#ff4466',
  tabBar:    '#03050d',
};
