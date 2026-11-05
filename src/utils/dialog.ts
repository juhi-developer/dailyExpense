import { Alert } from 'react-native';

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
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

export function showAlert(
  title: string,
  message?: string,
  _icon?: 'success' | 'error' | 'warning' | 'info' | 'question'
): void {
  Alert.alert(title, message);
}

export const Swal = null;
