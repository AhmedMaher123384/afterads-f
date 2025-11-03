import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Quote, User, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildImageUrl } from '../../config/api';

interface Testimonial {
  id: number;
  name: string;
  position?: string;
  testimonial: string;
  image?: string;
  createdAt: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading?: boolean;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials, loading = false }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  const cardsPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  const currentTestimonials = testimonials.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage
  );

  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        setCurrentPage(0);
        setVisibleCards([]);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setVisibleCards([]);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setVisibleCards([]);
  };

  useEffect(() => {
    if (!sectionVisible) return;

    setTimeout(() => {
      currentTestimonials.forEach((testimonial, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, testimonial.id]);
        }, index * 200);
      });
    }, 150);
  }, [currentPage, sectionVisible]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // حالة التحميل
  if (loading) {
    return (
      <section ref={sectionRef} data-section="testimonials" className="py-12 md:py-20 bg-[#292929] relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="h-10 bg-[#18b5d8]/10 rounded-full w-48 mx-auto mb-6 animate-pulse"></div>
            <div className="h-8 bg-white/5 rounded w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/5 rounded w-80 mx-auto animate-pulse"></div>
          </div>
          <div className={`grid gap-4 sm:gap-6 md:gap-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          }`}>
            {[...Array(cardsPerPage)].map((_, index) => (
              <div key={index} className="bg-[#1e1e1e]/80 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 h-60 sm:h-64 md:h-72 animate-pulse border border-gray-700/20">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 sm:h-5 bg-white/10 rounded w-24 sm:w-32 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-white/10 rounded w-20 sm:w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-5/6"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <section ref={sectionRef} data-section="testimonials" className="py-12 md:py-20 bg-[#292929] relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#18b5d8]/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Quote className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#18b5d8]" />
            </div>
            <p className="text-lg sm:text-xl text-gray-400">{t('home.testimonials.no_testimonials')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      data-section="testimonials" 
      className="py-20 bg-[#292929] relative overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* العنوان */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-[#18b5d8]/10 border border-[#18b5d8]/20 text-[#18b5d8] px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold">{t('home.testimonials.title')}</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            تجارب <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">مميزة</span> من عملائنا
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('home.testimonials.subtitle')}{" "}
          </p>
        </div>

        {/* السلايدر مع التحكم */}
        <div className="relative flex items-center">
          {/* السهم الايمن */}
          {totalPages > 1 && (
            <button 
              onClick={handlePrev}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#0a0a0a]/95 to-[#1a1a1a]/95 backdrop-blur-2xl border border-[#18b5d8]/10 rounded-lg md:rounded-xl flex items-center justify-center hover:border-[#18b5d8]/40 hover:shadow-[0_0_20px_rgba(24,181,213,0.15)] transition-all duration-500 z-10 group hover:scale-110 flex-shrink-0 ml-2 sm:ml-4"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#18b5d8]/70 group-hover:text-[#18b5d8] transition-all duration-300 group-hover:scale-110" />
            </button>
          )}

          {/* شبكة الكروت */}
          <div className="flex-1">
            <div className={`grid gap-4 sm:gap-6 md:gap-8 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
            }`}>
              {currentTestimonials.map((testimonial, index) => ( 
                <div
                  key={testimonial.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className={`transform transition-all duration-700 ease-out ${
                    visibleCards.includes(testimonial.id)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="bg-[#1e1e1e]/95 backdrop-blur-lg border border-gray-700/20 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 h-full hover:border-[#18b5d8]/30 transition-all duration-300 group">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {testimonial.image ? (
                          <img
                            src={buildImageUrl(testimonial.image)}
                            alt={testimonial.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover border-2 border-[#18b5d8]/20 shadow-lg shadow-[#18b5d8]/10 group-hover:border-[#18b5d8]/60 group-hover:shadow-[#18b5d8]/20 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#18b5d8] via-[#0f8aa3] to-[#18b5d8] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-[#18b5d8]/20 group-hover:shadow-[#18b5d8]/40 transition-all duration-500">
                            <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-white text-lg sm:text-xl mb-1 group-hover:text-[#18b5d8]/90 transition-colors duration-300">{testimonial.name}</h3>
                          {testimonial.position && (
                            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">{testimonial.position}</p>
                          )}
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Quote className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#18b5d8]/15 group-hover:text-[#18b5d8]/30 transition-all duration-500 group-hover:scale-110" />
                    </div>

                    {/* نص الشهادة */}
                    <div className="mb-6 sm:mb-8 flex-1 relative">
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-[#18b5d8]/10 rounded-full"></div>
                      <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg font-light italic relative z-10">
                        "{testimonial.testimonial}"
                      </p>
                      <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#18b5d8]/5 rounded-full"></div>
                    </div>

                    {/* تاريخ الشهادة */}
                    <div className="relative">
                      <div className="h-px bg-gradient-to-r from-transparent via-[#18b5d8]/20 to-transparent mb-3 sm:mb-4"></div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#18b5d8]/30 rounded-full"></div>
                        <span className="font-medium">
                          {new Date(testimonial.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* السهم الايسر */}
          {totalPages > 1 && (
            <button 
              onClick={handleNext}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#0a0a0a]/95 to-[#1a1a1a]/95 backdrop-blur-2xl border border-[#18b5d8]/10 rounded-lg md:rounded-xl flex items-center justify-center hover:border-[#18b5d8]/40 hover:shadow-[0_0_20px_rgba(24,181,213,0.15)] transition-all duration-500 z-10 group hover:scale-110 flex-shrink-0 mr-2 sm:mr-4"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#18b5d8]/70 group-hover:text-[#18b5d8] transition-all duration-300 group-hover:scale-110" />
            </button>
          )}
        </div>

        {/* مؤشر الصفحات */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 sm:mt-12 md:mt-16 gap-2 sm:gap-3">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentPage(index);
                  setVisibleCards([]);
                }}
                className={`transition-all duration-500 ${
                  currentPage === index
                    ? 'w-10 h-3 bg-gradient-to-r from-[#18b5d8] to-[#0f8aa3] rounded-full shadow-lg shadow-[#18b5d8]/30'
                    : 'w-3 h-3 bg-gray-600/50 hover:bg-gray-500/60 rounded-full hover:scale-125'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;