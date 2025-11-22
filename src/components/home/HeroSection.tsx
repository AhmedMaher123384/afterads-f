import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero from '../../assets/her.mp4';
import heroImage from '../../assets/hero.webp';
import malakImage from '../../assets/malak-removebg-preview.png';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden pt-28">
      {/* Banner في أعلى الهيرو سيكشن */}
      
      {/* Background Placeholder Image */}
      <div 
        className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-500 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* فيديو الهيرو يغطي السيكشن بالكامل */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        src={hero}
        onLoadedData={() => setVideoLoaded(true)}
        onCanPlay={() => setVideoLoaded(true)}
      />

      {/* طبقة overlay متدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>

      {/* طبقة ضوء ديناميكي */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#18b5d5]/5 to-transparent"></div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full text-center px-8 space-y-5">

      {/* صورة مالك */}
        <div className="relative">
          <img 
            src={malakImage} 
            alt="Malak"
className="w-24 sm:w-32 lg:w-40 h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
          />
          {/* تأثير توهج خلف الصورة */}
          <div className="absolute inset-0 bg-[#18b5d5]/20 blur-3xl -z-10 animate-pulse"></div>
        </div>

        {/* الجملة العربية مع تأثير الشفافية */}
        <div className="relative">
          <p className="text-xl sm:text-2xl lg:text-2xl font-light leading-relaxed max-w-md drop-shadow-lg opacity-90 relative"
             style={{
               WebkitTextStroke: '2px white',
               WebkitTextFillColor: 'transparent',
               color: 'transparent',
               fontWeight: '600'
             }}>
            {t('home.hero.subtitle')}
          </p>
          
          {/* طبقة خلفية للنص لضمان الوضوح */}
          <div className="absolute inset-0 blur-[1px] opacity-50"
               style={{
                 WebkitTextStroke: ' white',
                 color: 'transparent',
                 fontWeight: '100'
               }}>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light leading-relaxed max-w-2xl">
              {t('home.hero.subtitle')}
            </p>
          </div>
        </div>

        <div className="relative group flex  gap-2">
         <button
  onClick={() => {
    const section = document.querySelector('[data-section="themes"]'); // سكشن من نحن
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className="relative px-10 py-4 bg-transparent border-2 border-white/30 text-white font-medium text-lg rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-700 ease-out
  hover:border-[#18b5d5] hover:bg-[#18b5d5]/90 hover:shadow-[0_0_40px_rgba(24,181,213,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 hover:-translate-y-2 active:scale-105 group"
>
  <span className="relative z-10">
    {t('home.hero.theme_showcase')}
  </span>
</button>

        <button
  onClick={() => {
    const section = document.querySelector('[data-section="services"]');
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className="relative px-10 py-4 bg-transparent border-2 border-white/30 text-white font-medium text-lg rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-700 ease-out
  hover:border-[#18b5d5] hover:bg-[#18b5d5]/90 hover:shadow-[0_0_40px_rgba(24,181,213,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 hover:-translate-y-2 active:scale-105 group"
>
  <span className="relative z-10">
    {t('home.hero.why_us')}
  </span>
</button>


          {/* الهالة الخارجية */}
          <div className="absolute inset-0 rounded-2xl bg-[#18b5d5] opacity-0 group-hover:opacity-30 blur-xl scale-75 group-hover:scale-125 transition-all duration-700 -z-30"></div>
        </div>

        {/* نقاط ديكور */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#18b5d5]/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-20 w-1.5 h-1.5 bg-[#18b5d5]/40 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-12 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default HeroSection;