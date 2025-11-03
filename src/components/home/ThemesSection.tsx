import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShoppingCart, Star, Eye, Crown, Settings, Headphones, Store, Zap, CheckCircle, ArrowRight, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl } from '../../config/api';
import { addToCartUnified } from '../../utils/cartUtils';
import logo from '../../assets/themecover.webp';

interface Theme {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface ThemeCardProps {
  theme: Theme;
  viewMode: 'grid' | 'list';
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, viewMode }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-card-reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const handleAddToCart = () => {
    navigate(`/theme/${theme.id}`, { state: { scrollToPurchase: true } });
  };

  return (
    <div
      ref={cardRef}
      className="relative group max-w-7xl w-full opacity-0 will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-[#292929]/95 to-[#292929]/90 rounded-3xl backdrop-blur-xl border border-[#18b5d5]/20 shadow-2xl overflow-hidden transition-transform transition-shadow transition-border duration-300 hover:shadow-xl hover:border-[#18b5d5]/40 hover:-translate-y-1 will-change-transform neon-glow">

        {/* Minimalist Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-32 right-32 w-64 h-64 bg-[#18b5d5]/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 left-32 w-48 h-48 bg-[#18b5d5]/5 rounded-full blur-xl"></div>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden">
          <img
            src={logo}
            alt="ثيم ملاك المميز"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#292929]/80 via-[#292929]/20 to-transparent"></div>

          {/* Rating Badge */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 
                bg-[#ffffff]/10 backdrop-blur-md text-[#ffffff] 
                px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 
                rounded-md sm:rounded-lg md:rounded-xl 
                border border-[#ffffff]/20">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 mb-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5 text-[#18b5d5] fill-[#18b5d5]" />
              <span className="text-sm sm:text-base md:text-xl font-bold">5.0</span>
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm opacity-70">تقييم مثالي</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16">

          {/* Main Content Area */}
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">

            {/* Title Section */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold text-[#ffffff] leading-tight">
                {t('home.themes.enjoy_unlimited_features')}
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#ffffff]/80 font-light leading-relaxed max-w-3xl mx-auto">
                {t('home.themes.enjoy_unlimited_features')}
              </p>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#ffffff]/60 max-w-2xl mx-auto">
                {t('home.themes.most_advanced_theme')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-lg mx-auto">
              <button
                onClick={handleAddToCart}
                disabled={!theme.isAvailable}
                className="group bg-gradient-to-r from-[#18b5d5] to-[#292929] text-[#ffffff] px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl hover:from-[#292929] hover:to-[#18b5d5] disabled:opacity-50 transition-transform transition-shadow transition-border duration-300 font-semibold shadow-lg hover:shadow-md transform hover:scale-105 active:scale-95 will-change-transform text-xs sm:text-sm md:text-base"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('home.themes.add_to_cart')}
                </div>
              </button>

              <button
                onClick={() => navigate(`/theme/${theme.id}`)}
                className="group bg-[#292929]/50 backdrop-blur-md border border-[#ffffff]/50 text-[#ffffff] px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-[#292929]/70 hover:border-[#18b5d5]/40 transition-transform transition-shadow transition-border duration-300 font-semibold transform hover:scale-105 active:scale-95 will-change-transform text-xs sm:text-sm md:text-base"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('home.themes.live_preview')}
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200 will-change-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 pt-6 sm:pt-8 md:pt-12 lg:pt-16 border-t border-[#ffffff]/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">

              <div className="text-center group">
                <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-transform transition-shadow transition-border duration-300 will-change-transform">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-[#18b5d5]" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#ffffff] mb-1 sm:mb-2">25+</div>
                  <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.professional_elements')}</div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-transform transition-shadow transition-border duration-300 will-change-transform">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-[#ffffff]" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-1 sm:mb-2">250+</div>
                  <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.control_options')}</div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border border-[#18b5d5]/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10 transition-transform transition-shadow transition-border duration-300 will-change-transform">
                  <Headphones className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-[#18b5d5]" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#ffffff] mb-1 sm:mb-2">24/7</div>
                  <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.technical_support')}</div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border border-[#ffffff]/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:from-[#292929]/40 hover:to-[#292929]/30 transition-transform transition-shadow transition-border duration-300 will-change-transform">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-[#ffffff]" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-1 sm:mb-2">4000+</div>
                  <div className="text-[#ffffff]/60 text-xs sm:text-sm">{t('home.themes.active_store')}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Feature Line */}
          <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-[#ffffff] bg-[#292929]/30 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-[#ffffff]/30 max-w-4xl mx-auto">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#18b5d5] flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-medium text-center">
              {t('home.themes.platform_features')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ThemesSectionProps {
  themes: Theme[];
}

const ThemesSection: React.FC<ThemesSectionProps> = ({ themes }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  console.log('ThemesSection received themes:', themes);
  console.log('Number of themes:', themes.length);
  
  return (
    <section data-section="themes" className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-[#292929] to-[#292929] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(24,181,213,0.05)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(24,181,213,0.03)_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5]/15 to-[#292929]/15 border border-[#18b5d5]/20 text-[#ffffff] px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full mb-6 sm:mb-8 md:mb-12 backdrop-blur-lg">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5]" />
            <span className="font-semibold text-sm sm:text-base"> {t('home.themes.salla_themes')} </span>
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-[#ffffff] leading-tight mb-3 sm:mb-4 md:mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">
              {t('home.themes.malak_theme')}
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#ffffff] mb-4 sm:mb-6 md:mb-8 leading-tight">
            <span className="block mb-2 sm:mb-4">{t('home.themes.most_popular_theme')}</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#ffffff]/80 max-w-3xl mx-auto leading-relaxed font-light">
            {t('home.themes.malak_description')}
          </p>
        </div>

        {/* Theme Showcase */}
        <div className="space-y-10 sm:space-y-15 md:space-y-20">
          {themes.length > 0 ? (
            themes.map((theme) => (
              <div key={theme.id} className="flex justify-center">
                <ThemeCard
                  theme={theme}
                  viewMode="grid"
                />
              </div>
            ))
          ) : (
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-[#18b5d5]/10 to-[#0d8aa3]/5 border border-[#18b5d5]/20 rounded-3xl p-8 sm:p-12 md:p-16 max-w-4xl w-full backdrop-blur-lg">
                <div className="text-center">
                  <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-[#18b5d5] mx-auto mb-6" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#ffffff] mb-4">
                    {t('home.themes.coming_soon')}
                  </h3>
                  <p className="text-lg sm:text-xl text-[#ffffff]/80 mb-8">
                    {t('home.themes.coming_soon_description')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-[#18b5d5]/25 transition-all duration-300 transform hover:scale-105">
                      <span className="flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        {t('home.themes.subscribe_notification')}
                      </span>
                    </button>
                    <button className="border-2 border-[#18b5d5] text-[#18b5d5] px-8 py-4 rounded-full font-semibold hover:bg-[#18b5d5] hover:text-white transition-all duration-300">
                      {t('home.themes.learn_more')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 sm:mt-16 md:mt-24 lg:mt-32">
          <div className="bg-gradient-to-r from-[#292929]/50 to-[#292929]/30 backdrop-blur-lg border border-[#ffffff]/30 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 lg:p-16 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#ffffff] mb-2 sm:mb-3 md:mb-4 lg:mb-6">
              {t('home.themes.ready_to_develop')}
            </h3>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#ffffff]/80 mb-4 sm:mb-6 md:mb-8 lg:mb-10 font-light">
              {t('home.themes.join_successful_merchants')}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-[#18b5d5] font-semibold">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base text-center">{t('home.themes.guarantees')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes card-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes neonGlow {
          0% { box-shadow: 0 0 10px rgba(24, 181, 213, 0.3); }
          50% { box-shadow: 0 0 20px rgba(24, 181, 213, 0.6), 0 0 30px rgba(26, 181, 213, 0.4); }
          100% { box-shadow: 0 0 10px rgba(24, 181, 213, 0.3); }
        }
        .animate-card-reveal { 
          animation: card-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
        }
        .neon-glow {
          animation: neonGlow 2s ease-in-out infinite;
        }
        .will-change-transform { 
          will-change: transform; 
        }
      `}</style>
    </section>
  );
};

export default ThemesSection;