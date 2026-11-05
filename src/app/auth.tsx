import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { CURRENCIES } from '@/constants/currencies';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function AuthScreen() {
  const theme = useTheme();
  const { login, register } = useAuth();
  const { refreshData } = useExpense();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, selectedCurrency);
      }
      await refreshData();
      router.back();
    } catch (e: any) {
      Alert.alert('Authentication Failed', e.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('demo@example.com', 'password123');
      await refreshData();
      router.back();
    } catch (e: any) {
      Alert.alert('Demo Error', e.message || 'Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Account</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Brand Logo & Intro */}
          <View style={styles.brandHero}>
            <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
              <Ionicons name="wallet" size={32} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.brandTitle}>Daily Expense Tracker</ThemedText>
            <ThemedText style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              {mode === 'login'
                ? 'Sign in to sync your expenses, budgets, and reports.'
                : 'Create an account to start managing your personal finances.'}
            </ThemedText>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={[styles.modeTabs, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && { backgroundColor: theme.primary }]}
              onPress={() => setMode('login')}
            >
              <ThemedText
                style={[
                  styles.modeTabText,
                  { color: mode === 'login' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                Sign In
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'signup' && { backgroundColor: theme.primary }]}
              onPress={() => setMode('signup')}
            >
              <ThemedText
                style={[
                  styles.modeTabText,
                  { color: mode === 'signup' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                Create Account
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {mode === 'signup' && (
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Email Address</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="name@example.com"
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Password</ThemedText>
              <View
                style={[styles.passwordRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: theme.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'signup' && (
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Preferred Currency</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CURRENCIES.map(c => {
                      const isSelected = selectedCurrency === c.code;
                      return (
                        <TouchableOpacity
                          key={c.code}
                          style={[
                            styles.currencyChip,
                            {
                              backgroundColor: isSelected ? theme.primary : theme.card,
                              borderColor: isSelected ? theme.primary : theme.cardBorder,
                            },
                          ]}
                          onPress={() => setSelectedCurrency(c.code)}
                        >
                          <ThemedText
                            style={{
                              color: isSelected ? '#FFFFFF' : theme.text,
                              fontSize: 12,
                              fontWeight: isSelected ? '700' : '500',
                            }}
                          >
                            {c.symbol} {c.code}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Quick Demo Button */}
            <TouchableOpacity
              style={[
                styles.demoBtn,
                { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
              ]}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Ionicons name="sparkles" size={16} color={theme.primary} />
              <ThemedText style={[styles.demoBtnText, { color: theme.primary }]}>
                1-Click Demo Login (demo@example.com)
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.seven,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 420,
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.two,
  },
  modeTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.four,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formContainer: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.three,
    fontSize: 14,
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 6,
    marginTop: Spacing.one,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
