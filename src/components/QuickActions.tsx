import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface QuickActionsProps {
  onOpenExport?: () => void;
}

export function QuickActions({ onOpenExport }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Add Income */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push({ pathname: '/add-transaction', params: { type: 'income' } } as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: theme.successLight }]}>
          <Ionicons name="arrow-down-circle" size={24} color={theme.success} />
        </View>
        <ThemedText style={styles.actionLabel}>+ Income</ThemedText>
      </TouchableOpacity>

      {/* Add Expense */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push({ pathname: '/add-transaction', params: { type: 'expense' } } as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: theme.dangerLight }]}>
          <Ionicons name="arrow-up-circle" size={24} color={theme.danger} />
        </View>
        <ThemedText style={styles.actionLabel}>+ Expense</ThemedText>
      </TouchableOpacity>

      {/* Set Budget */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => router.push('/budget-modal' as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="pie-chart" size={22} color={theme.primary} />
        </View>
        <ThemedText style={styles.actionLabel}>Budget</ThemedText>
      </TouchableOpacity>

      {/* Export Report */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => (onOpenExport ? onOpenExport() : router.push('/analytics' as any))}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: '#ECFEFF' }]}>
          <Ionicons name="download-outline" size={22} color="#0891B2" />
        </View>
        <ThemedText style={styles.actionLabel}>Export</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

