import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, ArrowRight } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import AuthModal from './modals/AuthModal';
import CheckoutAuthModal from './modals/CheckoutAuthModal';
import PriceDisplay from './ui/PriceDisplay';
import LoadingSpinner from './ui/LoadingSpinner';



interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  optionsPricing?: Record<string, number>;
  productOptions?: Array<{
    optionId: string;
    optionName: { ar: string; en: string };
    value: string | string[];
    priceModifier: number;
  }>;
  productOptionsPriceModifier?: number;
  attachments?: {
    images?: string[];
    text?: string;
  };
  addOns?: Array<{ 
    name: string; 
    name_ar?: string; 
    name_en?: string; 
    price: number; 
    description?: string; 
    description_ar?: string; 
    description_en?: string; 
  }>;
  totalPrice?: number;
  basePrice?: number;
  addOnsPrice?: number;
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    detailedImages?: string[];
    isAvailable: boolean;
    productType?: string;
    additionalServices?: Array<{
      name: string;
      price: number;
      description?: string;
    }>;
  };
}

const ShoppingCart: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const isRTL = i18n.language === 'ar';
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const navigate = useNavigate();
  const [serverSubtotal, setServerSubtotal] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [serverLoyaltyDiscount, setServerLoyaltyDiscount] = useState<number | null>(null);
  const [serverLoyaltyAvailable, setServerLoyaltyAvailable] = useState<number | null>(null);

  // Helper function to get localized content for add-ons
  const getLocalizedAddOnContent = (field: 'name' | 'description', addOn: any) => {
    const currentLang = i18n.language;
    
    if (!addOn) return '';
    
    if (currentLang === 'ar') {
      return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
    } else {
      return addOn[`${field}_en`] || addOn[`${field}_ar`] || addOn[field] || '';
    }
  };

  // Load cart from server for logged users, fallback to localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        let cartToLoad = [];
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user?.id) {
              console.log('🔄 [ShoppingCart] User is logged in, loading cart from server:', user.id);
              
              // Load cart from server for logged users
              const serverCart = await apiCall(API_ENDPOINTS.USER_CART(user.id));
              
              if (Array.isArray(serverCart)) {
                cartToLoad = serverCart;
                setServerSubtotal(null);
                setServerTotal(null);
                setServerLoyaltyDiscount(null);
                setServerLoyaltyAvailable(null);
                console.log('✅ [ShoppingCart] Loaded cart from server (array):', cartToLoad.length, 'items');
              } else if (serverCart && typeof serverCart === 'object') {
                if (Array.isArray((serverCart as any).cart)) {
                  cartToLoad = (serverCart as any).cart;
                } else if (Array.isArray((serverCart as any).items)) {
                  cartToLoad = (serverCart as any).items;
                } else {
                  console.warn('⚠️ [ShoppingCart] Server returned unexpected cart format, falling back to local storage');
                  throw new Error('Invalid server cart format');
                }
                setServerSubtotal(typeof (serverCart as any).subtotal === 'number' ? (serverCart as any).subtotal : null);
                setServerTotal(typeof (serverCart as any).total === 'number' ? (serverCart as any).total : null);
                setServerLoyaltyDiscount(typeof (serverCart as any).loyaltyDiscount === 'number' ? (serverCart as any).loyaltyDiscount : null);
                setServerLoyaltyAvailable(typeof (serverCart as any).loyaltyAvailable === 'number' ? (serverCart as any).loyaltyAvailable : null);
              } else {
                console.warn('⚠️ [ShoppingCart] Server returned non-object cart format');
                throw new Error('Invalid server cart format');
              }
              
              // Update local storage with server cart
              localStorage.setItem('cart', JSON.stringify(cartToLoad));
              console.log('✅ [ShoppingCart] Local storage synced with server cart');
              
              // Dispatch cart update event
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
          } catch (serverError) {
            console.error('❌ [ShoppingCart] Error loading cart from server, falling back to local storage:', serverError);
            // Fallback to local storage if server fails
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              cartToLoad = JSON.parse(savedCart);
            }
          }
        } else {
          console.log('👤 [ShoppingCart] User not logged in, loading from local storage');
          // Load from local storage for non-logged users
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            cartToLoad = JSON.parse(savedCart);
          }
        }
        
        setCartItems(cartToLoad);
      } catch (error) {
        console.error('Error loading cart:', error);
        smartToast.frontend.error('فشل في تحميل السلة');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage
  const saveCartToLocalStorage = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      smartToast.frontend.error(t('cart.saveError'));
    }
  }, [t]);

  // Update quantity
  const updateQuantity = useCallback(
    async (itemId: number, newQuantity: number) => {
      if (newQuantity < 1) return;

      try {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          if (user?.id) {
            console.log('🔄 [ShoppingCart] Updating quantity on server for user:', user.id, 'item:', itemId, 'quantity:', newQuantity);
            
            // Update quantity on server
            await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
              method: 'PUT',
              body: JSON.stringify({ quantity: newQuantity })
            });
             
            console.log('✅ [ShoppingCart] Successfully updated quantity on server');
          }
        }
        
        // Update local state and localStorage
        const updatedItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        window.dispatchEvent(new Event('cartUpdated'));
        smartToast.frontend.success(t('cart.quantityUpdated'));
      } catch (error) {
        console.error('❌ [ShoppingCart] Error updating quantity:', error);
        
        // Still update locally even if server update fails
        const updatedItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        window.dispatchEvent(new Event('cartUpdated'));
        
        smartToast.frontend.error(t('cart.quantityUpdatedLocallyOnly'));
      }
    },
    [cartItems, saveCartToLocalStorage]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (itemId: number) => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          if (user?.id) {
            console.log('🗑️ [ShoppingCart] Removing item from server for user:', user.id, 'item:', itemId);
            
            // Delete from server
            await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
              method: 'DELETE'
            });
            
            console.log('✅ [ShoppingCart] Successfully removed item from server');
          }
        }
        
        // Update local state and localStorage
        const updatedItems = cartItems.filter((item) => item.id !== itemId);
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: { count: updatedItems.length } }));
        smartToast.frontend.success(t('cart.itemRemoved'));
      } catch (error) {
        console.error('❌ [ShoppingCart] Error removing item:', error);
        
        // Still remove locally even if server removal fails
        const updatedItems = cartItems.filter((item) => item.id !== itemId);
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: { count: updatedItems.length } }));
        
        smartToast.frontend.error(t('cart.itemRemovedLocallyOnly'));
      }
    },
    [cartItems, saveCartToLocalStorage]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      saveCartToLocalStorage([]);

      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            await apiCall(API_ENDPOINTS.USER_CART(user.id), { method: 'DELETE' });
            localStorage.setItem(`cartCount_${user.id}`, '0');
          }
        } catch (error) {
          console.error('Error clearing server cart:', error);
        }
      }

      localStorage.setItem('lastCartCount', '0');
      localStorage.removeItem('cart');

      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('cartCountChanged'));
      window.dispatchEvent(new Event('forceCartUpdate'));
      window.dispatchEvent(new CustomEvent('cartCleared', { detail: { count: 0 } }));

      document.querySelectorAll('[data-cart-count]').forEach((element) => {
        if (element instanceof HTMLElement) {
          element.textContent = '0';
          element.style.display = 'none';
        }
      });

      smartToast.frontend.success(t('cart.cartCleared'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      smartToast.frontend.error(t('cart.clearCartError'));
    }
  }, [saveCartToLocalStorage]);

  // Calculate totals
  const subtotal = useMemo(() => {
    if (serverSubtotal !== null && serverSubtotal !== undefined) return serverSubtotal;
    return cartItems.reduce((total, item) => {
      const basePrice = item.basePrice || item.product.price;
      const addOnsPrice = item.addOnsPrice || 0;
      
      // Calculate options price from both sources
      let optionsPrice = 0;
      if (item.optionsPricing) {
        optionsPrice += Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0);
      }
      if (item.productOptionsPriceModifier) {
        optionsPrice += item.productOptionsPriceModifier;
      }
      
      const itemTotal = (basePrice + addOnsPrice + optionsPrice) * item.quantity;
      return total + itemTotal;
    }, 0);
  }, [cartItems]);

  const total = serverTotal ?? subtotal;

  // Proceed to checkout
  const proceedToCheckout = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setShowCheckoutAuthModal(true);
      return;
    }
    
    navigate('/checkout');
  };

  // Filter cart items (no search, but keeping filteredCartItems for consistency)
  const filteredCartItems = cartItems;

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8] via-transparent to-[#16a2c7]"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #18b5d8 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #16a2c7 0%, transparent 50%)`,
          backgroundSize: '100px 100px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(24, 181, 216, 0.3)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 10px rgba(24, 181, 216, 0.7)); transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          @media (max-width: 640px) {
            .animate-pulse:not(.essential) { animation: none; }
          }
        `}
      </style>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-16 mt-[60px] sm:mt-[80px]">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1 sm:gap-3 mb-3 sm:mb-6">
            <div className="relative w-8 h-8 sm:w-12 sm:h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <CartIcon className="absolute inset-0 m-auto w-4 h-4 sm:w-6 sm:h-6 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white">
              {t('cart.title')} <span className="text-[#18b5d8]">{t('cart.yourCart')}</span>
            </h1>
            <div className="relative w-8 h-8 sm:w-12 sm:h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <CartIcon className="absolute inset-0 m-auto w-4 h-4 sm:w-6 sm:h-6 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
            </div>
          </div>
          <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto px-2 sm:px-4">
            {t('cart.description')}
          </p>
        </div>

        {/* Clear Cart Button */}
        {cartItems.length > 0 && (
          <div className="relative flex mb-6 sm:mb-12 justify-center">
            <button
              onClick={clearCart}
              className="relative flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl sm:rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base"
              aria-label={t('cart.clearCartAriaLabel')}
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('cart.clearCart')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isInitialLoading && (
      <LoadingSpinner message={t('home.themes.loading')} />
        )}

        {/* Empty Cart State */}
        {!isInitialLoading && filteredCartItems.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CartIcon className="w-10 h-10 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mb-4">{t('cart.emptyTitle')}</h3>
            <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
              {t('cart.emptyDescription')}
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
              <Link
                to="/products"
                className="block w-full btn-pro btn-pro-lg"
                aria-label={t('cart.browseProducts')}
              >
                {t('cart.browseProducts')}
              </Link>
              <Link
                to="/"
                className="block w-full btn-pro-outline btn-pro-lg"
                aria-label={t('cart.backToHome')}
              >
                {t('cart.backToHome')}
              </Link>
            </div>
          </div>
        )}

        {/* Cart Items and Order Summary */}
        {!isInitialLoading && filteredCartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-10 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-10">
              {filteredCartItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden group hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 transform hover:-translate-y-1 relative"
                >
                  {/* Decorative Circle */}
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-8 relative z-10">
                    {/* Product Image */}
                    <div className="md:col-span-1 order-1 relative">
                      <img
                        src={buildImageUrl(item.product.mainImage)}
                        alt={item.product.name}
                        loading="lazy"
                        className="w-full h-32 sm:h-48 object-cover rounded-xl sm:rounded-2xl border-2 border-[#18b5d8]/40 shadow-lg group-hover:border-[#18b5d8] transition-all duration-300 transform hover:scale-105"
                        onError={(e) => (e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3')}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-2 order-2 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2 line-clamp-2 hover:text-[#18b5d8] transition-colors duration-300">
                          {item.product.name}
                        </h3>
                       {item.product.description && Array.isArray(item.product.description) && item.product.description.length > 0 && (
  <div className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
    {item.product.description.map((desc: any, idx: number) => (
      <div key={idx} dangerouslySetInnerHTML={{ __html: desc.text || '' }} />
    ))}
  </div>
)}
                        {/* Price Breakdown */}
                        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-[#18b5d8]/10 to-[#16a2c7]/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
                          <div className="space-y-2">
                            {/* Base Price */}
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 text-xs sm:text-sm font-medium">{t('base_price')}:</span>
                              <PriceDisplay 
                                price={item.product.price * item.quantity} 
                                className="text-sm sm:text-base font-bold text-white"
                              />
                            </div>
                            
                            {/* Product Options Price */}
                            {item.productOptionsPriceModifier && item.productOptionsPriceModifier > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-xs sm:text-sm font-medium">{t('product_options')}:</span>
                                <PriceDisplay 
                                  price={item.productOptionsPriceModifier * item.quantity} 
                                  className="text-sm sm:text-base font-bold text-[#18b5d8]"
                                />
                              </div>
                            )}

                            {/* Display attachments if exists */}
{item.attachments?.text && (
  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
    <h4 className="text-xs sm:text-sm font-bold text-white mb-2">
      {t('cart.notes')}:
    </h4>
    <p className="text-gray-300 text-sm">{item.attachments.text}</p>
  </div>
)}

{item.attachments?.images && Array.isArray(item.attachments.images) && item.attachments.images.length > 0 && (
  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
    <h4 className="text-xs sm:text-sm font-bold text-white mb-2">
      {t('cart.attachedImages')}:
    </h4>
    <div className="flex gap-2 flex-wrap">
      {item.attachments.images.map((img, idx) => (
        <img 
          key={idx} 
          src={buildImageUrl(img)} 
          alt={`attachment-${idx}`} 
          className="w-16 h-16 rounded object-cover border border-[#18b5d8]/30"
        />
      ))}
    </div>
  </div>
)}
                            
                            {/* Add-ons Price */}
                            {item.addOnsPrice && item.addOnsPrice > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-xs sm:text-sm font-medium">{t('addons')}:</span>
                                <PriceDisplay 
                                  price={item.addOnsPrice * item.quantity} 
                                  className="text-sm sm:text-base font-bold text-[#16a2c7]"
                                />
                              </div>
                            )}
                            
                            {/* Total Price */}
                            <div className="border-t border-white/20 pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white text-sm sm:text-base font-bold">{t('total')}:</span>
                                <PriceDisplay 
                                  price={(() => {
                                    const basePrice = item.product.price * item.quantity;
                                    const optionsPrice = (item.productOptionsPriceModifier || 0) * item.quantity;
                                    const addOnsPrice = (item.addOnsPrice || 0) * item.quantity;
                                    return basePrice + optionsPrice + addOnsPrice;
                                  })()} 
                                  originalPrice={item.product.originalPrice && item.product.originalPrice > item.product.price ? (item.product.originalPrice * item.quantity) : undefined}
                                  className="text-lg sm:text-xl font-black text-[#18b5d8]"
                                  size="lg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Display selected options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
                            <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                              {t('cart.selectedOptions')}:
                            </h4>
                            <div className="space-y-1 sm:space-y-2">
                              {Object.entries(item.selectedOptions).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-xs sm:text-sm">
                                  <span className="text-gray-300">{key}:</span>
                                  <span className="text-[#18b5d8] font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display product options */}
                        {item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0 && (
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
                            <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                              {t('cart.productOptions')}:
                            </h4>
                            <div className="space-y-1 sm:space-y-2">
                              {item.productOptions.map((option, index) => (
                                <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                                  <span className="text-gray-300">
                                    {option.optionName ? (i18n.language === 'ar' ? option.optionName.ar : option.optionName.en) : option.optionId}:
                                  </span>
                                  <span className="text-[#18b5d8] font-medium">
                                    {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display selected add-ons */}
                        {item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0 && (
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/30">
                            <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                              {t('cart.additionalProducts')}:
                            </h4>
                            <div className="space-y-1 sm:space-y-2">
                              {item.addOns.map((addOn: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-gray-300">{getLocalizedAddOnContent('name', addOn)}</span>
                                    {getLocalizedAddOnContent('description', addOn) && (
                                      <span className="text-xs text-gray-400">{getLocalizedAddOnContent('description', addOn)}</span>
                                    )}
                                  </div>
                                  <PriceDisplay price={addOn.price} className="text-[#18b5d8] font-bold" size="sm" />
                                </div>
                              ))}
                            </div>
                            {item.basePrice && item.addOnsPrice && (
                              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
                                <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                                  <span className="text-gray-300">{t('cart.basePrice')}:</span>
                                  <PriceDisplay price={item.basePrice} />
                                </div>
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                  <span className="text-gray-300">{t('cart.additionalProductsPrice')}:</span>
                                  <PriceDisplay price={item.addOnsPrice} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-white font-bold text-sm sm:text-base">{t('cart.quantity')}:</span>
                          <div className="flex items-center bg-[#18b5d8]/10 rounded-lg sm:rounded-xl overflow-hidden border border-[#18b5d8]/30">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 sm:p-2 hover:bg-[#18b5d8]/30 transition-colors text-white"
                              disabled={item.quantity <= 1}
                              aria-label={t('cart.decreaseQuantity')}
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-2 sm:px-4 py-1 sm:py-2 text-white font-bold min-w-[2rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 sm:p-2 hover:bg-[#18b5d8]/30 transition-colors text-white"
                              aria-label={t('cart.increaseQuantity')}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1 sm:gap-2 text-red-400 hover:text-red-300 transition-colors font-bold text-sm sm:text-base"
                          aria-label={`${t('cart.removeFromCart')} ${item.product.name}`}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          {t('cart.removeFromCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden group hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 sticky top-20 sm:top-24 relative">
                {/* Decorative Circle */}
                <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full animate-pulse"></div>
                <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] px-4 sm:px-6 py-3 sm:py-5 relative z-10">
                  <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-1 sm:gap-2">
                    <Package className="w-4 h-4 sm:w-6 sm:h-6" />
                    {t('cart.orderSummary')}
                  </h3>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
                  {serverLoyaltyAvailable !== null && (
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                      <span className="text-gray-300 font-medium text-sm sm:text-base">نقاط الولاء المتاحة:</span>
                      <span className="text-white font-black text-base sm:text-lg">{serverLoyaltyAvailable}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <span className="text-gray-300 font-medium text-sm sm:text-base">{t('cart.subtotal')}:</span>
                    <PriceDisplay price={subtotal} className="font-black text-white text-base sm:text-lg" />
                  </div>

                  <div className="border-t-2 border-[#18b5d8]/30 pt-3 sm:pt-4">
                    {serverLoyaltyDiscount && serverLoyaltyDiscount > 0 && (
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-2">
                        <span className="text-purple-400 font-medium text-sm sm:text-base">خصم نقاط الولاء</span>
                        <PriceDisplay price={-serverLoyaltyDiscount} className="font-black text-purple-400 text-base sm:text-lg" />
                      </div>
                    )}
                    <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-[#18b5d8]/20 to-[#16a2c7]/20 rounded-xl sm:rounded-2xl border-2 border-[#18b5d8]/30">
                      <span className="font-black text-white text-lg sm:text-xl">{t('cart.total')}:</span>
                      <PriceDisplay price={total} className="text-2xl sm:text-3xl font-black text-[#18b5d8]" />
                    </div>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    aria-label={t('cart.proceedToCheckout')}
                  >
                    <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    {t('cart.proceedToCheckout')}
                  </button>
                  <Link
                    to="/products"
                    className="block w-full text-center mt-3 sm:mt-4 text-gray-300 hover:text-[#18b5d8] transition-colors font-bold text-sm sm:text-base"
                    aria-label={t('cart.continueShopping')}
                  >
                    {t('cart.continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modals */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => {
              setShowAuthModal(false);
            }}
          />
        )}
        {showCheckoutAuthModal && (
          <CheckoutAuthModal
            isOpen={showCheckoutAuthModal}
            onClose={() => setShowCheckoutAuthModal(false)}
            onContinueAsGuest={() => {
              setShowCheckoutAuthModal(false);
              navigate('/checkout');
            }}
            onLoginSuccess={() => {
              setShowCheckoutAuthModal(false);
              navigate('/checkout');
            }}
          />
        )}
      </div>
    </section>
  );
};

export default ShoppingCart;