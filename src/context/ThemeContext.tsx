import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue extends ThemeColors {
  isDark: boolean;
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = '@daily_expense_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    }
    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  const effectiveTheme: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return deviceScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, deviceScheme]);

  const isDark = effectiveTheme === 'dark';
  const colors = Colors[effectiveTheme];

  const value = useMemo<ThemeContextValue>(() => {
    return {
      ...colors,
      isDark,
      theme: effectiveTheme,
      themeMode,
      setThemeMode,
      toggleTheme,
    };
  }, [colors, isDark, effectiveTheme, themeMode, setThemeMode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    const fallback = Colors.light;
    return {
      ...fallback,
      isDark: false,
      theme: 'light',
      themeMode: 'light',
      setThemeMode: async () => {},
      toggleTheme: async () => {},
    };
  }
  return context;
}

