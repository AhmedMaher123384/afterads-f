import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Package, Filter, Grid, List, RefreshCw, ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import WhatsAppButton from './ui/WhatsAppButton';
import { extractIdFromSlug, isValidSlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  image: string;
}

// Simplified Tech Background
const TechBackground = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
      
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(122,122,122,0.2) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(122,122,122,0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7a7a7a]/3 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#4a4a4a]/3 rounded-full blur-3xl" />
    </div>
  );
});

TechBackground.displayName = 'TechBackground';

const MemoizedProductCard = memo(ProductCard);

const CategoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = useMemo(() => i18n.language === 'ar', [i18n.language]);
  const { categoryId, slug } = useParams<{ categoryId?: string; slug?: string }>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const getLocalizedContent = useCallback((item: any, field: string) => {
    const currentLang = i18n.language;
    const langField = `${field}_${currentLang}`;
    
    if (item[langField] && item[langField].trim()) {
      return item[langField];
    }
    
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const otherLangField = `${field}_${otherLang}`;
    if (item[otherLangField] && item[otherLangField].trim()) {
      return item[otherLangField];
    }
    
    return item[field] || '';
  }, [i18n.language]);

  const fetchCategoryAndProducts = useCallback(async (catId: number) => {
    try {
      setLoading(true);
      const [categoryData, productsResponse] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORY_BY_ID(catId)),
        apiCall(API_ENDPOINTS.PRODUCTS),
      ]);

      setCategory(categoryData);
      const allProducts = productsResponse.products || productsResponse;
      const categoryProducts = allProducts.filter((product: Product) => product.categoryId === catId);
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      smartToast.frontend.error(t('category_load_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let catId: number | null = null;

    if (slug) {
      if (isValidSlug(slug)) {
        catId = extractIdFromSlug(slug);
      } else {
        smartToast.frontend.error('رابط التصنيف غير صحيح');
        return;
      }
    } else if (categoryId) {
      catId = parseInt(categoryId);
    }

    if (catId) {
      fetchCategoryAndProducts(catId);
    }
  }, [categoryId, slug, fetchCategoryAndProducts]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, sortBy]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center px-4">
        <TechBackground />
        <div className="relative text-center max-w-md mx-auto">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-[#7a7a7a] mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('loading')}</h2>
          <p className="text-gray-500">{t('loading_category_data')}</p>
        </div>
      </section>
    );
  }

  if (!category) return null;

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <TechBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 mt-[70px] sm:mt-[80px]">
        
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#7a7a7a] transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className={`w-5 h-5 transition-transform group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-sm font-medium">{t('back_to_home')}</span>
        </Link>

        {/* Category Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#7a7a7a] to-[#7a7a7a]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-white via-[#e0e0e0] to-white bg-clip-text text-transparent">
                {getLocalizedContent(category, 'name')}
              </span>
            </h1>
            <div className="w-16 h-[2px] bg-gradient-to-l from-transparent via-[#7a7a7a] to-[#7a7a7a]" />
          </div>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {getLocalizedContent(category, 'description')}
          </p>
        </div>

        {/* Filters Bar - Professional Dark Design */}
        <div className="bg-[#141414]/90 backdrop-blur-xl rounded-2xl border border-[#2a2a2a] p-4 sm:p-5 mb-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Left Side - Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-400 min-w-fit">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{t('sort_by')}:</span>
                </div>
                <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-[#0a0a0a] text-gray-300 rounded-xl 
                             border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#7a7a7a]/30 
                             focus:border-[#7a7a7a] transition-all duration-300 cursor-pointer 
                             hover:border-[#3a3a3a] text-sm font-medium"
                  >
                    <option value="name" className="bg-[#141414]">{t('sort_by_name')}</option>
                    <option value="price-low" className="bg-[#141414]">{t('price_low_to_high')}</option>
                    <option value="price-high" className="bg-[#141414]">{t('price_high_to_low')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Products Count Badge */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a]">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">{t('products')}:</span>
                <span className="text-base font-bold text-[#7a7a7a]">{products.length}</span>
              </div>
            </div>

            {/* Right Side - View Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-xl border border-[#2a2a2a]">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-[#7a7a7a] text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">شبكة</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-[#7a7a7a] text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">قائمة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8'
                : 'flex flex-col gap-6 max-w-5xl mx-auto'
            }
          >
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full">
                <MemoizedProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#7a7a7a]/5 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-full border border-[#2a2a2a] flex items-center justify-center">
                <Package className="w-12 h-12 text-[#7a7a7a]" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">{t('no_products_in_category')}</h3>
            <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">{t('products_coming_soon')}</p>
            
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7a7a7a] to-[#5a5a5a] 
                       text-white rounded-xl font-semibold transition-all duration-300 
                       hover:shadow-xl hover:shadow-[#7a7a7a]/20 hover:scale-105 border border-[#2a2a2a]"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t('back_to_home')}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <WhatsAppButton />
      </div>
    </section>
  );
};

export default memo(CategoryPage);