import React, { useEffect } from 'react';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.cardBorder,
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.cardBorder,
  },
};

function RootNavigator() {
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <NavigationThemeProvider value={theme.isDark ? customDarkTheme : customLightTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-transaction"
          options={{
            presentation: 'modal',
            title: 'Edit Transaction',
          }}
        />
        <Stack.Screen
          name="budget-modal"
          options={{
            presentation: 'modal',
            title: 'Set Budget',
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            title: 'Manage Categories',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications',
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <RootNavigator />
        </ExpenseProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
