// API Configuration for different environments
export const API_CONFIG = {
  // للتطوير المحلي
  development: {
    baseURL: 'http://localhost:3001',
  },
  // للإنتاج - PRODUCTION READY 🚀
  production: {
    baseURL: 'https://afterads-b.onrender.com', // AfterAds backend on Render
  }
};

// الحصول على الـ base URL حسب البيئة
export const getApiBaseUrl = (): string => {
  // أولاً: تحقق من Environment Variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // ثانياً: تحقق من البيئة
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;
};

// دالة مساعدة لبناء URL كامل
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // إزالة الـ slash الأول من endpoint إذا كان موجود
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // إزالة api/ إذا كانت موجودة في endpoint لأنها ستضاف تلقائياً
  const finalEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint.slice(4) : cleanEndpoint;
  
  // إذا كان endpoint فارغ، أرجع base URL مع /api بدون trailing slash
  if (!finalEndpoint) {
    return `${baseUrl}/api`;
  }
  
  return `${baseUrl}/api/${finalEndpoint}`;
};

// دالة مساعدة لبناء URL الصور - محدثة
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:image/')) return imagePath;
  
  const baseUrl = getApiBaseUrl();
  
  // إذا كان المسار يبدأ بـ /api/ فهو endpoint API - لا نضيف /images/
  if (imagePath.startsWith('/api/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // إذا كان المسار يبدأ بـ /images/ فهو مسار نسبي من الباك إند
  if (imagePath.startsWith('/images/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // إذا كان المسار يبدأ بـ images/ بدون slash
  if (imagePath.startsWith('images/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  // إذا كان مسار عادي، أضف /images/ قبله
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}/images${cleanPath}`;
};

// دالة مركزية لجميع API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  try {
    // Don't set Content-Type for FormData - let the browser set it automatically
    const headers: Record<string, string> = {};
    
    // Only set Content-Type to application/json if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // إضافة JWT token للطلبات المحمية (admin endpoints)
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && (endpoint.includes('auth/') || endpoint.includes('users') || endpoint.includes('activity-logs') || endpoint.includes('logs/') || endpoint.includes('orders/') || endpoint.includes('customers') || endpoint.includes('admin-pin'))) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      // في حالة انتهاء صلاحية التوكن - لكن تجاهل طلبات admin-pin
      if (response.status === 401 && adminToken && !endpoint.includes('admin-pin')) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// تصدير الثوابت المفيدة
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id: string | number) => `products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `products/category/${categoryId}`,
  PRODUCTS_BY_SUBCATEGORY: (subcategoryId: string | number) => `products/subcategory/${subcategoryId}`,
  PRODUCT_REVIEWS: (id: string | number) => `products/${id}/reviews`,
  PRODUCT_DEFAULT_OPTIONS: (productType: string) => `products/default-options/${encodeURIComponent(productType)}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id: string | number) => `categories/${id}`,
  
  // Subcategories
  SUBCATEGORIES: 'subcategories',
  SUBCATEGORIES_BY_PARENT: (parentId: string | number) => `subcategories/by-parent/${parentId}`,
  SUBCATEGORY_BY_ID: (id: string | number) => `subcategories/${id}`,

  // Cart
  USER_CART: (userId: string | number) => `user/${userId}/cart`,
  CART_UPDATE_OPTIONS: (userId: string | number) => `user/${userId}/cart/update-options`,
  CART_ITEM: (userId: string | number, itemId: string | number) => `user/${userId}/cart/${itemId}`,
  
  // Wishlist
  USER_WISHLIST: (userId: string | number) => `user/${userId}/wishlist`,
  WISHLIST_CHECK: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/check/${productId}`,
  WISHLIST_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/product/${productId}`,
  
  // Orders
  CHECKOUT: 'checkout',
  ORDERS: 'orders',
  ORDER_BY_ID: (id: string | number) => `orders/${id}`,
  ORDER_STATUS: (id: string | number) => `orders/${id}/status`,
  USER_ORDERS: (email: string) => `orders/user/${encodeURIComponent(email)}`,
  
  // Auth
  SEND_OTP: 'auth/send-otp',
  VERIFY_OTP: 'auth/verify-otp',
  COMPLETE_REGISTRATION: 'auth/complete-registration',
  
  // Coupons
  COUPONS: 'coupons',
  VALIDATE_COUPON: 'coupons/validate',
  COUPON_BY_ID: (id: string | number) => `coupons/${id}`,
  
  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_STATS: 'customers/stats',
  CUSTOMER_BY_ID: (id: string | number) => `customers/${id}`,
  
  // Health Check
  HEALTH: 'health',
  
  // Services (if needed)
  SERVICES: 'services',
  SERVICE_BY_ID: (id: string | number) => `services/${id}`,
  
  // Authentication
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  CHANGE_PASSWORD: 'auth/change-password',

  // Static Pages
  STATIC_PAGES: 'static-pages',
  STATIC_PAGE_BY_ID: (id: string | number) => `static-pages/${id}`,
  STATIC_PAGE_BY_SLUG: (slug: string) => `static-pages/slug/${encodeURIComponent(slug)}`,
  
  // Blog Posts - Simplified
  BLOG_POSTS: 'blog-posts',
  BLOG_POST_BY_ID: (id: string | number) => `blog-posts/${id}`,
  BLOG_POST_BY_SLUG: (slug: string) => `blog-posts/${encodeURIComponent(slug)}`,

  // Testimonials endpoints
  TESTIMONIALS: 'testimonials',
  TESTIMONIAL_BY_ID: (id: string | number) => `testimonials/${id}`,
  TESTIMONIALS_ACTIVE: 'testimonials/active',
  TESTIMONIALS_FEATURED: 'testimonials/featured',
  TESTIMONIAL_TOGGLE_ACTIVE: (id: string | number) => `testimonials/${id}/toggle-active`,
  TESTIMONIAL_TOGGLE_FEATURED: (id: string | number) => `testimonials/${id}/toggle-featured`,
  TESTIMONIAL_SORT_ORDER: (id: string | number) => `testimonials/${id}/sort-order`,

  // Clients endpoints
  CLIENTS: 'clients',
  CLIENT_BY_ID: (id: string | number) => `clients/${id}`,
  CLIENTS_ACTIVE: 'clients/active',
  CLIENTS_FEATURED: 'clients/featured',
  CLIENTS_BY_INDUSTRY: (industry: string) => `clients/industry/${encodeURIComponent(industry)}`,
  CLIENT_TOGGLE_ACTIVE: (id: string | number) => `clients/${id}/toggle-active`,
  CLIENT_TOGGLE_FEATURED: (id: string | number) => `clients/${id}/toggle-featured`,
  CLIENT_SORT_ORDER: (id: string | number) => `clients/${id}/sort-order`,

  // Users endpoints
  USERS: 'users',
  USER_BY_ID: (id: string | number) => `users/${id}`,
  USER_RESET_PASSWORD: (id: string | number) => `users/${id}/reset-password`,

  // Comments
  COMMENTS: 'comments',
  COMMENT_BY_ID: (id: string | number) => `comments/${id}`,
  PRODUCT_COMMENTS: (productId: string | number) => `comments/product/${productId}`,
  
  // Activity Logs
  ACTIVITY_LOGS: 'activity-logs',
  ACTIVITY_LOG_BY_ID: (id: string | number) => `activity-logs/${id}`,
  ACTIVITY_LOGS_STATS: 'activity-logs/stats',
  ACTIVITY_LOGS_MY: 'activity-logs/my-activities',
  ACTIVITY_LOGS_EXPORT: 'activity-logs/export/csv',
  LOGIN_LOGS: 'activity-logs?action=login',
  
  // Admin Pin Management
  ADMIN_PIN_CURRENT: 'admin-pin/current',
  ADMIN_PIN_VERIFY: 'admin-pin/verify',
  ADMIN_PIN_UPDATE: 'admin-pin/update',

  // Portfolio Management
  PORTFOLIO: {
    LIST: 'portfolios',
    CREATE: 'portfolios',
    UPDATE: (id: string | number) => `portfolios/${id}`,
    DELETE: (id: string | number) => `portfolios/${id}`,
    BY_ID: (id: string | number) => `portfolios/${id}`,
    BY_CATEGORY: (categoryId: string | number) => `portfolios/category/${categoryId}`,
    FEATURED: 'portfolios/featured',
    TOGGLE_FEATURED: (id: string | number) => `portfolios/${id}/toggle-featured`,
  },

  // Portfolio Categories Management
  PORTFOLIO_CATEGORIES: {
    LIST: 'portfolio-categories',
    CREATE: 'portfolio-categories',
    UPDATE: (id: string | number) => `portfolio-categories/${id}`,
    DELETE: (id: string | number) => `portfolio-categories/${id}`,
    BY_ID: (id: string | number) => `portfolio-categories/${id}`,
  },

  // Upload attachments
  UPLOAD_ATTACHMENTS: 'upload-attachments',

  

 
};

// Blog Service - Simplified
export const BlogService = {
  // Get all blog posts with optional filters
  getAllPosts: async (params?: { category?: string; limit?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const endpoint = `${API_ENDPOINTS.BLOG_POSTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall(endpoint);
  },

  // Get single blog post by ID
  getPostById: async (id: string | number) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id));
  },

  // Get single blog post by slug
  getPostBySlug: async (slug: string) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_SLUG(slug));
  },

  // Create new blog post
  createPost: async (postData: any) => {
    return await apiCall(API_ENDPOINTS.BLOG_POSTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  },

  // Update blog post
  updatePost: async (id: string | number, postData: any) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  },

  // Delete blog post
  deletePost: async (id: string | number) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id), {
      method: 'DELETE',
    });
  },
};