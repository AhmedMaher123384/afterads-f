import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { FileText, Calendar, Eye, ArrowLeft } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const StaticPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        let pages: StaticPage[] = [];
        
        // Try to fetch from API
        try {
          const response = await apiCall(API_ENDPOINTS.STATIC_PAGES);
          pages = Array.isArray(response) ? response : (response.data || []);
          console.log('✅ Fetched static pages from API:', pages.length);
        } catch (apiError) {
          console.warn('⚠️ API fetch failed, trying localStorage:', apiError);
          
          // Fallback to localStorage
          const savedPages = localStorage.getItem('staticPages');
          if (savedPages) {
            try {
              const parsedPages = JSON.parse(savedPages);
              if (Array.isArray(parsedPages)) {
                pages = parsedPages;
                console.log('📦 Using localStorage pages:', pages.length);
              }
            } catch (error) {
              console.error('Error parsing saved static pages:', error);
            }
          }
        }

        const foundPage = pages.find(p => p.slug === slug && p.isActive);
        
        if (foundPage) {
          setPage(foundPage);
          document.title = `${foundPage.title} - AfterAds`;
          if (foundPage.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', foundPage.metaDescription);
            }
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center px-3 sm:px-4" dir="rtl">
        <div className="text-center animate-fadeInUp">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#7a7a7a] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <div className="text-lg sm:text-xl text-white font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] relative overflow-hidden" dir="rtl">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .animate-pulse {
            animation: pulse 4s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.25;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.35;
            }
          }

          .animate-pulse-delay-1 {
            animation-delay: 1s;
          }

          .animate-pulse-delay-05 {
            animation-delay: 0.5s;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-fadeInUp, .animate-pulse {
              animation: none;
            }
          }

          /* Force all text within prose to be white */
          .prose-content * {
            color: #ffffff !important;
          }
        `}
      </style>

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(122, 122, 122, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 90% 80%, rgba(122, 122, 122, 0.2) 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
        }}></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-6 sm:top-10 left-6 sm:left-10 w-24 h-24 sm:w-40 sm:h-40 bg-[#7a7a7a]/15 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-12 sm:bottom-20 right-12 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 bg-[#7a7a7a]/15 rounded-full blur-2xl sm:blur-3xl animate-pulse animate-pulse-delay-1"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 sm:w-32 sm:h-32 bg-[#7a7a7a]/15 rounded-full blur-2xl sm:blur-3xl animate-pulse animate-pulse-delay-05"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16 mt-[70px] sm:mt-[80px]">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 flex-wrap justify-center">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-[#7a7a7a]/40 to-[#292929]/40 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/20 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#7a7a7a] filter drop-shadow-[0_0_12px_rgba(122,122,122,0.9)]" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center leading-tight">
              {page.title}
            </h1>
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 group hidden sm:block">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-[#7a7a7a]/40 to-[#292929]/40 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/20 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#7a7a7a] filter drop-shadow-[0_0_12px_rgba(122,122,122,0.9)]" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/15 p-3 sm:p-4 max-w-xs sm:max-w-sm md:max-w-2xl mx-auto animate-fadeInUp">
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a]" />
              <span className="text-sm sm:text-base text-white font-bold">آخر تحديث: {formatDate(page.updatedAt)}</span>
            </div>
            {page.updatedAt !== page.createdAt && (
              <div className="flex items-center gap-2 justify-center mt-2 flex-wrap">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a]" />
                <span className="text-sm sm:text-base text-white font-bold">تم الإنشاء: {formatDate(page.createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/15 shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12">
            {/* Featured Image */}
            {page.imageUrl && (
              <div className="mb-6 sm:mb-8 md:mb-10 animate-fadeInUp">
                <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] overflow-hidden rounded-xl sm:rounded-2xl border border-white/10">
                  <img
                    src={page.imageUrl}
                    alt={page.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="mb-8 sm:mb-10 md:mb-12 animate-fadeInUp">
              {page.metaDescription && (
                <div className="bg-[#7a7a7a]/15 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-7 md:mb-8 border border-white/10">
                  <p className="text-base sm:text-lg leading-relaxed text-[#18b5d5]">{page.metaDescription}</p>
                </div>
              )}
              <div
                className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-content prose-headings:text-white prose-p:text-white prose-li:text-white prose-strong:text-white prose-a:text-[#7a7a7a] prose-blockquote:text-white prose-code:text-white prose-pre:text-white"
                style={{
                  direction: 'rtl',
                  textAlign: 'right',
                  lineHeight: '1.8'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center animate-fadeInUp">
              <Link
                to="/"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPageView;