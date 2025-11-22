import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Shield, Crown, HandshakeIcon, Medal, Award, Tag, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import logo from "../../assets/her.webp";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { 
      opacity: 0;
    }
    to { 
      opacity: 1;
    }
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out forwards;
  }

  .animate-fadeIn {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .gradient-text {
    background: linear-gradient(90deg, #18b5d5 0%, #0ea5c4 50%, #18b5d5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .smooth-hover {
    transition: all 0.3s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Counter Hook مبسط
const useCountUp = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);
      
      setCount(currentCount);

      if (progress >= 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, shouldStart]);

  return count;
};

// Counter Component
interface AnimatedCounterProps {
  number: string;
  label: string;
  shouldAnimate: boolean;
  delay?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ number, label, shouldAnimate, delay = 0 }) => {
  const [startAnimation, setStartAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isNumeric = !isNaN(parseInt(number));
  const targetNumber = isNumeric ? parseInt(number) : 0;
  const suffix = isNumeric ? number.replace(/\d+/, '') : number;
  
  const count = useCountUp(targetNumber, 2000, startAnimation);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setStartAnimation(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, delay]);

  const displayValue = isNumeric ? `${count}${suffix}` : number;

  return (
    <div 
      className={`text-center bg-[#1f1f1f]/70 border border-[#18b5d5]/20 rounded-xl p-4 lg:p-6 smooth-hover hover:bg-[#1f1f1f] hover:border-[#18b5d5]/40 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
    >
      <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#18b5d5] mb-2">
        {displayValue}
      </div>
      <div className="text-[#ffffff]/70 text-xs lg:text-sm">
        {label}
      </div>
    </div>
  );
};

const AboutUsSection = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const features = [
    { icon: Users, title: t('home.about.features.expert_team'), description: t('home.about.features.expert_team_desc') },
    { icon: Shield, title: t('home.about.features.quality_assurance'), description: t('home.about.features.quality_assurance_desc') },
    { icon: Crown, title: t('home.about.features.premium_service'), description: t('home.about.features.premium_service_desc') },
    { icon: HandshakeIcon, title: t('home.about.features.fast_delivery'), description: t('home.about.features.fast_delivery_desc') },
    { icon: Medal, title: t('home.about.features.wide_experience'), description: t('home.about.features.wide_experience_desc') },
    { icon: Award, title: t('home.about.features.global_standards'), description: t('home.about.features.global_standards_desc') },
    { icon: Tag, title: t('home.about.features.competitive_prices'), description: t('home.about.features.competitive_prices_desc') },
    { icon: Zap, title: t('home.about.features.superior_performance'), description: t('home.about.features.superior_performance_desc') }
  ];

  const steps = [
    { 
      number: '01', 
      title: t('home.about.steps.discovery'),
      description: t('home.about.steps.discovery_desc'),
      details: t('home.about.steps.discovery_details', { returnObjects: true }) as string[]
    },
    { 
      number: '02', 
      title: t('home.about.steps.approach'),
      description: t('home.about.steps.approach_desc'),
      details: t('home.about.steps.approach_details', { returnObjects: true }) as string[]
    },
    { 
      number: '03', 
      title: t('home.about.steps.planning'),
      description: t('home.about.steps.planning_desc'),
      details: t('home.about.steps.planning_details', { returnObjects: true }) as string[]
    },
    { 
      number: '04', 
      title: t('home.about.steps.creativity'),
      description: t('home.about.steps.creativity_desc'),
      details: t('home.about.steps.creativity_details', { returnObjects: true }) as string[]
    },
    { 
      number: '05', 
      title: t('home.about.steps.assembly'),
      description: t('home.about.steps.assembly_desc'),
      details: t('home.about.steps.assembly_details', { returnObjects: true }) as string[]
    },
    { 
      number: '06', 
      title: t('home.about.steps.launch'),
      description: t('home.about.steps.launch_desc'),
      details: t('home.about.steps.launch_details', { returnObjects: true }) as string[]
    }
  ];

  const stats = [
    { number: '500+', label: t('home.about.stats.completed_projects') },
    { number: '200+', label: t('home.about.stats.satisfied_clients') },
    { number: '5+', label: t('home.about.stats.years_experience') },
    { number: '24/7', label: t('home.about.stats.technical_support') }
  ];

  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const statsRef = useRef(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.2 });
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.15 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div >
        {/* About Us Section */}
        <section ref={aboutRef} className="py-16 md:py-24 bg-[#292929] relative overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={aboutInView ? "visible" : "hidden"}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* العنوان */}
            <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-4">
                  <span className="gradient-text">
                    AfterAds
                  </span>
                  <span className="text-white">
                    {t('home.about.main_title')}
                  </span>
                </div>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#ffffff]/80 max-w-4xl mx-auto leading-relaxed font-light px-4">
                {t('home.about.main_description')}
              </p>
            </motion.div>

            {/* النص والمنتجات + الصورة */}
            <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 mt-8 lg:mt-12">
              {/* المنتجات */}
              <motion.div variants={itemVariants} className="flex-1 text-right flex flex-col justify-center">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">{t('home.about.what_we_offer')}</h3>
                <p className="text-[#ffffff]/80 text-sm sm:text-base lg:text-lg leading-relaxed mb-4">
                  {t('home.about.what_we_offer_description')}
                </p>
                <motion.ul 
                  className="space-y-3 text-sm sm:text-base lg:text-lg text-[#ffffff]/90"
                  variants={containerVariants}
                >
                  {(t('home.about.services', { returnObjects: true }) as string[]).map((text, i) => (
                    <motion.li 
                      key={i}
                      variants={itemVariants}
                      className="bg-[#1f1f1f]/60 px-4 py-3 rounded-xl border border-[#18b5d5]/10 smooth-hover hover:bg-[#1f1f1f] hover:border-[#18b5d5]/30 min-h-[70px] flex items-center"
                    >
                      {text}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              {/* الصورة */}
              <motion.div 
                variants={itemVariants}
                className="flex-1 relative flex items-center"
              >
                <div className="relative w-full max-w-sm lg:max-w-md mx-auto lg:mx-0 h-[300px] lg:h-[400px]">
                  <img
                    src={logo}
                    alt="After Ads – فريقنا المبدع"
                    className="w-full h-full object-cover rounded-xl border border-[#18b5d5]/30 shadow-lg"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Why Choose Us Section */}
        <section ref={servicesRef} className="py-16 md:py-24 bg-[#292929] relative overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.div variants={itemVariants} className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
                {t('home.about.why_choose_us')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#ffffff]/80 max-w-3xl mx-auto leading-relaxed font-light px-4">
                {t('home.about.why_choose_us_description')}
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16"
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-[#1f1f1f]/60 border border-[#18b5d5]/20 rounded-xl p-4 smooth-hover hover:bg-[#1f1f1f] hover:border-[#18b5d5]/40">
                      <div className="text-center">
                        <div className="relative mb-3 mx-auto w-fit">
                          <div className="w-12 h-12 bg-[#18b5d5]/10 border border-[#18b5d5]/20 rounded-lg flex items-center justify-center smooth-hover group-hover:bg-[#18b5d5]/20">
                            <IconComponent className="w-6 h-6 text-[#18b5d5]" />
                          </div>
                        </div>
                        <h3 className="text-sm lg:text-base font-black text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-[#ffffff]/70 text-xs leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              ref={statsRef}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16"
            >
              {stats.map((stat, index) => (
                <AnimatedCounter
                  key={index}
                  number={stat.number}
                  label={stat.label}
                  shouldAnimate={statsInView}
                  delay={index * 100}
                />
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 lg:mt-20">
              <div className="text-center mb-8 lg:mb-12">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                  {t('home.about.project_journey')}
                </h3>
                <p className="text-[#ffffff]/80 max-w-2xl mx-auto text-base leading-relaxed px-4">
                  {t('home.about.project_journey_description')}
                </p>
              </div>

              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-4"
              >
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-4 z-10">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#1f1f1f]/60 border border-[#18b5d5]/20 rounded-full flex flex-col items-center justify-center smooth-hover group-hover:bg-[#1f1f1f] group-hover:border-[#18b5d5]/40 mx-auto">
                        <span className="text-sm font-black text-[#18b5d5] mb-1">
                          {step.number}
                        </span>
                        <span className="text-xs font-black text-white">
                          {step.title}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#ffffff]/70 text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mt-12 lg:mt-16 px-4">
              <div className="bg-[#1f1f1f]/60 border border-[#18b5d5]/20 rounded-xl p-6 smooth-hover hover:bg-[#1f1f1f] hover:border-[#18b5d5]/40 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-right flex-1">
                    <h3 className="text-xl lg:text-2xl font-black text-white mb-3">
                      {t('home.about.ready_to_start')}
                    </h3>
                    <p className="text-[#ffffff]/70 text-base leading-relaxed">
                      {t('home.about.ready_to_start_description')}
                    </p>
                  </div>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 justify-center bg-[#18b5d5]/20 border border-[#18b5d5]/50 text-[#18b5d5] text-sm font-bold rounded-xl px-6 py-3 smooth-hover hover:bg-[#18b5d5]/30"
                  >
                    {t('home.about.start_now')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default AboutUsSection;