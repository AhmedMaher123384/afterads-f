import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaTwitter, FaFacebookF, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { ArrowUp, ExternalLink, Award, Users, Zap, Mail, Phone, MapPin } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/logo.webp";
import salla from "../../assets/sallalogo.webp";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  showInFooter: boolean;
  createdAt: string;
}

const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchStaticPages();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStaticPages = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.STATIC_PAGES);
      if (data && Array.isArray(data)) {
        const footerPages = data.filter((page: StaticPage) => page.showInFooter);
        setStaticPages(footerPages);
      }
    } catch (error) {
      console.error('Error fetching static pages:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const importantLinks = [
    { to: "/about", label: t('footer.about_us') },
    { to: "/contact", label: t('footer.contact_us') },
    { to: "/privacy-policy", label: t('footer.privacy_policy') },
    { to: "/terms-and-conditions", label: t('footer.terms_conditions') },
  ];

  const quickLinks = [
    { name: t('footer.home'), to: "/" },
    { name: t('footer.our_work'), to: "/portfolio" },
    { name: t('footer.blog'), to: "/blog" },
    { name: t('footer.about_us'), to: "/about" },
  ];

  return (
    <>
      {/* Newsletter Section - Only show on home page */}
      {location.pathname === '/' && (
        <div className="bg-gradient-to-r from-[#18b5d5] via-[#16a8c4] to-[#1499b3] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white/80" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{t('footer.stay_connected')}</h3>
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white/80 animate-pulse" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto px-4">
                <input
                  type="email"
                  placeholder={t('footer.email_placeholder')}
                  className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:border-white/40 transition-all duration-300 text-sm sm:text-base"
                />
                <button 
                  onClick={() => {}}
                  className="px-6 sm:px-7 md:px-8 py-3 sm:py-4 bg-white text-[#18b5d5] font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
                >
                  {t('footer.subscribe_now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <footer className="relative bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#18b5d5] rounded-full opacity-40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-16 mb-12 sm:mb-14 md:mb-16">
              
              {/* Company Info */}
              <div className="sm:col-span-2 lg:col-span-1 text-center lg:text-right">
                <div className="lg:col-span-1 flex flex-col justify-start lg:items-start items-center mb-6 sm:mb-8">
                  <a href="/" className="inline-block mb-3 sm:mb-4">
                    <img
                      src={logo}
                      alt="AfterAds Logo"
                      className="w-28 sm:w-32 md:w-40 lg:w-48 h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-sm text-center lg:text-right px-4 lg:px-0">
                    {t('footer.company_description')}
                  </p>
                </div>

                {/* Social Media */}
                <div className="flex justify-center lg:justify-start gap-2 sm:gap-3 flex-wrap">
                  <a
                    href="https://www.instagram.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://wa.me/201069006131"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://x.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://www.facebook.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="mailto:info@afterads.com"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="tel:+201069006131"
                    className="group relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <FaPhone className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>

              {/* important Links & Services - جنب بعض في الموبايل */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
                {/* important Links */}
                <div className="text-center lg:text-right">
                  <h4 className="font-bold text-white mb-3 sm:mb-4 md:mb-6 text-sm sm:text-lg md:text-xl relative inline-block">
                    {t('footer.important_links')}
                    <div className="absolute -bottom-2 right-0 w-8 sm:w-12 h-1 bg-gradient-to-r from-[#18b5d5] to-transparent rounded-full"></div>
                  </h4>
                  <div className="space-y-1 sm:space-y-2 md:space-y-3">
                    {importantLinks.map((link, index) => (
                      <Link
                        key={index}
                        to={link.to}
                        className="block text-gray-300 hover:text-[#18b5d5] transition-all duration-300 text-xs sm:text-sm md:text-base py-1 sm:py-2 px-1 sm:px-3 md:px-4 rounded-md sm:rounded-lg hover:bg-[#18b5d5]/5 transform hover:translate-x-1 sm:hover:translate-x-2 group"
                      >
                        <span className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2">
                          {link.label}
                          <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </span>
                      </Link>
                    ))}
                    {staticPages.map((page, index) => (
                      <Link
                        key={index}
                        to={`/page/${page.slug}`}
                        className="block text-gray-300 hover:text-[#18b5d5] transition-all duration-300 text-xs sm:text-sm md:text-base py-1 sm:py-2 px-1 sm:px-3 md:px-4 rounded-md sm:rounded-lg hover:bg-[#18b5d5]/5 transform hover:translate-x-1 sm:hover:translate-x-2 group"
                      >
                        <span className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2">
                          {page.title}
                          <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* quickLinks */}
                <div className="text-center lg:text-right">
                  <h4 className="font-bold text-white mb-3 sm:mb-4 md:mb-6 text-sm sm:text-lg md:text-xl relative inline-block">
                    {t('footer.quick_links')}
                    <div className="absolute -bottom-2 right-0 w-8 sm:w-12 h-1 bg-gradient-to-r from-[#18b5d5] to-transparent rounded-full"></div>
                  </h4>
                  <div className="space-y-1 sm:space-y-2 md:space-y-3">
                    {quickLinks.map((service, index) => (
                      <Link
                        key={index}
                        to={service.to}
                        className="block text-gray-300 hover:text-[#18b5d5] transition-all duration-300 text-xs sm:text-sm md:text-base py-1 sm:py-2 px-1 sm:px-3 md:px-4 rounded-md sm:rounded-lg hover:bg-[#18b5d5]/5 transform hover:translate-x-1 sm:hover:translate-x-2 group"
                      >
                        <span className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2">
                          {service.name}
                          <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Partners */}
              <div className="sm:col-span-2 lg:col-span-1 text-center lg:text-right">
                <h4 className="font-bold text-white mb-6 text-xl relative inline-block">
                  {t('footer.contact_us')}
                  <div className="absolute -bottom-2 right-0 w-12 h-1 bg-gradient-to-r from-[#18b5d5] to-transparent rounded-full"></div>
                </h4>
                
                {/* Contact Info */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-gray-300 hover:text-[#18b5d5] transition-all duration-300 p-2 sm:p-3 rounded-lg hover:bg-[#18b5d5]/5 group">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs sm:text-sm">{t('footer.location')}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-gray-300 hover:text-[#18b5d5] transition-all duration-300 p-2 sm:p-3 rounded-lg hover:bg-[#18b5d5]/5 group">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs sm:text-sm" dir="ltr">01069006131</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-gray-300 hover:text-[#18b5d5] transition-all duration-300 p-2 sm:p-3 rounded-lg hover:bg-[#18b5d5]/5 group">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs sm:text-sm">info@afterads.com</span>
                  </div>
                </div>

                {/* Partners */}
                <div>
                  <h5 className="font-semibold text-white mb-3 sm:mb-4 text-base sm:text-lg">{t('footer.partners')}</h5>
                  <div className="flex justify-center lg:justify-start">
                    <a
                      href="https://salla.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#18b5d5]/5 border border-[#18b5d5]/20 hover:border-[#18b5d5]/40 transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={salla}
                        alt={t('footer.partners_salla')}
                        className="h-8 sm:h-10 md:h-12 object-contain"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-8 bg-[#1a1a1a]">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#18b5d5] rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-[#18b5d5] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-2 h-2 bg-[#18b5d5] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-[#18b5d5]/5 via-[#18b5d5]/10 to-[#18b5d5]/5 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-[#18b5d5]/20 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5]" />
                    <div className="text-center sm:text-right">
                      <p className="text-gray-300 text-sm sm:text-base md:text-lg font-medium">
                        {t('footer.copyright')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                    <span>{t('footer.tax_number')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button - Show on mobile, hide on desktop and ThemeDetail page */}
      {showScrollTop && !location.pathname.includes('/theme/') && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#18b5d5] to-[#16a8c4] text-white rounded-full shadow-2xl hover:shadow-[#18b5d5]/25 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group lg:hidden"
          aria-label={t('footer.scroll_to_top')}
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
        </button>
      )}

      <style>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-gentle-float {
          animation: gentle-float 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(24, 181, 213, 0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  );
};

export default GlobalFooter;