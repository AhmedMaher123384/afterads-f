import React, { useState, useEffect,memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Search, Grid, List, FolderOpen, X, ArrowUpDown } from 'lucide-react';
import GlobalFooter from './layout/GlobalFooter';
import { createCategorySlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  image: string;
  isActive?: boolean;
  createdAt?: string;
}

const AllCategories: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedAllCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedAllCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Helper function to get localized content
  const getLocalizedContent = (category: Category, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Category;
    const enField = `${field}_en` as keyof Category;
    
    if (currentLang === 'ar') {
      return (category[arField] as string) || (category[enField] as string) || category[field];
    } else {
      return (category[enField] as string) || (category[arField] as string) || category[field];
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [categories, searchTerm, sortBy]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      const filteredCategories = data.filter((category: Category) => category.name !== t('categories.themes'));
      setCategories(filteredCategories);
      localStorage.setItem('cachedAllCategories', JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error fetching categories:', error);
      smartToast.frontend.error(t('categories.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCategories = () => {
    let filtered = [...categories];
    if (searchTerm) {
      filtered = filtered.filter(category =>
        getLocalizedContent(category, 'name').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocalizedContent(category, 'description').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => getLocalizedContent(a, 'name').localeCompare(getLocalizedContent(b, 'name')));
        break;
      case 'name-desc':
        filtered.sort((a, b) => getLocalizedContent(b, 'name').localeCompare(getLocalizedContent(a, 'name')));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
    }
    setFilteredCategories(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value);

  const CategoryCard: React.FC<{ category: Category; viewMode: 'grid' | 'list' }> = ({ category, viewMode }) => {
    const categorySlug = createCategorySlug(category.id, getLocalizedContent(category, 'name'));

    if (viewMode === 'list') {
      return (
        <Link
          to={`/category/${categorySlug}`}
          className="block bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden"
          aria-label={t('common.categories.explore_category', { name: getLocalizedContent(category, 'name') })}
        >
          <div className="flex items-center p-6 gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm rounded-2xl group-hover:blur-md transition-all duration-500"></div>
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#7a7a7a]/30">
                <img
                  src={buildImageUrl(category.image)}
                  alt={getLocalizedContent(category, 'name')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#7a7a7a]/50 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#18b5d8] transition-colors duration-300">
                {getLocalizedContent(category, 'name')}
              </h3>
              <p className="text-gray-100 text-base leading-relaxed line-clamp-2">
                {getLocalizedContent(category, 'description') || t('categories.default_description')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 backdrop-blur-sm border border-[#7a7a7a]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowUpDown className="w-4 h-4 text-white transform -rotate-90" />
              </div>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        to={`/category/${categorySlug}`}
        className="block bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group overflow-hidden"
        aria-label={t('categories.explore_category', { name: getLocalizedContent(category, 'name') })}
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm rounded-3xl group-hover:blur-md transition-all duration-500"></div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
            <img
              src={buildImageUrl(category.image)}
              alt={getLocalizedContent(category, 'name')}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop';
              }}
            />
            <div className="absolute top-4 right-4 w-8 h-8 bg-[#7a7a7a]/50 rounded-full flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#292929]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className="relative p-6">
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#18b5d8] transition-colors duration-300">
              {getLocalizedContent(category, 'name')}
            </h3>
            <p className="text-gray-100 text-sm leading-relaxed line-clamp-5 mb-4">
              {getLocalizedContent(category, 'description') || t('categories.default_description')}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[#18b5d8] text-sm font-medium">{t('categories.explore_products')}</span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7a7a7a]/30 to-[#292929]/30 backdrop-blur-sm border border-[#7a7a7a]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowUpDown className="w-3 h-3 text-white transform -rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="min-h-screen bg-[#292929] relative overflow-hidden " dir="rtl">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#292929] via-[#4a4a4a] to-[#2a2a2a] opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '5%', left: '5%' }}>
            &lt;div className=&quot;categories&quot;&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '15%', right: '10%', animationDelay: '500ms' }}>
            function getCategories()
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '20%', left: '15%', animationDelay: '1000ms' }}>
            const [categories, setCategories] =
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '10%', right: '5%', animationDelay: '1500ms' }}>
            API.fetchCategories();
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '25%', left: '50%', animationDelay: '2000ms' }}>
            categories.map(category =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '35%', right: '20%', animationDelay: '2500ms' }}>
            useState(&#123; loading: false &#125;);
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '30%', left: '25%', animationDelay: '3000ms' }}>
            fetchData().then(res =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '50%', left: '30%', animationDelay: '3500ms' }}>
            renderUI(component);
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '15%', right: '15%', animationDelay: '4000ms' }}>
            &lt;RouterProvider /&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '60%', left: '20%', animationDelay: '4500ms' }}>
            const query = useQuery();
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ top: '10%', left: '70%', animationDelay: '5000ms' }}>
            useEffect(() =&gt;
          </div>
          <div className="absolute font-mono text-base text-[#7a7a7a] animate-pulse" style={{ bottom: '25%', right: '25%', animationDelay: '5500ms' }}>
            async function init()
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#4a4a4a]/40 to-transparent animate-pulse"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2a2a2a]/30 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#4a4a4a]/30 to-transparent animate-pulse delay-500"></div>
          <div className="absolute right-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#2a2a2a]/35 to-transparent animate-pulse delay-1500"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-[#4a4a4a]/70 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-[#2a2a2a]/80 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-[#4a4a4a]/60 rounded-full animate-ping delay-1200"></div>
          <div className="absolute bottom-60 right-20 w-1 h-1 bg-[#2a2a2a]/70 rounded-full animate-ping delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-[#4a4a4a]/90 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-80 right-1/4 w-1.5 h-1.5 bg-[#2a2a2a]/50 rounded-full animate-ping delay-1800"></div>
        </div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-10 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse">
            1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0
          </div>
          <div className="absolute top-0 left-32 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-500">
            0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1
          </div>
          <div className="absolute top-0 right-20 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1000">
            1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1<br/>0
          </div>
          <div className="absolute top-0 right-40 text-[#7a7a7a] font-mono text-base leading-6 animate-pulse delay-1500">
            0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1<br/>1<br/>0<br/>1
          </div>
        </div>
        <div className="absolute inset-0 opacity-35">
          <div className="absolute text-[#18b5d8]/50 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '5%', left: '5%' }}>
            <span role="img" aria-label="folder">📁</span>
          </div>
          <div className="absolute text-[#ffffff]/45 text-3xl animate-[float_7s_ease-in-out_infinite]" style={{ top: '15%', right: '10%', animationDelay: '600ms' }}>
            <span role="img" aria-label="category">🗂️</span>
          </div>
          <div className="absolute text-[#ffffff]/40 text-2xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '30%', right: '20%', animationDelay: '1200ms' }}>
            <span role="img" aria-label="organize">📋</span>
          </div>
          <div className="absolute text-[#18b5d8]/50 text-2xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '25%', right: '15%', animationDelay: '1800ms' }}>
            <span role="img" aria-label="collection">📚</span>
          </div>
          <div className="absolute text-[#7a7a7a]/45 text-3xl animate-[glow_3.5s_ease-in-out_infinite]" style={{ top: '25%', left: '20%', animationDelay: '2400ms' }}>
            <span role="img" aria-label="folder-open">📂</span>
          </div>
          <div className="absolute text-[#7a7a7a]/50 text-4xl animate-[float_7s_ease-in-out_infinite]" style={{ bottom: '35%', left: '25%', animationDelay: '3000ms' }}>
            <span role="img" aria-label="archive">🗃️</span>
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4a4a4a]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-[#4a4a4a]/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2000ms'}}></div>
          <div className="absolute top-2/3 left-2/3 w-28 h-28 bg-[#4a4a4a]/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
        </div>
        <div className="absolute inset-0 opacity-15 animate-pulse"
             style={{
               backgroundImage: `linear-gradient(rgba(74, 74, 74, 0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(74, 74, 74, 0.3) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg) scale(1);
            }
            50% {
              transform: translateY(-15px) rotate(5deg) scale(1.1);
            }
          }
          @keyframes glow {
            0%, 100% {
              filter: drop-shadow(0 0 5px rgba(122, 122, 122, 0.3));
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 10px rgba(122, 122, 122, 0.7));
              transform: scale(1.05);
            }
          }
        `}
      </style>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-[80px]">        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
                <FolderOpen className="w-6 h-6 text-[#18b5d8] filter drop-shadow-[0_0_10px_rgba(76,255,238,0.8)]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {t('categories.all_categories')} <span className="text-[#7a7a7a]">{t('categories.available')}</span>
            </h1>
            <div className="relative w-12 h-12">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
                <FolderOpen className="w-6 h-6 text-[#18b5d8] filter drop-shadow-[0_0_10px_rgba(76,255,238,0.8)]" />
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto px-4">
            {t('categories.subtitle')}
          </p>
        </div>

      

        {loading ? (
          <div className="text-center py-16 px-4">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-[#7a7a7a]/30 rounded-full animate-spin border-t-[#18b5d8]"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('categories.loading')}</h3>
            <p className="text-lg text-gray-100">{t('categories.loading_message')}</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 justify-items-center place-items-center' 
              : 'space-y-4 sm:space-y-6'
          } w-full max-w-7xl mx-auto`}>
            {filteredCategories.map(category => (
              <div key={category.id} className="w-full max-w-sm mx-auto flex justify-center">
                <CategoryCard category={category} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#7a7a7a]/15 to-transparent transform rotate-0 transition-all duration-700"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
                <FolderOpen className="w-10 h-10 text-[#18b5d8] filter drop-shadow-[0_0_10px_rgba(76,255,238,0.8)]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('categories.no_categories')}</h3>
            <p className="text-lg text-gray-100 mb-8 max-w-md mx-auto">
              {searchTerm
                ? t('categories.no_search_results')
                : t('categories.no_categories_available')}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#292929] text-white px-8 py-4 rounded-xl hover:from-[#292929] hover:to-[#7a7a7a] transition-all duration-300 font-bold text-lg backdrop-blur-sm border border-white/10 hover:scale-105 transform"
                aria-label={t('categories.clear_search_aria')}
              >
                <span>{t('categories.clear_search')}</span>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(AllCategories);