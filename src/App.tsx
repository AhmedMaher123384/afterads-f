import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}
import { useTranslation } from 'react-i18next';
import { smartToast } from './utils/toastConfig';
import { apiCall, API_ENDPOINTS } from './config/api';
import { useApiQuery } from './hooks/useApiQuery';
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
  const { data: categoriesResp, isLoading: categoriesLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CATEGORIES, queryKey: ['categories'] });
  const { data: productsResp, isLoading: productsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.PRODUCTS, queryKey: ['products'] });
  const { data: staticResp, isLoading: staticLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.STATIC_PAGES, queryKey: ['static-pages'] });
  const { data: testimonialsResp, isLoading: testimonialsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.TESTIMONIALS, queryKey: ['testimonials'] });
  const { data: clientsResp, isLoading: clientsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CLIENTS, queryKey: ['clients'] });

  useEffect(() => {
    const cats = Array.isArray(categoriesResp) ? categoriesResp : [];
    const products = Array.isArray(productsResp?.products) ? productsResp.products : (Array.isArray(productsResp) ? productsResp : []);
    const regularCategories = cats.filter((category: Category) => category.name !== 'ثيمات');
    const themeProducts = products.filter((product: Product) => product.name?.includes('ثيم') || product.productType === 'theme' || product.productType?.includes('ثيم'));
    const regularProducts = products.filter((product: Product) => !product.name?.includes('ثيم') && product.productType !== 'theme' && !product.productType?.includes('ثيم'));
    const categoryProductsData = regularCategories.map((category: Category) => ({
      category,
      products: regularProducts.filter((product: Product) => product.categoryId === category.id)
    }));
    setCategoryProducts(categoryProductsData);
    setThemes(themeProducts);
  }, [categoriesResp, productsResp]);

  useEffect(() => {
    const resp = staticResp;
    if (!resp) return;
    if (Array.isArray(resp)) {
      setStaticPages(resp.filter((page: StaticPage) => page.showInFooter));
    } else if ((resp as any).success && Array.isArray((resp as any).data)) {
      setStaticPages((resp as any).data.filter((page: StaticPage) => page.showInFooter));
    }
  }, [staticResp]);

  useEffect(() => {
    const r = testimonialsResp;
    if (!r) return;
    if (Array.isArray(r)) {
      setTestimonials(r);
    } else if ((r as any).success && Array.isArray((r as any).data)) {
      setTestimonials((r as any).data);
    } else if ((r as any).testimonials && Array.isArray((r as any).testimonials)) {
      setTestimonials((r as any).testimonials);
    } else {
      setTestimonials([]);
    }
  }, [testimonialsResp]);

  useEffect(() => {
    const r = clientsResp;
    if (!r) return;
    if (Array.isArray(r)) {
      setClients(r);
    } else if ((r as any).success && Array.isArray((r as any).data)) {
      setClients((r as any).data);
    } else if ((r as any).clients && Array.isArray((r as any).clients)) {
      setClients((r as any).clients);
    } else {
      setClients([]);
    }
  }, [clientsResp]);

  useEffect(() => {
    const loadingDerived = categoriesLoading || productsLoading || staticLoading || testimonialsLoading || clientsLoading;
    if (loadingDerived) return;
    const isMobile = isMobileDevice();
    if (isMobile) {
      setIsLoading(false);
    } else {
      setTimeout(() => setIsLoading(false), 300);
    }
    loadWishlistFromStorage();
  }, [categoriesLoading, productsLoading, staticLoading, testimonialsLoading, clientsLoading, setIsLoading, loadWishlistFromStorage]);

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
 


        <section data-section="categories">
          <MemoizedCategoriesSection 
            loading={categoriesLoading || productsLoading}
            categoryProducts={categoryProducts}
          />
        </section>
     
        <section data-section="testimonials">
          <MemoizedTestimonialsSection testimonials={testimonials} />
        </section>

        <section data-section="clients">
          <MemoizedClientsSection clients={clients} />
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