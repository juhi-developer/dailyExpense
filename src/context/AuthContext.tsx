import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { apiService } from '@/services/api';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        await apiService.init();
        const storedToken = await AsyncStorage.getItem('@daily_expense_token');
        const storedUser = await AsyncStorage.getItem('@daily_expense_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Default demo user so user can start testing right away!
          const demoUser: User = {
            id: 'demo-user-1',
            name: 'Alex Johnson',
            email: 'demo@example.com',
            currency: 'USD',
            themePreference: 'system',
          };
          setUser(demoUser);
          setToken('demo_token');
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    apiService.setToken(null);
    await AsyncStorage.removeItem('@daily_expense_token');
    await AsyncStorage.removeItem('@daily_expense_user');
  };

  const updateUser = async (updates: Partial<User>) => {
    const updated = await apiService.updateProfile(updates);
    setUser(updated);
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

