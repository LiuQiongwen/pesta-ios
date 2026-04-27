import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ── Auth Stack ────────────────────────────────────────────────
export type AuthStackParams = {
  Login: undefined;
};

// ── Main Tab Bar ──────────────────────────────────────────────
export type MainTabParams = {
  Capture: undefined;
  Search:  undefined;
  StarMap: undefined;
  Insight: undefined;
  Memory:  undefined;
  Action:  undefined;
};

// ── Root Stack ────────────────────────────────────────────────
export type RootStackParams = {
  Splash: undefined;
  Auth:   undefined;
  Main:   undefined;
};

// ── Typed screen props ────────────────────────────────────────
export type LoginScreenProps   = NativeStackScreenProps<AuthStackParams, 'Login'>;
export type CaptureScreenProps = BottomTabScreenProps<MainTabParams, 'Capture'>;
export type SearchScreenProps  = BottomTabScreenProps<MainTabParams, 'Search'>;
export type StarMapScreenProps = BottomTabScreenProps<MainTabParams, 'StarMap'>;
export type InsightScreenProps = BottomTabScreenProps<MainTabParams, 'Insight'>;
export type MemoryScreenProps  = BottomTabScreenProps<MainTabParams, 'Memory'>;
export type ActionScreenProps  = BottomTabScreenProps<MainTabParams, 'Action'>;
