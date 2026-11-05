import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, Spacing } from '@/constants/theme';

export function BalanceCard() {
  const theme = useTheme();
  const { summary, currency } = useExpense();
  const [showBalance, setShowBalance] = useState(true);

  const formattedBalance = showBalance ? formatCurrency(summary.balance, currency) : '••••••••';
  const formattedIncome = showBalance ? `+${formatCurrency(summary.totalIncome, currency)}` : '••••';
  const formattedExpense = showBalance ? `-${formatCurrency(summary.totalExpense, currency)}` : '••••';

  return (
    <View style={styles.shadowWrapper}>
      <LinearGradient
        colors={theme.gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Ambient Glow Bubbles */}
        <View style={styles.glowOrbTop} />
        <View style={styles.glowOrbBottom} />
        <View style={styles.glowOrbRight} />

        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <View style={styles.shieldIconWrapper}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} hitSlop={12} style={styles.eyeBtn}>
              <Ionicons
                name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>
          </View>

          {summary.savingsRate > 0 && (
            <View style={styles.savingsBadge}>
              <ThemedText style={styles.savingsText}>
                {summary.savingsRate}% Saved
              </ThemedText>
            </View>
          )}
        </View>

        {/* Main Amount */}
        <ThemedText style={styles.balanceAmount}>{formattedBalance}</ThemedText>

        {/* Translucent Glass Pill Stats */}
        <View style={styles.statsGlassContainer}>
          {/* Income Stat */}
          <View style={styles.statPill}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
              <Ionicons name="arrow-down" size={15} color="#34D399" />
            </View>
            <View style={styles.statTextGroup}>
              <ThemedText style={styles.statLabel}>Income</ThemedText>
              <ThemedText style={[styles.statValue, { color: '#6EE7B7' }]}>
                {formattedIncome}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statPillDivider} />

          {/* Expense Stat */}
          <View style={styles.statPill}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.25)' }]}>
              <Ionicons name="arrow-up" size={15} color="#FDA4AF" />
            </View>
            <View style={styles.statTextGroup}>
              <ThemedText style={styles.statLabel}>Expenses</ThemedText>
              <ThemedText style={[styles.statValue, { color: '#FECDD3' }]}>
                {formattedExpense}
              </ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginVertical: Spacing.two,
    borderRadius: BorderRadius.xl,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrbTop: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(217, 70, 239, 0.3)',
  },
  glowOrbRight: {
    position: 'absolute',
    top: 50,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(79, 70, 229, 0.25)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
  },
  eyeBtn: {
    padding: 2,
    marginLeft: 2,
  },
  savingsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginVertical: Spacing.three,
  },
  statsGlassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  statPillDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginHorizontal: Spacing.one,
  },
});
