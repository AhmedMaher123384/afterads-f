import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Grid, List, Package, ChevronDown, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import LoadingSpinner from './ui/LoadingSpinner';
import GlobalFooter from './layout/GlobalFooter';
import { createCategorySlug, createProductSlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { useApiQuery } from '../hooks/useApiQuery';

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: any;
  description_ar?: string;
  description_en?: string;
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

const AllProducts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery<Category[]>({
    endpoint: API_ENDPOINTS.CATEGORIES,
    queryKey: ['categories']
  });
  const { data: productsResponse, isLoading: productsLoading } = useApiQuery<any>({
    endpoint: API_ENDPOINTS.PRODUCTS,
    queryKey: ['products']
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cachedAllProducts');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const loading = categoriesLoading || productsLoading;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper function to get localized content
  const getLocalizedContent = (product: Product, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    const value = currentLang === 'ar'
      ? (product[arField] as any) || (product[enField] as any) || product[field]
      : (product[enField] as any) || (product[arField] as any) || product[field];
    if (Array.isArray(value)) {
      return value.map((b: any) => (b && b.text) ? b.text : '').join(' ');
    }
    return String(value || '');
  };

  // Helper function to get localized category content
  const getCategoryLocalizedContent = (category: Category, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return category[`${field}_ar`] || category[`${field}_en`] || category[field] || '';
    } else {
      return category[`${field}_en`] || category[`${field}_ar`] || category[field] || '';
    }
  };

  const baseProducts: Product[] = useMemo(() => {
    if (!productsResponse || !categoriesData) return [];
    const productsData = productsResponse.products || productsResponse;
    const themesCategory = categoriesData.find((category: Category) => {
      const categoryName = getCategoryLocalizedContent(category, 'name').toLowerCase();
      return categoryName === 'ثيمات' || categoryName === 'themes';
    });
    const themesCategoryId = themesCategory ? themesCategory.id : null;
    const filtered = (productsData as Product[]).filter((product: Product) => 
      product.categoryId !== themesCategoryId && product.id !== 55
    );
    return filtered;
  }, [productsResponse, categoriesData]);

  useEffect(() => {
    if (baseProducts.length === 0 || !categoriesData) return;
    localStorage.setItem('cachedAllProducts', JSON.stringify(baseProducts));
    localStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
    setFilteredProducts(baseProducts);
  }, [baseProducts, categoriesData]);

  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, searchTerm, sortBy]);

  const productsDataForFilter = baseProducts;

  

  const filterAndSortProducts = () => {
    let filtered = [...productsDataForFilter];
    if (selectedCategory) filtered = filtered.filter(product => product.categoryId === selectedCategory);
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const localizedName = getLocalizedContent(product, 'name');
        const localizedDescription = getLocalizedContent(product, 'description');
        return localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               localizedDescription.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => {
          const nameA = getLocalizedContent(a, 'name');
          const nameB = getLocalizedContent(b, 'name');
          return nameA.localeCompare(nameB);
        });
        break;
    }
    setFilteredProducts(filtered);
  };

  const handleCategoryFilter = (categoryId: number | null) => setSelectedCategory(categoryId);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value);

  if (loading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Banner في أعلى صفحة المنتجات */}
      
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
          <div className="absolute text-[#4cffee]/50 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '5%', left: '5%' }}>
            <span role="img" aria-label="chart">📊</span>
          </div>
          <div className="absolute text-[#ffffff]/45 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '15%', right: '10%', animationDelay: '600ms' }}>
            <span role="img" aria-label="trending">📈</span>
          </div>
          <div className="absolute text-[#ffffff]/40 text-2xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '30%', right: '20%', animationDelay: '1200ms' }}>
            <span role="img" aria-label="bulb">💡</span>
          </div>
          <div className="absolute text-[#4cffee]/50 text-2xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '25%', right: '15%', animationDelay: '1800ms' }}>
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
        `}
      </style>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-[80px]">        {/* Header */}
        <div className="text-center mb-12">
          
          <div className="inline-flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {t('all_products.title')} <span className="text-[#7a7a7a]">{t('all_products.title_highlight')}</span>
            </h1>
            <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              
            </div>
          </div>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto px-4">
            {t('all_products.description')}
          </p>
        </div>
        
      

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center place-items-center' : 'space-y-4 sm:space-y-6'} w-full max-w-7xl mx-auto`}>
            {filteredProducts.map(product => (
              <div key={product.id} className={`w-full ${viewMode === 'grid' ? 'max-w-sm mx-auto flex justify-center' : ''}`}>
                <ProductCard
                  product={product}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
                <Package className="w-10 h-10 text-[#7a7a7a] filter drop-shadow-[0_0_10px_rgba(122,122,122,0.8)]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('products.no_products')}</h3>
            <p className="text-lg text-gray-100 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory
                ? t('products.no_products_search')
                : t('products.no_products_available')} 
            </p>
            {(searchTerm || selectedCategory) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-8 py-4 rounded-xl hover:from-[#292929] hover:to-[#7a7a7a] transition-all duration-300 font-bold text-lg backdrop-blur-sm border border-white/10 hover:scale-105 transform"
              >
                <span>{t('products.clear_filters')}</span>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      
    </section>
  );
};

export default AllProducts;