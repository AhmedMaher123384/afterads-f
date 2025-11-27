import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Package } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { useApiQuery } from '../../hooks/useApiQuery';
import { createProductSlug } from '../../utils/slugify';
import { useTranslation } from 'react-i18next';
import PriceDisplay from './PriceDisplay';

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
  mainImage: string;
  category?: {
    id: number;
    name: string;
    name_ar?: string;
    name_en?: string;
  };
}

interface LiveSearchProps {
  onClose?: () => void;
  className?: string;
}

const LiveSearch: React.FC<LiveSearchProps> = ({ onClose, className = '' }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<number, { id: number; name: string; name_ar?: string; name_en?: string }>>({});
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // تحميل المنتجات عند بدء التطبيق
  const { data: productsResp, isLoading: productsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.PRODUCTS, queryKey: ['products'] });
  useEffect(() => {
    const cached = localStorage.getItem('searchProducts');
    if (cached) {
      try {
        const cachedProducts = JSON.parse(cached);
        setAllProducts(cachedProducts);
        setIsLoading(false);
      } catch {}
    }

    const cats = localStorage.getItem('cachedCategories');
    if (cats) {
      try {
        const parsed = JSON.parse(cats);
        const map: Record<number, { id: number; name: string; name_ar?: string; name_en?: string }> = {};
        parsed.forEach((c: any) => { if (c && typeof c.id === 'number') map[c.id] = c; });
        setCategoryMap(map);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (!productsResp) return;
    const productsData = productsResp?.products || productsResp || [];
    const availableProducts = productsData.filter((product: Product) => product.isAvailable && product.name && product.name.trim() !== '');
    setAllProducts(availableProducts);
    localStorage.setItem('searchProducts', JSON.stringify(availableProducts));
    setIsLoading(false);
  }, [productsResp]);

  const getLocalizedContent = (product: Product, field: 'name' | 'description') => {
    const currentLang = (localStorage.getItem('i18nextLng') || 'ar');
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    const baseValue = (product as any)[field];
    const value = currentLang === 'ar'
      ? ((product as any)[arField] ?? (product as any)[enField] ?? baseValue)
      : ((product as any)[enField] ?? (product as any)[arField] ?? baseValue);
    if (Array.isArray(value)) {
      return value.map((b: any) => (b && b.text) ? b.text : '').join(' ');
    }
    return String(value || '');
  };

  const getCategoryName = (product: Product) => {
    const currentLang = (localStorage.getItem('i18nextLng') || 'ar');
    const pickName = (obj: any) => {
      if (!obj) return '';
      return currentLang === 'ar' ? (obj.name_ar ?? obj.name_en ?? obj.name ?? '') : (obj.name_en ?? obj.name_ar ?? obj.name ?? '');
    };
    const fromProduct = pickName(product.category);
    const fromMap = product.categoryId != null ? pickName(categoryMap[product.categoryId]) : '';
    return fromProduct || fromMap;
  };

  const performSearch = (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.trim().toLowerCase();

    const nameMatches = allProducts.filter(product => {
      const nameText = getLocalizedContent(product, 'name').toLowerCase();
      return nameText.includes(searchTerm);
    });

    const categoryMatches = allProducts.filter(product => {
      if (nameMatches.includes(product)) return false;
      const categoryText = getCategoryName(product).toLowerCase();
      return categoryText && categoryText.includes(searchTerm);
    });

    const descriptionMatches = allProducts.filter(product => {
      if (nameMatches.includes(product) || categoryMatches.includes(product)) return false;
      const descText = getLocalizedContent(product, 'description').toLowerCase();
      return descText.includes(searchTerm);
    });

    const combinedResults = [...nameMatches, ...categoryMatches, ...descriptionMatches];

    setSearchResults(combinedResults.slice(0, 6));
  };

  // التعامل مع تغيير النص
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
    setIsOpen(true);
  };

  // إغلاق البحث
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    onClose?.();
  };

  // الانتقال إلى صفحة المنتج
  const handleProductClick = (product: Product) => {
    const localizedName = getLocalizedContent(product, 'name');
    const slug = createProductSlug(product.id, localizedName);
    navigate(`/product/${slug}`);
    handleClose();
  };

  // الانتقال إلى صفحة جميع النتائج
  const handleViewAll = () => {
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    handleClose();
  };

  // إغلاق عند الضغط خارج المكون أو الضغط على Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
      >
        <Search size={20} />
        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div ref={searchRef} className="w-full max-w-2xl mx-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={t('search_placeholder', 'البحث عن المنتجات...')}
                className="w-full px-6 py-4 pl-14 pr-12 text-white placeholder-white/70 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 shadow-lg text-lg text-right"
                autoFocus
              />
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white/70 w-6 h-6" />
              <button
                onClick={handleClose}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* نتائج البحث المحسنة - Updated with glassmorphism */}
            {searchQuery.length >= 2 && (
              <div 
                className="rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: `
                    0 20px 60px rgba(0,0,0,0.3),
                    inset 1px 1px 1px rgba(255,255,255,0.1),
                    inset 0 1px 1px rgba(255,255,255,0.05)
                  `
                }}
              >
                 {isLoading ? (
                   <div className="p-8 text-center">
                     <div 
                       className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"
                       style={{
                         background: 'conic-gradient(from 0deg, transparent, rgba(24,181,216,0.8), transparent)',
                         mask: 'radial-gradient(circle at center, transparent 30%, black 32%, black 68%, transparent 70%)',
                         WebkitMask: 'radial-gradient(circle at center, transparent 30%, black 32%, black 68%, transparent 70%)'
                       }}
                     />
                     <p className="text-white/80 font-medium text-sm">{t('live_search.loading', 'جاري التحميل...')}</p>
                   </div>
                 ) : searchResults.length > 0 ? (
                   <>
                     {/* قائمة النتائج المحسنة */}
                     <div className="max-h-80 overflow-y-auto custom-scrollbar">
                       {searchResults.map((product, index) => (
                         <button
                           key={product.id}
                           onClick={() => handleProductClick(product)}
                           className="w-full p-3 hover:bg-white/10 transition-all duration-300 border-b border-white/10 last:border-b-0 text-right group/item"
                           style={{
                             animationDelay: `${index * 50}ms`,
                             animation: 'slideInUp 0.4s ease-out forwards'
                           }}
                         >
                           <div className="flex items-center gap-3">
                             {/* صورة المنتج المحسنة */}
                             <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 group-hover/item:scale-105 transition-transform duration-300 border border-white/20">
                               {product.mainImage ? (
                                 <img
                                   src={buildImageUrl(product.mainImage)}
                                   alt={product.name}
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                   <Package size={20} className="text-white/40" />
                                 </div>
                               )}
                             </div>
                             
                             {/* معلومات المنتج المحسنة */}
                             <div className="flex-1 min-w-0">
                               <h4 className="font-semibold text-white truncate text-right mb-1 group-hover/item:text-white/90 transition-colors duration-200 text-sm">
                                 {getLocalizedContent(product, 'name')}
                               </h4>
                               {getCategoryName(product) && (
                                 <p className="text-xs text-white/60 truncate text-right mb-1">
                                   {getCategoryName(product)}
                                 </p>
                               )}
                               <div className="flex items-center justify-end">
                                 <span className="text-xs font-semibold text-white bg-gradient-to-r from-[#18b5d8] to-[#0891b2] px-2 py-1 rounded-lg">
                                   <PriceDisplay price={product.price} />
                                 </span>
                               </div>
                             </div>
                             
                             {/* سهم الانتقال */}
                             <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform group-hover/item:translate-x-1">
                               <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                                 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                 </svg>
                               </div>
                             </div>
                           </div>
                         </button>
                       ))}
                     </div>
              
                     {/* زر عرض جميع النتائج المحسن */}
                     {searchResults.length >= 6 && (
                       <div className="p-3 border-t border-white/10">
                         <button
                           onClick={handleViewAll}
                           className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group/btn text-sm bg-[#18b5d8] hover:bg-[#0891b2] focus:ring-2 focus:ring-white/30"
                           style={{
                             border: '1px solid rgba(255,255,255,0.35)',
                             boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
                           }}
                         >
                           {/* تأثير الإضاءة عند التمرير */}
                           <div 
                             className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                             style={{
                               background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                             }}
                           />
                           <span className="relative z-10">{t('live_search.view_all_results', 'عرض جميع النتائج')}</span>
                         </button>
                       </div>
                     )}
                   </>
                 ) : (
                   <div className="p-6 text-center">
                     <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                       <Package size={24} className="text-white/40" />
                     </div>
                     <h3 className="text-sm font-semibold text-white mb-1">{t('live_search.no_results', 'لا توجد نتائج')}</h3>
                     <p className="text-xs text-white/60">{t('live_search.no_products_found', 'لم يتم العثور على منتجات')}</p>
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
       )}
       
       {/* إضافة الستايلات المخصصة */}
       <style>{`
         .custom-scrollbar::-webkit-scrollbar {
           width: 4px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: rgba(255,255,255,0.05);
           border-radius: 2px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: rgba(255,255,255,0.2);
           border-radius: 2px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: rgba(255,255,255,0.3);
         }
         
         @keyframes slideInUp {
           from {
             opacity: 0;
             transform: translateY(8px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
       `}</style>
     </>
   );
};

export default LiveSearch;