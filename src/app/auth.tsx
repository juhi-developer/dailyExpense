import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { CURRENCIES } from '@/constants/currencies';
import { Spacing, BorderRadius } from '@/constants/theme';
import { showAlert } from '@/utils/dialog';

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
      showAlert('Validation Error', 'Email and password are required.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      showAlert('Validation Error', 'Please enter your full name.');
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
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      showAlert('Authentication Failed', e.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('demo@example.com', 'password123');
      await refreshData();
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      showAlert('Demo Error', e.message || 'Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Ambient Purple Gradient Glow */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(124, 58, 237, 0.22)', 'rgba(79, 70, 229, 0.06)', 'transparent']
            : ['rgba(124, 58, 237, 0.10)', 'rgba(79, 70, 229, 0.03)', 'transparent']
        }
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Account</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Brand Logo & Intro */}
          <View style={styles.brandHero}>
            <LinearGradient
              colors={theme.gradientHero || ['#7C3AED', '#6D28D9', '#4F46E5']}
              style={styles.logoBox}
            >
              <Ionicons name="wallet" size={32} color="#FFFFFF" />
            </LinearGradient>
            <ThemedText style={styles.brandTitle}>Daily Expense Tracker</ThemedText>
            <ThemedText style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              {mode === 'login'
                ? 'Sign in to sync your expenses, budgets, and reports.'
                : 'Create an account to start managing your personal finances.'}
            </ThemedText>
          </View>

          {/* Mode Switcher Tabs */}
          <View
            style={[
              styles.modeTabs,
              {
                backgroundColor: theme.card,
                borderColor: theme.glassBorder || theme.cardBorder,
              },
            ]}
          >
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
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.glassBorder || theme.cardBorder,
                      color: theme.text,
                    },
                  ]}
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
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.glassBorder || theme.cardBorder,
                    color: theme.text,
                  },
                ]}
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
                style={[
                  styles.passwordRow,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.glassBorder || theme.cardBorder,
                  },
                ]}
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
                              borderColor: isSelected ? theme.primary : (theme.glassBorder || theme.cardBorder),
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
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                style={styles.submitBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitBtnText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Demo Button */}
            <TouchableOpacity
              style={[
                styles.demoBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.glassBorder || theme.cardBorder,
                },
              ]}
              onPress={handleDemoLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={16} color={theme.primary} />
              <ThemedText style={[styles.demoBtnText, { color: theme.primary }]}>
                Quick Demo Login
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
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
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
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.four,
  },
  modeTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: 3,
    marginBottom: Spacing.four,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  formContainer: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  demoBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});