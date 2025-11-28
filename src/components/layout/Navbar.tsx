import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Search, Package, Settings, Phone, Mail, MapPin, Clock, ChevronDown, Home, Grid3X3, Star, Award, Truck, Shield, Sparkles, Bell, ChevronLeft, BookOpen,FileText, Crown } from 'lucide-react';
import logo from '../../assets/logo.webp';
import AuthModal from '../modals/AuthModal';
import CartDropdown from '../ui/CartDropdown';
import notfoundImg from '../../assets/search_not_found.png';
import LiveSearch from '../ui/LiveSearch';
import LanguageCurrencySelector from '../ui/LanguageCurrencySelector';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { useApiQuery } from '../../hooks/useApiQuery';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface StaticPage {
  id: number | string;
  title: string;
  slug: string;
  isActive?: boolean;
}

function Navbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimatingNav, setIsAnimatingNav] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0, left: 0 });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();


  // Function to get first letter of each name for mobile display
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Control navbar visibility based on scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // At top of page - show navbar, hide floating logo
        setScrolled(false);
        setShowNavbar(true);
      } else {
        // Scrolled down - mark as scrolled
        setScrolled(true);
        
        if (isLogoHovered) {
          // Logo is hovered - show navbar
          setShowNavbar(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide navbar
          setShowNavbar(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show navbar
          setShowNavbar(true);
          setIsAnimatingNav(true);
          window.setTimeout(() => setIsAnimatingNav(false), 350);
        }
      }

      setLastScrollY(currentScrollY);
    };

    const throttledControlNavbar = throttle(controlNavbar, 50);
    window.addEventListener('scroll', throttledControlNavbar);

    return () => window.removeEventListener('scroll', throttledControlNavbar);
  }, [lastScrollY, isLogoHovered]);

  useEffect(() => {
  const updateDropdownPosition = () => {
    if (userMenuRef.current && isUserMenuOpen) {
      const buttonRect = userMenuRef.current.querySelector('button')?.getBoundingClientRect();
      
      if (buttonRect) {
        const newPosition = {
          top: buttonRect.bottom + 12, // 12px تحت الزر
          right: isRTL ? window.innerWidth - buttonRect.right : 'auto',
          left: isRTL ? 'auto' : buttonRect.left
        };
        
        setDropdownPosition(newPosition);
      }
    }
  };

  updateDropdownPosition();
  window.addEventListener('scroll', updateDropdownPosition);
  window.addEventListener('resize', updateDropdownPosition);

  return () => {
    window.removeEventListener('scroll', updateDropdownPosition);
    window.removeEventListener('resize', updateDropdownPosition);
  };
}, [isUserMenuOpen, isRTL]);

  // Handle logo hover to show navbar
  useEffect(() => {
    if (isLogoHovered && scrolled) {
      setShowNavbar(true);
    }
  }, [isLogoHovered, scrolled]);

  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial mobile state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu and cart dropdown when clicking outside
// استبدل هذا الـ useEffect بالموجود بالفعل:
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    
    // إغلاق user menu إذا كان الكلك خارجه
    if (userMenuRef.current && !userMenuRef.current.contains(target)) {
      // تحقق أيضاً من الـ dropdown نفسه (في حالة الـ fixed positioning)
      const dropdown = document.querySelector('[data-user-dropdown]');
      if (dropdown && !dropdown.contains(target)) {
        setIsUserMenuOpen(false);
      }
    }
    
    // إغلاق cart dropdown
    if (cartDropdownRef.current && !cartDropdownRef.current.contains(target)) {
      setTimeout(() => {
        if (!isCartHovered) {
          setIsCartDropdownOpen(false);
        }
      }, 400);
    }
  };

  if (isUserMenuOpen || isCartDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isUserMenuOpen, isCartDropdownOpen, isCartHovered]);

  // Close mobile menu when clicking outside or on overlay
  useEffect(() => {
    const handleMobileMenuClose = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is on the overlay (not on the menu panel)
      if (isMenuOpen && target.classList.contains('mobile-menu-overlay')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleMobileMenuClose);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleMobileMenuClose);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Hide navbar when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [isMenuOpen]);

  // Throttle function for better performance
  const throttle = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch {
        localStorage.removeItem('user');
      }
    } else {
      const adminUser = localStorage.getItem('adminUser');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (adminUser && isAuthenticated) {
        try {
          const admin = JSON.parse(adminUser);
          const mapped = {
            id: admin.id || admin.userId || admin._id || undefined,
            name: admin.name || admin.username || admin.firstName || 'User',
            email: admin.email || '',
            avatar: admin.avatar || ''
          };
          setUser(mapped);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    

    const handleCartUpdate = () => {
      console.log('🔄 [Navbar] Cart update event received');
      fetchCartCount();
    };

    const handleCartCountChange = () => {
      console.log('🔄 [Navbar] Cart count change event received');
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            console.log('📊 [Navbar] Cart count updated instantly:', totalItems);
            const userData = localStorage.getItem('user');
            if (userData) {
              console.log('👤 [Navbar] Logged in user - syncing with server in background');
              setTimeout(() => fetchCartCount(), 100);
            }
            return;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing local cart:', parseError);
        }
      }
      const userData = localStorage.getItem('user');
      if (userData) {
        console.log('👤 [Navbar] No local cart - fetching from server');
        fetchCartCount();
      } else {
        setCartItemsCount(0);
      }
    };

    const handleWishlistUpdate = () => {
      console.log('🔄 [Navbar] Wishlist update event received');
      fetchWishlistCount();
    };

    const handleCategoriesUpdate = () => refetchCategories();

    const cartEvents = [
      'cartUpdated',
      'productAddedToCart',
      'forceCartUpdate'
    ];

    const cartCountEvents = [
      'cartCountChanged'
    ];

    const wishlistEvents = [
      'wishlistUpdated',
      'productAddedToWishlist',
      'productRemovedFromWishlist',
      'wishlistCleared'
    ];

    cartEvents.forEach(event => {
      window.addEventListener(event, handleCartUpdate);
    });

    cartCountEvents.forEach(event => {
      window.addEventListener(event, handleCartCountChange);
    });

    wishlistEvents.forEach(event => {
      window.addEventListener(event, handleWishlistUpdate);
    });

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh') {
        console.log('🔄 [Navbar] Storage cart update detected');
        handleCartUpdate();
      }
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') {
        console.log('🔄 [Navbar] Storage wishlist update detected');
        handleWishlistUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleUserUpdated = (e: any) => {
      try {
        const newUser = e?.detail ?? JSON.parse(localStorage.getItem('user') || 'null');
        if (newUser) {
          setUser(newUser);
        }
      } catch {}
    };

    window.addEventListener('userUpdated', handleUserUpdated);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);

      if (savedCartCount) {
        setCartItemsCount(parseInt(savedCartCount));
      }
      if (savedWishlistCount) {
        setWishlistItemsCount(parseInt(savedWishlistCount));
      }
    } else {
      console.log('👤 [Navbar] Loading wishlist for guest user');
      const savedWishlist = localStorage.getItem('wishlist');
      console.log('💾 [Navbar] Guest wishlist from localStorage:', savedWishlist);

      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          console.log('📦 [Navbar] Parsed guest wishlist:', parsedWishlist);

          if (Array.isArray(parsedWishlist)) {
            console.log('✅ [Navbar] Setting guest wishlist count:', parsedWishlist.length);
            setWishlistItemsCount(parsedWishlist.length);
          } else {
            console.log('❌ [Navbar] Guest wishlist is not an array');
            setWishlistItemsCount(0);
          }
        } catch (error) {
          console.error('❌ [Navbar] Error parsing guest wishlist:', error);
          setWishlistItemsCount(0);
        }
      } else {
        console.log('📭 [Navbar] No guest wishlist found, setting count to 0');
        setWishlistItemsCount(0);
      }
    }

    return () => {
      cartEvents.forEach(event => {
        window.removeEventListener(event, handleCartUpdate);
      });

      cartCountEvents.forEach(event => {
        window.removeEventListener(event, handleCartCountChange);
      });

      wishlistEvents.forEach(event => {
        window.removeEventListener(event, handleWishlistUpdate);
      });

      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');

      if (!userData) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              console.log('📊 [Navbar] Cart count from localStorage:', totalItems);
              return;
            }
          } catch (parseError) {
            console.error('❌ [Navbar] Error parsing local cart:', parseError);
          }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        console.log('📊 [Navbar] No user and no local cart, setting count to 0');
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        console.warn('⚠️ [Navbar] Invalid user data, falling back to localStorage');
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              return;
            }
          } catch (parseError) {
            console.error('❌ [Navbar] Error parsing local cart fallback:', parseError);
          }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }

      console.log('🔄 [Navbar] Fetching cart count for user:', user.id);

      try {
        const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
        console.log('📦 [Navbar] Raw cart data:', data);

        let totalItems = 0;
        if (Array.isArray(data)) {
          totalItems = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        } else if (data && typeof data === 'object') {
          if (Array.isArray((data as any).cart)) {
            totalItems = (data as any).cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          } else if (Array.isArray((data as any).items)) {
            totalItems = (data as any).items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          } else if (typeof (data as any).totalItems === 'number') {
            totalItems = (data as any).totalItems;
          }
        }

        console.log('📊 [Navbar] Cart count calculated from server:', totalItems);
        setCartItemsCount(totalItems);

        localStorage.setItem('lastCartCount', totalItems.toString());
        localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());

        console.log('💾 [Navbar] Cart count saved to localStorage:', totalItems);
      } catch (apiError) {
        console.error('❌ [Navbar] API error, falling back to localStorage:', apiError);

        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              console.log('📊 [Navbar] Cart count from localStorage fallback:', totalItems);
              return;
            }
          } catch (parseError) {
            console.error('❌ [Navbar] Error parsing local cart in API fallback:', parseError);
          }
        }

        const lastCount = localStorage.getItem('lastCartCount');
        if (lastCount) {
          const count = parseInt(lastCount, 10) || 0;
          setCartItemsCount(count);
          console.log('📊 [Navbar] Using last saved cart count:', count);
        } else {
          setCartItemsCount(0);
          localStorage.setItem('lastCartCount', '0');
          console.log('📊 [Navbar] No fallback available, setting count to 0');
        }
      }
    } catch (error) {
      console.error('❌ [Navbar] Error fetching cart count:', error);

      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            return;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing local cart fallback:', parseError);
        }
      }

      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      console.log('🔄 [Navbar] fetchWishlistCount called');

      const savedWishlist = localStorage.getItem('wishlist');
      console.log('💾 [Navbar] Raw wishlist from localStorage:', savedWishlist);

      let wishlistCount = 0;

      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          console.log('📦 [Navbar] Parsed wishlist:', parsedWishlist);

          if (Array.isArray(parsedWishlist)) {
            wishlistCount = parsedWishlist.length;
            console.log('✅ [Navbar] Calculated wishlist count:', wishlistCount);
          } else {
            console.log('❌ [Navbar] Wishlist is not an array');
            wishlistCount = 0;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing wishlist from localStorage:', parseError);
          wishlistCount = 0;
        }
      } else {
        console.log('📭 [Navbar] No wishlist found in localStorage');
      }

      console.log('📊 [Navbar] Final wishlist count:', wishlistCount);
      setWishlistItemsCount(wishlistCount);
      localStorage.setItem('lastWishlistCount', wishlistCount.toString());

      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            localStorage.setItem(`wishlistCount_${user.id}`, wishlistCount.toString());
          }
        } catch (error) {
          console.error('❌ [Navbar] Error parsing user data:', error);
        }
      }

      console.log('💾 [Navbar] Wishlist count saved to localStorage:', wishlistCount);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching wishlist count:', error);
      setWishlistItemsCount(0);
      localStorage.setItem('lastWishlistCount', '0');
    }
  };

  const { data: categoriesResp, refetch: refetchCategories } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CATEGORIES, queryKey: ['categories'] });
  useEffect(() => {
    if (!categoriesResp) return;
    const arr = Array.isArray(categoriesResp) ? categoriesResp : categoriesResp?.data || [];
    const filtered = arr.filter((category: Category) => category.name !== 'ثيمات');
    setCategories(filtered);
    localStorage.setItem('cachedCategories', JSON.stringify(filtered));
  }, [categoriesResp]);

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAuthenticated');
    try {
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
    } catch {}
    setIsAuthModalOpen(false);

    const mergeLocalCartWithUserCart = async () => {
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (localItems.length > 0) {
            console.log('🔄 [Navbar] Merging local cart with user cart:', localItems.length, 'items');

            for (const item of localItems) {
              try {
                await apiCall(API_ENDPOINTS.USER_CART(userData.id), {
                  method: 'POST',
                  body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity,
                    selectedOptions: item.selectedOptions || {},
                    optionsPricing: item.optionsPricing || {},
                    attachments: item.attachments || {},
                    productName: item.product?.name || t('product:name'),
                    price: item.product?.price || 0,
                    image: item.product?.mainImage || ''
                  })
                });
                console.log('✅ [Navbar] Merged item:', item.productId);
              } catch (error) {
                console.error('❌ [Navbar] Error merging item:', item.productId, error);
              }
            }

            try {
              const serverCart = await apiCall(API_ENDPOINTS.USER_CART(userData.id));
              const mergedItems = Array.isArray(serverCart)
                ? serverCart
                : Array.isArray((serverCart as any)?.items)
                  ? (serverCart as any).items
                  : Array.isArray((serverCart as any)?.cart)
                    ? (serverCart as any).cart
                    : [];
              localStorage.setItem('cart', JSON.stringify(mergedItems));
              console.log('✅ [Navbar] Cart merged successfully, new cart size:', mergedItems.length);

              window.dispatchEvent(new CustomEvent('cartUpdated'));

             } catch (error) {
              console.error('❌ [Navbar] Error fetching merged cart:', error);
            }
          } else {
            console.log('📭 [Navbar] Local cart is empty, no merge needed');
          }
        } else {
          console.log('📭 [Navbar] No local cart found');
        }
      } catch (error) {
        console.error('❌ [Navbar] Error in cart merge:', error);
      }
    };

    mergeLocalCartWithUserCart();

   };

  const handleLogout = () => {
    const currentUser = user;
    setUser(null);
    setIsCartDropdownOpen(false);
    localStorage.removeItem('user');

    if (currentUser?.id) {
      localStorage.removeItem(`cartCount_${currentUser.id}`);
      localStorage.removeItem(`wishlistCount_${currentUser.id}`);
    }

    try {
      localStorage.clear();
    } catch (e) {}

    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);

    navigate('/');
    smartToast.frontend.success(t('common:auth.logout_success'));
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Floating Logo - Appears when scrolled and navbar is hidden - Hidden on Mobile */}
      {scrolled && !showNavbar && !isAnimatingNav && (
        <div 
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] transition-all duration-300 ease-out opacity-100 translate-y-0 scale-100 pointer-events-auto hidden md:block"
          onMouseEnter={() => {
            setIsLogoHovered(true);
          }}
          onMouseLeave={() => {
            setTimeout(() => {
              setIsLogoHovered(false);
            }, 500);
          }}
        >
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
<img src={logo} alt="Logo" className="w-16 sm:w-21 h-16 sm:h-21 object-contain hover:scale-95 transition-transform duration-200" />
          </Link>
        </div>
      )}
      {/* Main Navbar */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ease-out ${
          (showNavbar && !isMenuOpen) || isMobile ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          top: 'var(--announcement-offset, 0px)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
        onMouseEnter={() => {
          if (scrolled && !isMenuOpen) {
            setIsLogoHovered(true);
          }
        }}
        onMouseLeave={() => {
          setTimeout(() => setIsLogoHovered(false), 500);
        }}
      >
        {/* Navbar Container with Rounded Corners */}
<div className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          <div 
           className={`relative mx-auto max-w-[90rem] transition-all duration-500 ease-out rounded-xl sm:rounded-2xl ${
  scrolled 
    ? 'bg-white/5 backdrop-blur-xl sm:backdrop-blur-2xl border border-white/10 shadow-xl sm:shadow-2xl shadow-black/20' 
    : 'bg-transparent border border-transparent'
}`}
          >
<div className="flex items-center justify-between h-12 sm:h-16 px-3 sm:px-6">              
              {/* Mobile Menu Button & Cart */}
<div className="lg:hidden flex items-center gap-1.5">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-1 sm:p-2 rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm touch-manipulation relative overflow-hidden group"
                  aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.menu')}
                >
                  <div className="relative z-10">
                    {isMenuOpen ? <X size={18} className="sm:w-[22px] sm:h-[22px]" /> : <Menu size={18} className="sm:w-[22px] sm:h-[22px]" />}
                  </div>
                  <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
                </button>

                {/* Mobile Cart Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!user) return;
                      setIsCartDropdownOpen(!isCartDropdownOpen);
                    }}
                    className="relative text-white p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm touch-manipulation group"
                    aria-label={t('nav.shopping_cart')}
                  >
<ShoppingCart size={18} className="sm:w-[22px] sm:h-[22px]" />
                    {cartItemsCount > 0 && (
<span className="absolute -top-1 -right-1 bg-[#18b5d5] text-white rounded-full min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold shadow-[0_0_6px_rgba(24,181,213,0.4)] animate-pulse">
                        {cartItemsCount}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
                  </button>
                  
                  {/* Mobile Cart Dropdown */}
                  {isCartDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 z-50">
                      <CartDropdown
                        isOpen={isCartDropdownOpen}
                        onClose={() => setIsCartDropdownOpen(false)}
                        onHoverChange={(isHovered) => setIsCartHovered(isHovered)}
                      />
                    </div>
                  )}
                </div>

                {/* Mobile Language & Currency Selector */}
                <div className="hidden">
                  <LanguageCurrencySelector />
                </div>
              </div>

              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="cursor-pointer">
<img src={logo} alt="Logo" className="h-6 sm:h-8 w-auto" />                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-1">
                {[
                  { name: t('nav.home'), href: '/' },
                  { name: t('nav.products'), href: '/products' },
                  { name: t('nav.theme_malak'), href: '/theme/55' },
                  { name: t('nav.blog'), href: '/blog' },
                  { name: t('nav.documentation', { defaultValue: 'التوثيق' }), href: '/documentation' },
                  { name: t('nav.categories'), href: '/categories' },
                  { name: t('nav.contact'), href: '/contact' }
                ].map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`relative px-4 py-2 text-white/90 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-300 text-sm font-medium group ${
                      isActive(link.href) ? 'text-[#18b5d8]' : ''
                    }`}
                  >
                    {link.name}
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#18b5d8] to-[#0891b2] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="hidden lg:flex items-center space-x-3">
                
                {/* Language & Currency Selector */}
                <LanguageCurrencySelector />

                {/* Search Button */}
                <LiveSearch />

      {/* Cart Button with Dropdown */}
      <div className="relative" ref={cartDropdownRef}>
        <button 
          onClick={() => {
            if (!user) return;
            setIsCartDropdownOpen(!isCartDropdownOpen);
          }}
          className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
        >
          <ShoppingCart size={20} />
          {cartItemsCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-[#18b5d5] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-pulse"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(24,181,213,1))',
                animationDuration: '2s' // جعل الـ pulse أبطأ لتأثير أنيق
              }}
            >
              {cartItemsCount}
            </span>
          )}
          <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        <div className="absolute top-full left-0 mt-2 z-50 translate-x-4">
          <CartDropdown 
            isOpen={isCartDropdownOpen} 
            onClose={() => setIsCartDropdownOpen(false)}
            onHoverChange={setIsCartHovered}
          />
        </div>
      </div>

      {/* Wishlist Button */}
      <Link to="/wishlist" className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group">
        <Heart size={20} />
        {wishlistItemsCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-[#18b5d5] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-pulse"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(24,181,213,1))',
              animationDuration: '2s' // جعل الـ pulse أبطأ لتأثير أنيق
            }}
          >
            {wishlistItemsCount}
          </span>
        )}
        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

 
{/* User Menu */}
{user ? (
  <div className="relative" ref={userMenuRef}>
    <button 
      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
      className="flex items-center text-white/90 hover:text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 transition-all duration-300 gap-2 md:gap-3 group"
    >
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg overflow-hidden border border-white/20">
        <img src={(user.avatar || user.storeLogo || user.storeImage) ? buildImageUrl(user.avatar || user.storeLogo || user.storeImage || '') : notfoundImg} alt={user.name || user.firstName || 'User'} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = notfoundImg; }} />
      </div>
      <span className="text-xs md:text-sm font-medium hidden md:inline">{user.name?.split(' ')[0] || user.firstName || t('nav.profile')}</span>
      <span className="text-xs md:text-sm font-medium md:hidden">{getInitials(user.name || user.firstName || t('nav.profile'))}</span>
      <ChevronDown size={14} className={`md:w-4 md:h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
    </button>
    
{isUserMenuOpen && (
  <div 
    className={`fixed ${isRTL ? 'left-2' : 'right-2'} w-36 md:w-56 max-w-[calc(100vw-0.5rem)] bg-white/5 backdrop-blur-2xl rounded-lg md:rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[9999]`}

  >
        {/* احنا هنحدد موقع الـ dropdown ديناميكي من خلال JavaScript */}
        <div className="p-1 md:p-2 space-y-0.5 md:space-y-2">
          <Link
            to="/profile"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center px-2 md:px-4 py-1.5 md:py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-md md:rounded-xl transition-all duration-200 gap-1.5 md:gap-3"
          >
            <User size={14} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
            <span className="text-xs md:text-base truncate">{t('nav.profile')}</span>
          </Link>
          
          <div className="border-t border-white/10 my-0.5 md:my-2"></div>
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-2 md:px-4 py-1.5 md:py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md md:rounded-xl transition-all duration-200 gap-1.5 md:gap-3"
          >
            <LogOut size={14} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
            <span className="text-xs md:text-base truncate">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    )}
  </div>
) : (
  <button 
    onClick={openAuthModal} 
    className="relative text-white bg-gradient-to-r from-[#18b5d8] to-[#0891b2] px-6 py-2 rounded-xl hover:from-[#0891b2] hover:to-[#18b5d8] transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transform"
  >
    <span className="relative z-10">{t('nav.login')}</span>
    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
  </button>
)}
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/40 z-[60] transition-opacity duration-200 mobile-menu-overlay ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsMenuOpen(false);
          }
        }}
      >
        {/* Mobile Menu Panel */}
        <div 
          className={`fixed right-0 top-0 h-full w-full max-w-sm transform transition-all duration-300 ease-out flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#292929',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-10px 0 24px rgba(0,0,0,0.35)',
            maxHeight: '100vh',
            overflowY: 'hidden'
          }}
        >
          

          <div 
            className="relative flex justify-between items-center p-3 border-b border-white/10"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="transition-all duration-200">
              <img src={logo} alt="Logo" className="h-7 w-auto" />
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
              aria-label={t('nav.close_menu')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Container */}
          <div className="flex flex-col flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {/* User Section - Enhanced Glassmorphism */}
            {user ? (
              <div 
               className="relative p-4 border-b border-white/15"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                {/* User Info Card */}
                <div 
                 className="relative flex items-center gap-3 p-4 text-white rounded-xl mb-4 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Animated Background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(24,181,216,0.1) 0%, rgba(8,145,178,0.05) 100%)'
                    }}
                  ></div>
                  
                  {/* Avatar (show client image on mobile if available) */}
                  <div 
                    className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #18b5d8 0%, #0891b2 100%)',
                      boxShadow: '0 8px 32px rgba(24,181,216,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
                    }}
                  >
                    { (user.avatar || user.storeLogo || user.storeImage) ? (
                      <img
                        src={buildImageUrl(user.avatar || user.storeLogo || user.storeImage || '')}
                        alt={user.name || user.firstName || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <>
                        <span className="text-white font-bold text-lg relative z-10">
                          {getInitials(user.name || user.firstName || t('nav.profile'))}
                        </span>
                        <div 
                          className="absolute inset-0 opacity-50"
                          style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)'
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 relative z-10">
  <div className="text-base font-bold text-white mb-1.5">
                      {user.name?.split(' ')[0] || user.firstName || t('nav.profile')}
                    </div>
                    <div className="text-sm text-white/80 font-medium">
                      {user.email}
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.5)'
                      }}
                    ></div>
                    <span className="text-xs text-white/70 font-medium">{t('nav.online')}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                   className="relative flex items-center w-full px-4 py-3 text-white/90 hover:text-white rounded-2xl transition-all duration-300 space-x-3 touch-manipulation group overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(24,181,216,0.15) 0%, rgba(8,145,178,0.08) 100%)'
                      }}
                    ></div>
                    <User size={18} className="flex-shrink-0 relative z-10" />
<span className="text-sm font-semibold relative z-10">{t('nav.profile')}</span>
                    <ChevronLeft size={18} className="mr-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10" />
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="relative flex items-center w-full px-5 py-4 text-red-400 hover:text-red-300 rounded-2xl transition-all duration-300 space-x-3 touch-manipulation group overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)'
                      }}
                    ></div>
                    <LogOut size={18} className="flex-shrink-0 relative z-10" />
<span className="text-sm font-semibold relative z-10">{t('nav.logout')}</span>
                    <ChevronLeft size={18} className="mr-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="relative p-6 border-b border-white/15"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <button 
                  onClick={openAuthModal}
                  className="relative flex items-center justify-center w-full px-5 py-3.5 text-white rounded-xl transition-all duration-300 touch-manipulation group overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #18b5d8 0%, #0891b2 100%)',
                    boxShadow: '0 8px 32px rgba(24,181,216,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
                  }}
                >
                  {/* Animated Background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #0891b2 0%, #18b5d8 100%)'
                    }}
                  ></div>
                  
                  {/* Shimmer Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 1.5s ease-in-out infinite'
                    }}
                  ></div>
                  
                  <User size={20} className="flex-shrink-0 ml-2 relative z-10" />
<span className="font-bold text-base relative z-10">{t('nav.login')}</span>
                </button>
              </div>
            )}

            <div className="p-2 border-b border-white/10">
              <div className="flex justify-center">
                <LanguageCurrencySelector />
              </div>
            </div>

            {/* Navigation Links Section - Enhanced Glassmorphism */}
            <div 
              className="relative p-4 flex-1"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)'
              }}
            >
              {/* Section Header */}
              <div className="flex items-center mb-4">
                <div 
                  className="w-0.5 h-4 rounded-full mr-2"
                  style={{
                    background: 'linear-gradient(135deg, #18b5d8 0%, #0891b2 100%)',
                    boxShadow: '0 0 8px rgba(24,181,216,0.4)'
                  }}
                ></div>
                <h3 className="text-white/70 text-xs font-bold uppercase tracking-wider">{t('nav.pages')}</h3>
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-2">
                {[
                  { name: t('nav.home'), href: '/', icon: Home, color: '#18b5d8' },
                  // { name: t('nav.products'), href: '/products', icon: Grid3X3, color: '#0891b2' },
                  { name: t('nav.theme_malak'), href: '/theme/55', icon: Crown, color: '#f59e0b' },
                  { name: t('nav.blog'), href: '/blog', icon: BookOpen, color: '#10b981' },
                  { name: t('nav.documentation', { defaultValue: 'التوثيق' }), href: '/documentation', icon: FileText, color: '#60a5fa' },
                  { name: t('nav.products'), href: '/categories', icon: Package, color: '#f97316' },
                  { name: t('nav.contact'), href: '/contact', icon: Phone, color: '#ef4444' }
                ].map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`relative flex items-center px-3 py-2 text-white/90 hover:text-white rounded-lg transition-all duration-300 space-x-2 group touch-manipulation overflow-hidden ${
                      isActive(link.href) ? 'text-white' : ''
                    }`}
                    style={{
                      background: isActive(link.href) 
                        ? `linear-gradient(135deg, ${link.color}20 0%, ${link.color}10 100%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: isActive(link.href) 
                        ? `1px solid ${link.color}40`
                        : '1px solid rgba(255,255,255,0.1)',
                      animationDelay: `${index * 100}ms`,
                      animation: isMenuOpen ? 'slideInRight 0.5s ease-out forwards' : 'none'
                    }}
                  >
                    {/* Hover Background */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${link.color}15 0%, ${link.color}08 100%)`
                      }}
                    ></div>
                    
                    {/* Icon Container */}
                    <div 
                      className="relative w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: isActive(link.href) 
                          ? `linear-gradient(135deg, ${link.color} 0%, ${link.color}cc 100%)`
                          : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                        boxShadow: isActive(link.href) 
                          ? `0 2px 12px ${link.color}40`
                          : '0 1px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <link.icon 
                        size={14} 
                        className="relative z-10"
                        style={{ 
                          color: isActive(link.href) ? '#ffffff' : link.color 
                        }}
                      />
                      {isActive(link.href) && (
                        <div 
                          className="absolute inset-0 rounded-lg opacity-50"
                          style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)'
                          }}
                        ></div>
                      )}
                    </div>
                    
                    {/* Text */}
                    <span className="font-medium text-sm relative z-10 flex-1">{link.name}</span>
                    
                    {/* Arrow */}
                    <ChevronLeft 
                      size={14} 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10"
                      style={{ color: link.color }}
                    />
                    
                    {/* Active Indicator */}
                    {isActive(link.href) && (
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                        style={{
                          background: `linear-gradient(135deg, ${link.color} 0%, ${link.color}cc 100%)`,
                          boxShadow: `0 0 10px ${link.color}60`
                        }}
                      ></div>
                    )}
                    
                    {/* Shimmer Effect on Hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-lg"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'shimmer 2s ease-in-out infinite'
                      }}
                    ></div>
                  </Link>
                ))}
              </div>
           
            </div>

            
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;
