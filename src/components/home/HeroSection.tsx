import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero from '../../assets/her.mp4';
import heroImage from '../../assets/hero.webp';

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

        {/* العنوان الرئيسي */}
        <div className="relative" >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#18b5d5] font-bold tracking-[0.2em] drop-shadow-xl relative ">
            {t('home.hero.title')}
            {/* تأثير النيون */}
            <div className="absolute inset-0 text-[#18b5d5] font-bold tracking-[0.2em] blur-sm opacity-70 mt-2">
              {t('home.hero.title')}
            </div>
          </h1>

          {/* خط تحت العنوان */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#18b5d5] to-transparent mx-auto mt-4 rounded-full shadow-lg shadow-[#18b5d5]/30"></div>
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

        <div className="relative group">
          <Link to="/contact">
            <button className="relative px-10 py-4 bg-transparent border-2 border-white/30 text-white font-medium text-lg rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-700 ease-out
            hover:border-[#18b5d5] 
            hover:bg-[#18b5d5]/90 
            hover:shadow-[0_0_40px_rgba(24,181,213,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] 
            hover:scale-110 
            hover:-translate-y-2
            active:scale-105 group">

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out"></div>

              <div className="absolute inset-0 rounded-2xl bg-[#18b5d5]/20 scale-0 group-hover:scale-150 transition-all duration-1000 ease-out opacity-0 group-hover:opacity-100 -z-10"></div>
              <div className="absolute inset-0 rounded-2xl bg-[#18b5d5]/10 scale-0 group-hover:scale-200 transition-all duration-1500 ease-out opacity-0 group-hover:opacity-100 -z-20"></div>

              <span className="relative z-10 transition-all duration-300 group-hover:text-white group-hover:font-semibold group-hover:drop-shadow-md ">
                {t('home.hero.contact_us')}
              </span>

              {/* البريق */}
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </button>
          </Link>


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