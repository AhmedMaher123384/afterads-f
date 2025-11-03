import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { ShoppingCart, User, CreditCard, CheckCircle, ArrowLeft, Package, MapPin, Phone, Mail, Gift, ChevronDown } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import PriceDisplay from './ui/PriceDisplay';
import { useCurrency } from '../contexts/CurrencyContext';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  productType?: string;
  additionalServices?: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
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
  addOns?: Array<{ name: string; price: number; description?: string }>;
  totalPrice?: number;
  basePrice?: number;
  addOnsPrice?: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes?: string;
  address: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

const Checkout: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { getCurrentCurrencySymbol } = useCurrency();
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
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    notes: '',
    address: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [loading, setLoading] = useState<boolean>(true);
  const [placing, setPlacing] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponValidating, setCouponValidating] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const paymentMethods: PaymentMethod[] = [
    { id: 'cod', name: t('checkout.cashOnDelivery'), description: t('checkout.cashOnDeliveryDesc') }
  ];

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        try {
          const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
          if (Array.isArray(data) && data.length > 0) {
            setCartItems(data);
            return;
          }
        } catch (error) {
          console.error('Error fetching from server, falling back to localStorage:', error);
        }
      }
      
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        const localItems = JSON.parse(localCart);
        if (Array.isArray(localItems) && localItems.length > 0) {
          const formattedItems = localItems.map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            productId: item.productId,
            quantity: item.quantity || 1,
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            basePrice: item.basePrice,
            addOnsPrice: item.addOnsPrice,
            totalPrice: item.totalPrice,
            product: item.product || {
              id: item.productId,
              name: 'منتج غير معروف',
              price: 0,
              mainImage: '',
              productType: item.product?.productType || ''
            }
          }));
          setCartItems(formattedItems);
          return;
        }
      }
      
      setCartItems([]);
    } catch (error) {
      console.error('Error in fetchCart:', error);
      smartToast.frontend.error('فشل في تحميل السلة');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);



  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerInfo(prev => ({
          ...prev,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);



  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // حساب السعر الأساسي
      const basePrice = item.basePrice || (item.product ? item.product.price : 0);
      
      // حساب سعر الخيارات
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
      
      // حساب سعر خيارات المنتج
      const productOptionsPrice = item.productOptionsPriceModifier || 0;
      
      // حساب سعر المنتجات الإضافية
      const addOnsPrice = item.addOnsPrice || 0;
      
      // استخدام totalPrice إذا كان متوفراً وأكبر من 0، وإلا احسب السعر
      const itemPrice = (item.totalPrice && item.totalPrice > 0) ? 
        item.totalPrice : (basePrice + optionsPrice + productOptionsPrice + addOnsPrice);
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getDiscountAmount = () => {
    return appliedCoupon ? appliedCoupon.discountAmount : 0;
  };

  const getFinalTotal = () => {
    return Math.max(0, getTotalPrice() - getDiscountAmount());
  };

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'التفاصيل',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش',
      fabric: 'نوع القماش',
      length: 'الطول',
      width: 'العرض',
      // خيارات المنتج الجديدة
      material: 'المادة',
      style: 'النمط',
      pattern: 'النقشة',
      finish: 'اللمسة النهائية',
      customization: 'التخصيص',
      engraving: 'النقش',
      packaging: 'التغليف'
    };
    return optionNames[optionName] || optionName;
  };

  const validateCoupon = async (code: string) => {
    try {
      setCouponValidating(true);
      const data = await apiCall(API_ENDPOINTS.VALIDATE_COUPON, {
        method: 'POST',
        body: JSON.stringify({ code, totalAmount: getTotalPrice() })
      });
      if (data.coupon && data.discountAmount !== undefined) {
        setAppliedCoupon({ ...data.coupon, discountAmount: data.discountAmount });
        smartToast.frontend.success(`تم تطبيق كود الخصم! خصم ${data.discountAmount} ${getCurrentCurrencySymbol()}`);
      } else {
        smartToast.frontend.error(data.message || 'كود الخصم غير صحيح');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      smartToast.frontend.error('فشل في التحقق من كود الخصم');
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    smartToast.frontend.info('تم إلغاء الكوبون');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAll = (): boolean => {
    if (cartItems.length === 0) {
      smartToast.frontend.error('سلة التسوق فارغة!');
      return false;
    }
    if (!customerInfo.name?.trim() || !customerInfo.phone?.trim()) {
      smartToast.frontend.error('يرجى ملء جميع بيانات التوصيل المطلوبة (الاسم ورقم الهاتف)');
      return false;
    }
    if (!customerInfo.address?.trim()) {
      smartToast.frontend.error('يرجى ملء العنوان التفصيلي');
      return false;
    }
    if (!selectedPaymentMethod) {
      smartToast.frontend.error('يرجى اختيار طريقة الدفع');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAll()) return;
    setPlacing(true);
    try {
      const userData = localStorage.getItem('user');
      let user = null;
      let isGuest = false;

      if (userData) {
        user = JSON.parse(userData);
      }
      if (!user || !user.id) {
        isGuest = true;
        user = {
          id: `guest_${Date.now()}`,
          email: customerInfo.email?.trim() || '',
          name: customerInfo.name?.trim() || '',
          phone: customerInfo.phone?.trim() || '',
          isGuest: true
        };
      }

      const paymentResult = await processPayment({});
      if (!paymentResult.success) {
        throw new Error('فشل في معالجة الدفع');
      }

      const orderPayload = {
        items: cartItems.map(item => {
          const basePrice = item.product?.price || 0;
          const optionsPrice: number = item.optionsPricing ? 
            Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
          const addOnsPrice = item.addOnsPrice || 0;
          const totalItemPrice = item.totalPrice || ((basePrice + optionsPrice + addOnsPrice) * item.quantity);
          return {
            productId: item.productId,
            productName: item.product?.name || 'منتج غير معروف',
            price: basePrice,
            quantity: item.quantity,
            totalPrice: totalItemPrice,
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            productImage: item.product?.mainImage || '',
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            basePrice: item.basePrice || basePrice,
            addOnsPrice: item.addOnsPrice || 0,
            productType: item.product?.productType || ''
          };
        }),
        customerInfo: {
          name: customerInfo.name?.trim() || '',
          email: customerInfo.email?.trim() || '',
          phone: customerInfo.phone?.trim() || '',
          notes: customerInfo.notes?.trim() || '',
          address: customerInfo.address?.trim() || ''
        },
        paymentMethod: selectedPaymentMethod,
        total: getFinalTotal(),
        subtotal: getTotalPrice(),
        couponDiscount: getDiscountAmount(),
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.coupon?.code || '',
          discount: getDiscountAmount()
        } : null,
        userId: isGuest ? null : user.id,
        isGuestOrder: isGuest,
        ...(paymentResult.paymentId && { 
          paymentId: paymentResult.paymentId,
          paymentStatus: 'paid'
        }),
        ...(!paymentResult.paymentId && { 
          paymentStatus: 'pending'
        })
      };

      console.log('📦 [Checkout] Sending orderPayload:', {
        total: orderPayload.total,
        subtotal: orderPayload.subtotal,
        couponDiscount: orderPayload.couponDiscount
      });

      const result = await apiCall(API_ENDPOINTS.CHECKOUT, {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (!result || !result.orderId) {
        throw new Error(result?.message || 'فشل في إتمام الطلب');
      }

      const thankYouOrder = {
        id: result.orderId,
        customerName: customerInfo.name?.trim() || '',
        customerEmail: customerInfo.email?.trim() || '',
        customerPhone: customerInfo.phone?.trim() || '',
        isGuest: isGuest,
        items: cartItems.map(item => {
          const basePrice = item.product?.price || 0;
          const optionsPrice: number = item.optionsPricing ? 
            Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
          const addOnsPrice = item.addOnsPrice || 0;
          const itemTotalPrice = item.totalPrice || (basePrice + optionsPrice + addOnsPrice);
          return {
            id: item.product?.id || item.productId,
            name: item.product?.name || 'منتج غير معروف',
            price: basePrice,
            quantity: item.quantity,
            mainImage: item.product?.mainImage || '',
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            basePrice: item.basePrice || basePrice,
            addOnsPrice: item.addOnsPrice || 0,
            productType: item.product?.productType || '',
            totalPrice: itemTotalPrice * item.quantity
          };
        }),
        totalAmount: getTotalPrice(),
        couponDiscount: getDiscountAmount(),
        customerAddress: customerInfo.address,
        finalAmount: getFinalTotal(),
        paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name || 'الدفع عند الاستلام',
        notes: customerInfo.notes?.trim() || '',
        orderDate: new Date().toISOString(),
        status: 'pending'
      };


      localStorage.setItem('thankYouOrder', JSON.stringify(thankYouOrder));
      localStorage.setItem('lastOrderId', thankYouOrder.id.toString());
      
      smartToast.frontend.success('تم إرسال طلبك بنجاح!');

      if (!isGuest && user && user.id) {
        await apiCall(API_ENDPOINTS.USER_CART(user.id), { method: 'DELETE' });
      } else {
        localStorage.removeItem('cart');
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/thank-you', { state: { order: thankYouOrder }, replace: true });
    } catch (error) {
      console.error('Error placing order:', error);
      smartToast.frontend.error(error instanceof Error ? error.message : 'فشل في إتمام الطلب');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentMethodSelection = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    smartToast.frontend.success(`تم اختيار ${paymentMethods.find(pm => pm.id === methodId)?.name}`);
  };

  const processPayment = async (_: any) => {
    if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'wallet') {
      const confirmPayment = window.confirm(
        `هل تريد المتابعة للدفع الإلكتروني؟\nالمبلغ: ${getFinalTotal().toFixed(2)} ${getCurrentCurrencySymbol()}`
      );
      if (!confirmPayment) throw new Error('تم إلغاء عملية الدفع');
      smartToast.frontend.success('تم الدفع بنجاح!');
      return { success: true, paymentId: 'PAY_' + Date.now() };
    }
    return { success: true, paymentId: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center" dir="rtl">
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(5deg); }
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
          `}
        </style>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8] to-[#16a2c7] rounded-lg blur opacity-75"></div>
            <div className="relative bg-[#292929] p-2 sm:p-3 rounded-lg">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
            </div>
          </div>
          <h2 className="text-lg font-black text-white">جاري تحميل السلة...</h2>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center" dir="rtl">
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(5deg); }
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
          `}
        </style>
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 text-center max-w-sm mx-auto border border-white/20 shadow-2xl hover:border-[#18b5d8]/50 transition-all duration-500">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8] via-transparent to-[#16a2c7]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <ShoppingCart className="absolute inset-0 m-auto w-10 h-10 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
          </div>
          <h2 className="text-lg font-black text-white mb-2">سلة التسوق فارغة</h2>
          <p className="text-gray-300 mb-4">أضف بعض المنتجات أولاً</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-2 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] font-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            تسوق الآن
          </button>
        </div>
      </div>
    );
  }

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
            .mobile-padding { padding: 0.75rem !important; }
            .mobile-text { font-size: 0.875rem !important; }
            .mobile-title { font-size: 1.25rem !important; }
            .mobile-grid { grid-template-columns: 1fr !important; }
            .mobile-gap { gap: 0.75rem !important; }
          }
        `}
      </style>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#18b5d8]/20 to-[#16a2c7]/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] rounded-lg blur opacity-75"></div>
                <div className="relative bg-[#292929] p-2 sm:p-3 rounded-lg">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mobile-title">{t('checkout.checkout')}</h1>
                <p className="text-gray-300 text-sm sm:text-base mobile-text">{t('checkout.reviewOrder')}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base mobile-padding"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('checkout.backToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mobile-grid mobile-gap">
          {/* Order Summary - Mobile First */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl sticky top-4 mobile-padding">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-title">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
                {t('checkout.order_summary')}
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-64 sm:max-h-80 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 mobile-padding">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="w-full sm:w-16 h-32 sm:h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.mainImage ? (
                          <img 
                            src={buildImageUrl(item.product.mainImage)} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm sm:text-base mb-1 sm:mb-2 truncate mobile-text">
                          {item.product?.name || 'منتج غير معروف'}
                        </h3>
                        
                        {/* Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="space-y-1 mb-2">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-300 flex flex-col sm:flex-row sm:justify-between">
                                <span>{formatOptionName(key)}:</span>
                                <span className="text-[#18b5d8] font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Product Options */}
                        {item.productOptions && (Array.isArray(item.productOptions) ? item.productOptions.length > 0 : Object.keys(item.productOptions).length > 0) && (
                          <div className="space-y-1 mb-2">
                            <div className="text-xs font-medium text-gray-400 mb-1">{t('cart.productOptions')}:</div>
                            {Array.isArray(item.productOptions) ? (
                              item.productOptions.map((option, index) => (
                                <div key={index} className="text-xs text-gray-300 flex flex-col sm:flex-row sm:justify-between">
                                  <span>{option.optionName ? (i18n.language === 'ar' ? option.optionName.ar : option.optionName.en) : option.optionId}:</span>
                                  <span className="text-[#18b5d8] font-medium">
                                    {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                    {option.priceModifier > 0 && (
                                      <span className="text-green-400 mr-1">
                                        (+{option.priceModifier.toLocaleString()} {getCurrentCurrencySymbol()})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))
                            ) : (
                              Object.entries(item.productOptions).map(([key, value]) => (
                                <div key={key} className="text-xs text-gray-300 flex flex-col sm:flex-row sm:justify-between">
                                  <span>{key}:</span>
                                  <span className="text-[#18b5d8] font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        
                        {/* Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {item.addOns.map((addon, addonIndex) => (
                              <div key={addonIndex} className="text-xs text-gray-300 flex flex-col sm:flex-row sm:justify-between">
                                <span>{getLocalizedAddOnContent('name', addon)}</span>
                                <span className="text-[#18b5d8] font-medium">+<PriceDisplay price={addon.price} /></span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Price Breakdown */}
                        <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="space-y-2">
                            {/* Base Price */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{t('base_price')}:</span>
                              <PriceDisplay 
                                price={(item.basePrice || (item.product ? item.product.price : 0)) * item.quantity} 
                                className="text-white font-medium" 
                              />
                            </div>
                            
                            {/* Product Options Price */}
                            {item.productOptionsPriceModifier && item.productOptionsPriceModifier > 0 && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">{t('product_options')}:</span>
                                <PriceDisplay 
                                  price={item.productOptionsPriceModifier * item.quantity} 
                                  className="text-[#18b5d8] font-medium" 
                                />
                              </div>
                            )}
                            
                            {/* Add-ons Price */}
                            {item.addOnsPrice && item.addOnsPrice > 0 && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">{t('addons')}:</span>
                                <PriceDisplay 
                                  price={item.addOnsPrice * item.quantity} 
                                  className="text-[#16a2c7] font-medium" 
                                />
                              </div>
                            )}
                            
                            {/* Total Price */}
                            <div className="border-t border-white/20 pt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium text-sm">{t('checkout.item_total')} ({item.quantity} {t('checkout.items')}):</span>
                                <PriceDisplay price={(() => {
                                  const basePrice = item.basePrice || (item.product ? item.product.price : 0);
                                  const optionsPrice = item.optionsPricing ? 
                                    Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
                                  const productOptionsPrice = item.productOptionsPriceModifier || 0;
                                  const addOnsPrice = item.addOnsPrice || 0;
                                  return (basePrice + optionsPrice + productOptionsPrice + addOnsPrice) * item.quantity;
                                })()} className="text-[#18b5d8] font-bold text-base" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Coupon Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="كود الخصم"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] text-sm sm:text-base mobile-padding mobile-text"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base font-medium mobile-padding mobile-text"
                    >
                      إلغاء
                    </button>
                  ) : (
                    <button
                      onClick={() => validateCoupon(couponCode)}
                      disabled={!couponCode.trim() || couponValidating}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-[#18b5d8] hover:bg-[#16a2c7] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm sm:text-base font-medium mobile-padding mobile-text"
                    >
                      {couponValidating ? 'جاري التحقق...' : 'تطبيق'}
                    </button>
                  )}
                </div>
                
                {appliedCoupon && (
                  <div className="mt-2 p-2 sm:p-3 bg-green-500/20 border border-green-500/30 rounded-lg mobile-padding">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xs sm:text-sm font-medium mobile-text">
                        {t('checkout.couponApplied')}: {appliedCoupon.coupon?.code}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Summary */}
              <div className="space-y-2 sm:space-y-3 border-t border-white/20 pt-4 sm:pt-6">
                <div className="flex justify-between text-gray-300 text-sm sm:text-base mobile-text">
                  <span>{t('checkout.subtotal')} ({getTotalItems()} {t('checkout.items')})</span>
                  <PriceDisplay price={getTotalPrice()} size="sm" />
                </div>
                
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-green-400 text-sm sm:text-base mobile-text">
                    <span>{t('checkout.discount')}</span>
                    <PriceDisplay price={-getDiscountAmount()} size="sm" />
                  </div>
                )}
                
                <div className="flex justify-between text-white font-bold text-lg sm:text-xl border-t border-white/20 pt-2 sm:pt-3">
                  <span>{t('checkout.total')}</span>
                  <PriceDisplay price={getFinalTotal()} size="lg" className="text-[#18b5d8]" />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information & Payment */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6 sm:space-y-8">
            {/* Customer Information */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl mobile-padding">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-title">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
                {t('checkout.deliveryInfo')}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mobile-grid mobile-gap">
                <div className="sm:col-span-2">
                  <label className="block text-white font-medium mb-2 text-sm sm:text-base mobile-text">
                    {t('checkout.fullName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all text-sm sm:text-base mobile-padding mobile-text"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2 text-sm sm:text-base mobile-text">
                    {t('checkout.phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all text-sm sm:text-base mobile-padding mobile-text"
                      placeholder="05xxxxxxxx"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2 text-sm sm:text-base mobile-text">
                    {t('checkout.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all text-sm sm:text-base mobile-padding mobile-text"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                

                
                {/* العنوان التفصيلي */}
                <div className="sm:col-span-2">
                  <label className="block text-white font-medium mb-2 text-sm sm:text-base mobile-text flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#18b5d8]" />
                    {t('checkout.address')} *
                  </label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all resize-none text-sm sm:text-base mobile-padding mobile-text"
                    placeholder={t('checkout.addressPlaceholder')}
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">{t('checkout.addressNote')}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-white font-medium mb-2 text-sm sm:text-base mobile-text">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all resize-none text-sm sm:text-base mobile-padding mobile-text"
                    placeholder={t('checkout.notesPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl mobile-padding">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-title">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
                {t('checkout.paymentMethod')}
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodSelection(method.id)}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 mobile-padding ${
                      selectedPaymentMethod === method.id
                        ? 'border-[#18b5d8] bg-[#18b5d8]/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#18b5d8] bg-[#18b5d8]'
                          : 'border-white/40'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm sm:text-base mobile-text">{method.name}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mobile-text">{method.description}</p>
                      </div>
                      
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl mobile-padding">
              <button
                onClick={handlePlaceOrder}
                disabled={placing || cartItems.length === 0}
                className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] hover:from-[#16a2c7] hover:to-[#18b5d8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg text-sm sm:text-base lg:text-lg mobile-padding mobile-text"
              >
                {placing ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    {t('checkout.processingOrder')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('checkout.confirmOrder')} - <PriceDisplay price={getFinalTotal()} />
                  </div>
                )}
              </button>
              
              <p className="text-center text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4 mobile-text">
                {t('checkout.termsAgreement')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;