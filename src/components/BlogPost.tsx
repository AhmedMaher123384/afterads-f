import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ArrowLeft, Share2, Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogService, buildImageUrl, API_ENDPOINTS } from '../config/api';
import { useApiQuery } from '../hooks/useApiQuery';
import LoadingSpinner from './ui/LoadingSpinner';
import RichTextDisplay from './ui/RichTextDisplay';
import notfoundImg from '../assets/search_not_found.png';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featuredImage: string;
  author: string;
  categories: string[];
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

const BlogPost: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const { data: postResp, isLoading: postLoading, error: postError } = useApiQuery<any>({ 
    endpoint: API_ENDPOINTS.BLOG_POST_BY_SLUG(slug), 
    queryKey: ['blog-post', slug], 
    enabled: !!slug 
  });
  const { data: postsResp } = useApiQuery<any>({ 
    endpoint: `${API_ENDPOINTS.BLOG_POSTS}?limit=24`, 
    queryKey: ['blog-posts', 24] 
  });

  useEffect(() => {
    if (!postResp) return;
    const fetchedPost = (postResp as any).post || postResp;
    setPost(fetchedPost);
  }, [postResp]);

  useEffect(() => {
    if (!postsResp || !post) return;
    const postsList: BlogPost[] = postsResp?.posts || postsResp?.data || postsResp || [];
    const byCategory = postsList.filter((p: BlogPost) => {
      if (p.slug === post.slug) return false;
      const a = new Set((post.categories || []).map((c: string) => c.toLowerCase()));
      const b = (p.categories || []).map(c => c.toLowerCase());
      return b.some(c => a.has(c));
    });
    const fallback = postsList.filter(p => p.slug !== post.slug);
    setRelated((byCategory.length > 0 ? byCategory : fallback).slice(0, 5));
  }, [postsResp, post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    }
  };

  if (postLoading) {
    return <LoadingSpinner message={t('blog.loading_post')} />;
  }

  if (error || postError || !post) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">المقال غير موجود</h3>
          <p className="text-gray-300 mb-8">{error || 'لم نتمكن من العثور على المقال المطلوب'}</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-3 bg-[#18b5d5] text-white rounded-lg hover:bg-[#18b5d5]/80 transition-all duration-300 font-semibold shadow-lg"
          >
            {isRTL ? <ArrowLeft className="w-5 h-5 ml-2" /> : <ArrowLeft className="w-5 h-5 mr-2" />}
            العودة للمدونة
          </Link>
        </div>
      </div>
    );
  }

  const siteUrl = window.location.origin;
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg;
  const publishedDate = new Date(post.createdAt).toISOString();

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title} | مدونة AfterAds</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.keywords || post.categories.join(', ')} />
        <meta name="author" content={post.author} />
        <link rel="canonical" href={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.ogTitle || post.metaTitle || post.title} />
        <meta property="og:description" content={post.ogDescription || post.metaDescription || post.excerpt} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={postUrl} />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={publishedDate} />
      </Helmet>

      <div className="min-h-screen bg-[#292929]" dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Main Content Grid */}
        <section className="pt-20 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
              
              {/* Sidebar - Left Side (شمال) */}
              <aside className={`lg:col-span-1 ${isRTL ? 'lg:col-start-4' : ''}`}>
                {/* Back Button */}
                <div className="mb-6">
                  <Link 
                    to="/blog" 
                    className="w-full inline-flex items-center justify-center gap-2 text-[#18b5d5] hover:text-[#18b5d5]/80 font-semibold py-3 px-4 bg-[#1f1f1f]/50 border border-[#18b5d5]/20 rounded-lg hover:border-[#18b5d5]/40 transition-all group"
                  >
                    {isRTL ? (
                      <>
                        <span className="text-sm">العودة</span>
                        <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">العودة</span>
                      </>
                    )}
                  </Link>
                </div>

                {/* Related Posts */}
                {related.length > 0 && (
                  <div className="  rounded-xl p-4 sticky top-20">
                    <h3 className="text-lg font-bold text-white mb-4">مقالات ذات صلة</h3>
                    <div className="space-y-3">
                      {related.map(item => (
                        <Link
                          key={item.id}
                          to={`/blog/${item.slug}`}
                          className="group block hover:translate-x-1 transition-transform"
                        >
                          <div className="relative h-24 overflow-hidden rounded-lg mb-2">
                            <img
                              src={item.featuredImage ? buildImageUrl(item.featuredImage) : notfoundImg}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={e => {
                                const t = e.target as HTMLImageElement;
                                t.src = notfoundImg;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          </div>
                          <h4 className="text-xs font-semibold text-white group-hover:text-[#18b5d5] transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Main Article - Right Side (يمين) */}
              <article className={`lg:col-span-3 ${isRTL ? 'lg:col-start-1' : ''}`}>
                
                {/* Header Info */}
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                    {post.title}
                  </h1>

                  {/* Meta Info - Single Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-[#18b5d5]" />
                      <span className="font-medium">{post.author}</span>
                    </div>

                    <div className="h-4 w-px bg-gray-600"></div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-[#18b5d5]" />
                      <span>{new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <div className="h-4 w-px bg-gray-600"></div>

                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-[#18b5d5]/20 text-[#18b5d5] rounded-full text-xs font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleShare}
                      className="ml-auto text-[#18b5d5] hover:text-[#18b5d5]/80 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Featured Image */}
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-xl cursor-zoom-in group mb-8"
                  onClick={() => setZoomSrc(post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg)}
                >
                  <img
                    src={post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg}
                    alt={post.title}
                    className="w-full h-[350px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      const t = e.target as HTMLImageElement;
                      t.src = notfoundImg;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Article Content */}
                <div className="bg-[#1f1f1f] border border-[#18b5d5]/20 rounded-2xl shadow-xl p-8 md:p-12">
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 pb-8 border-b border-[#18b5d5]/20">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Main Content */}
                  <div className="space-y-8">
                    {Array.isArray(post.content) ? (
                      <div className="space-y-8">
                        {(post.content as any[]).map((block: any, idx: number) => {
                          const hasImages = Array.isArray(block.images) && block.images.length > 0;
                          const isHorizontal = hasImages && block.images.every((img: any) => img.orientation === 'horizontal');
                          return (
                            <div key={idx} className="space-y-6">
                              {block.text && (
                                <div 
                                  className="text-white/90 leading-relaxed text-base md:text-lg"
                                  dangerouslySetInnerHTML={{ __html: block.text }} 
                                />
                              )}
                              {hasImages && (
                                isHorizontal ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {block.images.map((img: any, i: number) => (
                                      <img
                                        key={i}
                                        src={buildImageUrl(img.url)}
                                        alt=""
                                        className="w-full h-56 md:h-64 object-cover rounded-lg cursor-zoom-in hover:shadow-lg transition-shadow"
                                        loading="lazy"
                                        onError={e => { const t = e.target as HTMLImageElement; t.src = notfoundImg; }}
                                        onClick={() => setZoomSrc(buildImageUrl(img.url))}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-6 items-center">
                                    {block.images.map((img: any, i: number) => (
                                      <img
                                        key={i}
                                        src={buildImageUrl(img.url)}
                                        alt=""
                                        className="max-w-full max-h-[500px] object-contain rounded-lg cursor-zoom-in shadow-lg"
                                        loading="lazy"
                                        onError={e => { const t = e.target as HTMLImageElement; t.src = notfoundImg; }}
                                        onClick={() => setZoomSrc(buildImageUrl(img.url))}
                                      />
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : post.content ? (
                      <RichTextDisplay content={post.content as any} />
                    ) : (
                      <p className="text-gray-400">محتوى المقال غير متاح حاليًا.</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="mt-12 pt-8 border-t border-[#18b5d5]/20">
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((cat, i) => (
                        <span key={i} className="px-4 py-2 bg-[#18b5d5]/10 text-[#18b5d5] rounded-lg text-sm font-medium hover:bg-[#18b5d5]/20 transition-colors cursor-pointer">
                          #{cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Author Card */}
                  <div className="mt-12 p-6 md:p-8 bg-[#18b5d5]/10 border border-[#18b5d5]/20 rounded-xl">
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#18b5d5] to-[#0a8fa3] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{post.author}</h3>
                        <p className="text-sm text-gray-300">كاتب ومحرر محتوى متخصص</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-[#18b5d5]/20 to-transparent border border-[#18b5d5]/30 rounded-2xl p-8 md:p-12 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    استمتعت بالمقال؟
                  </h2>
                  <p className="text-gray-300 mb-6">
                    اكتشف المزيد من المقالات المميزة في مدونتنا
                  </p>
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#18b5d5] text-white rounded-lg hover:bg-[#18b5d5]/80 transition-all duration-300 font-semibold shadow-lg"
                  >
                    تصفح جميع المقالات
                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5 rotate-180" />}
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>

      {/* Zoom Modal */}
      {zoomSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomSrc(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all"
            onClick={() => setZoomSrc(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={zoomSrc} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  );
};

export default BlogPost;