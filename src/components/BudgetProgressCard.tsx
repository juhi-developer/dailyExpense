import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { BudgetProgress } from '@/types';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, Spacing } from '@/constants/theme';

interface BudgetProgressCardProps {
  progress: BudgetProgress;
  onPress?: () => void;
}

export function BudgetProgressCard({ progress, onPress }: BudgetProgressCardProps) {
  const theme = useTheme();
  const { currency } = useExpense();

  // Progress Bar gradient logic
  let barGradient: readonly [string, string, ...string[]] = ['#059669', '#10B981'];
  let statusBadgeText = 'On Track';
  let badgeBg = theme.successLight;
  let badgeColor = theme.success;

  if (progress.isOverBudget) {
    barGradient = ['#BE123C', '#F43F5E'];
    statusBadgeText = 'Exceeded';
    badgeBg = theme.dangerLight;
    badgeColor = theme.danger;
  } else if (progress.isWarning) {
    barGradient = ['#D97706', '#FBBF24'];
    statusBadgeText = 'Near Limit';
    badgeBg = theme.warningLight;
    badgeColor = theme.warning;
  }

  const cappedPercentage = Math.min(progress.percentage, 100);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: progress.isOverBudget ? `${theme.danger}60` : theme.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.catInfo}>
          <View style={[styles.iconWrapper, { backgroundColor: `${progress.categoryColor}25` }]}>
            <Ionicons
              name={(progress.categoryIcon as any) || 'wallet-outline'}
              size={18}
              color={progress.categoryColor || theme.primary}
            />
          </View>
          <View>
            <ThemedText style={styles.categoryName}>{progress.categoryName}</ThemedText>
            <ThemedText style={[styles.limitSubtext, { color: theme.textSecondary }]}>
              Target: {formatCurrency(progress.limitAmount, currency)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: badgeColor }]}>{statusBadgeText}</ThemedText>
        </View>
      </View>

      {/* Modern Gradient Progress Bar */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundElement }]}>
        <LinearGradient
          colors={barGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressBarFill,
            { width: `${cappedPercentage}%` },
          ]}
        />
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <ThemedText style={[styles.spentText, { color: theme.textSecondary }]}>
          Spent:{' '}
          <ThemedText style={[styles.spentAmount, { color: theme.text }]}>
            {formatCurrency(progress.spentAmount, currency)}
          </ThemedText>{' '}
          <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>
            ({progress.percentage}%)
          </ThemedText>
        </ThemedText>

        <ThemedText
          style={[
            styles.remainingText,
            {
              color: progress.isOverBudget ? theme.danger : theme.success,
            },
          ]}
        >
          {progress.isOverBudget
            ? `+${formatCurrency(progress.spentAmount - progress.limitAmount, currency)} over`
            : `${formatCurrency(progress.remainingAmount, currency)} left`}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.three,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  limitSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  progressBarBg: {
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: Spacing.two,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentText: {
    fontSize: 12,
  },
  spentAmount: {
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
