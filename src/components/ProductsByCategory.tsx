import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ArrowRight, Package, Filter, Grid, List, RefreshCw } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import { extractIdFromSlug, isValidSlug, createProductSlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { useApiQuery } from '../hooks/useApiQuery';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number | null;
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

 

const ProductsByCategory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  
  // استخراج categoryId من slug أو id
  const categoryId = useMemo(() => 
    slug ? extractIdFromSlug(slug).toString() : id, 
    [slug, id]
  );

  // Helper function to get localized category content
  const getLocalizedContent = (field: 'name' | 'description') => {
    if (!category) return '';
    
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return category[`${field}_ar`] || category[`${field}_en`] || category[field] || '';
    } else {
      return category[`${field}_en`] || category[`${field}_ar`] || category[field] || '';
    }
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  const { data: categoryResp, isLoading: categoryLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CATEGORY_BY_ID(Number(categoryId)), queryKey: ['category', Number(categoryId)], enabled: !!categoryId });
  const { data: productsResp, isLoading: productsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.PRODUCTS_BY_CATEGORY(Number(categoryId)), queryKey: ['products-by-category', Number(categoryId)], enabled: !!categoryId });
  useEffect(() => {
    if (categoryResp) setCategory(categoryResp);
  }, [categoryResp]);
  useEffect(() => {
    if (!productsResp) return;
    const arr = productsResp?.products || productsResp || [];
    setProducts(arr);
  }, [productsResp]);

  // تحسين عرض Loading
  const loading = categoryLoading || productsLoading;
  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-[70px] sm:mt-[80px]" dir="rtl">
        <div className="text-center py-6 sm:py-8">
          <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-green-600 mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">جاري التحميل...</h3>
          <p className="text-xs sm:text-sm text-gray-600">يتم تحميل منتجات التصنيف</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-[70px] sm:mt-[80px]" dir="rtl">
      {/* عرض معلومات الفئة */}
      {category && (
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center sm:text-right">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 px-2 sm:px-0">{getLocalizedContent('name')}</h1>
          {getLocalizedContent('description') && (
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 max-w-2xl mx-auto sm:mx-0 px-2 sm:px-0">{getLocalizedContent('description')}</p>
          )}
        </div>
      )}
      
      {/* عرض المنتجات أو رسالة فارغة */}
      {products.length === 0 ? (
        <div className="text-center py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
          <div className="max-w-sm sm:max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">لا توجد منتجات</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-6">
              {category ? `لا توجد منتجات في تصنيف "${getLocalizedContent('name')}" حالياً.` : 'لا توجد منتجات في هذا التصنيف حالياً.'}
            </p>
            <Link 
              to="/" 
              className="inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm lg:text-base font-medium"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 justify-items-center place-items-center w-full max-w-7xl mx-auto">
          {products.map(product => (
            <div key={product.id} className="w-full max-w-xs sm:max-w-sm mx-auto flex justify-center">
              <ProductCard product={product} variant="blog" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductsByCategory;
