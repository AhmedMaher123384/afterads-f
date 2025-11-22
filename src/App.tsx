import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}
import { useTranslation } from 'react-i18next';
import { smartToast } from './utils/toastConfig';
import { apiCall, API_ENDPOINTS } from './config/api';
import WhatsAppButton from './components/ui/WhatsAppButton';
import ThemesSection from './components/home/ThemesSection';
import ScrollProgressIndicator from './components/ui/ScrollProgressIndicator';
import ScrollToTopButton from './components/ui/ScrollToTopButton';
import LoadingScreen from './components/ui/LoadingScreen';
import { useLoading } from './contexts/LoadingContext';
import HeroSection from './components/home/HeroSection';
import CategoriesSection from './components/home/CategoriesSection';
import AboutUsSection from './components/home/AboutUsSection';
import TestimonialsSection from './components/home/TestimonialsSection';
import ClientsSection from './components/home/ClientsSection';
import FAQSection from './components/home/FAQSection';
import ContactSection from './components/home/ContactSection';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from './utils/cartUtils';
import { isMobileDevice } from './utils/deviceDetection';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  productType?: string;
  createdAt?: string;
}

interface Theme {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  categoryType?: 'regular' | 'theme';
}

interface CategoryProducts {
  category: Category;
  products: Product[];
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  showInFooter: boolean;
  createdAt: string;
}

interface Testimonial {
  id: number;
  name: string;
  testimonial: string;
  image?: string;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  createdAt: string;
}

// Memoized Components
const MemoizedThemesSection = memo(ThemesSection);
const MemoizedCategoriesSection = memo(CategoriesSection);
const MemoizedAboutUsSection = memo(AboutUsSection);
const MemoizedTestimonialsSection = memo(TestimonialsSection);
const MemoizedClientsSection = memo(ClientsSection);
const MemoizedFAQSection = memo(FAQSection);
const MemoizedContactSection = memo(ContactSection);
const MemoizedHeroSection = memo(HeroSection);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = useMemo(() => i18n.language === 'ar', [i18n.language]);
  const { isLoading, setIsLoading } = useLoading();

  // State
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Refs
  const testimonialsTrackRef = useRef<HTMLDivElement | null>(null);

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  // Record visit once on mount
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const path = window.location?.pathname || '/';
        await apiCall(API_ENDPOINTS.VISITS_COUNTER, {
          method: 'POST',
          body: JSON.stringify({ path }),
        });
      } catch (err) {
        console.warn('لم يتم تسجيل الزيارة:', err);
      }
    };
    recordVisit();
  }, []);

  // Initial visibility animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Memoized load wishlist function
  const loadWishlistFromStorage = useCallback(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
  }, []);

  // Memoized fetch functions
  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesResponse, productsResponse] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORIES),
        apiCall(API_ENDPOINTS.PRODUCTS)
      ]);
      
      const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      const products = Array.isArray(productsResponse?.products) ? productsResponse.products : [];
      
      const regularCategories = categories.filter((category: Category) => 
        category.name !== 'ثيمات'
      );
      
      const themeProducts = products.filter((product: Product) => 
        product.name?.includes('ثيم') || 
        product.productType === 'theme' ||
        product.productType?.includes('ثيم')
      );
      
      const regularProducts = products.filter((product: Product) => 
        !product.name?.includes('ثيم') && 
        product.productType !== 'theme' &&
        !product.productType?.includes('ثيم')
      );
      
      const categoryProductsData = regularCategories.map((category: Category) => ({
        category,
        products: regularProducts.filter((product: Product) => product.categoryId === category.id)
      }));
      
      setCategoryProducts(categoryProductsData);
      setThemes(themeProducts);
    } catch (error) {
      console.error('Error fetching category products:', error);
      setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
      smartToast.frontend.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaticPages = useCallback(async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.STATIC_PAGES);
      
      if (Array.isArray(response)) {
        const footerPages = response.filter((page: StaticPage) => page.showInFooter);
        setStaticPages(footerPages);
      } else if (response.success && Array.isArray(response.data)) {
        const footerPages = response.data.filter((page: StaticPage) => page.showInFooter);
        setStaticPages(footerPages);
      }
    } catch (error) {
      console.error('Error fetching static pages:', error);
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.TESTIMONIALS);
      
      if (Array.isArray(response)) {
        setTestimonials(response);
      } else if (response.success && Array.isArray(response.data)) {
        setTestimonials(response.data);
      } else if (response.testimonials && Array.isArray(response.testimonials)) {
        setTestimonials(response.testimonials);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.CLIENTS);
      
      if (Array.isArray(response)) {
        setClients(response);
      } else if (response.success && Array.isArray(response.data)) {
        setClients(response.data);
      } else if (response.clients && Array.isArray(response.clients)) {
        setClients(response.clients);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const isMobile = isMobileDevice();
        
        if (isMobile) {
          setIsLoading(false);
        }
        
        await Promise.all([
          fetchCategoryProducts(),
          fetchStaticPages(),
          fetchTestimonials(),
          fetchClients()
        ]);
        
        loadWishlistFromStorage();
        
        if (!isMobile) {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [setIsLoading, fetchCategoryProducts, fetchStaticPages, fetchTestimonials, fetchClients, loadWishlistFromStorage]);

  // Memoized cart handlers
  const handleQuantityIncrease = useCallback((productId: number, maxStock: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      if (currentQuantity < maxStock) {
        return { ...prev, [productId]: currentQuantity + 1 };
      }
      return prev;
    });
  }, []);

  const handleQuantityDecrease = useCallback((productId: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      if (currentQuantity > 1) {
        return { ...prev, [productId]: currentQuantity - 1 };
      }
      return prev;
    });
  }, []);

  const handleAddToCart = useCallback(async (productId: number, productName: string) => {
    try {
      const quantity = quantities[productId] || 1;
      const product = categoryProducts
        .flatMap(cp => cp.products)
        .find(p => p.id === productId);
      
      if (!product) {
        smartToast.frontend.error('المنتج غير موجود');
        return;
      }
      
      if (!product.isAvailable) {
        smartToast.frontend.error('الكمية المطلوبة غير متوفرة في المخزون');
        return;
      }
      
      const success = await addToCartUnified(
        productId, 
        productName, 
        quantity, 
        {}, 
        product.price, 
        product.mainImage
      );
      
      if (success) {
        setQuantities(prev => ({ ...prev, [productId]: 1 }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      smartToast.frontend.error('فشل في إضافة المنتج للسلة');
    }
  }, [quantities, categoryProducts]);

  const handleWishlistToggle = useCallback(async (productId: number, productName: string) => {
    try {
      const isInWishlist = wishlist.includes(productId);
      
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(productId, productName);
        if (success) {
          setWishlist(prev => prev.filter(id => id !== productId));
        }
      } else {
        const success = await addToWishlistUnified(productId, productName);
        if (success) {
          setWishlist(prev => [...prev, productId]);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      smartToast.frontend.error(t('common.errors.wishlist_update_failed'));
    }
  }, [wishlist, t]);

  // Memoized computed values
  const allProducts = useMemo(() => {
    return categoryProducts.flatMap(cp => cp.products);
  }, [categoryProducts]);

  const featuredProducts = useMemo(() => {
    return allProducts.slice(0, 8);
  }, [allProducts]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">{t('common.errors.general')}</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchCategoryProducts}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('common.errors.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div 
      className={`min-h-screen w-full bg-[#292929] transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >      
      
      <div className="pt-0">
        <section data-section="hero">
          <MemoizedHeroSection />
        </section>

        <section data-section="themes">
          <MemoizedThemesSection themes={themes} />
        </section>

        <section data-section="services">
          <MemoizedAboutUsSection />
        </section>
 
        <section data-section="clients">
          <MemoizedClientsSection clients={clients} />
        </section>

        <section data-section="categories">
          <MemoizedCategoriesSection 
            loading={loading}
            categoryProducts={categoryProducts}
          />
        </section>
     
        <section data-section="testimonials">
          <MemoizedTestimonialsSection testimonials={testimonials} />
        </section>

        <section data-section="faq">
          <MemoizedFAQSection />
        </section>

        <section data-section="contact">
          <MemoizedContactSection />
        </section>
      </div>

      <ScrollToTopButton />
      <ScrollProgressIndicator />
    </div>
  );
}

export default memo(App);