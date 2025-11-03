import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  Package, 
  Clock, 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight, 
  Home, 
  ShoppingBag,
  Star,
  Sparkles,
  Gift,
  Heart,
  Award,
  Zap,
  Crown,
  Diamond,
  
  
} from 'lucide-react';
import { buildImageUrl } from '../config/api';
import PriceDisplay from './ui/PriceDisplay';
import { useCurrency } from '../contexts/CurrencyContext';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  mainImage: string;
  attachments?: {
    images?: string[];
    text?: string;
  };
  totalPrice?: number;
  addOns?: Array<{ name: string; price: number; description?: string }>;
  basePrice?: number;
  addOnsPrice?: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productOptions?: Array<{
    optionId: string;
    optionName: { ar: string; en: string };
    value: string | string[];
    priceModifier: number;
  }>;
  productOptionsPriceModifier?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  notes?: string;
  orderDate: string;
  status: string;
  customerAddress?: string;
}

const ThankYou: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Helper function to get localized content for add-ons
  const getLocalizedAddOnContent = (field: 'name' | 'description', addOn: any) => {
    if (!addOn) return '';
    
    // For Arabic, prefer Arabic content, fallback to English or default
    return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
  };

  // دالة لتنسيق أسماء الخيارات
  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: { ar: string; en: string } } = {
      nameOnSash: { ar: 'الاسم على الوشاح', en: 'Name on Sash' },
      embroideryColor: { ar: 'لون التطريز', en: 'Embroidery Color' },
      capFabric: { ar: 'قماش الكاب', en: 'Cap Fabric' },
      size: { ar: 'التفاصيل', en: 'Size' },
      color: { ar: 'اللون', en: 'Color' },
      capColor: { ar: 'لون الكاب', en: 'Cap Color' },
      dandoshColor: { ar: 'لون الدندوش', en: 'Tassel Color' },
      fabric: { ar: 'نوع القماش', en: 'Fabric Type' },
      length: { ar: 'الطول', en: 'Length' },
      width: { ar: 'العرض', en: 'Width' },
      material: { ar: 'المادة', en: 'Material' },
      style: { ar: 'النمط', en: 'Style' },
      pattern: { ar: 'النقشة', en: 'Pattern' },
      finish: { ar: 'اللمسة النهائية', en: 'Finish' },
      customization: { ar: 'التخصيص', en: 'Customization' },
      engraving: { ar: 'النقش', en: 'Engraving' },
      packaging: { ar: 'التغليف', en: 'Packaging' }
    };
    const currentLang = i18n.language as 'ar' | 'en';
    return optionNames[optionName]?.[currentLang] || optionName;
  };

  // فنكشن لحساب المرحلة النشطة حسب حالة الطلب
  const getOrderStageInfo = (status: string) => {
    const currentLang = i18n.language as 'ar' | 'en';
    
    // إذا كان الطلب ملغي، نعرض مراحل مختلفة
    if (status === 'cancelled') {
      return [
        { 
          key: 'received', 
          label: currentLang === 'ar' ? 'تم استلام الطلب' : 'Order Received', 
          description: currentLang === 'ar' ? 'طلبك وصلنا بنجاح' : 'Your order has been received successfully',
          icon: CheckCircle,
          isCompleted: true,
          isCurrent: false,
          index: 0
        },
        { 
          key: 'cancelled', 
          label: currentLang === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled', 
          description: currentLang === 'ar' ? 'تم إلغاء طلبك بناءً على طلبك أو لأسباب فنية' : 'Your order has been cancelled upon request or for technical reasons',
          icon: Clock,
          isCompleted: true,
          isCurrent: true,
          index: 1
        }
      ];
    }

    const stages = [
      { 
        key: 'received', 
        label: currentLang === 'ar' ? 'تم استلام الطلب' : 'Order Received', 
        description: currentLang === 'ar' ? 'طلبك وصلنا بنجاح ونحن نراجعه الآن' : 'Your order has been received and is being reviewed',
        icon: CheckCircle,
        statuses: ['pending', 'confirmed', 'preparing', 'delivered']
      },
      { 
        key: 'confirmed', 
        label: currentLang === 'ar' ? 'تأكيد الطلب' : 'Order Confirmed', 
        description: currentLang === 'ar' ? 'تم تأكيد طلبك وسيتم البدء في التحضير' : 'Your order has been confirmed and preparation will begin',
        icon: CheckCircle,
        statuses: ['confirmed', 'preparing', 'delivered']
      },
      { 
        key: 'preparing', 
        label: currentLang === 'ar' ? 'تحضير الطلب' : 'Preparing Order', 
        description: currentLang === 'ar' ? 'جاري تحضير طلبك وتجهيزه للتسليم' : 'Your order is being prepared for delivery',
        icon: Package,
        statuses: ['preparing', 'delivered']
      },
      { 
        key: 'delivered', 
        label: currentLang === 'ar' ? 'تم التسليم' : 'Delivered', 
        description: currentLang === 'ar' ? 'تم تسليم طلبك بنجاح' : 'Your order has been delivered successfully',
        icon: CheckCircle,
        statuses: ['delivered']
      }
    ];

    return stages.map((stage, index) => {
      const isCompleted = stage.statuses.includes(status);
      const isCurrent = (
        (status === 'pending' && stage.key === 'received') ||
        (status === 'confirmed' && stage.key === 'confirmed') ||
        (status === 'preparing' && stage.key === 'preparing') ||
        (status === 'delivered' && stage.key === 'delivered')
      );
      
      return {
        ...stage,
        isCompleted,
        isCurrent,
        index
      };
    });
  };

  // فنكشن للحصول على نص الحالة
  const getStatusText = (status: string) => {
    const currentLang = i18n.language as 'ar' | 'en';
    const statusTexts = {
      pending: { ar: 'قيد المراجعة', en: 'Pending' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed' },
      preparing: { ar: 'قيد التحضير', en: 'Preparing' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' }
    };
    return statusTexts[status as keyof typeof statusTexts]?.[currentLang] || status;
  };

  // فنكشن للحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'preparing': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  useEffect(() => {
    // التأكد من مسح السلة عند وصول المستخدم لصفحة Thank You
    const clearCartAfterOrder = () => {
      console.log('🧹 [ThankYou] Ensuring cart is cleared after successful order');
      
      // مسح السلة من localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('lastCartCount');
      
      // للمستخدمين المسجلين، مسح عداد السلة الخاص بهم
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            localStorage.removeItem(`cartCount_${user.id}`);
          }
        } catch (error) {
          console.error('❌ [ThankYou] Error parsing user data:', error);
        }
      }
      
      // إطلاق أحداث لتحديث عداد السلة في الـ Navbar
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new CustomEvent('cartCountChange'));
      
      console.log('✅ [ThankYou] Cart cleared and events dispatched');
    };

    // محاولة الحصول على البيانات من عدة مصادر
    const getOrderData = () => {
      // 1. من state الـ navigation
      if (location.state?.order) {
        console.log('✅ Order data found in navigation state');
        setOrder(location.state.order);
        setLoading(false);
        setCelebrationActive(true);
        setTimeout(() => setCelebrationActive(false), 4000);
        clearCartAfterOrder();
        return;
      }

      // 2. من localStorage
      const savedOrder = localStorage.getItem('thankYouOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          console.log('✅ Order data found in localStorage');
          setOrder(parsedOrder);
          setLoading(false);
          setCelebrationActive(true);
          setTimeout(() => setCelebrationActive(false), 4000);
          clearCartAfterOrder();
          return;
        } catch (error) {
          console.error('❌ Error parsing saved order:', error);
        }
      }

      // 3. إذا لم نجد البيانات، نوجه للصفحة الرئيسية
      console.log('❌ No order data found, redirecting to home');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    };

    getOrderData();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-[#18b5d8] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#18b5d8]/20 rounded-full animate-pulse mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#18b5d8] animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] bg-clip-text text-transparent">
            {t('thankYou.loading')}
          </h2>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#18b5d8] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-[#18b5d8] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-[#18b5d8] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-16 h-16 text-red-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">{t('thankYou.noOrderFound')}</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">{t('thankYou.noOrderDescription')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-8 py-4 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-black shadow-xl transform hover:scale-105"
          >
            <Home className="w-5 h-5 inline-block ml-2" />
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929] relative overflow-hidden" dir="rtl">
      {/* Celebration Effects */}
      {celebrationActive && (
        <>
          {/* Floating particles */}
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2000}ms`,
                  animationDuration: `${2000 + Math.random() * 3000}ms`
                }}
              >
                <Star className="w-4 h-4 text-[#18b5d8]" />
              </div>
            ))}
          </div>
          
          {/* Gradient overlay animation */}
          <div className="fixed inset-0 bg-gradient-to-br from-[#18b5d8]/5 via-transparent to-[#16a2c7]/5 animate-pulse pointer-events-none z-10"></div>
        </>
      )}

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

      {/* Success Header - Enhanced */}
      <div className="relative bg-gradient-to-br from-[#292929] via-[#1a1a1a] to-[#0f0f0f] border-b border-[#18b5d8]/30">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20 text-center relative z-20">
          
          {/* Crown Animation */}
          <div className="mb-4 sm:mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d8]/30 to-[#16a2c7]/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <Crown className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-[#18b5d8] mx-auto mb-2 sm:mb-4 drop-shadow-2xl animate-bounce" />
              <div className="absolute -top-2 -right-2 animate-spin">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-pulse">
                <Diamond className="w-5 h-5 text-[#18b5d8]" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#18b5d8] via-white to-[#16a2c7] bg-clip-text text-transparent">
                🎉 {t('thankYou.title')}
              </span>
              <br />
              <span className="text-lg sm:text-2xl lg:text-3xl">{t('thankYou.subtitle')}</span>
            </h1>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
              <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
              <p className="text-sm sm:text-lg lg:text-xl text-gray-300 font-medium">
                {t('thankYou.thankYouMessage')} <span className="text-[#18b5d8] font-black text-base sm:text-xl">{order.customerName}</span>
              </p>
              <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
            </div>
            <p className="text-gray-400 text-sm sm:text-lg">{t('thankYou.excitedToServe')}</p>
          </div>
          
          {/* Order Number Card - Enhanced */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] rounded-2xl sm:rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-4 sm:px-8 lg:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-3xl inline-block shadow-2xl border-2 border-white/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="relative">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm opacity-90 font-bold">{t('thankYou.orderNumber')}</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-black tracking-wider">#{order.id}</p>
                </div>
                {/* مؤشر الحالة */}
                <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm font-bold ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 sm:mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-xl px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-white/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm sm:text-base">طلبك قيد المعالجة</span>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          
          {/* Order Details - Enhanced */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            
            {/* Order Items */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden group hover:border-[#18b5d8]/50 transition-all duration-500">
              <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] px-4 sm:px-8 py-4 sm:py-6 relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-black text-white flex items-center">
                    <ShoppingBag className="w-5 h-5 sm:w-8 sm:h-8 ml-2 sm:ml-3" />
                    {t('thankYou.orderDetails')} 
                  </h2>
                  <div className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-full">
                    <span className="text-white font-bold text-sm sm:text-base">{order.items.length} {order.items.length === 1 ? t('thankYou.product') : t('thankYou.products')}</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>
              
              <div className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-8">
                  {order.items.map((item, index) => (
                    <div key={index} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d8]/5 to-[#16a2c7]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-start gap-3 sm:gap-6 p-4 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 hover:border-[#18b5d8]/30 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-1">
                        
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={buildImageUrl(item.mainImage)}
                            alt={item.name}
                            className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-xl sm:rounded-2xl border-2 border-[#18b5d8]/40 shadow-2xl group-hover:border-[#18b5d8] transition-all duration-300"
                          />
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[#18b5d8] text-white text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl font-black text-white mb-2 sm:mb-4 hover:text-[#18b5d8] transition-colors duration-300">
                            {item.name}
                          </h3>
                          
                          {/* Price Section */}
                          <div className="bg-gradient-to-r from-[#18b5d8]/10 to-[#16a2c7]/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border border-[#18b5d8]/20">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <div className="text-[#18b5d8] font-bold text-sm sm:text-lg">
                                  <PriceDisplay price={item.basePrice || item.price} /> × {item.quantity}
                                </div>
                              {(item.addOnsPrice ?? 0) > 0 && (
  <p className="text-green-400 font-medium text-xs sm:text-sm">
    + {t('thankYou.additionalProducts')}: {formatPrice(item.addOnsPrice ?? 0)}
  </p>
)}


                              </div>
                              <div className="text-left">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1">{t('thankYou.total')}</p>
                                <p className="text-lg sm:text-2xl font-black text-white">
                                  {formatPrice(item.totalPrice || (item.price * item.quantity))}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Product Options */}
                          {(() => {
                            const hasSelectedOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
                            const hasProductOptions = item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0;
                            return (hasSelectedOptions || hasProductOptions);
                          })() && (
                            <div className="mb-3 sm:mb-4">
                              <h4 className="font-black text-white flex items-center gap-2 text-sm sm:text-lg mb-2 sm:mb-3">
                                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                                {t('thankYou.productOptions')}:
                              </h4>
                              <div className="space-y-2">
                                {/* Selected Options */}
                                {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                                  <div key={key} className="bg-[#18b5d8]/10 border border-[#18b5d8]/30 rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-between">
                                    <p className="text-white font-medium text-sm sm:text-base">{formatOptionName(key)}</p>
                                    <p className="text-[#18b5d8] font-bold text-sm sm:text-base">{value}</p>
                                  </div>
                                ))}
                                
                                {/* Product Options */}
                                {item.productOptions && Array.isArray(item.productOptions) && item.productOptions.map((option, index) => (
                                  <div key={index} className="bg-[#18b5d8]/10 border border-[#18b5d8]/30 rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-between">
                                    <p className="text-white font-medium text-sm sm:text-base">{option.optionName ? (i18n.language === 'ar' ? option.optionName.ar : option.optionName.en) : option.optionId}</p>
                                    <div className="text-[#18b5d8] font-bold text-sm sm:text-base">
                                      {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                      {option.priceModifier > 0 && (
                                        <span className="text-green-400 mr-1">
                                          (+<PriceDisplay price={option.priceModifier} />)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Additional Services */}
                          {item.addOns && item.addOns.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                              <h4 className="font-black text-white flex items-center gap-2 text-sm sm:text-lg mb-2 sm:mb-3">
                                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                                {t('thankYou.additionalProducts')}:
                              </h4>
                              <div className="space-y-2">
                                {item.addOns.map((addOn, addOnIndex) => (
                                  <div key={addOnIndex} className="bg-[#18b5d8]/10 border border-[#18b5d8]/30 rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-between">
                                    <div>
                                      <p className="text-white font-medium text-sm sm:text-base">{getLocalizedAddOnContent('name', addOn)}</p>
                                      {getLocalizedAddOnContent('description', addOn) && (
                                        <p className="text-gray-400 text-xs sm:text-sm">{getLocalizedAddOnContent('description', addOn)}</p>
                                      )}
                                    </div>
                                    <p className="text-[#18b5d8] font-bold text-sm sm:text-base">+{formatPrice(addOn.price)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Attachments */}
                          {item.attachments && (item.attachments.text || (item.attachments.images && item.attachments.images.length > 0)) && (
                            <div className="space-y-3 sm:space-y-4">
                              <h4 className="font-black text-white flex items-center gap-2 text-sm sm:text-lg">
                                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                                {t('thankYou.attachments')}:
                              </h4>
                              
                              {item.attachments.text && (
                                <div className="bg-[#18b5d8]/10 border-2 border-[#18b5d8]/30 rounded-lg sm:rounded-xl p-3 sm:p-5 backdrop-blur-sm hover:bg-[#18b5d8]/15 transition-all duration-300">
                                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-[#18b5d8]" />
                                    <span className="text-xs sm:text-sm text-[#18b5d8] font-black">{t('thankYou.attachedText')}:</span>
                                  </div>
                                  <p className="text-white text-sm sm:text-base leading-relaxed bg-white/5 rounded-lg p-2 sm:p-3">
                                    {item.attachments.text}
                                  </p>
                                </div>
                              )}
                              
                              {item.attachments.images && item.attachments.images.length > 0 && (
                                <div className="bg-[#18b5d8]/10 border-2 border-[#18b5d8]/30 rounded-lg sm:rounded-xl p-3 sm:p-5 backdrop-blur-sm">
                                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-[#18b5d8]" />
                                    <span className="text-xs sm:text-sm text-[#18b5d8] font-black">
                                      {t('thankYou.attachedImages')} ({item.attachments.images.length}):
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                    {item.attachments.images.slice(0, 3).map((img, idx) => (
                                      <div key={idx} className="relative group">
                                        <div className="w-full h-16 sm:h-24 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/20 rounded-lg sm:rounded-xl border-2 border-[#18b5d8]/30 flex items-center justify-center hover:from-[#18b5d8]/30 hover:to-[#16a2c7]/30 transition-all duration-300 cursor-pointer transform hover:scale-105">
                                          <div className="text-center">
                                            <Package className="w-4 h-4 sm:w-6 sm:h-6 text-[#18b5d8] mx-auto mb-1" />
                                            <span className="text-[#18b5d8] text-xs font-bold">{i18n.language === 'ar' ? 'صورة' : 'Image'} {idx + 1}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
<div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8">
  <h3 className="text-lg sm:text-2xl font-black text-white mb-4 sm:mb-8 flex items-center">
    <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-[#18b5d8] ml-2 sm:ml-3" />
    {i18n.language === 'ar' ? 'مراحل معالجة طلبك' : 'Order Processing Stages'}
  </h3>
  
  {order && (
    <div className="relative">
      {(() => {
        const stageInfo = getOrderStageInfo(order.status);
        const completedStages = stageInfo.filter(stage => stage.isCompleted).length;
        const progressHeight = completedStages > 0 ? `${(completedStages - 1) * 25 + 12}%` : '12%';
        
        return (
          <>
            {/* Progress Line Background */}
            <div className="absolute right-[18px] sm:right-[26px] top-[20px] sm:top-[24px] bottom-[20px] sm:bottom-[24px] w-0.5 sm:w-1 bg-white/20 rounded-full -z-10"></div>
            {/* Active Progress Line */}
            <div 
              className="absolute right-[18px] sm:right-[26px] top-[20px] sm:top-[24px] w-0.5 sm:w-1 bg-gradient-to-b from-[#18b5d8] to-[#16a2c7] rounded-full shadow-lg transition-all duration-1000 ease-out -z-10"
              style={{ height: progressHeight }}
            ></div>
             
            <div className="space-y-4 sm:space-y-8">
              {stageInfo.map((stage) => {
                const Icon = stage.icon;
                
                return (
                  <div 
                    key={stage.key}
                    className={`flex items-center gap-3 sm:gap-6 transition-all duration-500 ${
                      stage.isCompleted ? 'opacity-100' : 
                      stage.isCurrent ? 'opacity-80' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl relative transition-all duration-500 ${
                      stage.isCompleted 
                        ? 'bg-gradient-to-r from-[#18b5d8] to-[#16a2c7]' 
                        : stage.isCurrent
                        ? 'bg-white/20 border-2 border-[#18b5d8]'
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-500 ${
                        stage.isCompleted 
                          ? 'text-white' 
                          : stage.isCurrent
                          ? 'text-[#18b5d8]'
                          : 'text-white/60'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-black text-sm sm:text-lg transition-colors duration-500 ${
                        stage.isCompleted 
                          ? 'text-white' 
                          : stage.isCurrent
                          ? 'text-white'
                          : 'text-white/60'
                      }`}>
                        {stage.label}
                        {stage.isCurrent && (
                          <span className="mr-2 text-[#18b5d8] text-xs sm:text-sm font-normal">
                            ({i18n.language === 'ar' ? 'الحالة الحالية' : 'Current Status'})
                          </span>
                        )}
                      </h4>
                      <p className={`text-xs sm:text-base transition-colors duration-500 ${
                        stage.isCompleted 
                          ? 'text-gray-300' 
                          : stage.isCurrent
                          ? 'text-gray-300'
                          : 'text-gray-400'
                      }`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}
    </div>
  )}
</div>
          </div>

          {/* Sidebar - Enhanced */}
          <div className="space-y-4 sm:space-y-8">
            
            {/* Payment Summary - Enhanced */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden group hover:border-[#18b5d8]/50 transition-all duration-500">
              <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] px-4 sm:px-6 py-3 sm:py-5 relative">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center">
                  <Diamond className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                  {t('thankYou.invoiceSummary')}
                </h3>
                <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
              </div>
              
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-medium text-sm sm:text-base">{t('thankYou.subtotal')}</span>
                  <div className="font-black text-white text-base sm:text-lg"><PriceDisplay price={order.totalAmount} /></div>
                </div>
                
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      <span className="text-green-400 font-medium text-sm sm:text-base">{t('thankYou.couponDiscount')}</span>
                    </div>
                    <div className="font-black text-green-400 text-base sm:text-lg">-<PriceDisplay price={order.couponDiscount} /></div>
                  </div>
                )}

                <div className="border-t-2 border-[#18b5d8]/30 pt-4 sm:pt-6">
                  <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-[#18b5d8]/20 to-[#16a2c7]/20 rounded-2xl border-2 border-[#18b5d8]/30">
                    <span className="font-black text-white text-lg sm:text-xl">{t('thankYou.finalTotal')}</span>
                    <div className="text-left">
                      <div className="text-2xl sm:text-3xl font-black text-[#18b5d8]">{order.finalAmount.toFixed(2)}</div>
                      <div className="text-[#18b5d8] text-xs sm:text-sm font-bold">{t('thankYou.saudiRiyal')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                    <p className="text-xs sm:text-sm text-gray-300 font-medium">{t('thankYou.paymentMethod')}</p>
                  </div>
                  <p className="font-black text-white text-base sm:text-lg">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Customer Info - Enhanced */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] px-4 sm:px-6 py-3 sm:py-5">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                  {t('thankYou.yourInfo')}
                </h3>
              </div>
              
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('thankYou.phoneNumber')}
                  </p>
                  <p className="font-black text-white text-base sm:text-lg">{order.customerPhone}</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('thankYou.email')}
                  </p>
                  <p className="font-black text-white text-s">{order.customerEmail}</p>
                </div>



                {order.customerAddress && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t('thankYou.deliveryAddress')}
                    </p>
                    <p className="font-black text-white text-base leading-relaxed">{order.customerAddress}</p>
                  </div>
                )}
                
                {order.notes && (
                  <div className="p-4 bg-gradient-to-r from-[#18b5d8]/10 to-[#16a2c7]/10 rounded-xl border border-[#18b5d8]/30">
                    <p className="text-sm text-[#18b5d8] mb-2 flex items-center gap-2 font-bold">
                      <MapPin className="w-4 h-4" />
                      {t('thankYou.additionalNotes')}
                    </p>
                    <p className="font-bold text-white leading-relaxed">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-[#18b5d8]/10 via-[#16a2c7]/10 to-[#18b5d8]/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#18b5d8]/30 p-4 sm:p-8 text-center hover:border-[#18b5d8]/50 transition-all duration-500">
              <div className="mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">{t('thankYou.needHelp')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {t('thankYou.supportAvailable')}
                </p>
              </div>
              
             <div className="space-y-2 sm:space-y-3">
  {/* زر الاتصال */}
  <button
    onClick={() => (window.location.href = "tel:+201070009494")}
    className="w-full bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
               transition-all duration-300 font-bold border border-white/20 
               hover:border-white/40 flex items-center justify-center text-sm sm:text-base"
  >
    <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline-block ml-1 sm:ml-2" />
    {t('thankYou.callNow')}
  </button>

  {/* زر واتساب */}
  <button
    onClick={() => window.open("https://wa.me/201069006131", "_blank")}
    className="w-full bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
               transition-all duration-300 font-bold border border-white/20 
               hover:border-white/40 flex items-center justify-center text-sm sm:text-base"
  >
    <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline-block ml-1 sm:ml-2" />
    {t('thankYou.messageUs')}
  </button>
</div>

            </div>

            {/* Action Buttons - Enhanced */}
            <div className="space-y-3 sm:space-y-5">
              <button
                onClick={() => navigate('/')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-500 font-black shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-base sm:text-lg">{t('thankYou.continueShopping')}</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
              </button>
              
              
             
            </div>
          </div>
        </div>

        {/* Success Footer */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#18b5d8]" />
              <h3 className="text-xl sm:text-2xl font-black text-white">{t('thankYou.thankYouForChoosing')}</h3>
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#18b5d8]" />
            </div>
            
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
              {t('thankYou.footerMessage')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span>{t('thankYou.qualityGuarantee')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span>{t('thankYou.fastProducts')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                <span>{t('thankYou.customerSatisfaction')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
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
      `}</style>
    </div>
  );
};

export default ThankYou;