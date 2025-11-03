import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { extractIdFromSlug, isValidSlug, createProductSlug, createProductSlugNameOnly, createCategorySlug } from '../utils/slugify';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Plus, 
  Minus, 
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Sparkles,
  Gift,
  Clock,
  RefreshCw,
  MessageSquare,
  Send,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import WhatsAppButton from './ui/WhatsAppButton';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { commentService, Comment, CreateCommentData } from '../services/commentService';
import AuthModal from './modals/AuthModal';
import PriceDisplay from './ui/PriceDisplay';
import ProductOptionsSelector from './ui/ProductOptionsSelector';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductOption {
  id: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color';
  name: {
    ar: string;
    en: string;
  };
  label: {
    ar: string;
    en: string;
  };
  required: boolean;
  options?: Array<{
    value: string;
    label: {
      ar: string;
      en: string;
    };
    priceModifier: number;
    colorCode?: string;
  }>;
  placeholder?: {
    ar: string;
    en: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  shortDescription?: string;
  shortDescription_ar?: string;
  shortDescription_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  mainImage: string;
  detailedImages: string[];
  faqs?: Array<{ 
    question: string; 
    question_ar?: string; 
    question_en?: string; 
    answer: string; 
    answer_ar?: string; 
    answer_en?: string; 
  }>;
  addOns?: Array<{ 
    name: string; 
    name_ar?: string; 
    name_en?: string; 
    price: number; 
    description?: string; 
    description_ar?: string; 
    description_en?: string; 
  }>;
  productOptions?: ProductOption[];
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
}

// FAQ Card Component
const FAQCard: React.FC<{ faq: { question: string; question_ar?: string; question_en?: string; answer: string; answer_ar?: string; answer_en?: string; }; index: number }> = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  // Helper function to get localized FAQ content
  const getLocalizedFAQContent = (field: 'question' | 'answer') => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return faq[`${field}_ar`] || faq[`${field}_en`] || faq[field] || '';
    } else {
      return faq[`${field}_en`] || faq[`${field}_ar`] || faq[field] || '';
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a]/80 to-[#2a2a2a]/60 rounded-xl border border-[#18b5d8]/20 overflow-hidden transition-all duration-300 hover:border-[#18b5d8]/40 hover:shadow-lg hover:shadow-[#18b5d8]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-6 text-right flex items-center justify-between group transition-all duration-200 hover:bg-[#18b5d8]/5"
      >
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 mt-1">
            {index + 1}
          </div>
          <h4 className="font-semibold text-white text-sm sm:text-base lg:text-lg text-right leading-relaxed group-hover:text-[#18b5d8] transition-colors duration-200">
            {getLocalizedFAQContent('question')}
          </h4>
        </div>
        <div className="flex-shrink-0 mr-3 sm:mr-4">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8] transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] group-hover:text-[#18b5d8] transition-colors duration-200" />
          )}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-[#0f0f0f]/50 rounded-lg p-4 sm:p-5 border-r-4 border-[#18b5d8] mr-11 sm:mr-14">
            <p className="text-[#e0e0e0] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {getLocalizedFAQContent('answer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['product_detail', 'common']);
  const isRTL = i18n.language === 'ar';
  const { convertPrice, formatPrice } = useCurrency();
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [attachments, setAttachments] = useState<{
    images: File[];
    text: string;
  }>({
    images: [],
    text: ''
  });
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ name: string; price: number; description?: string }>>([]);
  const [selectedProductOptions, setSelectedProductOptions] = useState<Array<{ optionId: string; value: string | string[]; priceModifier: number }>>([]);
  const [productOptionsPriceModifier, setProductOptionsPriceModifier] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // استخراج ID من slug أو استخدام id مباشرة
  const productId = slug ? extractIdFromSlug(slug).toString() : id;

  // Helper function to get localized content
  const getLocalizedContent = (field: 'name' | 'description' | 'shortDescription', item?: any) => {
    const currentLang = i18n.language;
    const targetItem = item || product;
    
    if (!targetItem) return '';
    
    if (currentLang === 'ar') {
      return targetItem[`${field}_ar`] || targetItem[`${field}_en`] || targetItem[field] || '';
    } else {
      return targetItem[`${field}_en`] || targetItem[`${field}_ar`] || targetItem[field] || '';
    }
  };

  // Helper function to get localized category content
  const getCategoryLocalizedContent = (field: 'name' | 'description') => {
    if (!category) return '';
    
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return category[`${field}_ar`] || category[`${field}_en`] || category[field] || '';
    } else {
      return category[`${field}_en`] || category[`${field}_ar`] || category[field] || '';
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setError(t('invalid_product_id'));
      setLoading(false);
    }
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchComments();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(productId!));
      
      if (!data) {
        throw new Error(t('failed_to_load'));
      }
      
      // معالجة productOptions - تحويل من تنسيق قاعدة البيانات إلى تنسيق الواجهة الأمامية
      if (data.productOptions && data.productOptions.length > 0) {
        data.productOptions = data.productOptions.map((option: any) => ({
          id: option.id || Math.random().toString(36).substr(2, 9),
          type: option.type,
          name: {
            ar: option.name_ar || option.name || '',
            en: option.name_en || ''
          },
          label: {
            ar: option.label_ar || option.label || '',
            en: option.label_en || ''
          },
          required: option.required || false,
          options: option.options ? option.options.map((opt: any) => ({
            value: opt.value,
            label: {
              ar: opt.label_ar || opt.label || '',
              en: opt.label_en || ''
            },
            priceModifier: opt.priceModifier || 0,
            colorCode: opt.colorCode
          })) : [],
          placeholder: {
            ar: option.placeholder_ar || option.placeholder || '',
            en: option.placeholder_en || ''
          },
          validation: option.validation,
          order: option.order || 0
        }));
      }
      
      setProduct(data);
      setSelectedImage(data.mainImage);
      
      // جلب معلومات التصنيف - Only if needed
      if (data.categoryId) {
        fetchCategory(data.categoryId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(t('failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async (categoryId: number) => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(categoryId));
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleAttachmentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
    }
  };

  const handleAttachmentTextChange = (text: string) => {
    setAttachments(prev => ({ ...prev, text }));
  };

  const removeAttachmentImage = (index: number) => {
    setAttachments(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleAddOn = (addOn: { name: string; price: number; description?: string }) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(item => item.name === addOn.name);
      if (isSelected) {
        return prev.filter(item => item.name !== addOn.name);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const handleProductOptionsChange = useCallback((options: Array<{ optionId: string; value: string | string[]; priceModifier: number }>, totalPriceModifier: number) => {
    setSelectedProductOptions(options);
    setProductOptionsPriceModifier(totalPriceModifier);
  }, []);

  const calculateTotalPrice = () => {
    if (!product) return 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (product.price + addOnsTotal + productOptionsPriceModifier) * quantity;
  };

  const getAddOnsPrice = () => {
    return selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  };

  // Validation function to check if all required options are selected
  const validateRequiredOptions = () => {
    if (!product?.productOptions) return true;
    
    const requiredOptions = product.productOptions.filter(option => option.required);
    
    for (const requiredOption of requiredOptions) {
      const selectedOption = selectedProductOptions.find(selected => selected.optionId === requiredOption.id);
      
      if (!selectedOption) {
        const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
        smartToast.frontend.error(t('required_option_missing', { option: optionLabel }));
        return false;
      }
      
      // Check if the value is empty for text/number inputs
      if (requiredOption.type === 'text' || requiredOption.type === 'number') {
        if (!selectedOption.value || (typeof selectedOption.value === 'string' && selectedOption.value.trim() === '')) {
          const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
          smartToast.frontend.error(t('required_option_empty', { option: optionLabel }));
          return false;
        }
      }
      
      // Check if the value is empty for arrays (checkbox)
      if (Array.isArray(selectedOption.value) && selectedOption.value.length === 0) {
        const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
        smartToast.frontend.error(t('required_option_empty', { option: optionLabel }));
        return false;
      }
    }
    
    return true;
  };

  const addToCart = async () => {
    if (!product) return;

    // Validate required options before adding to cart
    if (!validateRequiredOptions()) {
      return;
    }

    setAddingToCart(true);
    try {
      const addOnsPrice = getAddOnsPrice();
      const totalPrice = product.price + addOnsPrice + productOptionsPriceModifier;
      
      const attachmentsWithAddOns = {
        ...attachments,
        addOns: selectedAddOns,
        productOptions: selectedProductOptions,
        totalPrice: totalPrice,
        basePrice: product.price,
        addOnsPrice: addOnsPrice,
        productOptionsPriceModifier: productOptionsPriceModifier
      };
      
      const success = await addToCartUnified(
        product.id,
        getLocalizedContent('name'),
        quantity,
        attachmentsWithAddOns,
        product.price, // Pass only the base price, not totalPrice
        product.mainImage
      );

      // Toast message is handled by addToCartUnified function
    } catch (error) {
      console.error('Error adding to cart:', error);
      smartToast.frontend.error(t('add_to_cart_error'));
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!product) return;
    
    try {
      const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
      if (success) {
        smartToast.frontend.success(t('wishlist_added'));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      smartToast.frontend.error(t('wishlist_error'));
    }
  };

  const fetchComments = async () => {
    if (!product) return;
    
    try {
      setCommentsLoading(true);
      const commentsData = await commentService.getProductComments(product.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      smartToast.frontend.error(t('comments_load_error'));
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    // Check if user is logged in
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!product || !commentText.trim()) {
      smartToast.frontend.error(t('comment_required'));
      return;
    }

    try {
      setIsSubmittingComment(true);
      
      const commentData: CreateCommentData = {
        productId: product.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        content: commentText.trim(),
        rating: commentRating
      };

      const newComment = await commentService.createComment(commentData);
      
      // إعادة جلب التعليقات من الخادم للحصول على أحدث البيانات
      await fetchComments();
      setCommentText('');
      setCommentRating(5);
      
      smartToast.frontend.success(t('comment_added'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      smartToast.frontend.error(t('comment_add_error'));
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    smartToast.frontend.success('مرحباً بك! يمكنك الآن إضافة تعليقك');
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-[#18b5d8] fill-[#18b5d8]'
                  : 'text-[#7a7a7a]'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#18b5d8] mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('loading_product')}</h2>
          <p className="text-[#7a7a7a]">{t('please_wait')}</p>
        </div>
      </div>
    );
  }

  // حالة الخطأ أو عدم وجود المنتج
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#18b5d8] mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">جاري التحميل...</h1>
          <p className="text-[#7a7a7a] mb-6">يتم تحميل بيانات المنتج</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background Pattern - Same as AllProducts */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#292929] via-[#4a4a4a] to-[#2a2a2a] opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '5%', left: '5%' }}>
            &lt;div className=&quot;hero&quot;&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '15%', right: '10%', animationDelay: '500ms' }}>
            function analytics()
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '20%', left: '15%', animationDelay: '1000ms' }}>
            const [data, setData] =
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '10%', right: '5%', animationDelay: '1500ms' }}>
            SEO.optimize();
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '25%', left: '50%', animationDelay: '2000ms' }}>
            API.fetch(&#39;/products&#39;)
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '35%', right: '20%', animationDelay: '2500ms' }}>
            useState(&#123; loading: false &#125;);
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '30%', left: '25%', animationDelay: '3000ms' }}>
            fetchData().then(res =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '50%', left: '30%', animationDelay: '3500ms' }}>
            renderUI(component);
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '15%', right: '15%', animationDelay: '4000ms' }}>
            &lt;RouterProvider /&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '60%', left: '20%', animationDelay: '4500ms' }}>
            const query = useQuery();
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '10%', left: '70%', animationDelay: '5000ms' }}>
            useEffect(() =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '25%', right: '25%', animationDelay: '5500ms' }}>
            async function init()
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '40%', left: '40%', animationDelay: '6000ms' }}>
            setTimeout(() =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '35%', right: '30%', animationDelay: '6500ms' }}>
            &lt;Suspense fallback=&quot;loading&quot;&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '70%', left: '10%', animationDelay: '7000ms' }}>
            export default App;
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#4a4a4a]/40 to-transparent animate-pulse"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2a2a2a]/30 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#4a4a4a]/30 to-transparent animate-pulse delay-500"></div>
          <div className="absolute right-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#2a2a2a]/35 to-transparent animate-pulse delay-1500"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-[#4a4a4a]/70 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-[#2a2a2a]/80 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-[#4a4a4a]/60 rounded-full animate-ping delay-1200"></div>
          <div className="absolute bottom-60 right-20 w-1 h-1 bg-[#2a2a2a]/70 rounded-full animate-ping delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-[#4a4a4a]/90 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-80 right-1/4 w-1.5 h-1.5 bg-[#2a2a2a]/50 rounded-full animate-ping delay-1800"></div>
        </div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-10 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse">
            1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0
          </div>
          <div className="absolute top-0 left-32 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-500">
            0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1
          </div>
          <div className="absolute top-0 right-20 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1000">
            1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0
          </div>
          <div className="absolute top-0 right-40 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1500">
            0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1
          </div>
        </div>
        <div className="absolute inset-0 opacity-35">
          <div className="absolute text-[#18b5d8]/50 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '5%', left: '5%' }}>
            <span role="img" aria-label="chart">📊</span>
          </div>
          <div className="absolute text-[#ffffff]/45 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '15%', right: '10%', animationDelay: '600ms' }}>
            <span role="img" aria-label="trending">📈</span>
          </div>
          <div className="absolute text-[#ffffff]/40 text-2xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '30%', right: '20%', animationDelay: '1200ms' }}>
            <span role="img" aria-label="bulb">💡</span>
          </div>
          <div className="absolute text-[#18b5d8]/50 text-2xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '25%', right: '15%', animationDelay: '1800ms' }}>
            <span role="img" aria-label="target">🎯</span>
          </div>
          <div className="absolute text-[#7a7a7a]/45 text-3xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '25%', left: '20%', animationDelay: '2400ms' }}>
            <span role="img" aria-label="laptop">💻</span>
          </div>
          <div className="absolute text-[#7a7a7a]/50 text-4xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '35%', left: '25%', animationDelay: '3000ms' }}>
            <span role="img" aria-label="rocket">🚀</span>
          </div>
          <div className="absolute text-[#7a7a7a]/40 text-2xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '55%', right: '25%', animationDelay: '3600ms' }}>
            <span role="img" aria-label="search">🔍</span>
          </div>
          <div className="absolute text-[#7a7a7a]/45 text-3xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '10%', left: '60%', animationDelay: '4200ms' }}>
            <span role="img" aria-label="gear">⚙️</span>
          </div>
          <div className="absolute text-[#7a7a7a]/50 text-2xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '15%', right: '30%', animationDelay: '4800ms' }}>
            <span role="img" aria-label="phone">📱</span>
          </div>
          <div className="absolute text-[#7a7a7a]/45 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '65%', left: '15%', animationDelay: '5400ms' }}>
            <span role="img" aria-label="globe">🌐</span>
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4a4a4a]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-[#4a4a4a]/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2000ms'}}></div>
          <div className="absolute top-2/3 left-2/3 w-28 h-28 bg-[#4a4a4a]/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
        </div>
        <div className="absolute inset-0 opacity-15 animate-pulse"
             style={{
               backgroundImage: `linear-gradient(rgba(74, 74, 74, 0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(74, 74, 74, 0.3) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg) scale(1);
            }
            50% {
              transform: translateY(-15px) rotate(5deg) scale(1.1);
            }
          }
          @keyframes glow {
            0%, 100% {
              filter: drop-shadow(0 0 5px rgba(122, 122, 122, 0.3));
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 10px rgba(122, 122, 122, 0.7));
              transform: scale(1.05);
            }
          }
          @keyframes parallax {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50px); }
          }
          .parallax-bg {
            animation: parallax 10s linear infinite alternate;
          }
          .micro-hover:hover {
            transform: scale(1.05) rotate(2deg);
            transition: transform 0.3s ease-in-out;
          }
        `}
      </style>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-16 mt-[70px] sm:mt-[80px]">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-4 sm:mb-8 overflow-x-auto" dir="ltr">
          <button onClick={() => navigate('/')} className="text-[#7a7a7a] hover:text-white transition-colors whitespace-nowrap text-xs sm:text-sm">
            {t('home')}
          </button>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#7a7a7a] flex-shrink-0" />
          {category && (
            <>
              <span className="text-[#7a7a7a] whitespace-nowrap text-xs sm:text-sm">{getCategoryLocalizedContent('name')}</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#7a7a7a] flex-shrink-0" />
            </>
          )}
          <span className="text-white font-medium truncate text-xs sm:text-sm">{getLocalizedContent('name')}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
          {/* Image Section with Immersive Effects */}
          <div className="space-y-3 sm:space-y-6">
            <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-3 sm:p-6 lg:p-8 overflow-hidden">
              {/* Main Image Container - Improved Mobile Responsiveness */}
              <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-[3/2] overflow-hidden rounded-2xl sm:rounded-3xl bg-[#4a4a4a]/20 parallax-bg">
                <img
                  src={buildImageUrl(selectedImage)}
                  alt={getLocalizedContent('name')}
                  className="w-full h-full object-cover sm:object-contain transition-all duration-500 hover:scale-105 micro-hover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
                {/* Image Overlay for Better Mobile Viewing */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Thumbnails with Enhanced Mobile Design */}
              <div className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2 mt-3 sm:mt-4 scrollbar-hide">
                <button
                  onClick={() => setSelectedImage(product.mainImage)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 micro-hover ${
                    selectedImage === product.mainImage ? 'border-[#18b5d8] shadow-lg shadow-[#18b5d8]/30 scale-105' : 'border-[#7a7a7a] hover:border-[#18b5d8]'
                  }`}
                >
                  <img
                    src={buildImageUrl(product.mainImage)}
                    alt="الصورة الرئيسية"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                </button>
                
                {product.detailedImages && product.detailedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 micro-hover ${
                      selectedImage === image ? 'border-[#18b5d8] shadow-lg shadow-[#18b5d8]/30 scale-105' : 'border-[#7a7a7a] hover:border-[#18b5d8]'
                    }`}
                  >
                    <img
                      src={buildImageUrl(image)}
                      alt={`${t('detailed_image')} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Details Section with Metallics and Shapes */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">{getLocalizedContent('name')}</h1>
                <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="flex flex-col">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <PriceDisplay 
                        price={product.price} 
                        originalPrice={product.originalPrice}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18b5d8]"
                        size="xl"
                      />
                    ) : (
                      <PriceDisplay 
                        price={product.price}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18b5d8]"
                        size="xl"
                      />
                    )}
                    
                    {/* Total Price Display with Product Options and Add-ons */}
                    {(selectedAddOns.length > 0 || productOptionsPriceModifier !== 0) && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#18b5d8]/10 rounded-lg border border-[#18b5d8]/20">
                        <div className="text-xs sm:text-sm text-[#7a7a7a] mb-2">{t('total_price')}:</div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm text-[#7a7a7a]">{t('base_price')}: {formatPrice(product.price)}</div>
                            {productOptionsPriceModifier !== 0 && (
                              <div className={`text-xs sm:text-sm ${productOptionsPriceModifier > 0 ? 'text-[#18b5d8]' : 'text-red-400'}`}>
                                {t('product_options')}: {productOptionsPriceModifier > 0 ? '+' : ''}{formatPrice(productOptionsPriceModifier)}
                              </div>
                            )}
                            {selectedAddOns.length > 0 && (
                              <div className="text-xs sm:text-sm text-[#18b5d8]">{t('addons')}: +{formatPrice(getAddOnsPrice())}</div>
                            )}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#18b5d8]">
                            {formatPrice(calculateTotalPrice())}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {getLocalizedContent('shortDescription') && (
                  <p className="text-sm sm:text-base text-[#7a7a7a] leading-relaxed mb-4 sm:mb-6">{getLocalizedContent('shortDescription')}</p>
                )}
              </div>

              {/* Product Options */}
              {product.productOptions && product.productOptions.length > 0 && (
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 rounded-xl p-3 sm:p-4 border border-[#7a7a7a]/40">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8] mr-2" />
                      {t('product_options')}
                    </h3>
                    <ProductOptionsSelector
                      options={product.productOptions}
                      language={i18n.language}
                      onSelectionChange={handleProductOptionsChange}
                    />
                  </div>
                </div>
              )}

              {/* Additional Services */}
              {product.addOns && product.addOns.length > 0 && (
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 rounded-xl p-3 sm:p-4 border border-[#7a7a7a]/40">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8] mr-2" />
                      {t('addons')}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {product.addOns.map((addOn, index) => {
                        const isSelected = selectedAddOns.some(item => item.name === addOn.name);
                        return (
                          <div
                            key={index}
                            onClick={() => toggleAddOn(addOn)}
                            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'border-[#18b5d8] bg-[#18b5d8]/10'
                                : 'border-[#7a7a7a]/40 hover:border-[#18b5d8]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected ? 'border-[#18b5d8] bg-[#18b5d8]' : 'border-[#7a7a7a]'
                                  }`}>
                                    {isSelected && <span className="text-white text-xs">✓</span>}
                                  </div>
                                  <h4 className="font-semibold text-white text-sm sm:text-base">{getLocalizedContent('name', addOn)}</h4>
                                </div>
                                {getLocalizedContent('description', addOn) && (
                                  <p className="text-xs sm:text-sm text-[#7a7a7a] mt-1 mr-5 sm:mr-6">{getLocalizedContent('description', addOn)}</p>
                                )}
                              </div>
                              <div className="text-base sm:text-lg font-bold text-[#18b5d8]">
                                +<PriceDisplay price={addOn.price} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments with Textured Grains */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 rounded-xl p-3 sm:p-4 border border-[#7a7a7a]/40" style={{ backgroundImage: 'url(/grain-texture.png)', backgroundSize: 'cover' }}>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#18b5d8]/50 rounded-lg flex items-center justify-center text-white text-xs mr-2">📎</span>
                    {t('additional_attachments')}
                  </h3>
                  
                  <div className="mb-2 sm:mb-3">
                    <textarea
                      value={attachments.text}
                      onChange={(e) => handleAttachmentTextChange(e.target.value)}
                      rows={2}
                      className="w-full px-2 sm:px-3 py-2 bg-transparent border border-[#7a7a7a]/40 rounded-lg focus:ring-1 focus:ring-[#18b5d8] focus:border-[#18b5d8] text-white text-xs sm:text-sm"
                      placeholder={t('notes_placeholder')}
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        onChange={handleAttachmentImagesChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="attachmentImages"
                      />
                      <label htmlFor="attachmentImages" className="cursor-pointer">
                        <div className="flex items-center gap-1 sm:gap-2 p-2 border border-dashed border-[#7a7a7a]/40 rounded-lg hover:border-[#18b5d8] transition-colors">
                          <span className="text-base sm:text-lg text-[#18b5d8]">📷</span>
                          <span className="text-xs sm:text-sm text-[#7a7a7a]">{t('add_images')}</span>
                        </div>
                      </label>
                    </div>
                    {attachments.images.length > 0 && (
                      <span className="text-xs text-[#7a7a7a] bg-[#4a4a4a]/50 px-2 py-1 rounded">
                        {attachments.images.length} {t('image')}
                      </span>
                    )}
                  </div>

                  {attachments.images.length > 0 && (
                    <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2 flex-wrap">
                      {attachments.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`${t('attachment')} ${index + 1}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-[#7a7a7a]/40"
                          />
                          <button
                            onClick={() => removeAttachmentImage(index)}
                            className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#18b5d8]/50 text-white rounded-full text-xs hover:bg-[#18b5d8] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-xs sm:text-sm text-[#7a7a7a]">
                    {product.isAvailable ? (
                      <span className="text-[#18b5d8] font-medium">{t('available')}</span>
              ) : (
                <span className="text-red-400 font-medium">{t('unavailable')}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={addingToCart || !product.isAvailable}
                    className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl hover:from-[#292929] hover:to-[#7a7a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg micro-hover text-sm sm:text-base"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="text-xs sm:text-sm lg:text-base">{t('adding')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm lg:text-base">{t('add_to_cart')}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={addToWishlist}
                    className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-[#7a7a7a] text-[#7a7a7a] rounded-xl hover:bg-[#7a7a7a] hover:text-white transition-all duration-300 transform hover:scale-105 micro-hover"
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 sm:mt-8 lg:mt-12 space-y-4 sm:space-y-6 lg:space-y-8">
          {getLocalizedContent('description') && (
            <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d8]" />
                {t('product_details')}
              </h3>
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-[#ffffff] leading-relaxed">
                <p className="whitespace-pre-wrap text-sm sm:text-base">{getLocalizedContent('description')}</p>
              </div>
            </div>
          )}

          {/* FAQ Section - Professional & Compact */}
{product.faqs && product.faqs.length > 0 && (
  <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl p-6">
    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] p-2 rounded-lg">
        <AlertCircle className="w-6 h-6 text-white" />
      </div>
      {t('faqs')}
    </h3>
    <div className="space-y-2 sm:space-y-3">
      {product.faqs?.map((faq, index) => {
        // Helper function to get localized FAQ content
        const getLocalizedFAQContent = (field: 'question' | 'answer') => {
          const currentLang = i18n.language;
          
          if (currentLang === 'ar') {
            return faq[`${field}_ar`] || faq[`${field}_en`] || faq[field] || '';
          } else {
            return faq[`${field}_en`] || faq[`${field}_ar`] || faq[field] || '';
          }
        };

        return (
          <div key={index} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/8 transition-all duration-200">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-[#18b5d8] transition-colors duration-200">
                <span className="text-sm sm:text-base font-medium pr-2 leading-relaxed">{getLocalizedFAQContent('question')}</span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8] transform transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="mt-2 sm:mt-3 pt-2 border-t border-white/5">
                <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">{getLocalizedFAQContent('answer')}</p>
              </div>
            </details>
          </div>
        );
      })}
    </div>
  </div>
)}
        </div>

        {/* Comments Section with Interactive Animations */}
        <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-8 mb-8 mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#18b5d8]" />
            {t('comments')} ({comments.length})
          </h3>
          
          {/* Add Comment Form with Glow Effects */}
          <div className="mb-8 p-6 bg-[#4a4a4a]/20 rounded-xl border border-[#7a7a7a]/40">
            <h4 className="text-lg font-semibold text-white mb-4">{t('add_comment')}</h4>
            
            {!user ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-[#7a7a7a] mx-auto mb-4 animate-glow" />
                <h5 className="text-lg font-medium text-white mb-2">{t('login_to_comment')}</h5>
                <p className="text-[#7a7a7a] mb-4">{t('login_required_message')}</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-6 py-3 rounded-lg hover:from-[#292929] hover:to-[#7a7a7a] transition-colors font-medium flex items-center gap-2 mx-auto micro-hover"
                >
                  <User className="w-4 h-4" />
                  {t('login')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#18b5d8]/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#18b5d8]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-[#7a7a7a]">{user.email}</p>
                  </div>
                </div>
                
                {/* Rating with Hover Animation */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('rating')}
                  </label>
                  {renderStars(commentRating, true, setCommentRating)}
                </div>
                
                {/* Comment Text */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('comment')}
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('comment_placeholder')}
                    className="w-full p-4 bg-transparent border border-[#7a7a7a]/40 rounded-lg focus:ring-2 focus:ring-[#18b5d8] focus:border-[#18b5d8] resize-none text-white"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-[#7a7a7a] mt-1">
                    {commentText.length}/500
                  </div>
                </div>
                
                <button 
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-6 py-3 rounded-lg hover:from-[#292929] hover:to-[#7a7a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 micro-hover"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('submit_comment')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Comments List with Scroll-Triggered Animations */}
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18b5d8] mx-auto mb-3"></div>
                <p className="text-[#7a7a7a]">{t('loading_comments')}</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 rounded-lg p-4 border border-[#7a7a7a]/40 animate-[glow_3.5s_ease-in-out_infinite]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#18b5d8]/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#18b5d8]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {comment.userName || t('user')}
                        </div>
                        <div className="text-sm text-[#7a7a7a]">
                          {new Date(comment.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {comment.rating && renderStars(comment.rating)}
                  </div>
                  <p className="text-white leading-relaxed">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#7a7a7a]">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[#7a7a7a]" />
                <p>{t('no_comments')}</p>
              </div>
            )}
          </div>
        </div>

        <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </section>
  );
};

const RelatedProducts: React.FC<{ currentProductId: number; categoryId: number | null }> = ({ 
  currentProductId, 
  categoryId 
}) => {
  const { t, i18n } = useTranslation(['product_detail', 'common']);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Helper function to get localized content
  const getLocalizedContent = (field: 'name' | 'description' | 'shortDescription', product: Product) => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return product[`${field}_ar`] || product[`${field}_en`] || product[field] || '';
    } else {
      return product[`${field}_en`] || product[`${field}_ar`] || product[field] || '';
    }
  };

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiCall(API_ENDPOINTS.PRODUCTS),
        apiCall(API_ENDPOINTS.CATEGORIES)
      ]);
          } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('related_products')}</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-[#18b5d8] to-[#292929] mx-auto rounded-full"></div>
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <div 
            key={product.id}
            className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden hover:shadow-[#18b5d8]/50 transition-shadow duration-200 cursor-pointer micro-hover"
            onClick={() => {
              const productSlug = createProductSlug(product.id, getLocalizedContent('name', product));
              navigate(`/product/${productSlug}`);
            }}
          >
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={buildImageUrl(product.mainImage)}
                  alt={getLocalizedContent('name', product)}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className="absolute top-3 right-3 bg-[#18b5d8]/20 text-[#18b5d8] px-2 py-1 rounded-full text-xs font-bold">
                منتج
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-md font-bold text-white mb-2 line-clamp-2">{getLocalizedContent('name', product)}</h3>
              <p className="text-[#7a7a7a] text-sm mb-3 line-clamp-2">{getLocalizedContent('description', product) || 'وصف المنتج غير متوفر'}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-[#7a7a7a] line-through">
                          {product.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-[#18b5d8]/20 text-[#18b5d8] px-1 py-0.5 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                      <PriceDisplay price={product.price} />
                    </>
                  ) : (
                    <PriceDisplay price={product.price} />
                  )}
                </div>
                <button className="bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-3 py-2 rounded-lg hover:from-[#292929] hover:to-[#7a7a7a] transition-colors duration-200 text-sm micro-hover">
                  عرض
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;