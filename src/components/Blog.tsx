import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Search, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogService, buildImageUrl } from '../config/api';
import faq from '../assets/blog.webp';

interface BlogPost {
  id: number;
  title: string;
  slug: string; 
  excerpt: string;
  featuredImage: string;
  author: string;
  categories: string[];
  createdAt: string;
  isPremium?: boolean;
}

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await BlogService.getAllPosts({ limit: 20 });
      const fetchedPosts = response.posts || [];
      console.log('Fetched posts:', fetchedPosts);
      const updatedPosts = fetchedPosts.map((post: BlogPost, index: number) => ({
        ...post,
        isPremium: index < 3 || Math.random() > 0.7
      }));
      setPosts(updatedPosts);
      const allCategories = updatedPosts.reduce((acc: string[], post: BlogPost) => {
        if (post.categories && post.categories.length > 0) {
          post.categories.forEach(category => {
            if (!acc.includes(category)) {
              acc.push(category);
            }
          });
        }
        return acc;
      }, []);
      setCategories(['all', ...allCategories]);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(t('blog.error_loading_posts'));
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || (post.categories && post.categories.includes(selectedCategory));
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.categories && post.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#404040] to-[#292929] opacity-85"></div>
        <div className="text-center max-w-md mx-auto p-8 z-10">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/30 to-[#1ab5d5]/30 backdrop-blur-md border border-[#18b5d8]/40 rounded-full animate-pulse"></div>
            <BookOpen className="w-14 h-14 text-[#18b5d8] absolute inset-0 m-auto" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">{t('blog.system_error')}</h3>
          <p className="text-[#e0e0e0] mb-8 leading-relaxed">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-10 py-4 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white rounded-xl hover:from-[#1ab5d5] hover:to-[#18b5d8] transition-all duration-500 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            {t('blog.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929] relative overflow-hidden pt-16" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#404040] to-[#292929] opacity-85"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute font-mono text-xs text-[#18b5d8]/40 animate-pulse" style={{ top: '5%', left: '5%' }}>
            &lt;Blog posts=&quot;{posts.length}&quot;&gt;
          </div>
          <div className="absolute font-mono text-xs text-[#18b5d8]/40 animate-pulse" style={{ top: '10%', right: '5%', animationDelay: '500ms' }}>
            useEffect(() =&gt; fetchPosts());
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
      `}</style>

      {/* Hero Section - Unified Container with Text and Image */}
      <div className="relative pt-24 pb-20 z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 shadow-[0_12px_40px_rgba(31,38,135,0.2)] neon-glow overflow-hidden">
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/[0.02] via-transparent to-[#18b5d8]/[0.03] rounded-[23px] pointer-events-none"></div>
          <div className="relative flex flex-col lg:flex-row items-center gap-8 z-10">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl font-light text-white/95 mb-4 tracking-wide">
                <span className="block font-extralight text-white/80 mb-2">
                  {t('blog.hero_title')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">{t('blog.hero_highlight')}</span>

                </span>
              </h1>
              <p className="text-lg text-white/70 font-light mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {t('blog.hero_description')}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {[t('blog.tag_technology'), t('blog.tag_ecommerce'), t('blog.tag_digital_marketing')].map((item, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-full text-sm text-white/80 font-light shadow-lg hover:bg-white/[0.08] transition-all duration-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Image Section */}
            <div className="flex-1 max-w-md">
              <img
                src={faq}
                alt="مدونة المستقبل"
                className="w-full h-80 object-cover rounded-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
          </div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#18b5d8]/[0.03] to-transparent rounded-br-3xl"></div>
          <div className="absolute inset-0 bg-gradient-radial from-[#18b5d8]/[0.02] via-transparent to-transparent rounded-3xl -z-10"></div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8 sm:mb-12 z-10 relative">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_12px_40px_rgba(31,38,135,0.2)]">
          <div className="space-y-4 sm:space-y-6">
            {/* Search Bar - Full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('blog.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 sm:p-4 pr-10 sm:pr-12 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-lg sm:rounded-xl text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#18b5d8]/50 focus:ring-2 focus:ring-[#18b5d8]/20 transition-all duration-300 text-sm sm:text-base"
                />
                <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
              </div>
            </div>

            {/* Category Filters - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 text-center ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white shadow-lg'
                      : 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.08]'
                  }`}
                >
                  {category === 'all' ? t('blog.all_categories') : category}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="pt-3 sm:pt-4 border-t border-white/[0.06]">
              <div className="text-white/70 text-sm sm:text-base">
                <span className="font-semibold text-[#18b5d8]">{filteredPosts.length}</span> {t('blog.articles_available')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-24 z-10 relative">
        {/* All Posts Section */}
        <div className="mb-12">
          <div className="relative mb-12 text-center">
            <h2 className="text-4xl font-black text-[#18b5d8] tracking-wider uppercase relative z-10">
              {t('blog.articles_title')}
            </h2>
            <div className="absolute -inset-4 bg-gradient-to-r from-[#18b5d8]/10 via-[#1ab5d5]/10 to-[#18b5d8]/10 rounded-2xl blur-xl"></div>
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#18b5d8] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="group relative content-card card-hover"
                style={{ '--index': index } as React.CSSProperties}
              >
                <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(31,38,135,0.2)] neon-glow transition-all duration-500">
                  <div className="absolute inset-[1px] bg-gradient-to-br from-white/[0.02] via-transparent to-[#18b5d8]/[0.03] rounded-[23px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden">
                    <img
                      src={post.featuredImage ? buildImageUrl(post.featuredImage) : '/images/default-blog.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter group-hover:brightness-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/15 via-transparent to-[#1ab5d5]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {post.categories && post.categories.length > 0 && (
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 transform group-hover:-translate-y-1 transition-all duration-300">
                        <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full text-white/90 text-xs font-medium shadow-lg">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-[#18b5d8] rounded-full opacity-80"></div>
                            {post.categories[0]}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] text-white/95 rounded-lg sm:rounded-xl font-medium shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-white/[0.16] text-sm sm:text-base"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{t('blog.read_article')}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="relative p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white/95 mb-2 sm:mb-3 leading-tight group-hover:text-[#18b5d8]/90 transition-colors duration-300">
                      <Link to={`/blog/${post.slug}`} className="relative inline-block">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-6 h-6 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-3 h-3 text-white/80" />
                          </div>
                        </div>
                        <span className="text-white/70 text-xs sm:text-sm font-medium group-hover:text-[#18b5d8]/80 transition-colors duration-300">
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-white/60 group-hover:text-white/70 transition-colors duration-300">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs hidden sm:inline">
                          {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    {post.isPremium && (
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white rounded-lg sm:rounded-xl hover:from-[#1ab5d5] hover:to-[#18b5d8] transition-all duration-300 font-medium text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {t('blog.read_now')}
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                      </Link>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/[0.02] to-transparent rounded-tl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#18b5d8]/[0.03] to-transparent rounded-br-3xl"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-radial from-[#18b5d8]/[0.02] via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Placeholder */}
        <div className="text-center mt-12 sm:mt-16 content-section px-4">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl hover:from-[#1ab5d5] hover:to-[#18b5d8] transition-all duration-500 shadow-2xl hover:shadow-3xl hover:-translate-y-1 group w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4 group-hover:-translate-x-2 transition-transform duration-300" />
              {t('blog.explore_other_articles')}
            </Link>
          </div>
      </div>
    </div>
  );
};

export default Blog;