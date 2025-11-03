import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Target, 
  Rocket, 
  Heart, 
  Star, 
  CheckCircle, 
  Users, 
  Zap, 
  TrendingUp, 
  Code, 
  Palette, 
  ShoppingCart,
  Award,
  Globe,
  Clock,
  ArrowRight,
  ArrowLeft,
  ThumbsUp
} from 'lucide-react';

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('vision');

  // Services data with translation keys
  const services = [
    {
      icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      title: t('about.services.digital_marketing.title'),
      description: t('about.services.digital_marketing.description')
    },
    {
      icon: <Code className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      title: t('about.services.web_development.title'),
      description: t('about.services.web_development.description')
    },
    {
      icon: <Palette className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      title: t('about.services.creative_design.title'),
      description: t('about.services.creative_design.description')
    },
    {
      icon: <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      title: t('about.services.ecommerce.title'),
      description: t('about.services.ecommerce.description')
    }
  ];

  // Stats data with translation keys
  const stats = [
    {
      icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      number: t('about.stats.projects.number'),
      label: t('about.stats.projects.label')
    },
    {
      icon: <ThumbsUp className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      number: t('about.stats.clients.number'),
      label: t('about.stats.clients.label')
    },
    {
      icon: <Clock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      number: t('about.stats.experience.number'),
      label: t('about.stats.experience.label')
    },
    {
      icon: <Globe className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      number: t('about.stats.countries.number'),
      label: t('about.stats.countries.label')
    }
  ];

  // Team data with translation keys
  const team = [
    {
      name: t('about.team.member1.name'),
      role: t('about.team.member1.role'),
      image: "/api/placeholder/150/150"
    },
    {
      name: t('about.team.member2.name'),
      role: t('about.team.member2.role'),
      image: "/api/placeholder/150/150"
    },
    {
      name: t('about.team.member3.name'),
      role: t('about.team.member3.role'),
      image: "/api/placeholder/150/150"
    }
  ];

  // Testimonials data with translation keys
  const testimonials = [
    {
      text: t('about.testimonials.testimonial1.text'),
      name: t('about.testimonials.testimonial1.name'),
      rating: 5
    },
    {
      text: t('about.testimonials.testimonial2.text'),
      name: t('about.testimonials.testimonial2.name'),
      rating: 5
    },
    {
      text: t('about.testimonials.testimonial3.text'),
      name: t('about.testimonials.testimonial3.name'),
      rating: 5
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7a7a7a]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#7a7a7a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7a7a7a]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#7a7a7a]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 hidden sm:block">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500 hover:rotate-180"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500 hover:rotate-180"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#7a7a7a] filter drop-shadow-[0_0_10px_rgba(122,122,122,0.8)] flex-shrink-0" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-[#18b5d5] via-[#7a7a7a] to-[#18b5d5] bg-clip-text text-transparent mobile-text-3xl ultra-mobile-text-2xl animate-fadeInUp">
              {t('about.title')}
            </h1>
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 hidden sm:block">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/30 blur-sm transform rotate-0 transition-all duration-500 hover:rotate-180"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/20 to-[#292929]/10 backdrop-blur-md border border-[#7a7a7a]/30 transform rotate-0 transition-all duration-500 hover:rotate-180"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#7a7a7a] filter drop-shadow-[0_0_10px_rgba(122,122,122,0.8)] flex-shrink-0" />
              </div>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed mobile-text-lg ultra-mobile-text-base animate-fadeInUp">
            {t('about.description')}
          </p>
        </div>

        {/* Services Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18b5d5] text-center mb-8 sm:mb-10 lg:mb-12 mobile-text-2xl ultra-mobile-text-xl animate-slideInRight">
            {t('about.services.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mobile-grid-cols-1">
            {services.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/20 to-[#292929]/90 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/10 p-4 sm:p-6 text-center hover:transform hover:scale-105 hover:shadow-2xl hover:border-[#7a7a7a]/50 transition-all duration-300 animate-scaleIn mobile-p-4 ultra-mobile-p-3 group">
                <div className="text-[#7a7a7a] mx-auto mb-3 sm:mb-4 flex justify-center group-hover:text-[#18b5d5] transition-colors duration-300">{service.icon}</div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3 mobile-text-base ultra-mobile-text-sm group-hover:text-[#18b5d5] transition-colors duration-300">{service.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mobile-text-sm ultra-mobile-text-xs">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8 mb-12 sm:mb-16 lg:mb-20 mobile-p-4 ultra-mobile-p-3 animate-fadeInUp hover:shadow-3xl transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] text-center mb-6 sm:mb-8 mobile-text-xl ultra-mobile-text-lg">
            {t('about.stats.title')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mobile-grid-cols-2">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scaleIn group hover:transform hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <div className="text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300">{stat.icon}</div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 mobile-text-2xl ultra-mobile-text-xl group-hover:text-[#18b5d5] transition-colors duration-300">{stat.number}</div>
                <div className="text-gray-100 font-medium text-xs sm:text-sm lg:text-base mobile-text-sm ultra-mobile-text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision/Mission/Values Tabs */}
        <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8 mb-12 sm:mb-16 lg:mb-20 mobile-p-4 ultra-mobile-p-3 animate-slideInRight hover:shadow-3xl transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <div className="lg:w-1/3">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { id: 'vision', title: t('about.tabs.vision'), icon: <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> },
                  { id: 'mission', title: t('about.tabs.mission'), icon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> },
                  { id: 'values', title: t('about.tabs.values'), icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-2 sm:gap-3 mobile-p-3 ultra-mobile-p-2 hover:transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white shadow-lg'
                        : 'text-gray-100 hover:bg-[#7a7a7a]/20'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-bold text-base sm:text-lg mobile-text-base ultra-mobile-text-sm">{tab.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="bg-[#292929]/50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mobile-p-4 ultra-mobile-p-3">
                {activeTab === 'vision' && (
                  <div className="animate-fadeInUp">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 mobile-text-xl ultra-mobile-text-lg">
                      {t('about.vision.title')}
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-100 leading-relaxed mb-4 sm:mb-6 mobile-text-base ultra-mobile-text-sm">
                      {t('about.vision.description1')}
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed mobile-text-sm ultra-mobile-text-xs">
                      {t('about.vision.description2')}
                    </p>
                  </div>
                )}
                {activeTab === 'mission' && (
                  <div className="animate-fadeInUp">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 mobile-text-xl ultra-mobile-text-lg">
                      {t('about.mission.title')}
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-100 leading-relaxed mb-4 sm:mb-6 mobile-text-base ultra-mobile-text-sm">
                      {t('about.mission.description')}
                    </p>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        t('about.mission.point1'),
                        t('about.mission.point2'),
                        t('about.mission.point3'),
                        t('about.mission.point4')
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3 animate-slideInRight group hover:transform hover:translateX-2 transition-transform duration-300">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300" />
                          <span className="text-sm sm:text-base lg:text-lg text-gray-200 mobile-text-sm ultra-mobile-text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'values' && (
                  <div className="animate-fadeInUp">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 mobile-text-xl ultra-mobile-text-lg">
                      {t('about.values.title')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mobile-grid-cols-1">
                      <div className="bg-[#7a7a7a]/10 rounded-lg p-4 sm:p-6 mobile-p-4 ultra-mobile-p-3 animate-scaleIn hover:bg-[#7a7a7a]/20 hover:transform hover:scale-105 transition-all duration-300 group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300" />
                          <h4 className="text-lg sm:text-xl font-bold text-white mobile-text-lg ultra-mobile-text-base">{t('about.values.creativity.title')}</h4>
                        </div>
                        <p className="text-gray-200 text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">{t('about.values.creativity.description')}</p>
                      </div>
                      <div className="bg-[#7a7a7a]/10 rounded-lg p-4 sm:p-6 mobile-p-4 ultra-mobile-p-3 animate-scaleIn hover:bg-[#7a7a7a]/20 hover:transform hover:scale-105 transition-all duration-300 group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300" />
                          <h4 className="text-lg sm:text-xl font-bold text-white mobile-text-lg ultra-mobile-text-base">{t('about.values.quality.title')}</h4>
                        </div>
                        <p className="text-gray-200 text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">{t('about.values.quality.description')}</p>
                      </div>
                      <div className="bg-[#7a7a7a]/10 rounded-lg p-4 sm:p-6 mobile-p-4 ultra-mobile-p-3 animate-scaleIn hover:bg-[#7a7a7a]/20 hover:transform hover:scale-105 transition-all duration-300 group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300" />
                          <h4 className="text-lg sm:text-xl font-bold text-white mobile-text-lg ultra-mobile-text-base">{t('about.values.collaboration.title')}</h4>
                        </div>
                        <p className="text-gray-200 text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">{t('about.values.collaboration.description')}</p>
                      </div>
                      <div className="bg-[#7a7a7a]/10 rounded-lg p-4 sm:p-6 mobile-p-4 ultra-mobile-p-3 animate-scaleIn hover:bg-[#7a7a7a]/20 hover:transform hover:scale-105 transition-all duration-300 group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#7a7a7a] flex-shrink-0 group-hover:text-[#18b5d5] transition-colors duration-300" />
                          <h4 className="text-lg sm:text-xl font-bold text-white mobile-text-lg ultra-mobile-text-base">{t('about.values.speed.title')}</h4>
                        </div>
                        <p className="text-gray-200 text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">{t('about.values.speed.description')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18b5d5] text-center mb-8 sm:mb-10 lg:mb-12 mobile-text-2xl ultra-mobile-text-xl animate-fadeInUp">
            {t('about.testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mobile-grid-cols-1">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/20 to-[#292929]/90 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/10 p-4 sm:p-6 mobile-p-4 ultra-mobile-p-3 animate-slideInRight hover:transform hover:scale-105 hover:shadow-2xl hover:border-[#7a7a7a]/50 transition-all duration-300 group">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current group-hover:text-yellow-300 transition-colors duration-300" />
                  ))}
                </div>
                <p className="text-gray-100 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs">{testimonial.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#7a7a7a]/20 via-[#292929]/90 to-[#7a7a7a]/20 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8 lg:p-12 text-center mobile-p-6 ultra-mobile-p-4 animate-fadeInUp hover:shadow-3xl transition-shadow duration-300">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18b5d5] mb-4 sm:mb-6 mobile-text-2xl ultra-mobile-text-xl">
            {t('about.cta.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed mobile-text-base ultra-mobile-text-sm">
            {t('about.cta.description')}
          </p>
    
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <div className="text-center animate-fadeInUp">
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs"
              >
                {t('about.cta.start_project')}
              </Link>
            </div>
            
            <div className="text-center animate-fadeInUp">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-sm sm:text-base mobile-text-sm ultra-mobile-text-xs"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                {t('about.cta.back_home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;