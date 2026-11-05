import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { TransactionType, PaymentMethod } from '@/types';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function EditTransactionScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { transactions, categories, currency, editTransaction, deleteTransaction } = useExpense();

  const txId = params.id as string;
  const existingTx = transactions.find(t => t.id === txId);

  const [type, setType] = useState<TransactionType>(existingTx?.type || 'expense');
  const [amount, setAmount] = useState(existingTx ? existingTx.amount.toString() : '');
  const [selectedCategory, setSelectedCategory] = useState<string>(existingTx?.categoryId || '');
  const [date, setDate] = useState(existingTx?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(existingTx?.paymentMethod || 'card');
  const [note, setNote] = useState(existingTx?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) {
      Alert.alert('Category Required', 'Please select a valid category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await editTransaction(txId, {
        type,
        amount: numAmount,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        date,
        note: note.trim(),
        paymentMethod,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txId);
          router.back();
        },
      },
    ]);
  };

  const paymentMethods: { key: PaymentMethod; label: string }[] = [
    { key: 'card', label: 'Card' },
    { key: 'upi', label: 'UPI' },
    { key: 'cash', label: 'Cash' },
    { key: 'bank', label: 'Bank' },
  ];

  if (!existingTx) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText>Transaction not found.</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <ThemedText style={{ color: theme.primary }}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Dual Type Toggle */}
          <View style={[styles.typeToggle, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && { backgroundColor: theme.dangerLight },
              ]}
              onPress={() => setType('expense')}
            >
              <ThemedText
                style={[
                  styles.typeBtnText,
                  { color: type === 'expense' ? theme.danger : theme.textSecondary },
                  type === 'expense' && { fontWeight: '700' },
                ]}
              >
                Expense
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && { backgroundColor: theme.successLight },
              ]}
              onPress={() => setType('income')}
            >
              <ThemedText
                style={[
                  styles.typeBtnText,
                  { color: type === 'income' ? theme.success : theme.textSecondary },
                  type === 'income' && { fontWeight: '700' },
                ]}
              >
                Income
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Amount Box */}
          <View style={[styles.amountCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <ThemedText style={[styles.amountLabel, { color: theme.textSecondary }]}>Amount</ThemedText>
            <View style={styles.amountInputRow}>
              <ThemedText
                style={[
                  styles.currencySymbol,
                  { color: type === 'income' ? theme.success : theme.danger },
                ]}
              >
                {currency.symbol}
              </ThemedText>
              <TextInput
                style={[
                  styles.amountInput,
                  { color: type === 'income' ? theme.success : theme.danger },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Categories Grid */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Category</ThemedText>
            <View style={styles.categoryGrid}>
              {filteredCategories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryTile,
                      {
                        backgroundColor: isSelected ? `${cat.color}25` : theme.card,
                        borderColor: isSelected ? cat.color : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <ThemedText
                      style={[
                        styles.catTileName,
                        isSelected && { fontWeight: '700', color: cat.color },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Payment Method</ThemedText>
            <View style={styles.methodRow}>
              {paymentMethods.map(m => {
                const isSelected = paymentMethod === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.methodBtn,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.card,
                        borderColor: isSelected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setPaymentMethod(m.key)}
                  >
                    <ThemedText
                      style={[
                        styles.methodLabel,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {m.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date & Note */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Date</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              value={date}
              onChangeText={setDate}
            />

            <ThemedText style={[styles.sectionLabel, { marginTop: Spacing.two }]}>Note</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.saveBtnText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </ThemedText>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: `${theme.danger}40`, backgroundColor: theme.dangerLight }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <ThemedText style={[styles.deleteBtnText, { color: theme.danger }]}>
              Delete Transaction
            </ThemedText>
          </TouchableOpacity>
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
    maxWidth: MaxContentWidth,
  },
  typeToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.two,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  typeBtnText: {
    fontSize: 13,
  },
  amountCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '800',
    minWidth: 120,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginBottom: Spacing.one,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryTile: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTileName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  methodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  methodLabel: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    fontSize: 14,
  },
  saveBtn: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
