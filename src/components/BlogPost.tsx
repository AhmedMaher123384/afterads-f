import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ArrowLeft, Clock, Share2, Eye, X, Heart, Bookmark, MessageCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogService, buildImageUrl } from '../config/api';
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
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const response = await BlogService.getPostBySlug(postSlug);
      setPost(response);

      const all = await BlogService.getAllPosts({ limit: 24 });
      const postsList: BlogPost[] = all.posts || [];
      const byCategory = postsList.filter((p: BlogPost) => {
        if (p.slug === response.slug) return false;
        const a = new Set((response.categories || []).map((c: string) => c.toLowerCase()));
        const b = (p.categories || []).map(c => c.toLowerCase());
        return b.some(c => a.has(c));
      });
      const fallback = postsList.filter(p => p.slug !== response.slug);
      setRelated((byCategory.length > 0 ? byCategory : fallback).slice(0, 3));
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(t('blog.error_loading_post'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    }
  };

  if (loading) {
    return <LoadingSpinner message={t('blog.loading_post')} />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-100 mb-4">المقال غير موجود</h3>
          <p className="text-gray-300 mb-8">{error || 'لم نتمكن من العثور على المقال المطلوب'}</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
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

      <div className="min-h-screen bg-[#292929]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
          
          <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
            {/* Breadcrumb */}
            <Link to="/blog" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium mb-8 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              العودة للمدونة
            </Link>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((cat, i) => (
                <span key={i} className="px-4 py-2 bg-gray-800 text-indigo-400 rounded-full text-sm font-semibold shadow-md">
                  {cat}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-100 leading-tight mb-8">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-100">{post.author}</p>
                  <p className="text-sm text-gray-400">كاتب ومحرر</p>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-700"></div>

              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>{new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

               
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
           

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-gray-300 rounded-full font-semibold hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 mb-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl cursor-zoom-in" onClick={() => setZoomSrc(post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg)}>
            <img
              src={post.featuredImage ? buildImageUrl(post.featuredImage) : notfoundImg}
              alt={post.title}
              className="w-full h-[500px] object-cover"
              onError={e => {
                const t = e.target as HTMLImageElement;
                t.src = notfoundImg;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        </section>

        {/* Content with Sidebar Layout */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pb-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2 bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12">
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-100 prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg">
                {Array.isArray(post.content) ? (
                  <div className="space-y-8">
                    {(post.content as any[]).map((block: any, idx: number) => {
                      const hasImages = Array.isArray(block.images) && block.images.length > 0;
                      const isHorizontal = hasImages && block.images.every((img: any) => img.orientation === 'horizontal');
                      return (
                        <div key={idx} className="space-y-6">
                          {block.text && <div     className="text-white"
 dangerouslySetInnerHTML={{ __html: block.text }} />}
                          {hasImages && (
                            isHorizontal ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {block.images.map((img: any, i: number) => (
                                  <img
                                    key={i}
                                    src={buildImageUrl(img.url)}
                                    alt=""
                                    className="w-full h-64 object-cover rounded-2xl shadow-lg cursor-zoom-in hover:shadow-2xl transition-shadow"
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
                                    className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-lg cursor-zoom-in"
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
                  <RichTextDisplay content={post.content as any} className="prose-lg max-w-none" />
                ) : (
                  <p className="text-gray-400">محتوى المقال غير متاح حاليًا.</p>
                )}
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t-2 border-gray-700">
                <div className="flex flex-wrap gap-3">
                  <span className="text-gray-300 font-semibold">الوسوم:</span>
                  {post.categories.map((cat, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-700 text-indigo-400 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors cursor-pointer">
                      #{cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Card */}
              <div className="mt-12 p-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border border-gray-700">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-100 mb-2">{post.author}</h3>
                    <p className="text-gray-400 mb-4">كاتب ومحرر متخصص في المحتوى التقني والتسويق الرقمي</p>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md">
                        متابعة
                      </button>
                      <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-full font-semibold hover:bg-gray-600 transition-colors shadow-md">
                        المزيد من المقالات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar for Related Posts */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Related Posts */}
              {related.length > 0 && (
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl sticky top-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-gray-100">مقالات ذات صلة</h3>
                  </div>
                  <div className="space-y-4">
                    {related.map(item => (
                      <Link
                        key={item.id}
                        to={`/blog/${item.slug}`}
                        className="group block bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 transition-all duration-300 p-4"
                      >
                        <div className="relative h-32 overflow-hidden mb-3 rounded-lg">
                          <img
                            src={item.featuredImage ? buildImageUrl(item.featuredImage) : notfoundImg}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              const t = e.target as HTMLImageElement;
                              t.src = notfoundImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        <h4 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-1 mb-3">{item.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Sidebar Content if Needed */}
              {/* يمكن إضافة المزيد من العناصر هنا مثل الإعلانات أو الوسوم الشائعة */}
            </aside>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-3xl p-12 text-center shadow-xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              استمتعت بالمقال؟
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              اكتشف المزيد من المقالات المميزة في مدونتنا
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              تصفح جميع المقالات
            </Link>
          </div>
        </section>
      </div>

      {/* Zoom Modal */}
      {zoomSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setZoomSrc(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all"
            onClick={() => setZoomSrc(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={zoomSrc} alt="" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </>
  );
};

export default BlogPost;