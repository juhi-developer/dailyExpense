import { Platform } from 'react-native';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  primaryGlow: string;
  accentGlow: string;
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
  glassBackground: string;
  glassBorder: string;
  backgroundElement: string;
  backgroundSelected: string;
  inputBackground: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
  headerBackground: string;
  shadow: string;
  gradientHero: readonly [string, string, ...string[]];
  gradientPurple: readonly [string, string, ...string[]];
  gradientIncome: readonly [string, string, ...string[]];
  gradientExpense: readonly [string, string, ...string[]];
  gradientCard: readonly [string, string, ...string[]];
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#7C3AED', // Electric Purple
    primaryLight: '#F3EEFF',
    primaryDark: '#5B21B6',
    accent: '#C026D3', // Neon Fuchsia
    accentLight: '#FDF2F8',
    primaryGlow: 'rgba(124, 58, 237, 0.25)',
    accentGlow: 'rgba(192, 38, 211, 0.2)',
    success: '#10B981', // Neon Mint
    successLight: '#ECFDF5',
    danger: '#F43F5E', // Rose Coral
    dangerLight: '#FFF1F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    text: '#0F0C24', // Deep midnight purple
    textSecondary: '#6B6589',
    textTertiary: '#9C95B8',
    background: '#F8F7FF', // Soft lavender white
    card: '#FFFFFF',
    cardBorder: '#EDE9FE',
    glassBackground: 'rgba(255, 255, 255, 0.88)',
    glassBorder: 'rgba(124, 58, 237, 0.12)',
    backgroundElement: '#F3EEFF',
    backgroundSelected: '#E5DCFE',
    inputBackground: '#FAF8FF',
    inputBorder: '#DDD6FE',
    tabBar: '#FFFFFF',
    tabBarBorder: '#EDE9FE',
    headerBackground: '#F8F7FF',
    shadow: 'rgba(124, 58, 237, 0.08)',
    gradientHero: ['#4F46E5', '#7C3AED', '#C026D3'],
    gradientPurple: ['#6366F1', '#8B5CF6'],
    gradientIncome: ['#059669', '#10B981'],
    gradientExpense: ['#E11D48', '#F43F5E'],
    gradientCard: ['#FFFFFF', '#FAF8FF'],
  },
  dark: {
    primary: '#8B5CF6', // Glowing Violet Purple
    primaryLight: '#261B4E',
    primaryDark: '#4C1D95',
    accent: '#D946EF', // Electric Neon Magenta
    accentLight: '#381640',
    primaryGlow: 'rgba(139, 92, 246, 0.4)',
    accentGlow: 'rgba(217, 70, 239, 0.35)',
    success: '#34D399', // Mint glow
    successLight: '#064E3B',
    danger: '#FB7185', // Coral glow
    dangerLight: '#50131E',
    warning: '#FBBF24',
    warningLight: '#451A03',
    text: '#FAF8FF',
    textSecondary: '#C4B5FD', // Soft lavender text
    textTertiary: '#867DA6',
    background: '#090714', // Deep obsidian nebula purple
    card: '#130E28',
    cardBorder: '#271D4A',
    glassBackground: 'rgba(22, 16, 46, 0.78)',
    glassBorder: 'rgba(167, 139, 250, 0.22)',
    backgroundElement: '#1B1438',
    backgroundSelected: '#2A1F52',
    inputBackground: '#110C24',
    inputBorder: '#32255C',
    tabBar: '#0C081F',
    tabBarBorder: '#221945',
    headerBackground: '#090714',
    shadow: 'rgba(0, 0, 0, 0.6)',
    gradientHero: ['#4338CA', '#7C3AED', '#C026D3'],
    gradientPurple: ['#7C3AED', '#A855F7'],
    gradientIncome: ['#047857', '#10B981'],
    gradientExpense: ['#BE123C', '#F43F5E'],
    gradientCard: ['#171133', '#110C24'],
  },
};

export type StringThemeColor = {
  [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never;
}[keyof ThemeColors];

export type ThemeColor = StringThemeColor;

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
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
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

export const BottomTabInset = Platform.select({ ios: 72, android: 68, default: 64 });
export const MaxContentWidth = 840;
