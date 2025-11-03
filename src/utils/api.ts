import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// استخدام النظام الجديد للـ API
const API_BASE = buildApiUrl('');

// Simple cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Fast API call with caching
export const fastApi = async (endpoint: string, options: RequestInit = {}) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // استخدام buildApiUrl بدلاً من التعامل اليدوي مع المسارات
  const url = buildApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Cache successful responses
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Clear cache
export const clearCache = () => {
  cache.clear();
};

// Specific API functions
export const getProducts = () => fastApi('/products');
export const getCategories = () => fastApi('/categories');
export const getProduct = (id: string) => fastApi(`/products/${id}`);
export const getCategory = (id: string) => fastApi(`/categories/${id}`);

// Portfolio API functions
export const getPortfolios = (params?: any) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return fastApi(`/portfolios${queryString}`);
};
export const getPortfolioCategories = (params?: any) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return fastApi(`/portfolio-categories${queryString}`);
};
export const getPortfolio = (id: string) => fastApi(`/portfolios/${id}`);
export const getPortfolioCategory = (id: string) => fastApi(`/portfolio-categories/${id}`);
export const getFeaturedPortfolios = (limit?: number) => {
  const queryString = limit ? `?limit=${limit}` : '';
  return fastApi(`/portfolios/featured${queryString}`);
};
export const searchPortfolios = (query: string, params?: any) => {
  const searchParams = new URLSearchParams({ q: query, ...params });
  return fastApi(`/portfolios/search?${searchParams.toString()}`);
};

// Portfolio CRUD operations
export const createPortfolio = async (data: any) => {
  try {
    const result = await fastApi('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Create portfolio error:', error);
    return { success: false, message: 'فشل في إنشاء العمل' };
  }
};

export const updatePortfolio = async (id: string, data: any) => {
  try {
    const result = await fastApi(`/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Check if the result has success property
    if (result && result.success !== false) {
      return { success: true, data: result };
    } else {
      return { success: false, message: result?.message || 'فشل في تحديث العمل' };
    }
  } catch (error: any) {
    console.error('Update portfolio error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'فشل في تحديث العمل';
    if (error.message) {
      if (error.message.includes('404')) {
        errorMessage = 'العمل غير موجود';
      } else if (error.message.includes('400')) {
        errorMessage = 'بيانات غير صحيحة';
      } else if (error.message.includes('500')) {
        errorMessage = 'خطأ في الخادم';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, message: errorMessage };
  }
};

export const deletePortfolio = (id: string) => 
  fastApi(`/portfolios/${id}`, {
    method: 'DELETE',
  });

// Portfolio Category CRUD operations
export const createPortfolioCategory = (data: any) => 
  fastApi('/portfolio-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePortfolioCategory = (id: string, data: any) => 
  fastApi(`/portfolio-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePortfolioCategory = (id: string) => 
  fastApi(`/portfolio-categories/${id}`, {
    method: 'DELETE',
  });

export const getUserCart = (userId: string) => fastApi(`/user/${userId}/cart`);
export const getUserWishlist = (userId: string) => fastApi(`/user/${userId}/wishlist`);
export const getUserOrders = (email: string) => fastApi(API_ENDPOINTS.USER_ORDERS(email));

// POST requests (no caching)
export const addToCart = (userId: string, data: any) => 
  fastApi(`/user/${userId}/cart`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const addToWishlist = (userId: string, data: any) => 
  fastApi(`/user/${userId}/wishlist`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const removeFromWishlist = (userId: string, productId: string) => 
  fastApi(`/user/${userId}/wishlist/product/${productId}`, {
    method: 'DELETE',
  });

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
};