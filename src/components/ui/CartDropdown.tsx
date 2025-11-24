import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../../config/api';
import CheckoutAuthModal from '../modals/CheckoutAuthModal';
import PriceDisplay from './PriceDisplay';
import Spinner from './Spinner';
import notfoundImg from '../../assets/search_not_found.png';

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

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

// Memoized Cart Item Component
const CartItemCard = memo(({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  getLocalizedAddOnContent,
  isRTL,
  t 
}: { 
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  getLocalizedAddOnContent: (field: 'name' | 'description', addOn: any) => string;
  isRTL: boolean;
  t: any;
}) => {
  // Memoize calculations
  const itemPrices = useMemo(() => {
    const basePrice = (item.basePrice || item.product.price) * item.quantity;
    
    let optionsPrice = 0;
    if (item.optionsPricing) {
      optionsPrice += Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0);
    }
    if (item.productOptionsPriceModifier) {
      optionsPrice += item.productOptionsPriceModifier;
    }
    optionsPrice *= item.quantity;
    
    const addOnsPrice = (item.addOnsPrice || 0) * item.quantity;
    const total = basePrice + optionsPrice + addOnsPrice;
    
    return { basePrice, optionsPrice, addOnsPrice, total };
  }, [item]);

  const hasOptions = useMemo(() => 
    (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) || 
    (item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0),
    [item.selectedOptions, item.productOptions]
  );

  const hasAddOns = useMemo(() => 
    item.addOns && item.addOns.length > 0,
    [item.addOns]
  );

  const hasAdditionalServices = useMemo(() => 
    item.product.additionalServices && item.product.additionalServices.length > 0,
    [item.product.additionalServices]
  );

  return (
    <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 p-1.5 xs:p-2 sm:p-3 hover:bg-white/5 rounded-lg xs:rounded-xl transition-colors">
      {/* Product Image */}
      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-md xs:rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
        <img
          src={item.product.mainImage ? buildImageUrl(item.product.mainImage) : notfoundImg}
          alt={item.product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = notfoundImg;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-xs sm:text-sm font-medium truncate">
          {item.product.name}
        </h4>
        
        {/* Options */}
        {hasOptions && (
          <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-white/80 font-medium mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-[#18b5d8] rounded-full"></span>
              {t('product_options')}
            </div>
            
            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
              <div className="space-y-1 mb-2">
                {Object.entries(item.selectedOptions).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs flex justify-between items-center bg-white/5 rounded px-2 py-1">
                    <span className="text-white/70">{key}:</span>
                    <span className="text-[#18b5d8] font-medium">{value}</span>
                  </div>
                ))}
                {Object.keys(item.selectedOptions).length > 2 && (
                  <div className="text-xs text-white/50 text-center">
                    +{Object.keys(item.selectedOptions).length - 2} {t('cart_dropdown.other_options')}
                  </div>
                )}
              </div>
            )}
            
            {item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0 && (
              <div className="space-y-1">
                {item.productOptions.slice(0, 2).map((option, index) => (
                  <div key={index} className="text-xs flex justify-between items-center bg-white/5 rounded px-2 py-1">
                    <span className="text-white/70">
                      {option.optionName ? (isRTL ? option.optionName.ar : option.optionName.en) : option.optionId}:
                    </span>
                    <span className="text-[#18b5d8] font-medium">
                      {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                    </span>
                  </div>
                ))}
                {item.productOptions.length > 2 && (
                  <div className="text-xs text-white/50 text-center">
                    +{item.productOptions.length - 2} {t('cart_dropdown.other_options')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Add-ons */}
        {hasAddOns && (
          <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-white/80 font-medium mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-[#18b5d8] rounded-full"></span>
              {t('addons')}
            </div>
            <div className="space-y-1">
              {item.addOns!.slice(0, 2).map((addon, index) => (
                <div key={index} className="text-xs flex justify-between items-center bg-white/5 rounded px-2 py-1">
                  <span className="text-white/70">
                    {getLocalizedAddOnContent('name', addon)}
                  </span>
                  <span className="text-[#18b5d8] font-medium">
                    +<PriceDisplay price={addon.price} />
                  </span>
                </div>
              ))}
              {item.addOns!.length > 2 && (
                <div className="text-xs text-white/50 text-center">
                  +{item.addOns!.length - 2} {t('cart_dropdown.other_addons')}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Additional Services */}
        {hasAdditionalServices && (
          <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {t('cart_dropdown.available_to_add')}:
            </div>
            <div className="space-y-1">
              {item.product.additionalServices!.slice(0, 2).map((service, index) => (
                <div key={index} className="text-xs text-gray-200 flex justify-between items-center bg-white/5 rounded px-2 py-1">
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400 text-xs">+</span>
                    {service.name}
                  </span>
                  <span className="text-[#18b5d8] font-medium">
                    <PriceDisplay price={service.price} />
                  </span>
                </div>
              ))}
            </div>
            {item.product.additionalServices!.length > 2 && (
              <div className="text-xs text-blue-300 mt-1 text-center">
                +{item.product.additionalServices!.length - 2} {t('cart_dropdown.other_products')}
              </div>
            )}
          </div>
        )}
        
        {/* Price Breakdown */}
        <div className="mt-3 p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/10">
          <div className="text-xs text-white/80 font-medium mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#18b5d8] rounded-full"></span>
            {t('price_breakdown')}
          </div>
          <div className="space-y-1.5">
            {/* Base Price */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70">{t('base_price')}</span>
              <span className="text-white font-medium">
                <PriceDisplay price={itemPrices.basePrice} />
              </span>
            </div>
            
            {/* Options Price */}
            {itemPrices.optionsPrice > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70">{t('product_options')}</span>
                <span className="text-[#18b5d8] font-medium">
                  +<PriceDisplay price={itemPrices.optionsPrice} />
                </span>
              </div>
            )}
            
            {/* Add-ons Price */}
            {itemPrices.addOnsPrice > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70">{t('addons')}</span>
                <span className="text-[#18b5d8] font-medium">
                  +<PriceDisplay price={itemPrices.addOnsPrice} />
                </span>
              </div>
            )}
            
            <div className="border-t border-white/20 my-1"></div>
            
            {/* Total */}
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-white">{t('total')}</span>
              <span className="text-[#18b5d8]">
                <PriceDisplay price={itemPrices.total} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-0.5 xs:gap-1">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <Minus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
        </button>
        <span className="w-5 xs:w-6 sm:w-8 text-center text-white text-xs sm:text-sm font-medium">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
      >
        <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
      </button>
    </div>
  );
});

CartItemCard.displayName = 'CartItemCard';

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose, onHoverChange }) => {
  const { t, i18n } = useTranslation('common');
  const isRTL = useMemo(() => i18n.language === 'ar', [i18n.language]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const [serverSubtotal, setServerSubtotal] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const navigate = useNavigate();

  // Memoized helper function
  const getLocalizedAddOnContent = useCallback((field: 'name' | 'description', addOn: any) => {
    const currentLang = i18n.language;
    
    if (!addOn) return '';
    
    if (currentLang === 'ar') {
      return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
    } else {
      return addOn[`${field}_en`] || addOn[`${field}_ar`] || addOn[field] || '';
    }
  }, [i18n.language]);

  // Memoized cart loading function
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        
        try {
          const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
          
          let cartToLoad = [];
          if (Array.isArray(data) && data.length > 0) {
            cartToLoad = data;
            setServerSubtotal(null);
            setServerTotal(null);
          } else if (data && typeof data === 'object') {
            if (data.cart && Array.isArray(data.cart) && data.cart.length > 0) {
              cartToLoad = data.cart;
            } else if (data.items && Array.isArray(data.items) && data.items.length > 0) {
              cartToLoad = data.items;
            }
            setServerSubtotal(typeof (data as any).subtotal === 'number' ? (data as any).subtotal : null);
            setServerTotal(typeof (data as any).total === 'number' ? (data as any).total : null);
          }
          
          if (cartToLoad.length > 0) {
            setCartItems(cartToLoad);
            localStorage.setItem('cart', JSON.stringify(cartToLoad));
            return;
          }
        } catch (serverError) {
          console.error('Server error, falling back to localStorage:', serverError);
        }
      }
      
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on open and on updates
  useEffect(() => {
    if (isOpen && cartItems.length === 0) {
      loadCart();
    }

    const handleCartUpdate = () => loadCart();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountChanged', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountChanged', handleCartUpdate);
    };
  }, [isOpen, cartItems.length, loadCart]);

  // Continuous cart update listener
  useEffect(() => {
    const handleCartUpdate = () => loadCart();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountChanged', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountChanged', handleCartUpdate);
    };
  }, [loadCart]);

  // Memoized update quantity
  const updateQuantity = useCallback(async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity })
          });
        }
      }
      
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
    }
  }, [cartItems]);

  // Memoized remove from cart
  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
            method: 'DELETE'
          });
        }
      }
      
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
      smartToast.frontend.success(t('cart_dropdown.product_removed'));
    } catch (error) {
      console.error('Error removing item:', error);
      
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
      smartToast.frontend.success(t('cart_dropdown.product_removed'));
    }
  }, [cartItems, t]);

  // Memoized calculate total
  const calculatedTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.basePrice || item.product.price;
      
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
      
      const addOnsPrice = item.addOnsPrice || 0;
      
      const itemPrice = (item.totalPrice && item.totalPrice > 0) ? 
        item.totalPrice : (basePrice + optionsPrice + addOnsPrice);
      
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);

  // Memoized handlers
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      smartToast.frontend.error(t('cart_dropdown.cart_empty_error'));
      return;
    }
    setShowCheckoutAuthModal(true);
  }, [cartItems.length, t]);

  const handleViewCart = useCallback(() => {
    onClose();
    navigate('/cart');
  }, [onClose, navigate]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHoverChange?.(false);
    setTimeout(() => {
      if (!isHovered) {
        onClose();
      }
    }, 300);
  }, [isHovered, onClose, onHoverChange]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="relative w-64 xs:w-72 sm:w-96 md:w-80 lg:w-96 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 max-h-[60vh] xs:max-h-[65vh] sm:max-h-[80vh] overflow-hidden"
        style={{
          background: '#292929',
          backdropFilter: 'blur(16px) saturate(150%)',
          WebkitBackdropFilter: 'blur(16px) saturate(150%)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
              <span className="hidden xs:inline">{t('cart_dropdown.shopping_cart')}</span>
              <span className="xs:hidden">{t('cart_dropdown.cart')}</span>
            </h3>
            <span className="text-xs sm:text-sm text-white/70">
              {cartItems.length} {t('cart_dropdown.product')}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-40 xs:max-h-48 sm:max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 sm:p-6 text-center flex flex-col items-center gap-3">
              <Spinner size={28} />
              <p className="text-white/80 text-xs sm:text-sm">{t('common.loading')}</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="p-3 xs:p-4 sm:p-6 text-center">
              <Package className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-white/30 mx-auto mb-2 sm:mb-3" />
              <p className="text-white/70 mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base">
                {t('cart_dropdown.cart_empty')}
              </p>
            </div>
          ) : (
            <div className="p-1 xs:p-1 sm:p-2">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  getLocalizedAddOnContent={getLocalizedAddOnContent}
                  isRTL={isRTL}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-2 xs:p-3 sm:p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span className="text-white font-medium text-sm sm:text-base">
                {t('cart_dropdown.total')}:
              </span>
              <span className="text-[#18b5d8] font-bold text-base sm:text-lg">
                <PriceDisplay price={serverTotal ?? calculatedTotal} />
              </span>
            </div>

            <div className="flex gap-1 xs:gap-2">
              <button
                onClick={handleViewCart}
                className="flex-1 btn-pro-outline btn-pro-sm"
              >
                <span className="hidden sm:inline">{t('cart_dropdown.view_cart')}</span>
                <span className="sm:hidden">{t('cart_dropdown.cart')}</span>
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 btn-pro btn-pro-sm flex items-center justify-center gap-1 sm:gap-2"
              >
                <span className="hidden sm:inline">{t('cart_dropdown.checkout')}</span>
                <span className="sm:hidden">{t('cart_dropdown.buy')}</span>
                <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showCheckoutAuthModal && (
        <CheckoutAuthModal
          isOpen={showCheckoutAuthModal}
          onClose={() => setShowCheckoutAuthModal(false)}
          onContinueAsGuest={() => {
            setShowCheckoutAuthModal(false);
            onClose();
            navigate('/checkout');
          }}
          onLoginSuccess={() => {
            setShowCheckoutAuthModal(false);
            onClose();
            navigate('/checkout');
          }}
        />
      )}
    </>
  );
};

export default memo(CartDropdown);