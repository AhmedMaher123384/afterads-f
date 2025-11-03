import { buildApiUrl } from '../config/api';

// Performance-optimized constants
export const PERFORMANCE_CONFIG = {
  // API settings
  API_TIMEOUT: 3000, // 3 seconds max
  CACHE_DURATION: 60000, // 1 minute
  RETRY_ATTEMPTS: 2,
  
  // Animation settings (minimal for speed)
  ANIMATION_DURATION: 200, // 200ms for fast animations
  TRANSITION_DURATION: 150, // 150ms for transitions
  HOVER_DELAY: 50, // 50ms hover delay
  
  // Image settings
  IMAGE_LAZY_THRESHOLD: 0.1,
  IMAGE_PRELOAD_COUNT: 5,
  
  // Pagination
  PRODUCTS_PER_PAGE: 20,
  INFINITE_SCROLL_THRESHOLD: 200,
  
  // Debounce/Throttle
  SEARCH_DEBOUNCE: 300,
  SCROLL_THROTTLE: 100,
  RESIZE_THROTTLE: 250,
};

// API Configuration
export const API_CONFIG = {
  BASE: buildApiUrl(''),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/user/:userId/cart',
  WISHLIST: '/user/:userId/wishlist',
  REVIEWS: '/products/:productId/reviews',
  AUTH: '/auth',
};

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Color palette for consistent theming
export const COLORS = {
  PRIMARY: {
    50: '#fdf2f8',
    100: '#fce7f3',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
  },
  SUCCESS: '#18b5d5',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
};

// Performance monitoring
export const PERFORMANCE_METRICS = {
  CRITICAL_RENDER_TIME: 1000, // 1 second
  ACCEPTABLE_LOAD_TIME: 2000, // 2 seconds
  SLOW_LOAD_TIME: 3000, // 3 seconds
};

// Cache keys
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  USER_CART: 'user_cart_',
  USER_WISHLIST: 'user_wishlist_',
  PRODUCT_DETAIL: 'product_',
  CATEGORY_PRODUCTS: 'category_products_',
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  CART_UPDATED: 'cartUpdated',
  WISHLIST_UPDATED: 'wishlistUpdated',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  SERVER_ERROR: 'خطأ في الخادم',
  NOT_FOUND: 'العنصر غير موجود',
  UNAUTHORIZED: 'غير مصرح لك بهذا الإجراء',
  VALIDATION_ERROR: 'خطأ في البيانات المدخلة',
  GENERIC_ERROR: 'حدث خطأ غير متوقع',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ADDED_TO_CART: 'تم إضافة المنتج إلى السلة',
  ADDED_TO_WISHLIST: 'تم إضافة المنتج إلى قائمة الأمنيات',
  REMOVED_FROM_CART: 'تم حذف المنتج من السلة',
  REMOVED_FROM_WISHLIST: 'تم حذف المنتج من قائمة الأمنيات',
  ORDER_PLACED: 'تم تأكيد الطلب بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي',
};

export const TOAST_CONFIG = {
  position: 'bottom-left' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  rtl: true,
}; 