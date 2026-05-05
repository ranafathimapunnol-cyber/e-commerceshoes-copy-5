// utils/toast.js
import toast from 'react-hot-toast';

// Export all toast functions
export const showToast = (message, type = 'success') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast(message, { icon: 'ℹ️' });
      break;
    case 'warning':
      toast(message, { icon: '⚠️' });
      break;
    default:
      toast(message);
  }
};

export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showInfo = (message) => toast(message, { icon: 'ℹ️' });
export const showWarning = (message) => toast(message, { icon: '⚠️' });

export default toast;