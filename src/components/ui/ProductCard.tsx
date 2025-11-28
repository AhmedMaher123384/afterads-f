import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Heart, ShoppingCart, CheckCircle, ArrowUpDown } from 'lucide-react';
import { createProductSlug } from '../../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../../utils/cartUtils';
import { buildImageUrl } from '../../config/api';
import PriceDisplay from '../ui/PriceDisplay';
import fallbackImg from '../../assets/search_not_found.png';

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: any;
  description_ar?: string;
  description_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
  hasRequiredOptions?: boolean;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  variant?: 'default' | 'blog';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid', variant = 'default' }) => {
  const { t, i18n } = useTranslation(['product_card', 'product', 'common']);
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  // Helper function to get localized content
  const getLocalizedContent = (field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    const value = currentLang === 'ar'
      ? (product[arField] as any) || (product[enField] as any) || (product as any)[field]
      : (product[enField] as any) || (product[arField] as any) || (product as any)[field];
    if (Array.isArray(value)) {
      return value.map((b: any) => (b && b.text) ? b.text : '').join(' ');
    }
    return String(value || '');
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        setIsInWishlist(event.detail.includes(product.id));
      } else {
        checkWishlistStatus();
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const truncateDescription = (text: string, maxWords: number = 8): string => {
    // إزالة HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const words = cleanText.split(' ');
    if (words.length <= maxWords) return cleanText;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const checkWishlistStatus = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setIsInWishlist(parsedWishlist.includes(product.id));
        }
      }
    } catch (error) {
      console.error(t('product_detail:wishlist_error'), error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(false);
      } else {
        const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      smartToast.frontend.error(t('product_detail:wishlist_error'));
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product has required options
    if (product.hasRequiredOptions) {
      // Redirect to product detail page to select options
      const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
      navigate(productPath);
      smartToast.frontend.info(t('product_detail:wishlist_error'));
      return;
    }
    
    try {
      const success = await addToCartUnified(product.id, getLocalizedContent('name'), quantity);
      if (success) {
        smartToast.frontend.success(t('product:added_to_cart', { name: getLocalizedContent('name') }));
      } else {
        smartToast.frontend.error(t('product:add_to_cart_failed'));
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      smartToast.frontend.error(t('product_detail:add_to_cart_error'));
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 99) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
    navigate(productPath);
  };

  // ---- BLOG VARIANT LIST VIEW ----
  if (variant === 'blog' && viewMode === 'list') {
    return (
      <div className="relative w-full mb-6">
        <Link
          to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
          className="block bg-[#333333]/60 backdrop-blur border border-[#444444] rounded-2xl overflow-hidden hover:border-[#18b5d5] transition-all duration-300 hover:shadow-2xl hover:shadow-[#18b5d5]/25 group"
          onClick={handleProductClick}
          aria-label={t('product:view_product_details', { name: getLocalizedContent('name') })}
        >
          <div className="flex items-center p-6 gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#444444] bg-[#3a3a3a]">
                <img
                  src={product.mainImage ? buildImageUrl(product.mainImage) : fallbackImg}
                  alt={getLocalizedContent('name')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 will-change-transform"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = fallbackImg; }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-[#18b5d5]/30 text-white px-3 py-1 rounded-full">
                  {product.isAvailable ? t('available') : t('unavailable')}
                </span>
              </div>
              <h3 dir="rtl" className="text-xl font-bold text-white mb-2 group-hover:text-[#18b5d5] transition-colors duration-300 line-clamp-2">
                {getLocalizedContent('name')}
              </h3>
              <p className="text-[#CCCCCC] text-sm leading-relaxed line-clamp-2 mb-3">
                {truncateDescription(getLocalizedContent('description'))}
              </p>
              <div className="flex items-center justify-between text-xs text-[#BBBBBB] border-t border-[#444444] pt-3 mt-auto">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
                  <PriceDisplay 
                    price={product.price}
                    originalPrice={product.originalPrice}
                    size="md"
                    variant="card"
                    className="min-h-[28px]"
                  />
                </div>
                {product.isAvailable && (
                  <button
                    onClick={addToCart}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#18b5d5]/40 text-white hover:bg-[#18b5d5]/20 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-medium text-sm">{t('addToCart')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // ---- LIST VIEW (DEFAULT) ----
  if (viewMode === 'list') {
    return (
      <div className="relative w-full mb-6">
        {/* Sale Badge - خارج الكارت */}
        {product.originalPrice && 
          <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-sm  z-[100]">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        }

        <Link
          to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
          className="relative group block bg-gradient-to-br from-[#18b5d5]/95 via-[#7a7a7a]/30 to-[#18b5d5]/90 rounded-2xl backdrop-blur-xl border border-[#18b5d5]/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] w-full overflow-hidden min-h-[200px]"
          onClick={handleProductClick}
          aria-label={t('product:view_product_details', { name: getLocalizedContent('name') })}
        >
          {/* Digital Effects */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 text-xs text-white/20 font-mono group-hover:text-white/30 transition-colors duration-500">
              <div className="animate-pulse">010101</div>
            </div>
            <div className="absolute bottom-4 left-4 text-xs text-white/15 font-mono group-hover:text-white/25 transition-colors duration-700">
              <div className="animate-pulse delay-300">110010</div>
            </div>
            <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-[#18b5d8]/30 via-[#18b5d8]/10 to-transparent transform -translate-x-1/2 skew-x-12 group-hover:-skew-x-6 transition-transform duration-700"></div>
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-[#18b5d8]/30 via-[#18b5d8]/10 to-transparent transform -translate-x-1/2 -skew-x-6 group-hover:skew-x-12 transition-transform duration-700"></div>
            <div className="absolute top-8 left-8 w-1 h-1 bg-[#18b5d8]/60 rounded-full animate-ping"></div>
            <div className="absolute bottom-12 right-12 w-1 h-1 bg-[#0d8aa3]/60 rounded-full animate-ping delay-1000"></div>
            <div className="absolute inset-0 opacity-5  transition-opacity duration-500"
                 style={{
                   backgroundImage: `linear-gradient(rgba(24, 181, 216, 0.3) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(24, 181, 216, 0.3) 1px, transparent 1px)`,
                   backgroundSize: '20px 20px'
                 }}>
            </div>
          </div>

          <div className="flex items-center p-6 gap-6">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#18b5d8]/30">
                <img
                  src={product.mainImage ? buildImageUrl(product.mainImage) : fallbackImg}
                  alt={getLocalizedContent('name')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImg;
                  }}
                />
                <div className="absolute top-2 right-2 bg-gradient-to-r from-[#18b5d8] to-[#0d8aa3] text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                  {t('new')}
                </div>
                {product.isAvailable === false && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                    <span className="text-white font-bold bg-red-600 px-3 py-1 rounded-lg text-xs">
                      {t('common:outOfStock')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 dir="rtl" className="text-2xl font-bold text-white mb-4 group-hover:text-[#18b5d8] transition-colors duration-300 line-clamp-2">
                {getLocalizedContent('name')}
              </h3>
              <p className="text-gray-200/80 text-sm leading-relaxed line-clamp-2 mb-6">
                {truncateDescription(getLocalizedContent('description') || `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`)}
              </p>
              <ul className="space-y-2 text-gray-200/70 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
                  <PriceDisplay 
                    price={product.price}
                    originalPrice={product.originalPrice}
                    size="md"
                    variant="card"
                    className="min-h-[28px]"
                  />
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
                  <span>{product.isAvailable ? t('available') : t('unavailable')}</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              <button
                onClick={toggleWishlist}
                className={`w-8 h-8 rounded-full bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm border border-[#18b5d8]/40 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isInWishlist ? 'text-red-500 border-red-500/40' : 'text-white'
                }`}
                type="button"
                aria-label={isInWishlist ? t('product_card:remove_from_wishlist') : t('product_card:add_to_wishlist')}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
              </button>
              {product.isAvailable && (
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white border border-[#18b5d8]/40 hover:bg-gradient-to-r hover:from-[#18b5d8]/30 hover:to-[#0d8aa3]/30 hover:border-[#18b5d8]/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all duration-200 hover:scale-105"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-white text-base bg-gradient-to-r from-[#18b5d8]/10 to-[#0d8aa3]/10 rounded-lg py-1">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= 99}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white border border-[#18b5d8]/40 hover:bg-gradient-to-r hover:from-[#18b5d8]/30 hover:to-[#0d8aa3]/30 hover:border-[#18b5d8]/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all duration-200 hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-[#18b5d8]/40 group-hover:bg-gradient-to-r group-hover:from-[#18b5d8]/30 group-hover:to-[#0d8aa3]/30 group-hover:border-[#18b5d8]/60 transition-all duration-300 hover:shadow-[0_0_15px_rgba(24,181,216,0.3)]"
                  >
                    <ShoppingCart className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="font-medium text-sm">{t('addToCart')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // ---- BLOG VARIANT GRID VIEW ----
  if (variant === 'blog') {
    return (
      <div className="relative w-full px-2 py-3">
        <Link
          to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
          className="block bg-[#333333]/60 backdrop-blur border border-[#444444] rounded-2xl overflow-hidden hover:border-[#18b5d5] transition-all duration-300 hover:shadow-2xl hover:shadow-[#18b5d5]/25 h-full flex flex-col group"
          onClick={handleProductClick}
          aria-label={t('product:view_product_details', { name: getLocalizedContent('name') })}
        >
          <div className="relative h-48 overflow-hidden bg-[#3a3a3a]">
            <img
              src={product.mainImage ? buildImageUrl(product.mainImage) : fallbackImg}
              alt={getLocalizedContent('name')}
              onError={(e) => { e.currentTarget.src = fallbackImg; }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="p-6 flex flex-col flex-grow">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs bg-[#18b5d5]/30 text-white px-3 py-1 rounded-full">
                {product.isAvailable ? t('available') : t('unavailable')}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#18b5d5] text-white transition-colors">
              {getLocalizedContent('name')}
            </h3>

            <p className="text-[#CCCCCC] text-sm mb-4 line-clamp-2 flex-grow">
              {truncateDescription(getLocalizedContent('description'))}
            </p>

            <div className="flex items-center justify-between text-xs text-[#BBBBBB] border-t border-[#444444] pt-4 mt-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
                <PriceDisplay 
                  price={product.price}
                  originalPrice={product.originalPrice}
                  size="md"
                  variant="card"
                />
              </div>
              {product.isAvailable && (
                <button
                  onClick={addToCart}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#18b5d5]/40 text-white hover:bg-[#18b5d5]/20 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium text-sm">{t('addToCart')}</span>
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // ---- GRID VIEW (DEFAULT) ----
  return (
    <div className="relative w-full px-2 py-3">
      {/* Sale Badge - خارج الكارت تماماً */}
      {product.originalPrice &&   
        <div className="absolute -top-3 -left-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-sm  z-[100]">
          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
        </div>
      }

      <Link
        to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
        className="relative group block transform hover:scale-105 transition-all duration-500 w-full h-full"
        onClick={handleProductClick}
        aria-label={t('product:view_product_details', { name: getLocalizedContent('name') })}
      >
        <div className="absolute inset-0 rounded-3xl backdrop-blur-xl border border-[#18b5d5]/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-[#18b5d5]/95 via-[#7a7a7a]/30 to-[#18b5d5]/90"></div>
        
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute top-4 right-4 text-xs text-white/20 font-mono group-hover:text-white/30 transition-colors duration-500">
            <div className="animate-pulse">010101</div>
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-white/15 font-mono group-hover:text-white/25 transition-colors duration-700">
            <div className="animate-pulse delay-300">110010</div>
          </div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-[#18b5d8]/40 via-[#18b5d8]/20 to-transparent transform -translate-x-1/2 -skew-x-12 group-hover:skew-x-12 transition-transform duration-700"></div>
          <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-[#18b5d8]/30 via-[#18b5d8]/10 to-transparent transform -translate-x-1/2 skew-x-12 group-hover:-skew-x-6 transition-transform duration-700"></div>
          <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-[#18b5d8]/30 via-[#18b5d8]/10 to-transparent transform -translate-x-1/2 -skew-x-6 group-hover:skew-x-12 transition-transform duration-700"></div>
          <div className="absolute top-8 left-8 w-1 h-1 bg-[#18b5d8]/60 rounded-full animate-ping"></div>
          <div className="absolute bottom-12 right-12 w-1 h-1 bg-[#0d8aa3]/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-16 right-16 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse delay-500"></div>
          <div className="absolute inset-0 opacity-5 transition-opacity duration-500"
               style={{
                 backgroundImage: `linear-gradient(rgba(24, 181, 216, 0.3) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(24, 181, 216, 0.3) 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
               }}>
          </div>
        </div>

        <div className="relative p-8 text-center flex flex-col min-h-[450px]">
          <div className="relative mx-auto mb-8 w-20 h-20">
            <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#0d8aa3]/30 blur-sm transform rotate-0 group-hover:rotate-6 transition-all duration-500"
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#0d8aa3]/10 backdrop-blur-md border border-[#18b5d8]/30 transform rotate-0 group-hover:rotate-6 transition-all duration-500"
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            </div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transform rotate-0 group-hover:-rotate-3 transition-all duration-700"
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            </div>
            <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
              <img
                src={buildImageUrl(product.mainImage)}
                alt={getLocalizedContent('name')}
                className="w-10 h-10 object-cover rounded-lg filter brightness-125 drop-shadow-[0_0_10px_rgba(24,181,216,0.5)]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/assets/placeholder-product.jpg';
                }}
              />
            </div>
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#18b5d8] to-[#0d8aa3] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-[#18b5d8]/30">
              {t('new')}
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={toggleWishlist}
              className={`w-10 h-10 rounded-full bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm border border-[#18b5d8]/40 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isInWishlist ? 'text-red-500 border-red-500/40' : 'text-white'
              }`}
              type="button"
              aria-label={isInWishlist ? t('product_card:remove_from_wishlist') : t('product_card:add_to_wishlist')}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {product.isAvailable === false && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl backdrop-blur-sm">
              <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-lg text-sm shadow-lg border border-red-500">
                {t('common:outOfStock')}
              </span>
            </div>
          )}

          <h3 dir="rtl" className="text-2xl font-bold text-white mb-4 group-hover:text-[#18b5d8] transition-colors duration-300 line-clamp-2">
            {getLocalizedContent('name')}
          </h3>

          <p className="text-gray-200/80 mb-6 leading-relaxed text-sm line-clamp-2">
            {truncateDescription(getLocalizedContent('description') || `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`)}
          </p>

          <ul className="space-y-2 text-gray-200/70 text-sm mb-6">
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
              <PriceDisplay 
                price={product.price}
                originalPrice={product.originalPrice}
                size="md"
                variant="card"
                className="min-h-[28px]"
              />
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#18b5d5]" />
              <span>{product.isAvailable ? t('available') : t('unavailable')}</span>
            </li>
          </ul>

          {product.isAvailable && (
            <div className="w-full space-y-4 mt-auto">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white border border-[#18b5d8]/40 hover:bg-gradient-to-r hover:from-[#18b5d8]/30 hover:to-[#0d8aa3]/30 hover:border-[#18b5d8]/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all duration-200 hover:scale-105"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-white text-lg bg-gradient-to-r from-[#18b5d8]/10 to-[#0d8aa3]/10 rounded-lg py-1">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white border border-[#18b5d8]/40 hover:bg-gradient-to-r hover:from-[#18b5d8]/30 hover:to-[#0d8aa3]/30 hover:border-[#18b5d8]/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all duration-200 hover:scale-105"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#18b5d8]/20 to-[#0d8aa3]/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-[#18b5d8]/40 group-hover:bg-gradient-to-r group-hover:from-[#18b5d8]/30 group-hover:to-[#0d8aa3]/30 group-hover:border-[#18b5d8]/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(24,181,216,0.3)] w-full justify-center"
              >
                <ShoppingCart className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                <span className="font-medium">{t('addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
