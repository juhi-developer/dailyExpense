import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ExportModal } from '@/components/ExportModal';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { CURRENCIES } from '@/constants/currencies';
import { downloadJsonBackup, restoreFromJson } from '@/services/backupService';
import { apiService } from '@/services/api';
import { confirmAction, showAlert } from '@/utils/dialog';
import { Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';
import { CurrencyConfig } from '@/types';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const {
    currency,
    setCurrency,
    notificationSettings,
    saveNotificationSettings,
    isBackendOnline,
    refreshData,
  } = useExpense();

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');

  // Server URL State
  const [serverUrl, setServerUrl] = useState(apiService.getApiUrl());
  const [testingConnection, setTestingConnection] = useState(false);

  // Restore JSON state
  const [restoreJsonInput, setRestoreJsonInput] = useState('');

  const toggleDarkMode = (val: boolean) => {
    theme.setThemeMode(val ? 'dark' : 'light');
  };

  const handleCurrencySelect = async (c: CurrencyConfig) => {
    await setCurrency(c);
    setCurrencyModalVisible(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert('Error', 'Name cannot be empty.');
      return;
    }
    await updateUser({ name: editName.trim() });
    setProfileModalVisible(false);
    showAlert('Success', 'Profile updated successfully.');
  };

  const handleTestAndSaveServer = async () => {
    setTestingConnection(true);
    try {
      await apiService.setApiUrl(serverUrl);
      const isOnline = await apiService.checkHealth();
      await refreshData();

      if (isOnline) {
        showAlert('Success', 'Connected successfully to backend server!');
        setServerModalVisible(false);
      } else {
        showAlert(
          'Notice',
          'Server not reachable at this URL. The app will continue operating seamlessly in local offline storage mode.'
        );
        setServerModalVisible(false);
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleBackupDownload = async () => {
    try {
      await downloadJsonBackup();
    } catch (e: any) {
      showAlert('Backup Error', e.message || 'Failed to download backup.');
    }
  };

  const handleRestoreSubmit = async () => {
    try {
      if (!restoreJsonInput.trim()) {
        showAlert('Error', 'Please paste valid backup JSON data.');
        return;
      }
      await restoreFromJson(restoreJsonInput);
      await refreshData();
      setRestoreModalVisible(false);
      setRestoreJsonInput('');
      showAlert('Success', 'Backup data restored successfully!');
    } catch {
      showAlert('Restore Error', 'Invalid backup format or corrupted JSON.');
    }
  };

  const handleLogout = () => {
    confirmAction({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      onConfirm: async () => {
        await logout();
        router.push('/auth' as any);
      },
    });
  };

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
            <ThemedText style={styles.title}>Settings</ThemedText>
          </View>

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <LinearGradient
              colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
              style={styles.avatarGlowRing}
            >
              <View style={[styles.avatar, { backgroundColor: theme.card }]}>
                <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </ThemedText>
              </View>
            </LinearGradient>

            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                {user ? user.name : 'Guest User'}
              </ThemedText>
              <ThemedText style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {user ? user.email : 'Not signed in'}
              </ThemedText>
            </View>

            {user ? (
              <TouchableOpacity
                style={[styles.editProfileBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
                onPress={() => {
                  setEditName(user.name);
                  setProfileModalVisible(true);
                }}
              >
                <Ionicons name="pencil" size={16} color={theme.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInPillWrapper}
                onPress={() => router.push('/auth' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                  style={styles.signInPill}
                >
                  <ThemedText style={styles.signInPillText}>Sign In</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Section: General Settings */}
          <ThemedText style={styles.sectionHeading}>General</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            {/* Dark Mode Switch */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                  <Ionicons name={theme.isDark ? 'moon' : 'sunny-outline'} size={18} color={theme.primary} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Dark Mode</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    {theme.isDark ? 'Dark theme active' : 'Light theme active'}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={theme.isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#CBD5E1', true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Currency Selector */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setCurrencyModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="cash-outline" size={18} color={theme.success} />
                </View>
                <ThemedText style={styles.settingTitle}>Currency</ThemedText>
              </View>
              <View style={styles.settingRight}>
                <ThemedText style={[styles.settingValue, { color: theme.primary }]}>
                  {currency.symbol} ({currency.code})
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Category Manager */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/categories' as any)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.warningLight }]}>
                  <Ionicons name="pricetags-outline" size={18} color={theme.warning} />
                </View>
                <ThemedText style={styles.settingTitle}>Manage Categories</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Section: Notifications & Reminders */}
          <ThemedText style={styles.sectionHeading}>Notifications & Alerts</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            {/* Daily Expense Reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="alarm-outline" size={18} color={theme.success} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Daily Expense Reminder</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Scheduled for {notificationSettings.reminderTime}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationSettings.dailyReminderEnabled}
                onValueChange={val => saveNotificationSettings({ dailyReminderEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: theme.success }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Budget Alerts (>80% / 100%) */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.dangerLight }]}>
                  <Ionicons name="warning-outline" size={18} color={theme.danger} />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Budget Overrun Alerts</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Notify when spending crosses 80% or 100%
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationSettings.budgetAlertsEnabled}
                onValueChange={val => saveNotificationSettings({ budgetAlertsEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: theme.danger }}
              />
            </View>
          </View>

          {/* Section: Data Export & Backup */}
          <ThemedText style={styles.sectionHeading}>Data Export & Backup</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            {/* Export Reports */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setExportModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="document-text-outline" size={18} color={theme.primary} />
                </View>
                <ThemedText style={styles.settingTitle}>Export PDF / CSV Statement</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Download JSON Backup */}
            <TouchableOpacity style={styles.settingRow} onPress={handleBackupDownload}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="cloud-download-outline" size={18} color="#7C3AED" />
                </View>
                <ThemedText style={styles.settingTitle}>Download JSON Backup</ThemedText>
              </View>
              <Ionicons name="download-outline" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Restore Data */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setRestoreModalVisible(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.warningLight }]}>
                  <Ionicons name="cloud-upload-outline" size={18} color={theme.warning} />
                </View>
                <ThemedText style={styles.settingTitle}>Restore from Backup</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Section: Backend & Server Config */}
          <ThemedText style={styles.sectionHeading}>Backend Connection (Node + MySQL)</ThemedText>
          <View style={[styles.settingGroup, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setServerModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isBackendOnline ? theme.successLight : theme.warningLight }]}>
                  <Ionicons
                    name="server-outline"
                    size={18}
                    color={isBackendOnline ? theme.success : theme.warning}
                  />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Express API Server</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    Status: {isBackendOnline ? 'Connected (MySQL)' : 'Offline (Local Fallback)'}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Account / Logout Button */}
          {user ? (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { borderColor: `${theme.danger}40`, backgroundColor: theme.dangerLight },
              ]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={theme.danger} />
              <ThemedText style={[styles.logoutText, { color: theme.danger }]}>
                Sign Out ({user.name})
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { borderColor: theme.primary, backgroundColor: theme.primaryLight },
              ]}
              onPress={() => router.push('/auth' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="log-in-outline" size={18} color={theme.primary} />
              <ThemedText style={[styles.logoutText, { color: theme.primary }]}>
                Sign In to Account
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* App Version Info */}
          <View style={styles.versionContainer}>
            <ThemedText style={[styles.versionText, { color: theme.textTertiary }]}>
              Daily Expense Tracker v1.0.0
            </ThemedText>
            <ThemedText style={[styles.versionSubtext, { color: theme.textTertiary }]}>
              React Native • Expo SDK 58 • Node.js • MySQL
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Currency</ThemedText>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {CURRENCIES.map(c => {
                const isSelected = c.code === currency.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyRow,
                      isSelected && { backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() => handleCurrencySelect(c)}
                  >
                    <View style={styles.currencyLeft}>
                      <ThemedText style={styles.currencySymbol}>{c.symbol}</ThemedText>
                      <View>
                        <ThemedText style={styles.currencyName}>{c.name}</ThemedText>
                        <ThemedText style={[styles.currencyCode, { color: theme.textSecondary }]}>
                          {c.code}
                        </ThemedText>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Profile Name</ThemedText>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Full Name
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
              placeholderTextColor={theme.textTertiary}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                style={styles.modalActionBtn}
              >
                <ThemedText style={styles.modalActionBtnText}>Save Changes</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Server URL Config Modal */}
      <Modal visible={serverModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Configure API Server</ThemedText>
              <TouchableOpacity onPress={() => setServerModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.modalHelpText, { color: theme.textSecondary }]}>
              Enter your Node.js + Express backend URL. For Expo on phone, use your machine&apos;s LAN
              IP (e.g., http://192.168.1.100:5000/api).
            </ThemedText>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://localhost:5000/api"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              onPress={handleTestAndSaveServer}
              disabled={testingConnection}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                style={styles.modalActionBtn}
              >
                <ThemedText style={styles.modalActionBtnText}>
                  {testingConnection ? 'Testing Connection...' : 'Save & Connect'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Restore JSON Backup Modal */}
      <Modal visible={restoreModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder || theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Restore from Backup</ThemedText>
              <TouchableOpacity onPress={() => setRestoreModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.modalHelpText, { color: theme.textSecondary }]}>
              Paste the exported JSON backup contents below to restore your transactions, categories,
              and budgets.
            </ThemedText>

            <TextInput
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              value={restoreJsonInput}
              onChangeText={setRestoreJsonInput}
              placeholder="Paste JSON here..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity
              onPress={handleRestoreSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradientPurple || ['#7C3AED', '#6D28D9']}
                style={styles.modalActionBtn}
              >
                <ThemedText style={styles.modalActionBtnText}>Restore Data</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    marginVertical: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarGlowRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2.5,
    marginRight: Spacing.three,
  },
  avatar: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPillWrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  signInPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  signInPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    opacity: 0.7,
  },
  settingGroup: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 0.5,
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.four,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalHelpText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    fontSize: 15,
    marginBottom: Spacing.four,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    fontSize: 13,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: Spacing.four,
  },
  modalActionBtn: {
    paddingVertical: 13,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.two,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.md,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '800',
    width: 32,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencyCode: {
    fontSize: 12,
  },
});