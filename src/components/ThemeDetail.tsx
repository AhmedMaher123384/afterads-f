import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import {
  ShoppingCart, Star, MessageSquare, Play, Eye, Headphones,
  Settings, Palette, Store, Smartphone, Languages, Search,
  RefreshCcw, Gift, Plus, Minus, ChevronDown, ChevronUp, FileText,
  Tablet,
  Monitor,
} from 'lucide-react';

// ✅ أضف React Icons
import { 
  FaUser, FaShoppingCart, FaHeart, FaStar, FaBolt, FaChartLine,
  FaTrophy, FaGift, FaShieldAlt, FaRocket, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaCamera, FaImage,
  FaCode, FaPalette, FaMobile, FaLaptop, FaSearch, FaCog,
  FaBell, FaHome, FaTag, FaFire, FaThumbsUp, FaComments,
  FaUsers, FaBox, FaCreditCard, FaTruck, FaStore, FaChartBar,
  FaGlobe, FaLock, FaKey, FaEye, FaDownload, FaUpload,
  FaEdit, FaTrash, FaPlus, FaMinus, FaSave, FaUndo,
  FaShareAlt, FaPrint, FaFilePdf, FaFileExcel, FaFileWord
} from 'react-icons/fa';

import {
  MdDashboard, MdEmail, MdPhone, MdLocationOn, MdAccessTime,
  MdCheckCircle
} from 'react-icons/md';

import {
  IoMdCart, IoMdHeart, IoMdStar, IoMdTrophy, IoMdGift, IoMdRocket
} from 'react-icons/io';

import {
  AiFillStar, AiFillHeart, AiFillFire, AiFillThunderbolt,
  AiFillGift, AiFillTrophy, AiFillRocket, AiFillBell
} from 'react-icons/ai';

import {
  BsFillLightningFill, BsFillRocketFill, BsFillStarFill,
  BsFillHeartFill, BsFillTrophyFill, BsFillGiftFill
} from 'react-icons/bs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { addToCartUnified, addToWishlistUnified } from '../utils/cartUtils';
import WhatsAppButton from './ui/WhatsAppButton';
import AuthModal from './modals/AuthModal';
import PriceDisplay from './ui/PriceDisplay';
import theme1 from '../assets/d.jpeg';
import theme2 from '../assets/t.jpeg';
import theme3 from '../assets/m.jpeg';
import theme4 from '../assets/113.webp';
import angel from '../assets/angel.webp';
import LoadingSpinner from './ui/LoadingSpinner';
import { FeatureCounter } from './ui/FeatureCounter';
import ThemeWorks from './ThemeWorks';

 const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    FaUser, FaShoppingCart, FaHeart, FaStar, FaBolt, FaChartLine,
    FaTrophy, FaGift, FaShieldAlt, FaRocket, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaCamera, FaImage,
    FaCode, FaPalette, FaMobile, FaLaptop, FaSearch, FaCog,
    FaBell, FaHome, FaTag, FaFire, FaThumbsUp, FaComments,
    FaUsers, FaBox, FaCreditCard, FaTruck, FaStore, FaChartBar,
    FaGlobe, FaLock, FaKey, FaEye, FaDownload, FaUpload,
    FaEdit, FaTrash, FaPlus, FaMinus, FaSave, FaUndo,
    FaShareAlt, FaPrint, FaFilePdf, FaFileExcel, FaFileWord,
    MdDashboard, MdEmail, MdPhone, MdLocationOn, MdAccessTime, MdCheckCircle,
    IoMdCart, IoMdHeart, IoMdStar, IoMdTrophy, IoMdGift, IoMdRocket,
    AiFillStar, AiFillHeart, AiFillFire, AiFillThunderbolt,
    AiFillGift, AiFillTrophy, AiFillRocket, AiFillBell,
    BsFillLightningFill, BsFillRocketFill, BsFillStarFill,
    BsFillHeartFill, BsFillTrophyFill, BsFillGiftFill
  };
  return icons[iconName] || FaUser;
};

gsap.registerPlugin(ScrollTrigger);

interface Theme {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  productType?: string;
  mainImage: string;
  detailedImages: string[];
  faqs?: Array<{ question: string; answer: string }>;
  addOns?: Array<{ name: string; price: number; description?: string }>;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  videoLink?: string;
  previewLink?: string;
  createdAt: string;
}
interface Category {
  id: number;
  name: string;
  description: string;
}

const ThemeDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { param } = useParams<{ param?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isNumericId = param && /^\d+$/.test(param);
  const themeId = isNumericId ? param : undefined;

  // ---------- Refs ----------
  const purchaseSectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);   // <--- هنا قبل أي useEffect

  // ---------- State ----------
  const [theme, setTheme] = useState<Theme | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showFixedButtons, setShowFixedButtons] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<{ [key: number]: boolean }>({});
  const [isAddOnsExpanded, setIsAddOnsExpanded] = useState(false);
  const [featuresInView, setFeaturesInView] = useState(false);
  const [dynamicComponents, setDynamicComponents] = useState<any[]>([]);
const [componentsLoading, setComponentsLoading] = useState(false)
const [mainPreviewDevice, setMainPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  // ---------- FAQ Card ----------
  const FAQCard: React.FC<{ faq: { question: string; answer: string }; index: number }> = ({ faq, index }) => {
    const [isOpen, setIsOpen] = useState(false);
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
              {faq.question}
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

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="bg-[#0f0f0f]/50 rounded-lg p-4 sm:p-5 border-r-4 border-[#18b5d8] mr-11 sm:mr-14">
              <p className="text-[#e0e0e0] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

const DynamicComponentCard: React.FC<{ component: any; index: number }> = ({ component, index }) => {
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const deviceStyles = {
    desktop: 'w-full',
    tablet: 'max-w-3xl mx-auto',
    mobile: 'max-w-sm mx-auto'
  };

  return (
    <div className="space-y-4">
     
      {/* الكارت مع التصميم المتجاوب */}
      <div className={`transition-all duration-500 ${deviceStyles[currentDevice]}`}>
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d5]/5 via-transparent to-[#18b5d5]/5 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-[#292929]/60 via-[#1a1a1a]/80 to-[#292929]/60 rounded-xl sm:rounded-3xl border border-[#18b5d5]/20 group-hover:border-[#18b5d5]/40 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-[#18b5d5]/10">
            
            <div className={`flex ${currentDevice === 'mobile' ? 'flex-col' : 'flex-col xl:flex-row'}`}>
              {/* قسم الصورة مع الخلفية البيضاء والشريط الأصفر */}
              <div className={`${currentDevice === 'mobile' ? 'w-full' : 'w-full xl:w-56'} flex-shrink-0 relative`}>
                <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-3xl xl:rounded-l-3xl xl:rounded-tr-none bg-white">
                  {/* ارتفاع ثابت للخلفية البيضاء */}
                  <div className="relative h-48 sm:h-60 lg:h-72">
                    
                    {/* الشريط الأصفر مع النجمة */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-[#fec72d] transform -rotate-0 origin-top-left z-10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Star className="w-6 h-6 text-gray-600" fill="currentColor" />
                      </div>
                      {/* حدود الشريط */}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4a828]"></div>
                      <div className="absolute top-0 right-0 h-full w-0.5 bg-[#d4a828]"></div>
                    </div>
                    
              {/* الصورة أو النص على الخلفية البيضاء */}
{component.backgroundImage ? (
  <img
    src={`http://localhost:5000${component.backgroundImage}`}
    alt={component.title}
    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
  />
) : (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4">
    {/* ✅ الأيقونة */}
    {component.icon && (() => {
      const IconComponent = getIconComponent(component.icon);
      return <IconComponent className="w-16 h-16 text-gray-600" />;
    })()}
    
    {/* النص */}
    <p className="text-gray-800 text-lg font-semibold text-center">
      {component.overlayText || component.title}
    </p>
  </div>
)}
                    
                    {/* Badge برقم الترتيب */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#18b5d5]/90 to-[#18b5d5]/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#18b5d5]/30 z-20">
                      <span className="text-white text-xs font-bold">#{component.orderNumber}</span>
                    </div>
                    
                    {/* نقطة متحركة */}
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#18b5d5] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* قسم المحتوى */}
              <div className={`flex-1 ${currentDevice === 'mobile' ? 'p-4' : 'p-4 sm:p-6 lg:p-8'} flex flex-col justify-center`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-[#18b5d5]/20 to-[#18b5d5]/10 px-4 py-2 rounded-full border border-[#18b5d5]/30">
                    <span className="text-[#18b5d5] text-sm font-semibold">{component.category}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#18b5d5]/30 to-transparent"></div>
                </div>
                
                <h3 className={`${currentDevice === 'mobile' ? 'text-lg' : 'text-lg sm:text-xl lg:text-2xl'} font-black text-white mb-3 leading-tight group-hover:text-[#18b5d5] transition-colors duration-300`}>
                  {component.title}
                </h3>
                
                <p className={`text-[#a1a1a1] ${currentDevice === 'mobile' ? 'text-sm' : 'text-sm lg:text-base'} leading-relaxed mb-4`}>
                  {component.description}
                </p>
                
                {/* الخصائص */}
                <div className="flex flex-wrap gap-2">
                  {component.features && component.features.map((feature: string, idx: number) => (
                    <span 
                      key={idx}
                      className="bg-[#18b5d5]/10 text-[#18b5d5] px-3 py-1 rounded-full text-xs font-medium border border-[#18b5d5]/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* الخط السفلي المتحرك */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#18b5d5]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
  const images = [theme1, theme2, theme3, theme4];

  // ---------- Fixed buttons on scroll ----------
  useEffect(() => {
    const handleScroll = () => setShowFixedButtons(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---------- Carousel auto-play ----------
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isAutoPlaying, images.length]);

  const { data: activeCardsResp, isLoading: cardsLoading } = useApiQuery<any>({ endpoint: 'theme-card?isActive=true', queryKey: ['theme-cards-active'] });
  useEffect(() => {
    if (!activeCardsResp) return;
    const list = Array.isArray(activeCardsResp) ? activeCardsResp : (activeCardsResp?.data || []);
    setDynamicComponents(list);
    setComponentsLoading(false);
  }, [activeCardsResp]);
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const goToImage = (i: number) => {
    setCurrentImageIndex(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };


  const { data: themeResp, isLoading: themeLoading } = useApiQuery<any>({ endpoint: themeId ? API_ENDPOINTS.PRODUCT_BY_ID(themeId) : '', queryKey: ['theme', themeId], enabled: !!themeId });
  const { data: categoryResp, isLoading: categoryLoading } = useApiQuery<any>({ endpoint: themeResp?.categoryId ? API_ENDPOINTS.CATEGORY_BY_ID(themeResp.categoryId) : '', queryKey: ['category', themeResp?.categoryId], enabled: !!themeResp?.categoryId });
  useEffect(() => {
    if (!themeResp) return;
    const data = themeResp?.data || themeResp;
    if (!data?.id) {
      setError('لم يتم العثور على الثيم');
      setLoading(false);
      return;
    }
    setTheme(data);
    setSelectedImage(data.mainImage);
    setLoading(false);
  }, [themeResp]);
  useEffect(() => {
    if (!categoryResp) return;
    const cat = categoryResp?.data || categoryResp;
    setCategory(cat);
  }, [categoryResp]);
  useEffect(() => {
    gsap.utils.toArray('.animate-section').forEach((el: any) => {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, [t]);

  // ---------- IntersectionObserver للعدادات ----------
  useEffect(() => {
    if (!featuresRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []); // يعمل مرة واحدة بعد أول render

  // ---------- Fallback إذا لم يُكتشف التقاطع (مثلاً على شاشات صغيرة) ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!featuresInView) setFeaturesInView(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [featuresInView]);

  

  // ---------- Handlers ----------
  const handleAddToCart = async () => {
    if (!theme) return;
    setAddingToCart(true);
    try {
      const addOns = getSelectedAddOnsData();
      const total = calculateTotalPrice();
      await addToCartUnified(
        theme.id,
        theme.name,
        quantity,
        { addOns, totalPrice: total, basePrice: theme.price, addOnsPrice: addOns.reduce((s, a) => s + a.price, 0) },
        total,
        theme.mainImage
      );
      smartToast.frontend.success(
        `تم إضافة الثيم إلى السلة!${addOns.length ? ` مع ${addOns.length} خدمة إضافية` : ''}`
      );
    } catch {
      smartToast.frontend.error('فشل إضافة الثيم إلى السلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!theme) return;
    try {
      await addToWishlistUnified(theme.id, theme.name);
      smartToast.frontend.success('تمت الإضافة إلى قائمة الأمنيات');
    } catch {
      smartToast.frontend.error('فشل إضافة الثيم إلى قائمة الأمنيات');
    }
  };

  const handleLoginSuccess = (u: any) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setIsAuthModalOpen(false);
    try {
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: u }));
    } catch {}
    smartToast.frontend.success(t('auth.messages.loginSuccess'));
  };

  const increaseQuantity = () => setQuantity(p => p + 1);
  const decreaseQuantity = () => setQuantity(p => Math.max(1, p - 1));
  const toggleAddOn = (i: number) => setSelectedAddOns(p => ({ ...p, [i]: !p[i] }));

  const calculateTotalPrice = () => {
    if (!theme) return 0;
    let total = theme.price * quantity;
    theme.addOns?.forEach((a, i) => selectedAddOns[i] && (total += a.price * quantity));
    return total;
  };
  const getSelectedAddOnsData = () => theme?.addOns?.filter((_, i) => selectedAddOns[i]) ?? [];

  // ---------- Loading / Error ----------
  if (loading) return <LoadingSpinner message={t('home.themes.loading')} />;
  if (error || !theme) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('home.themes.error_loading')}</h2>
          <p className="text-[#7a7a7a] mb-6">{error || t('home.themes.not_found')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-6 py-3 rounded-lg hover:from-[#292929] hover:to-[#7a7a7a] transition-all duration-300 transform hover:scale-105 font-medium"
          >
            {t('home.themes.back_to_home')}
          </button>
        </div>
      </div>
    );
  }return (
  <section className="min-h-screen bg-[#292929] relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
    {/* Animated Background Pattern */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#292929] via-[#4a4a4a] to-[#2a2a2a] opacity-90" />
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
          1<br />0<br />1<br />1<br />0<br />1<br />0<br />1<br />1<br />0
        </div>
        <div className="absolute top-0 left-32 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-500">
          0<br />1<br />0<br />1<br />1<br />0<br />1<br />0<br />1<br />1
        </div>
        <div className="absolute top-0 right-20 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1000">
          1<br />1<br />0<br />1<br />0<br />1<br />1<br />0<br />1<br />0
        </div>
        <div className="absolute top-0 right-40 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1500">
          0<br />1<br />1<br />0<br />1<br />0<br />1<br />1<br />0<br />1
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
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-[#4a4a4a]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        <div className="absolute top-2/3 left-2/3 w-28 h-28 bg-[#4a4a4a]/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
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

    <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-16 mt-[60px] sm:mt-[80px]">
      <div className="flex justify-center my-3 sm:my-6">
        <img src={angel} alt="angel theme preview" className="w-24 sm:w-32 lg:w-40 h-auto" />
      </div>
      <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-8 text-center px-2">
        {t('home.themes.number_one')}
      </h2>

      {/* Hero Section with Enhanced Carousel */}
      <div className="relative z-10 w-full px-2 sm:px-4 py-6 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="w-full mb-6 sm:mb-12 relative group">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700/50">
              <div className="relative h-[250px] sm:h-[400px] lg:h-[700px]">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-out transform ${index === currentImageIndex
                        ? 'opacity-100 scale-100 translate-x-0'
                        : index < currentImageIndex
                          ? 'opacity-0 scale-95 -translate-x-full'
                          : 'opacity-0 scale-95 translate-x-full'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Malak Theme ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                      onError={(e) => (e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d8]/5 via-transparent to-purple-500/5"></div>
                  </div>
                ))}
              </div>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-[#18b5d8]/80 text-white p-2 sm:p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-10"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-[#18b5d8]/80 text-white p-2 sm:p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-10"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute top-2 sm:top-6 right-2 sm:right-6 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-white/20">
                <span className="text-[#18b5d8]">{currentImageIndex + 1}</span> / {images.length}
              </div>
              {isAutoPlaying && (
                <div className="absolute top-2 sm:top-6 left-2 sm:left-6 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-2 border border-white/20">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">{t('home.themes.autoplay_on')}</span>
                  <span className="sm:hidden">{t('home.themes.autoplay_short')}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
                <div
                  className="h-full bg-gradient-to-r from-[#18b5d8] to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center mt-4 sm:mt-8 gap-2 sm:gap-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative transition-all duration-500 ${index === currentImageIndex
                      ? 'w-6 sm:w-8 h-2 sm:h-3 bg-gradient-to-r from-[#18b5d8] to-purple-500 rounded-full scale-110'
                      : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-600 hover:bg-gray-500 rounded-full hover:scale-110'
                    }`}
                >
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d8] to-purple-500 rounded-full animate-pulse"></div>
                  )}
                  <span className="sr-only">الذهاب للصورة {index + 1}</span>
                </button>
              ))}
            </div>
           
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
            <button
              onClick={() => window.open('https://salla.com/themes/1499917793', '_blank')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5] to-[#16a8cc] text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-[#16a8cc] hover:to-[#18b5d5] transition-all duration-300 transform hover:scale-105 micro-hover shadow-xl hover:shadow-2xl border border-[#18b5d5]/30"
            >
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{t('home.themes.View_Cart')}</span>
              <span className="sm:hidden">{t('home.themes.View_Cart')}</span>
            </button>
            
            <a
              href="https://drive.google.com/drive/folders/1TuMasEWd5kB6_DzDN9OVhj8afVS6w9zb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-800 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl micro-hover"
            >
              <Play className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{t('home.themes.video_explanation')}</span>
              <span className="sm:hidden">{t('home.themes.video_explanation')}</span>
            </a>
            
            <a
              href="https://salla.sa/dev-etmlwprywtygjjcy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl micro-hover"
            >
              <Eye className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{t('home.themes.preview_theme')}</span>
              <span className="sm:hidden">{t('home.themes.preview_theme')}</span>
            </a>
          </div>
        </div>
      </div>

{/* Device Preview Section */}
<div className="mt-6 mb-6 animate-section flex justify-center">
  <div className="   shadow-2xl p-3 w-fit">
    
 

    {/* شريط الأزرار */}
    <div className="flex justify-center items-center gap-2 mb-3 bg-gradient-to-r from-[#18b5d8]/10 to-transparent px-3 py-1.5 rounded-lg border border-[#18b5d8]/20 w-fit mx-auto">
      <span className="text-[#18b5d8] text-xs font-medium">{t('home.themes.preview_label')}</span>
      <button
        onClick={() => setMainPreviewDevice('desktop')}
        className={`p-1 rounded-lg transition-all ${
          mainPreviewDevice === 'desktop' 
            ? 'bg-[#18b5d8] text-white shadow-lg' 
            : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setMainPreviewDevice('tablet')}
        className={`p-1 rounded-lg transition-all ${
          mainPreviewDevice === 'tablet' 
            ? 'bg-[#18b5d8] text-white shadow-lg' 
            : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
        }`}
      >
        <Tablet className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setMainPreviewDevice('mobile')}
        className={`p-1 rounded-lg transition-all ${
          mainPreviewDevice === 'mobile' 
            ? 'bg-[#18b5d8] text-white shadow-lg' 
            : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* عرض الصورة */}
    <div className="relative w-fit mx-auto">
      <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#292929]/60 to-[#1a1a1a]/80 border border-[#18b5d8]/30">
        
        <div className="absolute top-2 right-2 bg-[#18b5d8]/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-xs font-semibold z-10 flex items-center gap-1">
          {mainPreviewDevice === 'desktop' && <><Monitor className="w-2.5 h-2.5" /> Desktop</>}
          {mainPreviewDevice === 'tablet' && <><Tablet className="w-2.5 h-2.5" /> Tablet</>}
          {mainPreviewDevice === 'mobile' && <><Smartphone className="w-2.5 h-2.5" /> Mobile</>}
        </div>

        <div className="p-3">
   <div className={`bg-white/5 rounded-lg overflow-hidden transition-all duration-500 ${
  mainPreviewDevice === 'desktop' ? 'w-[92vw] max-w-[640px] h-[220px] sm:h-[350px]' :
  mainPreviewDevice === 'tablet' ? 'w-[88vw] max-w-[420px] h-[360px] sm:h-[400px]' :
  'w-[85vw] max-w-[280px] h-[520px]'
}`}>
            <img 
              src={
                mainPreviewDevice === 'desktop' ? theme1 :
                mainPreviewDevice === 'tablet' ? theme2 :
                theme3
              }
              alt={`${mainPreviewDevice} Preview`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

      {/* Why Choose Malak Theme Section */}
      <div className="mt-8 sm:mt-16 mb-12 sm:mb-20 relative animate-section">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d5]/5 via-transparent to-[#292929]/20 rounded-xl sm:rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-[#18b5d5]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-tl from-[#18b5d5]/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="relative bg-gradient-to-br from-[#292929]/98 via-[#1a1a1a]/95 to-[#292929]/98 rounded-xl sm:rounded-3xl backdrop-blur-xl border border-[#18b5d5]/20 shadow-2xl p-4 sm:p-8 lg:p-12 overflow-hidden">
          <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#18b5d5] rounded-full animate-ping"></div>
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-1 h-1 bg-[#18b5d5]/70 rounded-full animate-ping delay-500"></div>
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5]/20 to-[#18b5d5]/10 px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-[#18b5d5]/30 mb-4 sm:mb-6">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#18b5d5] rounded-full animate-pulse"></div>
              <span className="text-[#18b5d5] font-medium text-xs sm:text-sm">{t('home.themes.discover_features')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#18b5d5] to-white mb-4 sm:mb-6 leading-tight px-2">
              {t('home.themes.why_choose_malak')}
            </h2>
            <p className="text-sm sm:text-xl text-[#a1a1a1] max-w-3xl mx-auto leading-relaxed px-4">
              {t('home.themes.optimal_solution')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-all duration-300">
                <Smartphone className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('home.themes.responsive_design')}</h3>
                <p className="text-[#a1a1a1] text-xs sm:text-sm">{t('home.themes.responsive_description')}</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-all duration-300">
                <Languages className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('home.themes.arabic_support')}</h3>
                <p className="text-[#a1a1a1] text-xs sm:text-sm">{t('home.themes.arabic_description')}</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-all duration-300">
                <Search className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('home.themes.seo_optimization')}</h3>
                <p className="text-[#a1a1a1] text-xs sm:text-sm">{t('home.themes.seo_description')}</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-all duration-300">
                <RefreshCcw className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('home.themes.free_updates')}</h3>
                <p className="text-[#a1a1a1] text-xs sm:text-sm">{t('home.themes.updates_description')}</p>
              </div>
            </div>
          </div>
          <div ref={featuresRef} className="mt-16 pt-12 border-t border-[#18b5d8]/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 max-w-5xl mx-auto">
              <FeatureCounter key="p1" icon={Palette} number="25+" label={t('home.themes.professional_elements')} shouldAnimate={featuresInView} delay={0} variant="primary" />
              <FeatureCounter key="p2" icon={Settings} number="250+" label={t('home.themes.features.advanced_customization.title')} shouldAnimate={featuresInView} delay={100} variant="secondary" />
              <FeatureCounter key="p3" icon={Headphones} number="24/7" label={t('home.themes.technical_support')} shouldAnimate={featuresInView} delay={200} variant="primary" />
              <FeatureCounter key="p4" icon={Store} number="4000+" label={t('home.themes.active_store')} shouldAnimate={featuresInView} delay={300} variant="secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Components Showcase */}
      <div className="mt-12 sm:mt-20 mb-12 sm:mb-16 relative animate-section">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d5]/3 via-transparent to-[#292929]/10 rounded-xl sm:rounded-3xl"></div>
        <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-br from-[#18b5d5]/15 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-tl from-[#18b5d5]/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="relative bg-gradient-to-br from-[#1a1a1a]/98 via-[#292929]/95 to-[#1a1a1a]/98 rounded-xl sm:rounded-3xl backdrop-blur-xl border border-[#18b5d5]/20 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #18b5d5 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          <div className="relative p-4 sm:p-6 lg:p-12 pb-6 sm:pb-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5]/20 to-[#18b5d5]/10 px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-[#18b5d5]/30 mb-4 sm:mb-6">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#18b5d5] rounded-full animate-pulse"></div>
                <span className="text-[#18b5d5] font-medium text-xs sm:text-sm">{t('home.themes.features.advanced_elements.title')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#18b5d5] to-white mb-4 sm:mb-6 leading-tight px-2">
                {t('home.themes.features.homepage_elements.title')}
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl text-[#a1a1a1] max-w-4xl mx-auto leading-relaxed px-4">
                {t('home.themes.features.professional_elements.desc')}
              </p>
            </div>
          </div>
          <div className="relative px-2 sm:px-4 lg:px-12 pb-8 sm:pb-12">
            <div className="space-y-4 sm:space-y-8">
              {componentsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18b5d5]"></div>
                </div>
              ) : dynamicComponents.length > 0 ? (
                dynamicComponents.map((component, index) => (
                  <DynamicComponentCard key={component._id || index} component={component} index={index} />
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-[#a1a1a1] text-lg">لا توجد عناصر متاحة حالياً</p>
                </div>
              )}
            </div>
            <div className="mt-8 sm:mt-16 text-center">
              <div className="bg-gradient-to-r from-[#18b5d5]/10 via-[#18b5d5]/5 to-[#18b5d5]/10 rounded-xl sm:rounded-2xl border border-[#18b5d5]/20 p-4 sm:p-8">
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">{t('home.themes.not_everything')}</h3>
                <p className="text-[#a1a1a1] mb-4 sm:mb-6 text-sm sm:text-base">{t('home.themes.discover_more_features')}</p>
                <div className="flex items-center justify-center gap-2 text-[#18b5d5]">
                  <span className="text-xs sm:text-sm font-medium">{t('home.themes.more_creativity_awaits')}</span>
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#18b5d5] rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  {/* CTA Section - Fixed Horizontal Bar */}
<div className="fixed bottom-0 left-0 right-0 bg-[#292929] z-[9999] animate-section">
  <div ref={purchaseSectionRef} className="bg-[#292929] backdrop-blur-2xl border-t border-[#18b5d8]/30 shadow-2xl">
    
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* الجزء الأيمن: الصورة + الاسم + السعر */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-[#18b5d8]/20 flex-shrink-0">
            <img 
              src={buildImageUrl(theme.mainImage)}
              alt={theme.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/assets/placeholder-product.jpg';
              }}
            />
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#18b5d8] mb-1">{theme.name}</h3>
            
            <div className="flex items-center gap-2">
              {theme.originalPrice && theme.originalPrice > theme.price ? (
                <>
                  <PriceDisplay price={theme.price} className="text-base font-bold text-[#18b5d8]" />
                  <PriceDisplay price={theme.originalPrice} className="text-xs text-gray-400 line-through" />
                  <span className="bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                    -{Math.round(((theme.originalPrice - theme.price) / theme.originalPrice) * 100)}%
                  </span>
                </>
              ) : (
                <PriceDisplay price={theme.price} className="text-base font-bold text-[#18b5d8]" />
              )}
            </div>
          </div>
        </div>

        {/* الجزء الأيسر: الأزرار */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.open('https://salla.com/themes/1499917793', '_blank')}
            className="flex items-center gap-2 bg-gradient-to-r from-[#041a20] to-[#051c20] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:from-[#16a8cc] hover:to-[#18b5d8] transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <ShoppingCart className="w-4 h-4 group-hover:animate-bounce" />
            <span>{t('home.themes.get_theme_now')}</span>
          </button>
          
          <a
            href="https://drive.google.com/drive/folders/1TuMasEWd5kB6_DzDN9OVhj8afVS6w9zb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200"
          >
            <Play className="w-4 h-4" />
            <span>{t('home.themes.video')}</span>
          </a>
          
          <a
            href="https://salla.sa/dev-etmlwprywtygjjcy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200"
          >
            <Eye className="w-4 h-4" />
            <span>{t('home.themes.preview_theme')}</span>
          </a>
        </div>

      </div>
    </div>
  </div>
</div>

      <ThemeWorks />

      {/* FAQ Section */}
      {theme?.faqs && theme.faqs.length > 0 && (
        <div className="mt-12 sm:mt-16 animate-section">
          <div className="relative">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#18b5d8]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tl from-[#18b5d8]/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-[#18b5d8]/5 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
            
            <div className="relative bg-gradient-to-br from-[#1a1a1a]/95 via-[#292929]/90 to-[#1a1a1a]/95 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-[#18b5d8]/20 shadow-2xl p-6 sm:p-8 lg:p-10">
              
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {t('home.themes.faq')}
                </h2>
              </div>

              <p className="text-[#a1a1a1] text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
                {t('home.themes.features.faq_answers.desc', { themeName: theme.name })}
              </p>

              <div className="space-y-3 sm:space-y-4">
                {theme.faqs.map((faq, index) => (
                  <FAQCard key={index} faq={faq} index={index} />
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  </section>
); }

export default ThemeDetail;
