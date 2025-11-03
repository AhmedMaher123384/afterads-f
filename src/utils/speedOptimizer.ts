// Speed optimizer for lightning-fast performance
import { PERFORMANCE_CONFIG } from './constants';
import { buildApiUrl, buildImageUrl } from '../config/api';

// Memory cache for instant access
const speedCache = new Map<string, any>();
const cacheTimestamps = new Map<string, number>();

// Performance monitoring
let performanceMetrics = {
  apiCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageResponseTime: 0,
  totalResponseTime: 0,
};

// Ultra-fast API call with aggressive caching
export const ultraFastApi = async (endpoint: string, options: RequestInit = {}) => {
  const startTime = performance.now();
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = speedCache.get(cacheKey);
  const timestamp = cacheTimestamps.get(cacheKey);
  
  if (cached && timestamp && Date.now() - timestamp < PERFORMANCE_CONFIG.CACHE_DURATION) {
    performanceMetrics.cacheHits++;
    return cached;
  }
  
  performanceMetrics.cacheMisses++;
  performanceMetrics.apiCalls++;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PERFORMANCE_CONFIG.API_TIMEOUT);
    
    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses
    speedCache.set(cacheKey, data);
    cacheTimestamps.set(cacheKey, Date.now());
    
    // Update performance metrics
    const responseTime = performance.now() - startTime;
    performanceMetrics.totalResponseTime += responseTime;
    performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.apiCalls;
    
    return data;
  } catch (error) {
    // Return stale cache on error if available
    if (cached) {
      console.warn('Using stale cache due to error:', error);
      return cached;
    }
    throw error;
  }
};

// Batch API calls for efficiency
export const batchApiCalls = async (endpoints: string[]) => {
  const promises = endpoints.map(endpoint => ultraFastApi(endpoint));
  return Promise.all(promises);
};

// Preload critical resources
export const preloadCriticalResources = async () => {
  try {
    // Preload in parallel for maximum speed
    await Promise.all([
      ultraFastApi('/categories'),
      ultraFastApi('/products'),
    ]);
    console.log('✅ Critical resources preloaded');
  } catch (error) {
    console.warn('⚠️ Preload failed:', error);
  }
};

// Image optimization
export const optimizeImage = (src: string, width?: number, height?: number) => {
  if (!src) return '';
  
  // Use the centralized image URL builder
  const baseUrl = buildImageUrl(src);
  
  // Add optimization parameters if provided
  if (width || height) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', '80'); // Quality 80%
    return `${baseUrl}?${params.toString()}`;
  }
  
  return baseUrl;
};

// Lazy loading with intersection observer
export const createLazyLoader = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: PERFORMANCE_CONFIG.IMAGE_LAZY_THRESHOLD,
  });
};

// Debounce for search and input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = PERFORMANCE_CONFIG.SEARCH_DEBOUNCE
): ((...args: Parameters<T>) => void) => {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle for scroll and resize
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = PERFORMANCE_CONFIG.SCROLL_THROTTLE
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory management
export const clearSpeedCache = (pattern?: string) => {
  if (pattern) {
    // Clear specific pattern
    for (const key of speedCache.keys()) {
      if (key.includes(pattern)) {
        speedCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  } else {
    // Clear all
    speedCache.clear();
    cacheTimestamps.clear();
  }
};

// Performance monitoring
export const getPerformanceMetrics = () => ({
  ...performanceMetrics,
  cacheSize: speedCache.size,
  cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100,
});

// Reset performance metrics
export const resetPerformanceMetrics = () => {
  performanceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
  };
};

// Auto-cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp > PERFORMANCE_CONFIG.CACHE_DURATION * 2) {
      speedCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}, PERFORMANCE_CONFIG.CACHE_DURATION);

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', preloadCriticalResources);
  window.addEventListener('focus', preloadCriticalResources);
  
  // Performance logging in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setInterval(() => {
      const metrics = getPerformanceMetrics();
      console.log('🚀 Performance Metrics:', metrics);
    }, 10000); // Log every 10 seconds
  }
}

// تحسينات السرعة والأداء
export class SpeedOptimizer {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

  // تخزين مؤقت ذكي
  static setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // استرجاع من التخزين المؤقت
  static getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // تنظيف التخزين المؤقت المنتهي الصلاحية
  static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // مسح التخزين المؤقت
  static clearCache(): void {
    this.cache.clear();
  }

  // تحسين الصور
  static optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';
    
    // إضافة معاملات التحسين للصور
    const separator = url.includes('?') ? '&' : '?';
    let optimizedUrl = url;
    
    if (width) {
      optimizedUrl += `${separator}w=${width}`;
    }
    if (height) {
      optimizedUrl += `${optimizedUrl.includes('?') ? '&' : '?'}h=${height}`;
    }
    
    return optimizedUrl;
  }

  // تحميل مسبق للبيانات
  static async preloadData(endpoints: string[]): Promise<void> {
    const promises = endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          this.setCache(endpoint, data);
        }
      } catch (error) {
        console.warn(`Failed to preload ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // تحسين الطلبات المتوازية
  static async parallelRequests<T>(requests: Promise<T>[]): Promise<T[]> {
    const results = await Promise.allSettled(requests);
    return results
      .filter((result) => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<T>).value);
  }

  // تأخير ذكي للطلبات
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  // تحسين الذاكرة
  static memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // تحسين التحميل التدريجي
  static createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }

  // تحسين الأداء العام
  static performanceOptimizations(): void {
    // تنظيف التخزين المؤقت كل 10 دقائق
    setInterval(() => {
      this.cleanExpiredCache();
    }, 10 * 60 * 1000);

    // تحسين الذاكرة
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.cleanExpiredCache();
      });
    }
  }
}

// تشغيل التحسينات عند تحميل الملف
SpeedOptimizer.performanceOptimizations(); 