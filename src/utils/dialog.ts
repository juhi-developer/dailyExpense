import { Alert, Platform } from 'react-native';

export function confirmAction({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}): void {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : true;
    if (ok) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(`${title}${message ? `\n\n${message}` : ''}`);
    }
  } else {
    Alert.alert(title, message);
  }
}

