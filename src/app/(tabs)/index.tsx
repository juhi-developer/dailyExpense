import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionItem } from '@/components/TransactionItem';
import { BudgetProgressCard } from '@/components/BudgetProgressCard';
import { ExportModal } from '@/components/ExportModal';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    transactions,
    budgetProgress,
    unreadNotificationCount,
    isBackendOnline,
    refreshData,
  } = useExpense();

  const [refreshing, setRefreshing] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 5);
  const overallBudget = budgetProgress.find(b => b.categoryId === null) || budgetProgress[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Ambient Purple Gradient Glow */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(124, 58, 237, 0.22)', 'rgba(79, 70, 229, 0.08)', 'transparent']
            : ['rgba(124, 58, 237, 0.10)', 'rgba(79, 70, 229, 0.03)', 'transparent']
        }
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.contentWrapper}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <ThemedText style={[styles.greeting, { color: theme.textSecondary }]}>
                {user ? 'Welcome back,' : 'Hello,'}
              </ThemedText>
              <ThemedText style={styles.userName}>{user ? user.name : 'Guest User'}</ThemedText>
            </View>

            <View style={styles.headerRight}>
              {/* Server Connection Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isBackendOnline ? theme.successLight : theme.warningLight,
                    borderColor: isBackendOnline ? `${theme.success}30` : `${theme.warning}30`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isBackendOnline ? theme.success : theme.warning },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: isBackendOnline ? theme.success : theme.warning },
                  ]}
                >
                  {isBackendOnline ? 'Online' : 'Local'}
                </ThemedText>
              </View>

              {/* Notification Bell */}
              <TouchableOpacity
                style={[
                  styles.bellButton,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.glassBorder || theme.cardBorder,
                  },
                ]}
                onPress={() => router.push('/notifications' as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={theme.text} />
                {unreadNotificationCount > 0 && (
                  <View style={[styles.badgeDot, { backgroundColor: theme.danger }]}>
                    <ThemedText style={styles.badgeCount}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Hero Card */}
          <BalanceCard />

          {/* Quick Actions */}
          <QuickActions onOpenExport={() => setExportModalVisible(true)} />

          {/* Monthly Budget Glance */}
          {overallBudget && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Budget Status</ThemedText>
                <TouchableOpacity onPress={() => router.push('/budgets' as any)}>
                  <ThemedText style={[styles.seeAllText, { color: theme.primary }]}>
                    Manage
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <BudgetProgressCard
                progress={overallBudget}
                onPress={() => router.push('/budgets' as any)}
              />
            </View>
          )}

          {/* Recent Transactions Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
              <TouchableOpacity onPress={() => router.push('/transactions' as any)}>
                <ThemedText style={[styles.seeAllText, { color: theme.primary }]}>
                  See All ({transactions.length})
                </ThemedText>
              </TouchableOpacity>
            </View>

            {recentTransactions.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder },
                ]}
              >
                <Ionicons name="receipt-outline" size={44} color={theme.textTertiary} />
                <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                  No transactions yet
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                  Add your first income or expense using the buttons above.
                </ThemedText>
              </View>
            ) : (
              recentTransactions.map(tx => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.seven,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  sectionContainer: {
    marginTop: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});