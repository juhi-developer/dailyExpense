import Swal, { SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Inject custom purple theme CSS for SweetAlert2
if (typeof document !== 'undefined') {
  const styleId = 'swal-purple-theme-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .swal-purple-popup {
        border-radius: 24px !important;
        border: 1px solid rgba(167, 139, 250, 0.25) !important;
        box-shadow: 0 20px 50px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .swal-purple-confirm-btn {
        background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%) !important;
        border-radius: 12px !important;
        font-weight: 700 !important;
        padding: 10px 24px !important;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4) !important;
        border: none !important;
      }
      .swal-purple-confirm-btn:hover {
        opacity: 0.92 !important;
        transform: translateY(-1px) !important;
      }
      .swal-purple-cancel-btn {
        border-radius: 12px !important;
        font-weight: 700 !important;
        padding: 10px 20px !important;
        border: 1px solid rgba(156, 163, 175, 0.3) !important;
      }
      .swal2-title {
        font-weight: 800 !important;
        letter-spacing: -0.02em !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function isDarkModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const theme = localStorage.getItem('@daily_expense_theme_mode');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
  } catch {
    // ignore
  }
  return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
}

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
  const isDark = isDarkModeActive();

  Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#7C3AED',
    cancelButtonColor: isDark ? '#374151' : '#9CA3AF',
    background: isDark ? '#16102E' : '#FFFFFF',
    color: isDark ? '#F8F7FF' : '#1E1B4B',
    backdrop: 'rgba(9, 7, 20, 0.75)',
    customClass: {
      popup: 'swal-purple-popup',
      confirmButton: 'swal-purple-confirm-btn',
      cancelButton: 'swal-purple-cancel-btn',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

export function showAlert(
  title: string,
  message?: string,
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question'
): void {
  const isDark = isDarkModeActive();

  let detectedIcon: SweetAlertIcon = icon || 'info';
  if (!icon) {
    const lower = `${title} ${message || ''}`.toLowerCase();
    if (
      lower.includes('success') ||
      lower.includes('restored') ||
      lower.includes('saved') ||
      lower.includes('connected') ||
      lower.includes('added') ||
      lower.includes('updated')
    ) {
      detectedIcon = 'success';
    } else if (
      lower.includes('error') ||
      lower.includes('fail') ||
      lower.includes('corrupted') ||
      lower.includes('invalid')
    ) {
      detectedIcon = 'error';
    } else if (
      lower.includes('warning') ||
      lower.includes('notice') ||
      lower.includes('require') ||
      lower.includes('cannot')
    ) {
      detectedIcon = 'warning';
    }
  }

  Swal.fire({
    title,
    text: message,
    icon: detectedIcon,
    confirmButtonText: 'OK',
    confirmButtonColor: '#7C3AED',
    background: isDark ? '#16102E' : '#FFFFFF',
    color: isDark ? '#F8F7FF' : '#1E1B4B',
    backdrop: 'rgba(9, 7, 20, 0.75)',
    customClass: {
      popup: 'swal-purple-popup',
      confirmButton: 'swal-purple-confirm-btn',
    },
  });
}

export { Swal };

