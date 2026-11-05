import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface BarDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height, backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <ThemedText style={{ color: theme.textSecondary }}>No data available for this period</ThemedText>
      </View>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.flatMap(d => [d.income, d.expense]),
    100
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <LinearGradient
            colors={theme.gradientIncome || ['#10B981', '#059669']}
            style={styles.legendDot}
          />
          <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Income</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <LinearGradient
            colors={theme.gradientExpense || ['#F43F5E', '#BE123C']}
            style={styles.legendDot}
          />
          <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Expense</ThemedText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.chartContainer, { height }]}>
          {data.map((item, index) => {
            const incomeHeight = Math.max(6, (item.income / maxValue) * (height - 50));
            const expenseHeight = Math.max(6, (item.expense / maxValue) * (height - 50));

            return (
              <View key={`bar-${index}`} style={styles.groupContainer}>
                {/* Dual Bars Container */}
                <View style={styles.barsArea}>
                  {/* Income Bar */}
                  <LinearGradient
                    colors={theme.gradientIncome || ['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.bar,
                      {
                        height: incomeHeight,
                      },
                    ]}
                  />

                  {/* Expense Bar */}
                  <LinearGradient
                    colors={theme.gradientExpense || ['#F43F5E', '#E11D48']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.bar,
                      {
                        height: expenseHeight,
                      },
                    ]}
                  />
                </View>

                {/* X-axis Label */}
                <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Baseline Divider */}
      <View style={[styles.baseLine, { backgroundColor: theme.cardBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    marginVertical: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.one,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
    paddingTop: 10,
  },
  groupContainer: {
    alignItems: 'center',
    width: 48,
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: '100%',
    paddingBottom: 22,
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
  },
  baseLine: {
    height: 1,
    marginTop: -22,
    width: '100%',
  },
  emptyContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
});
