import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      {/* Background Accent Circles for depth */}
      <View style={[styles.glowCircleTop, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      <View style={[styles.glowCircleBottom, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />

      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} hitSlop={12} style={styles.eyeBtn}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="rgba(255, 255, 255, 0.8)"
            />
          </TouchableOpacity>
        </View>

        {summary.savingsRate > 0 && (
          <View style={styles.savingsBadge}>
            <Ionicons name="sparkles" size={12} color="#FBBF24" />
            <ThemedText style={styles.savingsText}>{summary.savingsRate}% saved</ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.balanceAmount}>{formattedBalance}</ThemedText>

      <View style={styles.statsDivider} />

      <View style={styles.bottomRow}>
        {/* Income Block */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="arrow-down" size={16} color="#34D399" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>Income</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#A7F3D0' }]}>{formattedIncome}</ThemedText>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Expense Block */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Ionicons name="arrow-up" size={16} color="#F87171" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>Expenses</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#FECACA' }]}>{formattedExpense}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: Spacing.two,
  },
  glowCircleTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  glowCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
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
    gap: Spacing.two,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  eyeBtn: {
    padding: 2,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginVertical: Spacing.two,
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: Spacing.two,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: Spacing.two,
  },
});

