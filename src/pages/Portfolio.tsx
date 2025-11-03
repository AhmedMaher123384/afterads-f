import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ExternalLink, Filter, Search, Eye, Calendar, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPortfolios, getPortfolioCategories } from '../utils/api';
import { buildImageUrl } from '../config/api';
import { smartToast } from '../utils/toastConfig';
import portfolio from '../assets/portfolio.webp';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  mainImage: string;
  projectUrl?: string;
  categoryId: number | null;
  status: string;
  createdAt: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
}

interface PortfolioCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const Portfolio: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Intersection Observer for animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.getAttribute('data-id') || '0');
            setVisibleItems(prev => new Set(prev).add(id));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Attach observer to elements
  const attachObserver = (element: HTMLElement | null, id: number) => {
    if (element && observerRef.current) {
      element.setAttribute('data-id', id.toString());
      observerRef.current.observe(element);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfoliosResponse, categoriesResponse] = await Promise.all([
        getPortfolios(),
        getPortfolioCategories(),
      ]);

      if (portfoliosResponse.success) {
        setPortfolios(portfoliosResponse.data);
      } else {
        throw new Error('فشل في جلب المشاريع');
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      } else {
        throw new Error('فشل في جلب الفئات');
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('حدث خطأ في تحميل البيانات');
      smartToast.dashboard.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((portfolio) => {
      const matchesCategory = selectedCategory === null || selectedCategory === 0 || portfolio.categoryId === selectedCategory;
      const matchesSearch = searchTerm === '' ||
        portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (portfolio.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [portfolios, selectedCategory, searchTerm]);

  const openModal = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPortfolio(null);
    setShowModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#404040] to-[#292929] opacity-85"></div>
        <div className="text-center max-w-md mx-auto p-8 z-10">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/30 to-[#1ab5d5]/30 backdrop-blur-md border border-[#18b5d8]/40 rounded-full animate-pulse"></div>
            <Filter className="w-14 h-14 text-[#18b5d8] absolute inset-0 m-auto" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">خطأ في النظام</h3>
          <p className="text-[#e0e0e0] mb-8 leading-relaxed">{error}</p>
          <button
            onClick={fetchData}
            className="px-10 py-4 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white rounded-xl hover:from-[#1ab5d5] hover:to-[#18b5d8] transition-all duration-500 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#404040] to-[#292929] opacity-85"></div>
        <div className="text-center animate-fadeInUp z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#18b5d8] mx-auto mb-4"></div>
          <p className="text-[#e0e0e0] text-lg">جاري تحميل معرض الأعمال...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929] relative overflow-hidden pt-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#404040] to-[#292929] opacity-85"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute font-mono text-xs text-[#18b5d8]/40 animate-pulse" style={{ top: '5%', left: '5%' }}>
            &lt;Portfolio projects=&quot;{portfolios.length}&quot;&gt;
          </div>
          <div className="absolute font-mono text-xs text-[#18b5d8]/40 animate-pulse" style={{ top: '10%', right: '5%', animationDelay: '500ms' }}>
            useEffect(() =&gt; fetchData());
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#18b5d8]/20 to-transparent animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-full h-px bg-gradient-to-l from-transparent via-[#1ab5d5]/20 to-transparent animate-pulse delay-1000"></div>
        </div>
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#18b5d8] rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes particle {
          0% { opacity: 0; transform: translateY(0px) scale(1); }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.5); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes neonGlow {
          0% { box-shadow: 0 0 10px rgba(24, 181, 216, 0.3); }
          50% { box-shadow: 0 0 20px rgba(24, 181, 216, 0.6), 0 0 30px rgba(26, 181, 213, 0.4); }
          100% { box-shadow: 0 0 10px rgba(24, 181, 216, 0.3); }
        }
        @keyframes slideInFromLeft {
          0% { opacity: 0; transform: translateX(-120px) scale(0.8) rotateY(-15deg); }
          100% { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
        }
        @keyframes slideInFromRight {
          0% { opacity: 0; transform: translateX(120px) scale(0.8) rotateY(15deg); }
          100% { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
        }
        @keyframes slideInFromTop {
          0% { opacity: 0; transform: translateY(-50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInFromBottom {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes textReveal {
          0% { opacity: 0; transform: translateX(30px); filter: blur(10px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0px); }
        }
        @keyframes textRevealReverse {
          0% { opacity: 0; transform: translateX(-30px); filter: blur(10px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0px); }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.8) rotateZ(-5deg); }
          100% { opacity: 1; transform: scale(1) rotateZ(0deg); }
        }

        .animate-particle {
          animation: particle linear infinite;
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        .content-card {
          animation: fadeInUp 0.8s ease-out;
          animation-delay: calc(var(--index) * 0.1s);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .neon-glow {
          animation: neonGlow 2s ease-in-out infinite;
        }
        .card-hover:hover {
          transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
          box-shadow: 0 12px 40px rgba(24, 181, 216, 0.4), 0 0 60px rgba(26, 181, 213, 0.2);
        }
        .project-image-left {
          animation: slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .project-image-right {
          animation: slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .project-content-left {
          animation: textReveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
        .project-content-right {
          animation: textRevealReverse 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
        .project-title {
          animation: slideInFromTop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
        .project-description {
          animation: slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.7s;
          opacity: 0;
        }
        .project-category {
          animation: scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.9s;
          opacity: 0;
        }
        .project-image-hidden {
          opacity: 0;
          transform: translateX(-120px) scale(0.8) rotateY(-15deg);
        }
        .project-image-hidden-right {
          opacity: 0;
          transform: translateX(120px) scale(0.8) rotateY(15deg);
        }
        .project-content-hidden {
          opacity: 0;
          transform: translateX(30px);
          filter: blur(10px);
        }
        .project-content-hidden-reverse {
          opacity: 0;
          transform: translateX(-30px);
          filter: blur(10px);
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-[0_12px_40px_rgba(31,38,135,0.2)] neon-glow overflow-hidden">
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/[0.02] via-transparent to-[#18b5d8]/[0.03] rounded-[15px] sm:rounded-[23px] pointer-events-none"></div>
          <div className="relative flex flex-col lg:flex-row items-center gap-4 sm:gap-6 md:gap-8 z-10">
            <div className="flex-1 text-center lg:text-right">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white/95 mb-3 sm:mb-4 tracking-wide">
                <span className="block font-extralight text-white/80 mb-1 sm:mb-2">
                  اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">مشاريعنا</span>
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/70 font-light mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                حرصنا أن نضع لمستنا في كل تفصيلة، وعملنا بروح مليئة بالشغف لنمنحك الأفضل. نأمل أن تكون هذه البداية لشراكة ملهمة بيننا.
              </p>
            </div>
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md">
  <img
    src={portfolio}
    alt="معرض الأعمال"
    className="w-full h-65 sm:h-56 md:h-64 lg:h-70 
               object-cover lg:object-contain 
               rounded-xl sm:rounded-2xl"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
    }}
  />
</div>

          </div>
          <div className="absolute top-0 left-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-tl-2xl sm:rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-gradient-to-tl from-[#18b5d8]/[0.03] to-transparent rounded-br-2xl sm:rounded-br-3xl"></div>
          <div className="absolute inset-0 bg-gradient-radial from-[#18b5d8]/[0.02] via-transparent to-transparent rounded-2xl sm:rounded-3xl -z-10"></div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 mb-8 sm:mb-10 md:mb-12 z-10 relative">
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white'
                    : 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.08]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 pb-16 sm:pb-20 md:pb-24">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="relative mb-8 sm:mb-10 md:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#18b5d8] tracking-wider uppercase relative z-10 mb-32 sm:mb-40 md:mb-48">
              المشاريع
            </h2>
            <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-[#18b5d8]/10 via-[#1ab5d5]/10 to-[#18b5d8]/10 rounded-xl sm:rounded-2xl blur-xl"></div>
            <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#18b5d8] to-transparent"></div>
          </div>

          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-[#e0e0e0] mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-[#18b5d8] mb-2">لا توجد مشاريع</h3>
              <p className="text-[#e0e0e0]">لم نجد أي مشاريع تطابق معايير البحث الخاصة بك</p>
            </div>
          ) : (
            <div className="space-y-32">
              {filteredPortfolios.map((portfolio, index) => {
                const isEven = index % 2 === 0;
                const isVisible = visibleItems.has(portfolio.id);

                return (
                  <div
                    key={portfolio.id}
                    className="group"
                    ref={(el) => attachObserver(el, portfolio.id)}
                  >
                    <div className={`flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Image Section */}
                      <div className="flex-shrink-0 w-full md:w-1/2">
                        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl transform transition-all duration-700 ${
                          isVisible
                            ? (isEven ? 'project-image-left' : 'project-image-right')
                            : (isEven ? 'project-image-hidden' : 'project-image-hidden-right')
                        }`}>
                          {portfolio.projectUrl ? (
                            <a
                              href={portfolio.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative overflow-hidden rounded-xl sm:rounded-2xl group-hover:shadow-2xl transition-shadow duration-500"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                              <img
                                src={portfolio.mainImage ? buildImageUrl(portfolio.mainImage) : '/images/default-project.jpg'}
                                alt={portfolio.title}
                                className="w-full aspect-[4/3] object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                            </a>
                          ) : (
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                              <img
                                src={portfolio.mainImage ? buildImageUrl(portfolio.mainImage) : '/images/default-project.jpg'}
                                alt={portfolio.title}
                                className="w-full aspect-[4/3] object-cover transition-all duration-700 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 w-full md:w-1/2 text-center md:text-right px-2 sm:px-0">
                        <div className={`${
                          isVisible
                            ? (isEven ? 'project-content-left' : 'project-content-right')
                            : (isEven ? 'project-content-hidden' : 'project-content-hidden-reverse')
                        }`}>
                          {/* Category Badge */}
                          {portfolio.category && (
                            <div className={`mb-3 sm:mb-4 ${isVisible ? 'project-category' : ''}`}>
                              <span
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-[#18b5d5] shadow-lg"
                                style={{ backgroundColor: portfolio.category.color }}
                              >
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                                {portfolio.category.name}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight ${
                            isVisible ? 'project-title' : ''
                          }`}>
                            {portfolio.title}
                          </h3>

                          {/* Description */}
                          <p className={`text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 md:mb-8 ${
                            isVisible ? 'project-description' : ''
                          }`}>
                            {portfolio.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Line */}
                    <div className={`mt-12 sm:mt-14 md:mt-16 relative ${isVisible ? 'project-category' : ''}`}>
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t border-white/10 ${
                          isEven ? 'border-gradient-to-r' : 'border-gradient-to-l'
                        }`}></div>
                      </div>
                      <div className={`relative flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                        <div className="bg-[#292929] px-3 sm:px-4">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Portfolio Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10 p-4 sm:p-6 md:p-8 flex justify-between items-center z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                {selectedPortfolio.category && (
                  <span
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-[#18b5d5] shadow-lg"
                    style={{ backgroundColor: selectedPortfolio.category.color }}
                  >
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                    {selectedPortfolio.category.name}
                  </span>
                )}
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  {selectedPortfolio.title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-200 group"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Main Image */}
              <div className="mb-6 sm:mb-8">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <img
                    src={selectedPortfolio.mainImage ? buildImageUrl(selectedPortfolio.mainImage) : '/images/default-project.jpg'}
                    alt={selectedPortfolio.title}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  {selectedPortfolio.projectUrl && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <a
                        href={selectedPortfolio.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-white hover:bg-black/70 transition-colors duration-200"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">زيارة المشروع</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">وصف المشروع</h3>
                <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
                  {selectedPortfolio.description}
                </p>
              </div>



              {/* Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3">تاريخ الإنجاز</h3>
                  <p className="text-white/80 text-sm sm:text-base">
                    {formatDate(selectedPortfolio.createdAt)}
                  </p>
                </div>
              </div>
            </div>

              {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#18b5d8] via-[#1ab5d5] to-[#18b5d8]"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#18b5d8] via-[#1ab5d5] to-[#18b5d8]"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default Portfolio;