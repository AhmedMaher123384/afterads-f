import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Search, ArrowRight, TrendingUp, Sparkles, Award, Clock, Eye, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogService, buildImageUrl } from '../config/api';
import LoadingSpinner from './ui/LoadingSpinner';
import faq from '../assets/blog.webp';
import notfoundImg from '../assets/search_not_found.png';

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
  const isRTL = i18n.language === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await BlogService.getAllPosts({ limit: 20 });
      const fetchedPosts = response.posts || [];
      const updatedPosts = fetchedPosts.map((post: BlogPost, index: number) => ({
        ...post,
        isPremium: index < 3,
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
    const matchesSearch = searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message={t('nav.loading')} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1>{t('blog.system_error')}</h1>
        <p>{error}</p>
        <button onClick={fetchPosts}>{t('blog.retry')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929] text-white">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t('blog.hero_title')} {t('blog.hero_highlight')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-2">{t('blog.hero_description')}</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder={t('blog.search_placeholder') || 'ابحث عن مقالات...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 pr-14 bg-gray-800 border-2 border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-900/30 transition-all duration-300 shadow-lg"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center sm:justify-start">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? t('blog.all_categories') : category}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-bold">{t('blog.latest_articles')}</h2>
              <span className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold">
                {filteredPosts.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 h-full flex flex-col group">
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-gray-700">
                      <img
                        src={post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg}
                        alt={post.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = notfoundImg;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {post.isPremium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {t('blog.premium_badge')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.map((cat, i) => (
                            <span
                              key={i}
                              className="text-xs bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-2">{t('blog.no_results_title')}</h3>
            <p className="text-gray-400">{t('blog.no_results_hint')}</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
        <div className="bg-[#2a2a2a] border-y border-[#3a3a3a] mt-16 py-12 px-4 sm:px-6 lg:px-8">
          <div className="  w-full mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold  mb-4">{t('blog.cta_title')}</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {t('blog.cta_subtitle')}
            </p>
         <a
  href="https://www.afterads.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-gradient-to-r from-indigo-600 to-purple-600 
             hover:from-indigo-700 hover:to-purple-700 
             px-6 py-2 rounded-full font-semibold 
             transition-all duration-300 hover:shadow-lg 
             hover:shadow-indigo-500/50 
             inline-flex items-center gap-2 
             mx-auto block w-fit"
>
  {t('blog.cta_button')}
  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
</a>

          </div>
      </div>
    </div>
  );
};

export default Blog;