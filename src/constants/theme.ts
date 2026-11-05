import { Platform } from 'react-native';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  accent: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  warning: string;
  warningLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  background: string;
  card: string;
  cardBorder: string;
  backgroundElement: string;
  backgroundSelected: string;
  inputBackground: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
  headerBackground: string;
  shadow: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#4F46E5', // Indigo
    primaryLight: '#EEF2FF',
    accent: '#06B6D4',
    success: '#10B981',
    successLight: '#ECFDF5',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    inputBackground: '#F8FAFC',
    inputBorder: '#CBD5E1',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    headerBackground: '#FFFFFF',
    shadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    primary: '#6366F1',
    primaryLight: '#312E81',
    accent: '#22D3EE',
    success: '#34D399',
    successLight: '#064E3B',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    warning: '#FBBF24',
    warningLight: '#78350F',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0B0F17',
    card: '#161F30',
    cardBorder: '#233044',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    inputBackground: '#0F172A',
    inputBorder: '#334155',
    tabBar: '#121926',
    tabBarBorder: '#1E293B',
    headerBackground: '#121926',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export type ThemeColor = keyof ThemeColors;

export const Spacing = {
  zero: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier New',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, serif',
    mono: 'monospace',
  },
});

export const BottomTabInset = Platform.select({ ios: 70, android: 65, default: 60 });
export const MaxContentWidth = 840;
