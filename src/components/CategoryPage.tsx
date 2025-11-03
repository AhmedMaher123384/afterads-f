import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Package, Filter, Grid, List, RefreshCw } from 'lucide-react';
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

interface TechBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  bgGradient?: string[];
}

const codeSnippets = [
  { content: '&lt;div className=&quot;hero&quot;&gt;', top: '5%', left: '5%', delay: '0ms' },
  { content: 'function analytics()', top: '15%', right: '10%', delay: '500ms' },
  { content: 'const [data, setData] =', bottom: '20%', left: '15%', delay: '1000ms' },
  { content: 'SEO.optimize();', bottom: '10%', right: '5%', delay: '1500ms' },
  { content: 'API.fetch(&#39;/products&#39;)', top: '25%', left: '50%', delay: '2000ms' },
  { content: 'useState(&#123; loading: false &#125;);', top: '35%', right: '20%', delay: '2500ms' },
  { content: 'fetchData().then(res =&gt;', bottom: '30%', left: '25%', delay: '3000ms' },
  { content: 'renderUI(component);', top: '50%', left: '30%', delay: '3500ms' },
  { content: '&lt;RouterProvider /&gt;', bottom: '15%', right: '15%', delay: '4000ms' },
  { content: 'const query = useQuery();', top: '60%', left: '20%', delay: '4500ms' },
  { content: 'useEffect(() =&gt;', top: '10%', left: '70%', delay: '5000ms' },
  { content: 'async function init()', bottom: '25%', right: '25%', delay: '5500ms' },
  { content: 'setTimeout(() =&gt;', top: '40%', left: '40%', delay: '6000ms' },
  { content: '&lt;Suspense fallback=&quot;loading&quot;&gt;', bottom: '35%', right: '30%', delay: '6500ms' },
  { content: 'export default App;', top: '70%', left: '10%', delay: '7000ms' },
];

const binaryColumns = [
  { content: '1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0', top: '0', left: '10', delay: '0ms' },
  { content: '0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1', top: '0', left: '32', delay: '500ms' },
  { content: '1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0', top: '0', right: '20', delay: '1000ms' },
  { content: '0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1', top: '0', right: '40', delay: '1500ms' },
];

const emojis = [
  { emoji: '📊', size: '3xl', top: '5%', left: '5%', delay: '0ms', animation: 'float' },
  { emoji: '📈', size: '3xl', top: '15%', right: '10%', delay: '600ms', animation: 'float' },
  { emoji: '💡', size: '2xl', top: '30%', right: '20%', delay: '1200ms', animation: 'glow' },
  { emoji: '🎯', size: '2xl', bottom: '25%', right: '15%', delay: '1800ms', animation: 'float' },
  { emoji: '💻', size: '3xl', top: '25%', left: '20%', delay: '2400ms', animation: 'glow' },
  { emoji: '🚀', size: '4xl', bottom: '35%', left: '25%', delay: '3000ms', animation: 'float' },
  { emoji: '🔍', size: '2xl', top: '55%', right: '25%', delay: '3600ms', animation: 'float' },
  { emoji: '⚙️', size: '3xl', top: '20%', left: '60%', delay: '4200ms', animation: 'glow' },
  { emoji: '📱', size: '2xl', bottom: '15%', right: '30%', delay: '4800ms', animation: 'float' },
  { emoji: '🌐', size: '3xl', top: '65%', left: '15%', delay: '5400ms', animation: 'float' },
];

const TechBackground: React.FC<TechBackgroundProps> = ({
  primaryColor = '#7a7a7a',
  secondaryColor = '#4a4a4a',
  bgGradient = ['#292929', '#4a4a4a', '#2a2a2a'],
}) => {
  return (
    <div className="absolute inset-0">
      {/* Base Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${bgGradient[0]}, ${bgGradient[1]}, ${bgGradient[2]})`,
          opacity: 0.9,
        }}
      ></div>

      {/* Code Snippets */}
      <div className="absolute inset-0 opacity-20">
        {codeSnippets.map((snippet, index) => (
          <div
            key={`snippet-${index}`}
            className="absolute font-mono text-base animate-pulse"
            style={{
              top: snippet.top,
              left: snippet.left,
              right: snippet.right,
              bottom: snippet.bottom,
              animationDelay: snippet.delay,
              color: primaryColor,
            }}
            dangerouslySetInnerHTML={{ __html: snippet.content }}
          />
        ))}
      </div>

      {/* Gradient Lines */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-0 w-full h-px animate-pulse"
          style={{ background: `linear-gradient(to right, transparent, ${primaryColor}/0.4, transparent)` }}
        ></div>
        <div
          className="absolute top-2/3 left-0 w-full h-px animate-pulse"
          style={{ background: `linear-gradient(to right, transparent, ${secondaryColor}/0.3, transparent)`, animationDelay: '1000ms' }}
        ></div>
        <div
          className="absolute left-1/4 top-0 w-px h-full animate-pulse"
          style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}/0.3, transparent)`, animationDelay: '500ms' }}
        ></div>
        <div
          className="absolute right-1/3 top-0 w-px h-full animate-pulse"
          style={{ background: `linear-gradient(to bottom, transparent, ${secondaryColor}/0.35, transparent)`, animationDelay: '1500ms' }}
        ></div>
      </div>

      {/* Pulsing Dots */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: `${primaryColor}/0.7` }}></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 rounded-full animate-ping"
          style={{ backgroundColor: `${secondaryColor}/0.8`, animationDelay: '700ms' }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: `${primaryColor}/0.6`, animationDelay: '1200ms' }}
        ></div>
        <div
          className="absolute bottom-60 right-20 w-1 h-1 rounded-full animate-ping"
          style={{ backgroundColor: `${secondaryColor}/0.7`, animationDelay: '2000ms' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-1 h-1 rounded-full animate-ping"
          style={{ backgroundColor: `${primaryColor}/0.9`, animationDelay: '300ms' }}
        ></div>
        <div
          className="absolute top-80 right-1/4 w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: `${secondaryColor}/0.5`, animationDelay: '1800ms' }}
        ></div>
      </div>

      {/* Binary Code Columns */}
      <div className="absolute inset-0 opacity-15">
        {binaryColumns.map((column, index) => (
          <div
            key={`binary-${index}`}
            className="absolute font-mono text-base leading-6 animate-pulse"
            style={{
              top: column.top,
              left: column.left,
              right: column.right,
              animationDelay: column.delay,
              color: primaryColor,
            }}
            dangerouslySetInnerHTML={{ __html: column.content }}
          />
        ))}
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 opacity-35">
        {emojis.map((emoji, index) => (
          <div
            key={`emoji-${index}`}
            className={`absolute text-[#4cffee]/50 text-${emoji.size} animate-[${emoji.animation}_7s_ease-in-out_infinite]`}
            style={{
              top: emoji.top,
              left: emoji.left,
              right: emoji.right,
              bottom: emoji.bottom,
              animationDelay: emoji.delay,
            }}
          >
            <span role="img" aria-label={emoji.emoji}>{emoji.emoji}</span>
          </div>
        ))}
      </div>

      {/* Blurred Circles */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}/0.1` }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}/0.08`, animationDelay: '2000ms' }}
        ></div>
        <div
          className="absolute top-2/3 left-2/3 w-28 h-28 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}/0.12`, animationDelay: '1000ms' }}
        ></div>
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 animate-pulse"
        style={{
          backgroundImage: `linear-gradient(${primaryColor}/0.3 1px, transparent 1px),
                           linear-gradient(90deg, ${primaryColor}/0.3 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      ></div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-15px) rotate(5deg) scale(1.1); }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 5px ${primaryColor}/0.3); transform: scale(1); }
            50% { filter: drop-shadow(0 0 10px ${primaryColor}/0.7); transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

const CategoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { categoryId, slug } = useParams<{ categoryId?: string; slug?: string }>();
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`cachedCategoryProducts_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState<Category | null>(() => {
    const saved = localStorage.getItem(`cachedCategory_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper function to get localized content
  const getLocalizedContent = (item: any, field: string) => {
    const currentLang = i18n.language;
    const langField = `${field}_${currentLang}`;
    
    // Return the field for current language if available
    if (item[langField] && item[langField].trim()) {
      return item[langField];
    }
    
    // Fallback to other language
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const otherLangField = `${field}_${otherLang}`;
    if (item[otherLangField] && item[otherLangField].trim()) {
      return item[otherLangField];
    }
    
    // Final fallback to default field
    return item[field] || '';
  };

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
  }, [categoryId, slug]);

  const fetchCategoryAndProducts = async (catId: number) => {
    try {
      const [categoryData, productsResponse] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORY_BY_ID(catId)),
        apiCall(API_ENDPOINTS.PRODUCTS),
      ]);

      setCategory(categoryData);
      // Handle response object that contains products array
      const allProducts = productsResponse.products || productsResponse;
      const categoryProducts = allProducts.filter((product: Product) => product.categoryId === catId);
      setProducts(categoryProducts);

      localStorage.setItem(`cachedCategory_${catId}`, JSON.stringify(categoryData));
      localStorage.setItem(`cachedCategoryProducts_${catId}`, JSON.stringify(categoryProducts));
    } catch (error) {
      console.error('Error fetching data:', error);
      smartToast.frontend.error(t('category_load_error'));
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
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

  if (!category) {
    return (
      <section className="min-h-screen bg-[#292929] relative overflow-hidden flex items-center justify-center px-4" dir="rtl">
        <TechBackground />
        <div className="text-center max-w-md mx-auto">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-[#7a7a7a] mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">{t('loading')}</h2>
          <p className="text-lg text-gray-300">{t('loading_category_data')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <TechBackground />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-16 mt-[70px] sm:mt-[80px]">
        {/* Category Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative w-8 h-8 sm:w-12 sm:h-12">
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
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#7a7a7a]">
              <span className="text-[#ffffff]">{t('products')}  </span>{getLocalizedContent(category, 'name')} 
            </h1>
            <div className="relative w-8 h-8 sm:w-12 sm:h-12">
              <div
                className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#4a4a4a]/30 blur-sm transform rotate-0 transition-all duration-500"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#4a4a4a]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              <div
                className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              
            </div>
          </div>
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-2 sm:px-4">{getLocalizedContent(category, 'description')}</p>
        </div>

        {/* Filters & Controls */}
        <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/20 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a] flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-[#7a7a7a]/20 to-[#4a4a4a]/20 backdrop-blur-sm text-white rounded-lg border border-[#7a7a7a]/40 focus:ring-2 focus:ring-[#7a7a7a] focus:border-[#7a7a7a] transition-all duration-300 text-sm sm:text-base"
              >
                <option value="name"          
                 className="w-full pr-12 pl-4 py-3 bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                  {t('sort_by_name')}
                </option>
                <option value="price-low" className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[#7a7a7a] w-5 h-5">
                  {t('price_low_to_high')}
                </option>
                <option value="price-high" className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[#7a7a7a] w-5 h-5">
                  {t('price_high_to_low')}
                </option>
              </select>
            </div>

            {/* View Mode & Results Count */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="text-gray-300 text-sm sm:text-base">
                <span className="font-semibold text-[#7a7a7a]">{products.length}</span> {t('product')}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                  <div
                className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-[#7a7a7a]/20 to-[#4a4a4a]/20 backdrop-blur-sm 
               border border-[#7a7a7a]/60 text-[#7a7a7a]"
                >
                 <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
  </div>
</div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center place-items-center w-full max-w-7xl mx-auto'
                : 'space-y-4 sm:space-y-6 max-w-7xl mx-auto'
            }
          >
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full max-w-xs sm:max-w-sm mx-auto flex justify-center">
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8">
              <div
                className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#4a4a4a]/30 blur-sm transform rotate-0 transition-all duration-500"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#4a4a4a]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              <div
                className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#7a7a7a] filter drop-shadow-[0_0_10px_rgba(122,122,122,0.6)]" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{t('no_products_in_category')}</h3>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto">{t('products_coming_soon')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-[#4a4a4a] hover:to-[#7a7a7a] transition-all duration-300 font-bold text-base sm:text-lg backdrop-blur-sm border border-white/10 hover:scale-105 transform"
            >
              <span>{t('back_to_home')}</span>
            </Link>
          </div>
        )}
      </div>

      {/* WhatsApp Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50">
        <WhatsAppButton />
      </div>
    </section>
  );
};

export default CategoryPage;