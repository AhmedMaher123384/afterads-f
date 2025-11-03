import { toast, ToastOptions } from 'react-toastify';

// ألوان موحدة للتطبيق
const COLORS = {
  primary: '#18b5d8',
  white: '#ffffff',
  black: '#000000',
  gray: '#6b7280',
  success: '#18b5d8',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

// إعدادات Toast الافتراضية
const defaultToastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    fontFamily: 'Cairo, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: 'none'
  }
};

// Toast للواجهة الأمامية (Frontend)
export const frontendToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, #16a2c7 100%)`,
        color: COLORS.white,
        ...options?.style
      }
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.error} 0%, #dc2626 100%)`,
        color: COLORS.white,
        ...options?.style
      }
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.info} 0%, #2563eb 100%)`,
        color: COLORS.white,
        ...options?.style
      }
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.warning} 0%, #d97706 100%)`,
        color: COLORS.white,
        ...options?.style
      }
    });
  }
};

// Toast للوحة التحكم (Dashboard)
export const dashboardToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, #1f2937 100%)`,
        color: COLORS.white,
        border: `1px solid ${COLORS.gray}`,
        ...options?.style
      }
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, #1f2937 100%)`,
        color: COLORS.white,
        border: `1px solid ${COLORS.error}`,
        ...options?.style
      }
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, #1f2937 100%)`,
        color: COLORS.white,
        border: `1px solid ${COLORS.info}`,
        ...options?.style
      }
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      ...defaultToastOptions,
      ...options,
      style: {
        ...defaultToastOptions.style,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, #1f2937 100%)`,
        color: COLORS.white,
        border: `1px solid ${COLORS.warning}`,
        ...options?.style
      }
    });
  }
};

// دالة لمنع التكرار
let lastToastMessage = '';
let lastToastTime = 0;
const DUPLICATE_THRESHOLD = 1000; // منع التكرار لمدة ثانية واحدة

export const preventDuplicateToast = (message: string): boolean => {
  const now = Date.now();
  if (lastToastMessage === message && (now - lastToastTime) < DUPLICATE_THRESHOLD) {
    return false; // منع التكرار
  }
  lastToastMessage = message;
  lastToastTime = now;
  return true; // السماح بعرض الرسالة
};

// Toast محسن مع منع التكرار
export const smartToast = {
  frontend: {
    success: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return frontendToast.success(message, options);
      }
    },
    error: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return frontendToast.error(message, options);
      }
    },
    info: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return frontendToast.info(message, options);
      }
    },
    warning: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return frontendToast.warning(message, options);
      }
    }
  },
  dashboard: {
    success: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return dashboardToast.success(message, options);
      }
    },
    error: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return dashboardToast.error(message, options);
      }
    },
    info: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return dashboardToast.info(message, options);
      }
    },
    warning: (message: string, options?: ToastOptions) => {
      if (preventDuplicateToast(message)) {
        return dashboardToast.warning(message, options);
      }
    }
  }
};

export default smartToast;