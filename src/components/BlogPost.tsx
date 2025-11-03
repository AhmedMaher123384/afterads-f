import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ArrowLeft, BookOpen, Clock, Share2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogService, buildImageUrl } from '../config/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const response = await BlogService.getPostBySlug(postSlug);
      console.log('Post content:', response.content); // Debug content
      setPost(response);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(t('blog.error_loading_post'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#3a3a3a] to-[#0f0f0f] opacity-85"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute font-mono text-base text-[#18b5d8]/50 animate-pulse" style={{ top: '8%', left: '8%' }}>
            &lt;Loading state=&quot;active&quot;&gt;
          </div>
          <div className="absolute font-mono text-base text-[#18b5d8]/50 animate-pulse" style={{ bottom: '12%', right: '12%', animationDelay: '800ms' }}>
            await post.fetch();
          </div>
        </div>
        <div className="text-center z-10">
          <div className="w-24 h-24 border-4 border-[#18b5d8] border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-[#18b5d8] text-xl font-semibold">{t('blog.loading_post')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#3a3a3a] to-[#0f0f0f] opacity-85"></div>
        <div className="text-center max-w-md mx-auto p-8 z-10">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/30 to-[#1ab5d5]/30 backdrop-blur-md border border-[#18b5d8]/40 rounded-full animate-pulse"></div>
            <BookOpen className="w-14 h-14 text-[#18b5d8] absolute inset-0 m-auto" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">{t('blog.post_not_found')}</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">{error || t('blog.post_not_found_description')}</p>

        </div>
      </div>
    );
  }

  const siteUrl = window.location.origin;
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.featuredImage ? buildImageUrl(post.featuredImage) : `${siteUrl}/images/default-blog.jpg`;
  const publishedDate = new Date(post.createdAt).toISOString();
  const modifiedDate = new Date(post.createdAt).toISOString();

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
        <meta property="og:site_name" content="مدونة AfterAds" />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        {post.categories.map((category, index) => (
          <meta key={index} property="article:tag" content={category} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.twitterTitle || post.ogTitle || post.metaTitle || post.title} />
        <meta name="twitter:description" content={post.twitterDescription || post.ogDescription || post.metaDescription || post.excerpt} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.metaTitle || post.title,
            "description": post.metaDescription || post.excerpt,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "AfterAds",
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/favi.ico`
              }
            },
            "datePublished": publishedDate,
            "dateModified": modifiedDate,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": postUrl
            },
            "keywords": post.categories.join(', '),
            "articleSection": post.categories[0] || 'عام',
            "url": postUrl
          })}
        </script>
      </Helmet>

      <section className="min-h-screen bg-[#0f0f0f] relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#3a3a3a] to-[#0f0f0f] opacity-85"></div>
          <div className="absolute inset-0 opacity-15">
            <div className="absolute font-mono text-sm text-[#18b5d8]/50 animate-pulse" style={{ top: '5%', left: '5%' }}>
              &lt;BlogPost title=&quot;{post.title}&quot;&gt;
            </div>
            <div className="absolute font-mono text-sm text-[#18b5d8]/50 animate-pulse" style={{ top: '15%', right: '10%', animationDelay: '500ms' }}>
              useEffect(() =&gt; fetchPost());
            </div>
            <div className="absolute font-mono text-sm text-[#18b5d8]/50 animate-pulse" style={{ bottom: '20%', left: '15%', animationDelay: '1000ms' }}>
              const [post, setPost] =
            </div>
            <div className="absolute font-mono text-sm text-[#18b5d8]/50 animate-pulse" style={{ bottom: '10%', right: '5%', animationDelay: '1500ms' }}>
              renderContent(post);
            </div>
          </div>
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#18b5d8]/30 to-transparent animate-pulse"></div>
            <div className="absolute bottom-1/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-[#1ab5d5]/30 to-transparent animate-pulse delay-1000"></div>
            <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#18b5d8]/30 to-transparent animate-pulse delay-500"></div>
          </div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-2 h-2 bg-[#18b5d8]/50 rounded-full animate-ping"></div>
            <div className="absolute bottom-32 right-40 w-1.5 h-1.5 bg-[#1ab5d5]/50 rounded-full animate-ping delay-1200"></div>
            <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-[#18b5d8]/70 rounded-full animate-ping delay-300"></div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-20 text-[#18b5d8]/50 font-mono text-base leading-6 animate-pulse">
              1<br/>0<br/>1<br/>0<br/>1
            </div>
            <div className="absolute bottom-0 right-20 text-[#18b5d8]/50 font-mono text-base leading-6 animate-pulse delay-500">
              0<br/>1<br/>0<br/>1<br/>0
            </div>
          </div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute text-[#18b5d8]/50 text-3xl animate-[float_6s_ease-in-out_infinite]" style={{ top: '10%', left: '10%' }}>
              <span role="img" aria-label="book">📚</span>
            </div>
            <div className="absolute text-[#1ab5d5]/50 text-3xl animate-[float_6s_ease-in-out_infinite]" style={{ bottom: '15%', right: '15%', animationDelay: '600ms' }}>
              <span role="img" aria-label="pen">✍️</span>
            </div>
            <div className="absolute text-[#18b5d8]/50 text-2xl animate-[glow_3s_ease-in-out_infinite]" style={{ top: '30%', left: '20%', animationDelay: '1200ms' }}>
              <span role="img" aria-label="sparkles">✨</span>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
              50% { transform: translateY(-10px) rotate(3deg) scale(1.05); }
            }
            @keyframes glow {
              0%, 100% { filter: drop-shadow(0 0 5px rgba(92, 255, 237, 0.3)); transform: scale(1); }
              50% { filter: drop-shadow(0 0 10px rgba(92, 255, 237, 0.7)); transform: scale(1.1); }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .parallax {
              transform: translateZ(0);
              will-change: transform;
            }
            .hover-grow:hover {
              transform: scale(1.05);
              transition: transform 0.3s ease-in-out;
            }
            .content-section {
              animation: fadeInUp 0.8s ease-out;
            }
            .content-section p, .content-section li, .content-section blockquote {
              animation: fadeInUp 1s ease-out;
              animation-delay: calc(var(--index) * 0.1s);
            }
            .underline-glow {
              position: relative;
              display: inline-block;
            }
            .underline-glow::after {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 0;
              right: 0;
              height: 2px;
              background-image: linear-gradient(to right, #18b5d8, #1ab5d5);
              transition: all 0.3s ease-in-out;
            }
            .underline-glow:hover::after {
              height: 4px;
              filter: drop-shadow(0 0 8px rgba(92, 255, 237, 0.7));
            }
            .content-hover:hover {
              background: rgba(92, 255, 237, 0.05);
              transform: scale(1.02);
              transition: all 0.3s ease-in-out;
            }
          `}
        </style>

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
      

          {/* Hero Section */}
          <div className="relative mt-16 sm:mt-24 mb-8 sm:mb-16">
            <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl parallax">
              <img
                src={post.featuredImage ? buildImageUrl(post.featuredImage) : '/images/default-blog.jpg'}
                alt={post.title}
                className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzVjZmZlZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINin2YTZhdmC2KfZhDwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/80 via-[#0f0f0f]/50 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#1ab5d5]/30 blur-md animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#1ab5d5]/20 backdrop-blur-sm border border-[#18b5d8]/40 rounded-full"></div>
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#18b5d8] absolute inset-0 m-auto" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6 drop-shadow-[0_4px_8px_rgba(92,255,237,0.5)] px-2">
                {post.title}
              </h1>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {post.categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-[#18b5d8]/30 to-[#1ab5d5]/30 backdrop-blur-sm border border-[#18b5d8]/40 rounded-full text-white text-xs sm:text-sm font-medium hover-grow"
                  >
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="relative max-w-4xl mx-auto bg-[#0f0f0f]/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-[#18b5d8]/20 content-section">
            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-[#18b5d8]/20 pb-4 sm:pb-6 content-section">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#18b5d8]/30 to-[#1ab5d5]/30 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-white">{post.author}</p>
                  <p className="text-[#18b5d8]/80 text-xs sm:text-sm">{t('blog.article_author')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                  <span className="text-white text-xs sm:text-sm">
                    {new Date(post.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d8]" />
                  <span className="text-white text-xs sm:text-sm">{t('blog.reading_time', { time: 5 })}</span>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="relative mb-8 sm:mb-12 p-4 sm:p-6 bg-gradient-to-r from-[#18b5d8]/10 to-[#1ab5d5]/10 rounded-xl sm:rounded-2xl border-r-4 border-[#18b5d8] hover-grow content-section">
                <p className="text-base sm:text-lg text-[#e6f7f9] leading-relaxed font-medium" style={{ textShadow: '0 0 5px rgba(92, 255, 237, 0.3)' }}>
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Main Content */}
            <article
              className="prose prose-lg max-w-none min-h-[400px] overflow-visible"
              style={{
                direction: 'rtl',
                textAlign: 'right',
                lineHeight: '2',
                visibility: 'visible',
                opacity: 1
              }}
            >
              <style>
                {`
                  .prose h2, .prose h3, .prose h4 {
                    color: #ffffff;
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                    position: relative;
                    display: inline-block;
                  }
                  .prose h2 {
                    font-size: 1.5rem;
                    padding-right: 0.75rem;
                    background-image: linear-gradient(to right, #18b5d8, #1ab5d5);
                    background-position: bottom;
                    background-size: 100% 3px;
                    background-repeat: no-repeat;
                    transition: background-size 0.3s ease-in-out;
                  }
                  @media (min-width: 640px) {
                    .prose h2 {
                      font-size: 1.875rem;
                      padding-right: 1rem;
                      background-size: 100% 4px;
                    }
                  }
                  .prose h2:hover {
                    background-size: 100% 6px;
                    filter: drop-shadow(0 0 8px rgba(92, 255, 237, 0.7));
                  }
                  .prose h3 {
                    font-size: 1.25rem;
                  }
                  .prose h4 {
                    font-size: 1.125rem;
                  }
                  @media (min-width: 640px) {
                    .prose h3 {
                      font-size: 1.5rem;
                    }
                    .prose h4 {
                      font-size: 1.25rem;
                    }
                  }
                  .prose p, .prose li {
                    color: #e6f7f9;
                    line-height: 1.8;
                    margin-bottom: 1.25rem;
                    font-size: 1rem;
                    text-shadow: 0 0 5px rgba(92, 255, 237, 0.3);
                    transition: all 0.3s ease-in-out;
                  }
                  @media (min-width: 640px) {
                    .prose p, .prose li {
                      line-height: 2;
                      margin-bottom: 1.5rem;
                      font-size: 1.125rem;
                    }
                  }
                  .prose p:hover, .prose li:hover {
                    background: rgba(92, 255, 237, 0.05);
                    transform: scale(1.02);
                  }
                  .prose a {
                    color: #18b5d8;
                    text-decoration: none;
                    font-weight: 500;
                  }
                  .prose a:hover {
                    text-decoration: underline;
                    text-decoration-color: #18b5d8;
                    text-decoration-thickness: 2px;
                    text-underline-offset: 4px;
                  }
                  .prose strong {
                    color: #ffffff;
                    font-weight: bold;
                  }
                  .prose blockquote {
                    border-right: 3px solid #18b5d8;
                    background: linear-gradient(to right, rgba(92, 255, 237, 0.1), rgba(26, 181, 213, 0.1));
                    border-radius: 0 8px 8px 0;
                    padding: 1rem;
                    margin: 1.5rem 0;
                    transition: all 0.3s ease-in-out;
                  }
                  @media (min-width: 640px) {
                    .prose blockquote {
                      border-right: 4px solid #18b5d8;
                      border-radius: 0 12px 12px 0;
                      padding: 1.5rem;
                      margin: 2rem 0;
                    }
                  }
                  .prose blockquote:hover {
                    border-right-color: #1ab5d5;
                    filter: drop-shadow(0 0 8px rgba(92, 255, 237, 0.5));
                  }
                  .prose ul {
                    margin-bottom: 1rem;
                    list-style-type: none;
                  }
                  .prose li {
                    position: relative;
                    padding-right: 1.5rem;
                  }
                  .prose li::before {
                    content: '•';
                    position: absolute;
                    right: 0;
                    color: #18b5d8;
                    font-size: 1.25rem;
                  }
                  .prose img {
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    margin: 1.5rem 0;
                    max-width: 100%;
                    height: auto;
                    transition: all 0.3s ease-in-out;
                  }
                  @media (min-width: 640px) {
                    .prose img {
                      border-radius: 12px;
                      margin: 2rem 0;
                    }
                  }
                  .prose img:hover {
                    filter: drop-shadow(0 0 12px rgba(92, 255, 237, 0.5));
                    transform: scale(1.03);
                  }
                `}
              </style>
              {post.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ '--index': 0 } as React.CSSProperties}
                />
              ) : (
                <p
                  className="text-[#e6f7f9] text-lg content-hover"
                  style={{ textShadow: '0 0 5px rgba(92, 255, 237, 0.3)', '--index': 0 } as React.CSSProperties}
                >
                  عذرًا، محتوى المقال غير متاح حاليًا. يرجى المحاولة لاحقًا أو التواصل مع الدعم.
                </p>
              )}
            </article>

            {/* Article Footer */}
            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-[#18b5d8]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 content-section">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#18b5d8]/30 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[#e6f7f9] text-xs sm:text-sm" style={{ textShadow: '0 0 5px rgba(92, 255, 237, 0.3)' }}>
                  تم النشر في {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#18b5d8] to-[#1ab5d5] text-white rounded-lg sm:rounded-xl hover:from-[#1ab5d5] hover:to-[#18b5d8] transition-all duration-300 font-semibold text-xs sm:text-sm hover-grow w-full sm:w-auto justify-center"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                {t('blog.share_article')}
              </button>
            </div>
          </div>

          {/* Back to Blog Button */}
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
      </section>
    </>
  );
};

export default BlogPost;