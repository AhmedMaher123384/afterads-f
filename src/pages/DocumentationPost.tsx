import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, Menu, X, ChevronDown, Search, Filter, BookOpen, Layers, Home } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { useApiQuery } from '../hooks/useApiQuery';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Documentation {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
  classificationId?: string;
  content: any[];
  metadata?: {
    totalViews: number;
  };
}

interface Classification {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  order: number;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
  isActive: boolean;
  classifications: Classification[];
  documentations: Documentation[];
  metadata?: {
    totalViews: number;
    totalDocs: number;
    totalClassifications: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface MainClassification {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  color?: string;
  categories: Category[];
  isActive?: boolean;
  metadata?: {
    totalViews?: number;
    totalCategories?: number;
    totalDocs?: number;
  };
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

const DocumentationPost: React.FC = () => {
  const { categorySlug, docSlug } = useParams<{ categorySlug?: string; docSlug?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainClassifications, setMainClassifications] = useState<MainClassification[]>([]);
  const [selectedMainId, setSelectedMainId] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentDoc, setCurrentDoc] = useState<Documentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [expandedClassifications, setExpandedClassifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { data: structureResp, isLoading: structureLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.DOCUMENTATION_STRUCTURE, queryKey: ['documentation-structure'] });
  
  useEffect(() => {
    if (!structureResp) return;
    let mains: MainClassification[] = [];
    if (structureResp?.navigation && Array.isArray(structureResp.navigation)) {
      mains = structureResp.navigation;
    } else if (Array.isArray(structureResp)) {
      mains = structureResp;
    } else {
      setError(t('documentation.error_loading_data'));
      setCategoriesLoaded(true);
      return;
    }
    mains = mains.map(main => ({
      ...main,
      categories: Array.isArray(main.categories) ? main.categories.map(cat => ({
        ...cat,
        classifications: Array.isArray(cat.classifications) ? cat.classifications : [],
        documentations: Array.isArray(cat.documentations) ? cat.documentations : []
      })) : []
    }));
    setMainClassifications(mains);
    const allCategories: Category[] = [];
    mains.forEach(main => {
      if (Array.isArray(main.categories)) {
        main.categories.forEach(cat => {
          allCategories.push(cat);
        });
      }
    });
    setCategories(allCategories);
    setLoading(false);
    setCategoriesLoaded(true);
  }, [structureResp, t]);

  useEffect(() => {
    if (mainClassifications.length === 0) return;
    if (categorySlug) {
      const owningMain = mainClassifications.find(mc => (mc.categories || []).some(c => c.slug === categorySlug));
      if (owningMain) setSelectedMainId(owningMain.id);
    } else {
      setSelectedMainId(mainClassifications[0].id);
    }
  }, [mainClassifications, categorySlug]);

  // Fetch current category and doc
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!categorySlug) {
          const visibleCats = selectedMainId
            ? (mainClassifications.find(mc => mc.id === selectedMainId)?.categories || [])
            : categories;
          const firstCat = (visibleCats && visibleCats[0]) || (categories && categories[0]);
          if (firstCat) {
            navigate(`/documentation/${firstCat.slug}`, { replace: true });
            setLoading(false);
            return;
          }
          setError(t('documentation.no_categories'));
          setLoading(false);
          return;
        }

        let category = categories.find(cat => cat.slug === categorySlug);
        
        if (!category) {
          setError(t('documentation.category_not_found'));
          setLoading(false);
          return;
        }

        setCurrentCategory(category);

        if (docSlug) {
          const doc = category.documentations.find(d => d.slug === docSlug);
          if (doc) {
            setCurrentDoc(doc);
            if (doc.classificationId) {
              setExpandedClassifications(prev => new Set(prev).add(doc.classificationId!));
            }
          } else {
            setError(t('documentation.doc_not_found'));
          }
        } else {
          const firstDoc = category.documentations[0];
          if (firstDoc) {
            setCurrentDoc(firstDoc);
            if (firstDoc.classificationId) {
              setExpandedClassifications(prev => new Set(prev).add(firstDoc.classificationId!));
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || t('documentation.error_loading_content'));
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoriesLoaded && categories.length > 0) {
      fetchData();
    }
  }, [categorySlug, docSlug, categories, categoriesLoaded, selectedMainId, mainClassifications, navigate]);

  // Extract headings from content
  useEffect(() => {
    if (!currentDoc?.content) return;

    const extractedHeadings: HeadingItem[] = [];
    
    currentDoc.content.forEach((block: any, idx: number) => {
      if (block.text) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = block.text;
        
        const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingElements.forEach((heading, hIdx) => {
          const id = `heading-${idx}-${hIdx}`;
          const text = heading.textContent || '';
          const level = parseInt(heading.tagName.substring(1));
          
          heading.setAttribute('id', id);
          extractedHeadings.push({ id, text, level });
        });
        
        block.text = tempDiv.innerHTML;
      }
    });
    
    setHeadings(extractedHeadings);
  }, [currentDoc]);

  // Scroll spy for active heading
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveHeading(element.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setActiveHeading(id);
    }
  };

  const toggleClassification = (classificationId: string) => {
    setExpandedClassifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classificationId)) {
        newSet.delete(classificationId);
      } else {
        newSet.add(classificationId);
      }
      return newSet;
    });
  };

  // Group docs by classification
  const groupedDocs = currentCategory ? (() => {
    const withoutClassification: Documentation[] = [];
    const byClassification: { [key: string]: Documentation[] } = {};

    currentCategory.documentations.forEach(doc => {
      if (doc.classificationId) {
        if (!byClassification[doc.classificationId]) {
          byClassification[doc.classificationId] = [];
        }
        byClassification[doc.classificationId].push(doc);
      } else {
        withoutClassification.push(doc);
      }
    });

    return { withoutClassification, byClassification };
  })() : { withoutClassification: [], byClassification: {} };

  // Filter docs
  const filteredDocs = currentCategory ? currentCategory.documentations.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassification = selectedClassification === 'all' || doc.classificationId === selectedClassification;
    return matchesSearch && matchesClassification;
  }) : [];

  if (loading) {
    return <LoadingSpinner message={t('nav.loading')} />;
  }

  if (error || !currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e1e1e] via-[#242424] to-[#0f0f0f] flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <p className="text-xl text-red-400">{error || t('documentation.content_missing')}</p>
          <Link
            to="/documentation"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('documentation.return_to_docs')}
          </Link>
        </div>
      </div>
    );
  }

  const currentMain = mainClassifications.find(mc => mc.id === selectedMainId);
  const visibleCategories = currentMain?.categories || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e1e] via-[#242424] to-[#0f0f0f]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation Bar - Fixed at top */}
      <div className="border-b border-[#3a3a3a] sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Navigation Filters */}
            <div className="flex items-center gap-3 flex-1">
              {/* Main Classification Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMainDropdown(!showMainDropdown);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg transition-all duration-200 min-w-[140px] sm:min-w-[180px]"
                >
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span className={`font-medium flex-1 ${isRTL ? 'text-right' : 'text-left'} truncate text-xs sm:text-sm`}>
                    {currentMain?.title || t('documentation.select_main')}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMainDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showMainDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-[200px] sm:w-[280px] bg-[#292929] border border-[#3a3a3a] rounded-lg shadow-2xl overflow-hidden z-[80]">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {mainClassifications.map((main) => (
                        <button
                          key={main.id}
                          onClick={() => {
                            setSelectedMainId(main.id);
                            setShowMainDropdown(false);
                            const firstCat = (main.categories || [])[0];
                            if (firstCat) navigate(`/documentation/${firstCat.slug}`);
                          }}
                          className={`w-full text-right px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-[#2a2a2a] hover:text-white transition-colors duration-200 flex items-center gap-3 ${
                            selectedMainId === main.id ? 'bg-[#2a2a2a]' : ''
                          }`}
                        >
                          {main.icon && <span className="text-lg">{main.icon}</span>}
                          <div className="flex-1">
                            <p className="font-medium text-white text-xs sm:text-sm">
                              {main.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowMainDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg transition-all duration-200 min-w-[140px] sm:min-w-[200px]"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className={`font-medium flex-1 ${isRTL ? 'text-right' : 'text-left'} truncate text-xs sm:text-sm`}>
                    {currentCategory?.title || t('documentation.select_category')}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-[220px] sm:w-[300px] bg-[#292929] border border-[#3a3a3a] rounded-lg shadow-2xl overflow-hidden z-[80]">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {visibleCategories.length > 0 ? (
                        visibleCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/documentation/${cat.slug}`}
                            onClick={() => setShowCategoryDropdown(false)}
                            className={`block px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-[#2a2a2a] hover:text-white transition-colors duration-200 ${
                              cat.slug === categorySlug ? 'bg-[#2a2a2a]' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {cat.icon && <span className="text-lg">{cat.icon}</span>}
                              <div className="flex-1">
                                <p className="font-medium text-white text-xs sm:text-sm">
                                  {cat.title}
                                </p>
                                {cat.description && (
                                  <p className="text-xs sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{t('documentation.no_categories_available')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Home Button on Desktop */}
            <Link
              to="/"
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg transition-all duration-200"
            >
              <Home className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm">{t('nav.home')}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-white/80 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Right Sidebar - Advanced Filters (Mobile: Bottom, Desktop: Right) */}
          <aside className={`w-full lg:w-80 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4 sm:space-y-6">
              {/* Search Box */}
              <div className="rounded-lg p-4 sm:p-5 border border-[#3a3a3a] bg-[#2a2a2a]/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-white">{t('documentation.quick_search')}</h3>
                </div>
                <div className="relative border border-[#3a3a3a]">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('documentation.search_placeholder')}
                    className="w-full bg-[#2a2a2a] rounded-lg pr-10 pl-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t('documentation.results_count', { count: filteredDocs.length })}
                  </p>
                )}
              </div>

              {/* Classifications Filter */}
              <div className="rounded-lg p-4 sm:p-5 bg-[#2a2a2a]/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-white">{t('documentation.subclassifications')}</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedClassification('all')}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                      selectedClassification === 'all'
                        ? 'bg-[#2a2a2a] text-white font-medium'
                        : 'text-white/80 hover:text-white hover:bg-[#2a2a2a]/30'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedClassification === 'all' ? 'bg-white' : 'bg-gray-600'}`}></div>
                      {t('documentation.all_documents')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {currentCategory.documentations.length}
                    </span>
                  </button>
                  
                  {currentCategory.classifications.map((classification) => {
                    const count = groupedDocs.byClassification[classification.id]?.length || 0;
                    if (count === 0) return null;
                    
                    return (
                      <button
                        key={classification.id}
                        onClick={() => setSelectedClassification(classification.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                          selectedClassification === classification.id
                            ? 'bg-[#2a2a2a] text-white font-medium'
                            : 'text-white/80 hover:text-white hover:bg-[#2a2a2a]/30'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${selectedClassification === classification.id ? 'bg-white' : 'bg-gray-600'}`}></div>
                          {classification.icon && <span className="text-base">{classification.icon}</span>}
                          <span className="truncate">{classification.title}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Tree */}
              <div className="rounded-lg p-4 sm:p-5 bg-[#2a2a2a]/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-white">{t('documentation.contents')}</h3>
                </div>
                <nav className="space-y-1 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {groupedDocs.withoutClassification.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documentation/${categorySlug}/${doc.slug}`}
                      className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                        currentDoc?.id === doc.id
                          ? 'bg-[#2a2a2a] text-white font-medium'
                          : 'text-white/80 hover:text-white hover:bg-[#2a2a2a]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {doc.icon && <span className="text-base">{doc.icon}</span>}
                        <span className="flex-1 truncate">{doc.title}</span>
                      </div>
                    </Link>
                  ))}

                  {currentCategory.classifications.map((classification) => {
                    const docsInClassification = groupedDocs.byClassification[classification.id] || [];
                    if (docsInClassification.length === 0) return null;

                    const isExpanded = expandedClassifications.has(classification.id);

                    return (
                      <div key={classification.id} className="space-y-1">
                        <button
                          onClick={() => toggleClassification(classification.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-white/80 hover:text-white hover:bg-[#2a2a2a]/30 transition-all duration-200"
                        >
                          <span className="flex items-center gap-2">
                            {classification.icon && <span className="text-base">{classification.icon}</span>}
                            <span className="font-medium">{classification.title}</span>
                            <span className="text-xs text-gray-600">({docsInClassification.length})</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isExpanded && (
                          <div className={`${isRTL ? 'mr-4 border-r-2 pr-3' : 'ml-4 border-l-2 pl-3'} space-y-1 border-[#3a3a3a]`}>
                            {docsInClassification.map((doc) => (
                              <Link
                                key={doc.id}
                                to={`/documentation/${categorySlug}/${doc.slug}`}
                                className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                  currentDoc?.id === doc.id
                                    ? 'bg-[#2a2a2a] text-white font-medium'
                                    : 'text-white/80 hover:text-white hover:bg-[#2a2a2a]/30'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {doc.icon && <span className="text-sm">{doc.icon}</span>}
                                  <span className="flex-1 truncate">{doc.title}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
              
              {/* Home Button on Mobile */}
              <Link
                to="/"
                className="block lg:hidden w-full px-4 py-3 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg transition-all duration-200 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">{t('nav.home')}</span>
                </div>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentDoc ? (
              <article className="max-w-full">
                {/* Header */}
                <header className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center gap-3">
                    {currentDoc.icon && <span className="text-2xl sm:text-3xl">{currentDoc.icon}</span>}
                    {currentDoc.title}
                  </h1>
                  {currentDoc.description && (
                    <p className="text-base text-white/80">{currentDoc.description}</p>
                  )}
                </header>

                {/* Content */}
                {Array.isArray(currentDoc.content) && currentDoc.content.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {currentDoc.content.map((block: any, idx: number) => {
                      const hasImages = Array.isArray(block.images) && block.images.length > 0;
                      const imageCount = hasImages ? block.images.length : 0;
                      
                      return (
                        <div key={idx} className="space-y-6">
                          {block.text && (
                            <div 
                              className="prose prose-invert max-w-none
                                prose-headings:text-white prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                                prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg
                                prose-p:text-white/90 prose-p:leading-relaxed prose-p:mb-4
                                prose-a:text-[#18b5d8] prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-white
                                prose-code:text-[#18b5d8] prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded
                                prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-3 sm:prose-pre:p-4
                                prose-ul:text-white/90 prose-ol:text-white/90
                                prose-li:mb-2
                                prose-blockquote:border-r-4 prose-blockquote:border-[#18b5d8] prose-blockquote:pr-4 prose-blockquote:text-white/70
                                prose-img:rounded-lg text-white"
                              dangerouslySetInnerHTML={{ __html: block.text }} 
                            />
                          )}
                          
                          {hasImages && (
                            <div className={`${imageCount === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}`}>
                              {block.images.map((img: any, i: number) => (
                                <div 
                                  key={i} 
                                  className={`rounded-lg overflow-hidden cursor-zoom-in hover:border-[#4a4a4a] transition-all duration-200 ${
                                    imageCount === 1 ? 'max-w-full' : 'h-48 sm:h-64'
                                  }`}
                                  onClick={() => setZoomSrc(buildImageUrl(img.url))}
                                >
                                  <img
                                    src={buildImageUrl(img.url)}
                                    alt={img.alt || ''}
                                    className={`w-full h-full ${imageCount === 1 ? 'object-contain' : 'object-cover'}`}
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-white/70">{t('documentation.no_content')}</p>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex flex-col sm:flex-row items-center justify-between mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-[#3a3a3a] gap-4 sm:gap-0">
                  {(() => {
                    const allDocs = currentCategory.documentations.sort((a, b) => a.order - b.order);
                    const currentIndex = allDocs.findIndex(d => d.id === currentDoc.id);
                    const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
                    const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

                    return (
                      <>
                        <div className={`${isRTL ? 'sm:order-2' : ''}`}>
                          {prevDoc && (
                            <Link
                              to={`/documentation/${categorySlug}/${prevDoc.slug}`}
                              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all duration-200"
                            >
                              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                              <div className={isRTL ? 'text-right' : 'text-left'}>
                                <div className="text-xs mb-1">{t('nav.previous')}</div>
                                <div className="text-sm font-medium">{prevDoc.title}</div>
                              </div>
                            </Link>
                          )}
                        </div>
                        <div className="sm:hidden w-full border-t border-[#3a3a3a] my-2"></div>
                        <div className={`${isRTL ? 'sm:order-1' : ''}`}>
                          {nextDoc && (
                            <Link
                              to={`/documentation/${categorySlug}/${nextDoc.slug}`}
                              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all duration-200"
                            >
                              <div className={isRTL ? 'text-left' : 'text-right'}>
                                <div className="text-xs mb-1">{t('nav.next')}</div>
                                <div className="text-sm font-medium">{nextDoc.title}</div>
                              </div>
                              <ArrowLeft className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
                            </Link>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </nav>
              </article>
            ) : (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-white/70">{t('documentation.select_from_list')}</p>
              </div>
            )}
          </main>

          {/* Left Sidebar - TOC (Hidden on mobile, shown on desktop) */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="rounded-lg p-4 sm:p-5 border-[#3a3a3a] bg-[#2a2a2a]/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-white">{t('documentation.on_this_page')}</h3>
                </div>
                {headings.length > 0 ? (
                  <nav className="space-y-1 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {headings.map((heading) => (
                      <button
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`block w-full text-right px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                          activeHeading === heading.id
                            ? `text-white font-medium bg-[#2a2a2a] ${isRTL ? 'border-r-2' : 'border-l-2'} border-[#18b5d8]`
                            : 'text-white/80 hover:text-white hover:bg-[#2a2a2a]/30'
                        }`}
                        style={isRTL ? { paddingRight: `${(heading.level - 1) * 8 + 8}px` } : { paddingLeft: `${(heading.level - 1) * 8 + 8}px` }}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </nav>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">{t('documentation.no_headings')}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomSrc && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomSrc(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img 
              src={zoomSrc} 
              alt="" 
              className="max-w-full max-h-[95vh] rounded-lg object-contain" 
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomSrc(null);
              }}
              className="absolute top-4 left-4 hover:bg-[#2a2a2a] text-white p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(58, 58, 58, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 120, 0.7);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DocumentationPost;