import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings, BudgetProgress } from '@/types';

// Setup notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

export async function scheduleDailyExpenseReminder(settings: NotificationSettings): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    // Cancel previous scheduled reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.dailyReminderEnabled) return;

    const [hoursStr, minutesStr] = settings.reminderTime.split(':');
    const hour = parseInt(hoursStr, 10) || 20;
    const minute = parseInt(minutesStr, 10) || 0;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Expense Reminder 💸',
        body: 'Take 30 seconds to log today’s expenses and keep your budget in check!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    console.warn('Failed to schedule daily reminder:', error);
  }
}

export async function checkAndTriggerBudgetAlert(progress: BudgetProgress): Promise<void> {
  try {
    if (progress.isOverBudget) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Budget Exceeded!',
          body: `You have exceeded your ${progress.categoryName} budget (${progress.percentage}% spent).`,
          sound: true,
        },
        trigger: null, // immediate
      });
    } else if (progress.isWarning) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Budget Warning',
          body: `You have reached ${progress.percentage}% of your ${progress.categoryName} budget.`,
          sound: true,
        },
        trigger: null, // immediate
      });
    }
  } catch (error) {
    console.warn('Failed to trigger budget alert:', error);
  }
}

