import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { smartToast } from '../utils/toastConfig';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import PriceDisplay from './ui/PriceDisplay';
import notfoundImg from '../assets/search_not_found.png';
import ConfirmationModal from './modals/ConfirmationModal';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  isAvailable: boolean;
  description: string;
  categoryId?: number;
}

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlistProducts();

    const handleWishlistUpdate = () => loadWishlistProducts();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlistProducts = async () => {
    try {
      setLoading(true);
      let wishlistIds: number[] = [];
      const userData = localStorage.getItem('user');

      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            const serverWishlist = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id));
            wishlistIds = serverWishlist.map((item: any) => item.productId || item.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
          }
        } catch (serverError) {
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) wishlistIds = JSON.parse(savedWishlist) || [];
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) wishlistIds = JSON.parse(savedWishlist) || [];
      }

      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const productsResponse = await apiCall(API_ENDPOINTS.PRODUCTS);
      // Handle response object that contains products array
      const allProducts = productsResponse.products || productsResponse;
      const wishlistProducts = allProducts.filter((product: Product) =>
        wishlistIds.includes(product.id)
      );
      setWishlistProducts(wishlistProducts);
    } catch (error) {
      smartToast.frontend.error('فشل في تحميل قائمة المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number, productName: string) => {
    try {
      const userData = localStorage.getItem('user');
      let success = false;

      if (userData) {
        const user = JSON.parse(userData);
        success = user?.id
          ? await removeFromWishlistUnified(productId, productName)
          : await removeFromWishlistGuest(productId, productName);
      } else {
        success = await removeFromWishlistGuest(productId, productName);
      }

      if (success) {
        setWishlistProducts((prev) => prev.filter((product) => product.id !== productId));
        const savedWishlist = localStorage.getItem('wishlist');
        const newWishlist = savedWishlist ? JSON.parse(savedWishlist).filter((id: number) => id !== productId) : [];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: newWishlist }));
      }
    } catch (error) {
      smartToast.frontend.error('فشل في حذف المنتج من المفضلة');
    }
  };

  const removeFromWishlistGuest = async (productId: number, productName: string): Promise<boolean> => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      const currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      const newWishlist = currentWishlist.filter((id: number) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      smartToast.frontend.success(`تم حذف ${productName} من المفضلة`);
      return true;
    } catch (error) {
      smartToast.frontend.error('فشل في حذف المنتج من المفضلة');
      return false;
    }
  };

  const addToCart = async (productId: number, productName: string) => {
    try {
      const success = await addToCartUnified(productId, productName, 1);
      if (success) {
        smartToast.frontend.success(`تم إضافة ${productName} إلى السلة`);
        }
      } catch (error) {
        smartToast.frontend.error('فشل في إضافة المنتج للسلة');
    }
  };

  const clearWishlist = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id), { method: 'DELETE' });
        }
      }

      localStorage.setItem('wishlist', JSON.stringify([]));
      localStorage.setItem('lastWishlistCount', '0');
      setWishlistProducts([]);
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('wishlistCleared'));
      document.querySelectorAll('[data-wishlist-count]').forEach((element) => {
        if (element instanceof HTMLElement) {
          element.textContent = '0';
          element.style.display = 'none';
        }
      });
      smartToast.frontend.success('تم إفراغ قائمة المفضلة بالكامل');
    } catch (error) {
      smartToast.frontend.error('حدث خطأ أثناء إفراغ المفضلة');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] relative overflow-hidden overflow-x-hidden" dir="rtl">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/80 via-[#2a2a2a]/60 to-[#0f0f0f]/80"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
          backgroundSize: '120px 120px'
        }}></div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(24, 181, 216, 0.3)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 10px rgba(24, 181, 216, 0.7)); transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          @media (max-width: 640px) {
            .animate-pulse:not(.essential) { animation: none; }
          }
        `}
      </style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-[80px]">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <Heart className="absolute inset-0 m-auto w-6 h-6 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
              قائمة المفضلة <span className="text-[#18b5d8]">الخاصة بك</span>
            </h1>
            <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <Heart className="absolute inset-0 m-auto w-6 h-6 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            تصفح منتجاتك المفضلة وأضفها إلى سلتك بسهولة
          </p>
        </div>

        {/* Clear Wishlist Button */}
        {wishlistProducts.length > 0 && (
          <div className="relative flex mb-12 justify-center">
            <button
              onClick={() => setShowConfirmClear(true)}
              className="relative flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              aria-label="إفراغ قائمة المفضلة"
            >
              <Trash2 className="w-5 h-5" />
              إفراغ المفضلة
            </button>
          </div>
        )}

        <ConfirmationModal
          isOpen={showConfirmClear}
          title="تأكيد الإجراء"
          message="هل أنت متأكد من إفراغ قائمة المفضلة؟"
          onConfirm={async () => { await clearWishlist(); setShowConfirmClear(false); }}
          onCancel={() => setShowConfirmClear(false)}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18b5d8]"></div>
              </div>
            </div>
            <p className="text-white text-lg sm:text-xl font-black">جاري تحميل قائمة المفضلة...</p>
          </div>
        )}

        {/* Empty Wishlist State */}
        {!loading && wishlistProducts.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 text-center max-w-md mx-auto border border-white/20 shadow-2xl hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                <Heart className="absolute inset-0 m-auto w-10 h-10 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">قائمة المفضلة فارغة</h3>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-md mx-auto">
                لم تقم بإضافة أي منتجات إلى المفضلة بعد.
              </p>
              <div className="space-y-4 max-w-sm mx-auto">
                <Link
                  to="/products"
                  className="block w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
                  aria-label="تصفح المنتجات"
                >
                  تصفح المنتجات
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-gradient-to-r from-white/60 to-gray-100/80 backdrop-blur-xl border border-[#18b5d8]/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:from-white/80 hover:to-gray-100/90 transition-all duration-300 font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
                  aria-label="العودة للرئيسية"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {wishlistProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {wishlistProducts.map((product, index) => (
              <div
                key={product.id}
                className="w-full max-w-sm bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 group hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 transform hover:scale-105 relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Decorative Circle */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                {/* Product Image */}
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  <img
                    src={buildImageUrl(product.mainImage)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = notfoundImg; }}
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id, product.name)}
                    className="absolute top-3 right-3 w-8 sm:w-10 h-8 sm:h-10 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={`إزالة ${product.name} من المفضلة`}
                  >
                    <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 fill-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#18b5d8] transition-colors duration-300">{product.name}</h3>
                  <div className="flex flex-col items-center space-y-2 mb-4">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                            <PriceDisplay price={product.originalPrice} />
                          </span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-[#18b5d8]">
                          <PriceDisplay price={product.price} />
                        </div>
                      </>
                    ) : (
                      <div className="text-lg sm:text-xl font-black text-[#18b5d8]">
                        <PriceDisplay price={product.price} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Link
                      to={`/product/${createProductSlug(product.id, product.name)}`}
                      className="block w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white py-2 sm:py-3 px-4 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 text-sm sm:text-base font-black shadow-lg hover:shadow-xl hover:scale-105 transform text-center"
                      aria-label={`عرض تفاصيل ${product.name}`}
                    >
                      عرض التفاصيل
                    </Link>
                    {product.isAvailable && (
                      <button
                        onClick={() => addToCart(product.id, product.name)}
                        className="w-full bg-gradient-to-r from-[#18b5d8]/80 to-[#16a2c7]/80 text-white py-2 sm:py-3 px-4 rounded-2xl hover:from-[#18b5d8] hover:to-[#16a2c7] transition-all duration-300 text-sm sm:text-base font-black shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-2"
                        aria-label={`إضافة ${product.name} إلى السلة`}
                      >
                        <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
                        إضافة للسلة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;