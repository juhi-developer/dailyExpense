import { apiService } from '@/services/api';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@daily_expense_token';
const USER_KEY = '@daily_expense_user';
const LOGGED_OUT_KEY = '@daily_expense_logged_out';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        await apiService.init();
        const isExplicitlyLoggedOut = await AsyncStorage.getItem(LOGGED_OUT_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else if (isExplicitlyLoggedOut === 'true') {
          setToken(null);
          setUser(null);
        } else {
          // Default initial demo user for instant testability
          const demoUser: User = {
            id: 'demo-user-1',
            name: 'Alex Johnson',
            email: 'demo@example.com',
            currency: 'USD',
            themePreference: 'system',
          };
          setUser(demoUser);
          setToken('demo_token');
          await AsyncStorage.setItem(TOKEN_KEY, 'demo_token');
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        }
      } catch (e) {
        console.warn('Auth loading error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiService.login(email, password);
      setToken(result.token);
      setUser(result.user);
      await AsyncStorage.setItem(TOKEN_KEY, result.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
      await AsyncStorage.removeItem(LOGGED_OUT_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, currency?: string) => {
    setIsLoading(true);
    try {
      const result = await apiService.register(name, email, password, currency);
      setToken(result.token);
      setUser(result.user);
      await AsyncStorage.setItem(TOKEN_KEY, result.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
      await AsyncStorage.removeItem(LOGGED_OUT_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    apiService.setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.setItem(LOGGED_OUT_KEY, 'true');
  };

  const updateUser = async (updates: Partial<User>) => {
    const updated = await apiService.updateProfile(updates);
    setUser(updated);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
