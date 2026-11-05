import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): ThemeColors & { isDark: boolean; theme: 'light' | 'dark' } {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return {
    ...colors,
    isDark: theme === 'dark',
    theme,
  };
}
