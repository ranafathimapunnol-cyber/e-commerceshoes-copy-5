// utils/toast.js
import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '10px',
      padding: '12px 16px',
    },
    icon: '✅',
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '10px',
      padding: '12px 16px',
    },
    icon: '❌',
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      borderRadius: '10px',
      padding: '12px 16px',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 2000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      borderRadius: '10px',
      padding: '12px 16px',
    },
  });
};