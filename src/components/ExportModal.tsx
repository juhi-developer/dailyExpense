import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { exportToPdf, exportToCsv } from '@/services/exportService';
import { BorderRadius, Spacing } from '@/constants/theme';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExportModal({ visible, onClose }: ExportModalProps) {
  const theme = useTheme();
  const { transactions, summary, currency } = useExpense();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportToPdf({
        transactions,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
        currency,
        userName: user?.name || 'User',
        periodTitle: 'Expense Statement & Summary',
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Export Error', e.message || 'Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCsvExport = async () => {
    setIsExporting(true);
    try {
      await exportToCsv({ transactions });
      onClose();
    } catch (e: any) {
      Alert.alert('Export Error', e.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Export Financial Reports</ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Download your transactions, balance breakdown, and summary in your preferred format.
          </ThemedText>

          {isExporting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Preparing file...
              </ThemedText>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {/* PDF Option */}
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.backgroundElement }]}
                onPress={handlePdfExport}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={24} color="#EF4444" />
                </View>
                <View style={styles.optionDetails}>
                  <ThemedText style={styles.optionTitle}>Download Statement (PDF)</ThemedText>
                  <ThemedText style={[styles.optionDesc, { color: theme.textSecondary }]}>
                    Formatted document with summary cards, charts, and transaction ledger.
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>

              {/* CSV / Excel Option */}
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: theme.backgroundElement }]}
                onPress={handleCsvExport}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="grid" size={24} color="#10B981" />
                </View>
                <View style={styles.optionDetails}>
                  <ThemedText style={styles.optionTitle}>Spreadsheet (Excel / CSV)</ThemedText>
                  <ThemedText style={[styles.optionDesc, { color: theme.textSecondary }]}>
                    Raw tabular data compatible with Microsoft Excel, Google Sheets, etc.
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
            onPress={onClose}
          >
            <ThemedText style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 13,
  },
});

