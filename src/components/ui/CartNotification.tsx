import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, ArrowRight, Eye, CheckCircle, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildImageUrl } from '../../config/api';
import CheckoutAuthModal from '../modals/CheckoutAuthModal';
import { smartToast } from '../../utils/toastConfig';
import PriceDisplay from './PriceDisplay';

interface CartNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  product?: {
    name: string;
    image: string;
    price: number;
    addOns?: Array<{ 
      name: string; 
      name_ar?: string; 
      name_en?: string; 
      price: number; 
      description?: string; 
      description_ar?: string; 
      description_en?: string; 
    }>;
    productOptions?: Array<{
      optionId: string;
      optionName: { ar: string; en: string };
      value: string | string[];
      priceModifier: number;
    }>;
    totalPrice?: number;
  };
  quantity?: number;
}

const CartNotification: React.FC<CartNotificationProps> = ({ 
  isVisible, 
  onClose, 
  product, 
  quantity = 1 
}) => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isRTL = i18n.language === 'ar';

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

  // Memoized calculations
  const optionsCount = useMemo(() => {
    if (!product?.productOptions) return 0;
    return Array.isArray(product.productOptions) 
      ? product.productOptions.length 
      : Object.keys(product.productOptions).length;
  }, [product?.productOptions]);

  const addOnsCount = useMemo(() => {
    return product?.addOns?.length || 0;
  }, [product?.addOns]);

  // Load cart count
  useEffect(() => {
    if (isVisible) {
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
          }
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
      }
    }
  }, [isVisible]);

  // Animation and auto close
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleViewCart = useCallback(() => {
    handleClose();
    navigate('/cart');
  }, [handleClose, navigate]);

  const handleCheckout = useCallback(() => {
    if (cartItemsCount === 0) {
      smartToast.frontend.error(t('cart_notification.cart_empty_error'));
      return;
    }
    setShowCheckoutAuthModal(true);
  }, [cartItemsCount, t]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/favi.ico';
  }, []);

  if (!isVisible || !product) return null;

  return (
    <div className={`hidden sm:block fixed top-16 sm:top-20 ${isRTL ? 'left-2 sm:left-4' : 'right-2 sm:right-4'} z-50 max-w-xs sm:max-w-sm w-full px-2 sm:px-0`}>
      <div 
        className={`bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 transform transition-all duration-500 ease-out ${
          isAnimating ? 'translate-x-0 opacity-100 scale-100' : `${isRTL ? '-translate-x-full' : 'translate-x-full'} opacity-0 scale-95`
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header with success indicator */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#18b5d5] to-[#16a2c7] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-white font-medium text-xs sm:text-sm">
              <span className="hidden sm:inline">{t('cart_notification.product_added')}</span>
            <span className="sm:hidden">{t('cart_notification.added')}</span>
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Product Info with enhanced design */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/20 shadow-lg">
            <img
              src={buildImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-xs sm:text-sm font-bold truncate mb-1 leading-tight">
              {product.name}
            </h4>
            {/* Price Breakdown */}
            <div className="mb-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="space-y-1">
                {/* Base Price */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">{t('base_price')}:</span>
                  <PriceDisplay price={product.price * quantity} className="text-white font-medium" />
                </div>
                
                {/* Options Price */}
                {product.productOptions && Array.isArray(product.productOptions) && product.productOptions.length > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{t('product_options')}:</span>
                    <PriceDisplay 
                      price={product.productOptions.reduce((sum, option) => sum + (option.priceModifier || 0), 0) * quantity} 
                      className="text-[#18b5d8] font-medium" 
                    />
                  </div>
                )}
                
                {/* Add-ons Price */}
                {product.addOns && Array.isArray(product.addOns) && product.addOns.length > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{t('addons')}:</span>
                    <PriceDisplay 
                      price={product.addOns.reduce((sum, addon) => sum + addon.price, 0) * quantity} 
                      className="text-[#16a2c7] font-medium" 
                    />
                  </div>
                )}
                
                {/* Total Price */}
                <div className="flex justify-between items-center text-sm border-t border-white/20 pt-1">
                  <span className="text-white font-bold">{t('total')}:</span>
                  <PriceDisplay 
                    price={(() => {
                      const basePrice = (product?.price || 0) * quantity;
                      const optionsPrice = product?.productOptions ? 
                        product.productOptions.reduce((sum, option) => sum + (option.priceModifier || 0), 0) * quantity : 0;
                      const addOnsPrice = product?.addOns ? 
                        product.addOns.reduce((sum, addon) => sum + addon.price, 0) * quantity : 0;
                      return basePrice + optionsPrice + addOnsPrice;
                    })()} 
                    className="text-[#18b5d8] font-bold" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 text-xs mb-2">
              <span className="text-white font-medium bg-gradient-to-r from-[#18b5d5] to-[#16a2c7] px-1.5 sm:px-2 py-1 rounded-full text-xs shadow-sm">
                {quantity}
              </span>
            </div>
            
            {/* Selected Options with improved design */}
            {optionsCount > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('cart_notification.selected_options')}:</span>
              <span className="sm:hidden">{t('cart_notification.options')}:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(product.productOptions) ? (
                    product.productOptions!.slice(0, 1).map((option, index) => (
                      <span key={index} className="text-xs bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full text-gray-200 truncate border border-white/10">
                        {option.optionName ? (i18n.language === 'ar' ? option.optionName.ar : option.optionName.en) : option.optionId}: {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                      </span>
                    ))
                  ) : (
                    Object.entries(product.productOptions!).slice(0, 1).map(([key, value]) => (
                      <span key={key} className="text-xs bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full text-gray-200 truncate border border-white/10">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    ))
                  )}
                  {optionsCount > 1 && (
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                      +{optionsCount - 1} {t('cart_notification.others')}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Add-ons with improved design */}
            {addOnsCount > 0 && (
              <div className="text-xs text-white/70">
                <span className="font-medium hidden sm:inline">{t('cart_notification.addons')}: </span>
                <span className="font-medium sm:hidden">{t('cart_notification.addons_short')}: </span>
                {product.addOns!.slice(0, 1).map((addon, index) => (
                  <span key={index} className="truncate bg-white/10 px-2 py-1 rounded-full text-xs">
                    {getLocalizedAddOnContent('name', addon)} (+{addon.price})
                  </span>
                ))}
                {addOnsCount > 1 && (
                  <span className="text-white/50 bg-white/10 px-2 py-1 rounded-full text-xs ml-1">
                    +{addOnsCount - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary with enhanced design */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-white/70 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              {t('cart_notification.total_products_in_cart')}:
            </span>
            <span className="text-[#18b5d8] font-bold bg-white/10 px-2 py-1 rounded-full">
              {cartItemsCount} {t('cart_notification.product')}
            </span>
          </div>
        </div>

        {/* Action Buttons with enhanced design */}
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={handleViewCart}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 border border-white/20 hover:border-white/30 backdrop-blur-sm hover:shadow-lg group"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t('cart_notification.view_cart')}</span>
              <span className="sm:hidden">{t('cart_notification.cart')}</span>
          </button>
          <button
            onClick={handleCheckout}
            className="flex-1 bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] hover:from-[#16a2c7] hover:to-[#18b5d8] text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 group"
          >
            <span className="hidden sm:inline">{t('cart_notification.checkout')}</span>
              <span className="sm:hidden">{t('cart_notification.order')}</span>
            <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
          </button>
        </div>
      </div>

      {/* Checkout Auth Modal */}
      {showCheckoutAuthModal && (
        <CheckoutAuthModal
          isOpen={showCheckoutAuthModal}
          onClose={() => setShowCheckoutAuthModal(false)}
          onContinueAsGuest={() => {
            setShowCheckoutAuthModal(false);
            handleClose();
            navigate('/checkout');
          }}
          onLoginSuccess={() => {
            setShowCheckoutAuthModal(false);
            handleClose();
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
};

export default CartNotification;