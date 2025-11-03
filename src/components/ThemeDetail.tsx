import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { ShoppingCart, Star, MessageSquare, Play, Eye, Headphones, Settings, Palette, Store, Smartphone, Languages, Search, RefreshCcw, Gift, Plus, Minus, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { addToCartUnified, addToWishlistUnified } from '../utils/cartUtils';
import WhatsAppButton from './ui/WhatsAppButton';
import AuthModal from './modals/AuthModal';
import PriceDisplay from './ui/PriceDisplay';
import theme1 from '../assets/themecover.webp';
import theme2 from '../assets/111.webp';
import theme3 from '../assets/112.webp';
import theme4 from '../assets/113.webp';


import image1 from '../assets/1.webp';
import image2 from '../assets/2.webp';
import image3 from '../assets/3.webp';
import image4 from '../assets/4.webp';
import image5 from '../assets/5.webp';
import image6 from '../assets/6.webp';
import image7 from '../assets/7.webp';
import image8 from '../assets/8.webp';
import image9 from '../assets/9.webp';
import image10 from '../assets/10.webp';
import image11 from '../assets/11.webp';
import image12 from '../assets/12.webp';
import image13 from '../assets/13.webp';
import angel from '../assets/angel.webp';


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
  const { t } = useTranslation();
  const { param } = useParams<{ param?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if param is numeric ID or slug
  const isNumericId = param && /^\d+$/.test(param);
  const themeId = isNumericId ? param : undefined;
  const themeSlug = !isNumericId ? param : undefined;
  
  // Debug logging
  console.log('🔍 ThemeDetail Debug:', {
    param,
    isNumericId,
    themeId,
    themeSlug,
    pathname: location.pathname
  });
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
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const purchaseSectionRef = useRef<HTMLDivElement>(null);

  // FAQ Card Component
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
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
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

  const images = [theme1, theme2, theme3, theme4];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFixedButtons(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };


  // Remove the old themeId calculation since we now have it from params
  // const themeId = slug ? slug.match(/\d+/)?.[0] || undefined : id;



  const components = [
    { title: t('home.themes.components.animated_images.title'), desc: t('home.themes.components.animated_images.desc'), img: image1 },
    { title: t('home.themes.components.square_images.title'), desc: t('home.themes.components.square_images.desc'), img: image2 },
    { title: t('home.themes.components.store_features.title'), desc: t('home.themes.components.store_features.desc'), img: image3 },
    { title: t('home.themes.components.quick_links.title'), desc: t('home.themes.components.quick_links.desc'), img: image4 },
    { title: t('home.themes.components.featured_product.title'), desc: t('home.themes.components.featured_product.desc'), img: image5 },
    { title: t('home.themes.components.separator.title'), desc: t('home.themes.components.separator.desc'), img: image6 },
    { title: t('home.themes.components.modal_window.title'), desc: t('home.themes.components.modal_window.desc'), img: image7 },
    { title: t('home.themes.components.faq.title'), desc: t('home.themes.components.faq.desc'), img: image8 },
    { title: t('home.themes.components.animated_articles.title'), desc: t('home.themes.components.animated_articles.desc'), img: image9 },
    { title: t('home.themes.components.customer_reviews.title'), desc: t('home.themes.components.customer_reviews.desc'), img: image10 },
    { title: t('home.themes.components.store_locations.title'), desc: t('home.themes.components.store_locations.desc'), img: image11 },
    { title: t('home.themes.components.store_stories.title'), desc: t('home.themes.components.store_stories.desc'), img: image12 },
    { title: t('home.themes.components.brand_showcase.title'), desc: t('home.themes.components.brand_showcase.desc'), img: image13 },
  ];





  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setLoading(true);
        const response = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(themeId!));
        const productData = response.success ? response.data : response;
        if (productData && productData.id) {
          setTheme(productData);
          setSelectedImage(productData.mainImage);
          if (productData.categoryId) {
            const categoryResponse = await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(productData.categoryId));
            if (categoryResponse.success) setCategory(categoryResponse.data);
          }
        } else {
          setError('لم يتم العثور على الثيم');
        }
      } catch (error) {
        setError('حدث خطأ أثناء تحميل الثيم');
      } finally {
        setLoading(false);
      }
    };



    if (themeId) {
      fetchTheme();
    }

    gsap.utils.toArray('.animate-section').forEach((section: any) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [themeId]);

  const scrollToPurchaseSection = () => {
    const attemptScroll = (retryCount = 0) => {
      if (purchaseSectionRef.current) {
        // Check if element is actually rendered and visible
        const element = purchaseSectionRef.current;
        const rect = element.getBoundingClientRect();
        
        if (rect.height > 0 && rect.width > 0) {
          // Element is ready, perform scroll
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          // Add highlight effect
          element.style.transition = 'box-shadow 0.3s ease';
          element.style.boxShadow = '0 0 20px rgba(24, 181, 216, 0.5)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);
        } else if (retryCount < 10) {
          // Element not ready yet, retry with exponential backoff
          setTimeout(() => attemptScroll(retryCount + 1), 200 * (retryCount + 1));
        }
      } else if (retryCount < 10) {
        // Ref not ready yet, retry
        setTimeout(() => attemptScroll(retryCount + 1), 200 * (retryCount + 1));
      }
    };
    
    // Start attempting to scroll
    attemptScroll();
  };

  // Handle initial page load and scroll to purchase via navigation state
  useEffect(() => {
    if (theme) {
      const shouldScroll = Boolean((location.state as any)?.scrollToPurchase);
      if (shouldScroll) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToPurchaseSection();
          }, 100);
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  }, [theme, location.state]);

  // Disabled: hash-based scrolling (prevent footer flash)
  useEffect(() => {
    return () => {};
  }, []);

  const handleAddToCart = async () => {
    if (!theme) return;
    setAddingToCart(true);
    try {
      const selectedAddOnsData = getSelectedAddOnsData();
      const totalPrice = calculateTotalPrice();

      const cartData = {
        addOns: selectedAddOnsData,
        totalPrice: totalPrice,
        basePrice: theme.price,
        addOnsPrice: selectedAddOnsData.reduce((sum, addOn) => sum + addOn.price, 0)
      };

      await addToCartUnified(theme.id, theme.name, quantity, cartData, totalPrice, theme.mainImage);

      let successMessage = 'تم إضافة الثيم إلى السلة بنجاح!';
      if (selectedAddOnsData.length > 0) {
        successMessage += ` مع ${selectedAddOnsData.length} خدمة إضافية`;
      }

      smartToast.frontend.success(successMessage);
    } catch (error) {
      smartToast.frontend.error('حدث خطأ أثناء إضافة الثيم إلى السلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!theme) return;
    try {
      await addToWishlistUnified(theme.id, theme.name);
      smartToast.frontend.success('تم إضافة الثيم إلى قائمة الأمنيات!');
    } catch (error) {
      smartToast.frontend.error('حدث خطأ أثناء إضافة الثيم إلى قائمة الأمنيات');
    }
  };



  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    smartToast.frontend.success('مرحباً بك! يمكنك الآن إضافة تعليقك');
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const toggleAddOn = (addOnIndex: number) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnIndex]: !prev[addOnIndex]
    }));
  };

  const calculateTotalPrice = () => {
    if (!theme) return 0;
    let total = theme.price * quantity;

    if (theme.addOns) {
      theme.addOns.forEach((addOn, index) => {
        if (selectedAddOns[index]) {
          total += addOn.price * quantity;
        }
      });
    }

    return total;
  };

  const getSelectedAddOnsData = () => {
    if (!theme?.addOns) return [];
    return theme.addOns.filter((_, index) => selectedAddOns[index]);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#18b5d8] mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('home.themes.loading')}</h2>
          <p className="text-[#7a7a7a]">{t('home.themes.loading_message')}</p>
        </div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('home.themes.error_loading')}</h2>
          <p className="text-[#7a7a7a] mb-6">{error || t('home.themes.not_found')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-6 py-3 rounded-lg hover:from-[#292929] hover:to-[#7a7a7a] transition-all duration-300 transform hover:scale-105 font-medium micro-hover"
          >
            {t('home.themes.back_to_home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden" dir="rtl">
      {/* Animated Background Pattern */}
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
          <img
            src={angel} // استخدام الـ import هنا بدل "/angel"
            alt="angel theme preview"
            className="w-24 sm:w-32 lg:w-40 h-auto"
          />
        </div>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-8 text-center px-2">{t('home.themes.number_one')}</h2>

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
                        onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
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
                    <span className="hidden sm:inline">تشغيل تلقائي</span>
                    <span className="sm:hidden">تلقائي</span>
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
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-6">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ${index === currentImageIndex
                        ? 'ring-2 sm:ring-3 ring-[#18b5d8] scale-105 shadow-lg shadow-[#18b5d8]/25'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`صورة مصغرة ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-[#18b5d8]/20"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
              <button
                onClick={scrollToPurchaseSection}
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5] to-[#16a8cc] text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-[#16a8cc] hover:to-[#18b5d5] transition-all duration-300 transform hover:scale-105 micro-hover shadow-xl hover:shadow-2xl border border-[#18b5d5]/30"
              >
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('home.themes.add_to_cart')}</span>
                <span className="sm:hidden">{t('addToCart')}</span>
              </button>
              <a
                href="https://drive.google.com/drive/folders/1TuMasEWd5kB6_DzDN9OVhj8afVS6w9zb"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-800 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl micro-hover"
              >
                <Play className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('home.themes.video_explanation')}</span>
                <span className="sm:hidden">شرح فيديو</span>
              </a>
              <a
                href="https://salla.sa/dev-etmlwprywtygjjcy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl micro-hover"
              >
                <Eye className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{t('home.themes.preview_theme')}</span>
                <span className="sm:hidden">معاينة</span>
              </a>
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
            <div className="mt-16 pt-12 border-t border-[#18b5d5]/20">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-xl sm:rounded-2xl p-3 sm:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-all duration-300">
                    <Palette className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                    <div className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2">25+</div>
                    <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.professional_elements')}</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-xl sm:rounded-2xl p-3 sm:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-all duration-300">
                    <Settings className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <div className="text-lg sm:text-3xl font-bold text-[#18b5d5] mb-1 sm:mb-2">250+</div>
                    <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.features.advanced_customization.title')}</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-xl sm:rounded-2xl p-3 sm:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-all duration-300">
                    <Headphones className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-[#18b5d5]" />
                    <div className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2">24/7</div>
                    <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.technical_support')}</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-xl sm:rounded-2xl p-3 sm:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-all duration-300">
                    <Store className="w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <div className="text-lg sm:text-3xl font-bold text-[#18b5d5] mb-1 sm:mb-2">4000+</div>
                    <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.active_store')}</div>
                  </div>
                </div>
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
                {components.map((component, index) => (
                  <div key={index} className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d5]/5 via-transparent to-[#18b5d5]/5 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"></div>
                    <div className="relative bg-gradient-to-br from-[#292929]/60 via-[#1a1a1a]/80 to-[#292929]/60 rounded-xl sm:rounded-3xl border border-[#18b5d5]/20 group-hover:border-[#18b5d5]/40 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-[#18b5d5]/10">
                      <div className="flex flex-col xl:flex-row">
                        <div className="w-full xl:w-64 flex-shrink-0 relative">
                          <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-3xl xl:rounded-l-3xl xl:rounded-tr-none aspect-w-16 aspect-h-9">
                            <img
                              src={component.img}
                              alt={component.title}
                              className="w-full max-w-[150px] sm:max-w-[200px] mx-auto h-auto object-contain xl:object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d5]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-[#18b5d5]/90 to-[#18b5d5]/70 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-[#18b5d5]/30">
                              <span className="text-white text-xs font-bold">#{index + 1}</span>
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-2 sm:w-3 h-2 sm:h-3 bg-[#18b5d5] rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 p-3 sm:p-4 lg:p-8 flex flex-col justify-center">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="bg-gradient-to-r from-[#18b5d5]/20 to-[#18b5d5]/10 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-[#18b5d5]/30">
                              <span className="text-[#18b5d5] text-xs sm:text-sm font-semibold">{t('home.themes.advanced_element')}</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#18b5d5]/30 to-transparent"></div>
                          </div>
                          <h3 className="text-base sm:text-lg lg:text-2xl font-black text-white mb-2 sm:mb-3 leading-tight group-hover:text-[#18b5d5] transition-colors duration-300">
                            {component.title}
                          </h3>
                          <p className="text-[#a1a1a1] text-xs sm:text-sm lg:text-base leading-relaxed mb-3 sm:mb-4">
                            {component.desc}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="bg-[#18b5d5]/10 text-[#18b5d5] px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-[#18b5d5]/20">
                              {t('home.themes.easy_to_use')}
                            </span>
                            <span className="bg-[#18b5d5]/10 text-[#18b5d5] px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-[#18b5d5]/20">
                              {t('home.themes.customizable')}
                            </span>
                            <span className="bg-[#18b5d5]/10 text-[#18b5d5] px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-[#18b5d5]/20">
                              متجاوب
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#18b5d5]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                  </div>
                ))}
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

        {/* CTA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 sm:gap-12 animate-section">

          <div className="space-y-4 sm:space-y-8">
            <div ref={purchaseSectionRef} className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-8 lg:max-w-none">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4"> {theme.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex flex-col">
                  {theme.originalPrice && theme.originalPrice > theme.price ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <PriceDisplay price={theme.originalPrice} className="text-lg sm:text-xl text-[#7a7a7a] line-through font-medium" />
                        <span className="bg-[#18b5d8]/20 text-[#18b5d8] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit">
                          -{Math.round(((theme.originalPrice - theme.price) / theme.originalPrice) * 100)}% خصم
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-[#18b5d8]">
                        <PriceDisplay price={theme.price} />
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl sm:text-3xl font-bold text-[#18b5d8]">
                      <PriceDisplay price={theme.price} />
                    </div>
                  )}
                </div>
              </div>
              {theme.shortDescription && (
                <p className="text-sm sm:text-base text-[#7a7a7a] leading-relaxed mb-4 sm:mb-6">{theme.shortDescription}</p>
              )}

              {/* Additional Services */}
              {theme.addOns && theme.addOns.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setIsAddOnsExpanded(!isAddOnsExpanded)}
                    className="w-full flex items-center justify-between text-base font-semibold text-white mb-3 sm:mb-4 p-2 sm:p-3 bg-[#1a1a1a]/30 rounded-lg sm:rounded-xl border border-white/10 hover:border-[#18b5d8]/50 transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                      الخدمات الإضافية
                    </div>
                    <div className={`transform transition-transform duration-200 ${isAddOnsExpanded ? 'rotate-180' : ''
                      }`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isAddOnsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="space-y-2 sm:space-y-3">
                      {theme.addOns.map((addOn, index) => (
                        <div key={index} className="bg-[#1a1a1a]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={() => toggleAddOn(index)}
                                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${selectedAddOns[index]
                                      ? 'bg-[#18b5d8] border-[#18b5d8]'
                                      : 'border-[#7a7a7a] hover:border-[#18b5d8]'
                                    }`}
                                >
                                  {selectedAddOns[index] && (
                                    <Plus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                  )}
                                </button>
                                <div> 
                                  <h4 className="text-white font-medium text-sm sm:text-base">{addOn.name}</h4>
                                  {addOn.description && (
                                    <p className="text-[#7a7a7a] text-xs sm:text-sm mt-1">{addOn.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-[#18b5d8] font-semibold text-sm sm:text-base">
                              +<PriceDisplay price={addOn.price} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base font-semibold text-white mb-2 sm:mb-3">{t('home.themes.quantity')}</h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={decreaseQuantity}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1a1a] border border-[#7a7a7a] rounded-lg flex items-center justify-center text-white hover:border-[#18b5d8] transition-all duration-200"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-white font-semibold text-base min-w-[2.5rem] sm:min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1a1a] border border-[#7a7a7a] rounded-lg flex items-center justify-center text-white hover:border-[#18b5d8] transition-all duration-200"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#18b5d8]/10 to-[#16a8cc]/10 rounded-lg sm:rounded-xl border border-[#18b5d8]/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm sm:text-base">السعر الإجمالي:</span>
                  <span className="text-xl font-bold text-[#18b5d8]">
                    <PriceDisplay price={calculateTotalPrice()} />
                  </span>
                </div>
                {Object.values(selectedAddOns).some(Boolean) && (
                  <div className="mt-2 pt-2 border-t border-[#18b5d8]/20">
                    <div className="text-xs sm:text-sm text-[#7a7a7a] space-y-1">
                      <div className="flex justify-between">
                        <span>سعر الثيم الأساسي:</span>
                        <span><PriceDisplay price={theme.price * quantity} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span>الخدمات الإضافية:</span>
                        <span>+<PriceDisplay price={getSelectedAddOnsData().reduce((sum, addOn) => sum + addOn.price, 0)} /></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="text-xs sm:text-sm text-[#7a7a7a]">
                    {theme.isAvailable ? (
                      <span className="text-[#18b5d8] font-medium">متوفر</span>
                    ) : (
                      <span className="text-red-400 font-medium">غير متوفر</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !theme.isAvailable}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#18b5d5] to-[#16a8cc] text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-[#16a8cc] hover:to-[#18b5d5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg micro-hover border border-[#18b5d5]/30 text-sm sm:text-base"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="text-sm sm:text-base">جاري الإضافة...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">أضف إلى السلة</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-[#7a7a7a] text-[#7a7a7a] rounded-lg sm:rounded-xl hover:bg-[#7a7a7a] hover:text-white transition-all duration-300 transform hover:scale-105 micro-hover"
                  >
                    <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

       {/* FAQ Section */}
{theme?.faqs && theme.faqs.length > 0 && (
  <div className="mt-12 sm:mt-16 animate-section">
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#18b5d8]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tl from-[#18b5d8]/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-[#18b5d8]/5 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative bg-gradient-to-br from-[#1a1a1a]/95 via-[#292929]/90 to-[#1a1a1a]/95 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-[#18b5d8]/20 shadow-2xl p-6 sm:p-8 lg:p-10">
        
        {/* Title */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t('home.themes.faq')}
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-[#a1a1a1] text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
          {t('home.themes.features.faq_answers.desc', { themeName: theme.name })}
        </p>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {theme.faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/8 transition-all duration-200">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-white hover:text-[#18b5d8] transition-colors duration-200">
                  <span className="text-sm sm:text-base font-medium pr-2 leading-relaxed">
                    {faq.question}
                  </span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8] transform transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="mt-2 sm:mt-3 pt-2 border-t border-white/5">
                  <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
                    {faq.answer}
                  </p>
                </div>
              </details>
            </div>
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

      {showFixedButtons && (
        <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-50 transition-all duration-500 ease-in-out">
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 justify-center items-center max-w-xs sm:max-w-4xl mx-auto">
            <button
              onClick={scrollToPurchaseSection}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-[#18b5d5] to-[#16a8cc] text-white px-2 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-[#16a8cc] hover:to-[#18b5d5] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto border border-[#18b5d5]/30"
            >
              <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">أضف إلى السلة</span>
              <span className="sm:hidden text-xs">أضف إلى السلة</span>
            </button>
            <a
              href="https://drive.google.com/drive/folders/1TuMasEWd5kB6_DzDN9OVhj8afVS6w9zb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-600 to-red-800 text-white px-2 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Play className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">شرح كامل بالفيديو</span>
              <span className="sm:hidden text-xs"> شرح فيديو </span>
            </a>
            <a
              href="https://salla.sa/dev-etmlwprywtygjjcy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-2 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Eye className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('home.themes.preview_theme')}</span>
                <span className="sm:hidden text-xs">{t('home.themes.preview_theme')}</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default ThemeDetail;