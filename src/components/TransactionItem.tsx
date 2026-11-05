import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';
import { Transaction } from '@/types';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/constants/currencies';
import { BorderRadius, Spacing } from '@/constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showActions?: boolean;
}

export function TransactionItem({ transaction, onPress, showActions = false }: TransactionItemProps) {
  const theme = useTheme();
  const { currency, deleteTransaction } = useExpense();

  const isIncome = transaction.type === 'income';
  const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(transaction.amount, currency)}`;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.type} transaction for ${formatCurrency(
        transaction.amount,
        currency
      )}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit-transaction',
      params: { id: transaction.id },
    } as any);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
      onPress={onPress || handleEdit}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${transaction.categoryColor}20` }]}>
        <Ionicons
          name={(transaction.categoryIcon as any) || (isIncome ? 'wallet-outline' : 'cart-outline')}
          size={20}
          color={transaction.categoryColor || (isIncome ? theme.success : theme.danger)}
        />
      </View>

      {/* Info Column */}
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.categoryName} numberOfLines={1}>
            {transaction.categoryName}
          </ThemedText>
          <ThemedText
            style={[
              styles.amount,
              { color: isIncome ? theme.success : theme.danger },
            ]}
          >
            {formattedAmount}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.noteContainer}>
            {transaction.note ? (
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                {transaction.note}
              </ThemedText>
            ) : (
              <ThemedText style={[styles.metaText, { color: theme.textTertiary }]}>No note</ThemedText>
            )}
          </View>

          <View style={styles.rightMeta}>
            <View style={[styles.methodBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.methodText, { color: theme.textSecondary }]}>
                {transaction.paymentMethod?.toUpperCase() || 'CASH'}
              </ThemedText>
            </View>
            <ThemedText style={[styles.dateText, { color: theme.textTertiary }]}>
              {transaction.date}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Optional action buttons */}
      {showActions && (
        <View style={styles.actionCol}>
          <TouchableOpacity onPress={handleEdit} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.two,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  metaText: {
    fontSize: 12,
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: Spacing.two,
  },
  iconBtn: {
    padding: 4,
  },
});

