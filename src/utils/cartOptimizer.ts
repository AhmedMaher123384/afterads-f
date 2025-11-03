// Shopping Cart Speed Optimizer - محسن سرعة سلة التسوق
import { buildApiUrl } from '../config/api';

interface CartOptimizationConfig {
  enableInstantUpdates: boolean;
  enableLocalCache: boolean;
  enableBackgroundSync: boolean;
  maxCacheAge: number;
}

const CART_CONFIG: CartOptimizationConfig = {
  enableInstantUpdates: true,
  enableLocalCache: true,
  enableBackgroundSync: true,
  maxCacheAge: 30000 // 30 seconds
};

// Cache for cart data
const cartCache = new Map<string, { data: any; timestamp: number }>();

// Instant cart operations
export const cartOptimizer = {
  // Get cart data with instant cache
  async getCart(userId: string): Promise<any[]> {
    const cacheKey = `cart_${userId}`;
    const cached = cartCache.get(cacheKey);
    
    // Return cached data immediately if available and fresh
    if (cached && Date.now() - cached.timestamp < CART_CONFIG.maxCacheAge) {
      return cached.data;
    }
    
    try {
      // Fetch fresh data
      const response = await fetch(buildApiUrl(`/user/${userId}/cart`));
      const data = await response.json();
      
      // Cache the result
      cartCache.set(cacheKey, {
        data: Array.isArray(data) ? data : [],
        timestamp: Date.now()
      });
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Return cached data if available, even if stale
      if (cached) {
        return cached.data;
      }
      return [];
    }
  },

  // Update cart quantity instantly
  async updateQuantity(userId: string, itemId: number, quantity: number): Promise<void> {
    // Update cache immediately
    const cacheKey = `cart_${userId}`;
    const cached = cartCache.get(cacheKey);
    
    if (cached) {
      const updatedData = cached.data.map((item: any) => 
        item.id === itemId ? { ...item, quantity } : item
      );
      cartCache.set(cacheKey, {
        data: updatedData,
        timestamp: Date.now()
      });
    }
    
    // Background API call
    if (CART_CONFIG.enableBackgroundSync) {
      fetch(buildApiUrl(`/user/${userId}/cart/${itemId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      }).catch(console.error);
    }
  },

  // Remove item instantly
  async removeItem(userId: string, itemId: number): Promise<void> {
    // Update cache immediately
    const cacheKey = `cart_${userId}`;
    const cached = cartCache.get(cacheKey);
    
    if (cached) {
      const updatedData = cached.data.filter((item: any) => item.id !== itemId);
      cartCache.set(cacheKey, {
        data: updatedData,
        timestamp: Date.now()
      });
    }
    
    // Background API call
    if (CART_CONFIG.enableBackgroundSync) {
      fetch(buildApiUrl(`/user/${userId}/cart/${itemId}`), {
        method: 'DELETE'
      }).catch(console.error);
    }
  },

  // Clear cart instantly
  async clearCart(userId: string): Promise<void> {
    // Update cache immediately
    const cacheKey = `cart_${userId}`;
    cartCache.set(cacheKey, {
      data: [],
      timestamp: Date.now()
    });
    
    // Background API call
    if (CART_CONFIG.enableBackgroundSync) {
      fetch(buildApiUrl(`/user/${userId}/cart`), {
        method: 'DELETE'
      }).catch(console.error);
    }
  },

  // Update options instantly
  async updateOptions(userId: string, itemId: number, options: any): Promise<void> {
    // Update cache immediately
    const cacheKey = `cart_${userId}`;
    const cached = cartCache.get(cacheKey);
    
    if (cached) {
      const updatedData = cached.data.map((item: any) => 
        item.id === itemId ? { ...item, selectedOptions: options } : item
      );
      cartCache.set(cacheKey, {
        data: updatedData,
        timestamp: Date.now()
      });
    }
    
    // Background API call
    if (CART_CONFIG.enableBackgroundSync) {
      fetch(buildApiUrl(`/user/${userId}/cart/update-options`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: itemId,
          selectedOptions: options
        })
      }).catch(console.error);
    }
  },

  // Clear cache for user
  clearCache(userId: string): void {
    const cacheKey = `cart_${userId}`;
    cartCache.delete(cacheKey);
  },

  // Preload cart data
  async preloadCart(userId: string): Promise<void> {
    await this.getCart(userId);
  },

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: cartCache.size,
      keys: Array.from(cartCache.keys())
    };
  }
};

// Auto-cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cartCache.entries()) {
    if (now - value.timestamp > CART_CONFIG.maxCacheAge * 2) {
      cartCache.delete(key);
    }
  }
}, 60000); // Clean every minute

export default cartOptimizer; 