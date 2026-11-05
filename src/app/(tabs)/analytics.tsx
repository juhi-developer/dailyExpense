import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { ExportModal } from '@/components/ExportModal';
import { useExpense } from '@/context/ExpenseContext';
import { useTheme } from '@/hooks/use-theme';
import { apiService } from '@/services/api';
import { formatCurrency } from '@/constants/currencies';
import { ReportData, ReportPeriod } from '@/types';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { currency, transactions } = useExpense();

  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchReport = async () => {
      try {
        const data = await apiService.getAnalytics(period);
        if (active) {
          setReportData(data);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Analytics error:', e);
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchReport();
    return () => {
      active = false;
    };
  }, [period, transactions]);

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setIsLoading(true);
    setPeriod(newPeriod);
  };

  const periods: { key: ReportPeriod; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const highestCategory = reportData?.breakdown?.[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Ambient Purple Gradient Glow */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(124, 58, 237, 0.20)', 'rgba(79, 70, 229, 0.05)', 'transparent']
            : ['rgba(124, 58, 237, 0.08)', 'rgba(79, 70, 229, 0.02)', 'transparent']
        }
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.title}>Financial Reports</ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                Analytics & Cash Flow Trends
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={() => setExportModalVisible(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exportBtn}
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <ThemedText style={styles.exportBtnText}>Export</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Period Selector Tabs */}
          <View
            style={[
              styles.periodTabs,
              {
                backgroundColor: theme.card,
                borderColor: theme.glassBorder || theme.cardBorder,
              },
            ]}
          >
            {periods.map(p => {
              const isActive = period === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.periodTab,
                    isActive && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => handlePeriodChange(p.key)}
                >
                  <ThemedText
                    style={[
                      styles.periodTabText,
                      { color: isActive ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {p.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Calculating analytics...
              </ThemedText>
            </View>
          ) : reportData ? (
            <>
              {/* Summary Metric Cards */}
              <View style={styles.metricsRow}>
                {/* Income Card */}
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.glassBorder || theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <ThemedText style={[styles.metricLabel, { color: theme.textSecondary }]}>
                      Total Income
                    </ThemedText>
                    <Ionicons name="arrow-down-circle" size={18} color={theme.success} />
                  </View>
                  <ThemedText style={[styles.metricValue, { color: theme.success }]}>
                    +{formatCurrency(reportData.totalIncome, currency)}
                  </ThemedText>
                </View>

                {/* Expense Card */}
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.glassBorder || theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <ThemedText style={[styles.metricLabel, { color: theme.textSecondary }]}>
                      Total Expense
                    </ThemedText>
                    <Ionicons name="arrow-up-circle" size={18} color={theme.danger} />
                  </View>
                  <ThemedText style={[styles.metricValue, { color: theme.danger }]}>
                    -{formatCurrency(reportData.totalExpense, currency)}
                  </ThemedText>
                </View>
              </View>

              {/* Net Balance & Savings Rate Card */}
              <View
                style={[
                  styles.netCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.glassBorder || theme.cardBorder,
                  },
                ]}
              >
                <View>
                  <ThemedText style={[styles.netLabel, { color: theme.textSecondary }]}>
                    Net Savings
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.netAmount,
                      { color: reportData.balance >= 0 ? theme.primary : theme.danger },
                    ]}
                  >
                    {formatCurrency(reportData.balance, currency)}
                  </ThemedText>
                </View>

                <View style={[styles.savingsRateBadge, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="pie-chart" size={16} color={theme.primary} />
                  <ThemedText style={[styles.savingsRateText, { color: theme.primary }]}>
                    {reportData.savingsRate}% Saved
                  </ThemedText>
                </View>
              </View>

              {/* Bar Chart Section */}
              <View style={styles.chartSection}>
                <ThemedText style={styles.chartSectionTitle}>Income vs Expense Trend</ThemedText>
                <BarChart data={reportData.timeSeries} height={200} />
              </View>

              {/* Donut Chart / Category Breakdown */}
              <View style={styles.chartSection}>
                <DonutChart
                  breakdown={reportData.breakdown}
                  totalExpense={reportData.totalExpense}
                />
              </View>

              {/* Key Insight Highlight */}
              {highestCategory && (
                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.glassBorder || theme.cardBorder,
                    },
                  ]}
                >
                  <View style={[styles.insightIconContainer, { backgroundColor: `${theme.warning}18` }]}>
                    <Ionicons name="bulb-outline" size={22} color={theme.warning} />
                  </View>
                  <View style={styles.insightContent}>
                    <ThemedText style={styles.insightTitle}>Spending Insight</ThemedText>
                    <ThemedText style={[styles.insightDesc, { color: theme.textSecondary }]}>
                      <ThemedText style={{ fontWeight: '700' }}>
                        {highestCategory.categoryName}
                      </ThemedText>{' '}
                      is your highest spending category this period, accounting for{' '}
                      <ThemedText style={{ fontWeight: '700', color: theme.danger }}>
                        {highestCategory.percentage}%
                      </ThemedText>{' '}
                      of total expenses ({formatCurrency(highestCategory.total, currency)}).
                    </ThemedText>
                  </View>
                </View>
              )}
            </>
          ) : null}
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
    height: 300,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  periodTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: 3,
    marginBottom: Spacing.three,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  netCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.three,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  netLabel: {
    fontSize: 12,
  },
  netAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  savingsRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  savingsRateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartSection: {
    marginBottom: Spacing.two,
  },
  chartSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.three,
    marginTop: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: Spacing.seven,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 13,
  },
});