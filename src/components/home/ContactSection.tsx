import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import contact from '../../assets/contact.webp';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-card-reveal');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (formRef.current) observer.observe(formRef.current);

    return () => {
      if (formRef.current) observer.unobserve(formRef.current);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <section data-section="contact" className="py-12 sm:py-16 md:py-24 bg-[#292929] relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 sm:gap-4 bg-[#ffffff]/10 backdrop-blur-lg border border-[#18b5d5]/30 text-[#18b5d5] px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full mb-6 sm:mb-8 md:mb-10 shadow-lg shadow-[#18b5d5]/10">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-pulse" />
            <span className="font-bold text-sm sm:text-base md:text-lg">{t('home.contact.contact_us_now')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-2">
            LET'S TALK <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">BUSINESS</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#ffffff]/80 max-w-4xl mx-auto leading-relaxed font-light px-4">
            {t('home.contact.subtitle')}
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto px-2 sm:px-4">


          {/* الصورة فوق النموذج */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center">
            <div className="relative">
              <img
                src={contact}
                alt="Theme Cover"
                className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] mx-auto rounded-xl sm:rounded-2xl"
              />
            </div>
          </div>

          {/* الفورم */}
          <div
            ref={formRef}
            className="relative z-10 backdrop-blur-lg bg-[#ffffff]/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-[#18b5d5]/30 shadow-xl shadow-[#18b5d5]/20 opacity-0 scale-95 will-change-transform transition-all duration-700"
          >
            <div className="mb-6 sm:mb-8 md:mb-10 text-right">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">{t('home.contact.send_message')}</h3>
              <p className="text-[#ffffff]/80 text-sm sm:text-base md:text-lg lg:text-xl">{t('home.contact.team_ready')}</p>
            </div>
            <div className="space-y-4 sm:space-y-6 md:space-y-8 flex flex-col">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('home.contact.name_placeholder')}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 text-base sm:text-lg md:text-xl text-right"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('home.contact.email_placeholder')}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 text-base sm:text-lg md:text-xl text-right"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('home.contact.message_placeholder')}
                rows={6}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 resize-none text-base sm:text-lg md:text-xl text-right sm:rows-8 md:rows-10"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] text-white font-bold py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-[#0d8aa3] hover:to-[#18b5d5] hover:shadow-lg hover:shadow-[#18b5d5]/50 transition-all duration-300 text-base sm:text-lg md:text-xl flex items-center justify-center gap-2 sm:gap-3 group transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t('home.contact.send_button')}</span>
                <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes card-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(50px) scale(0.95);
          }
          50% {
            opacity: 0.5;
            transform: translateY(10px) scale(1.02);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-pulse { animation: pulse 3s ease-in-out infinite; }
        .animate-card-reveal { animation: card-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .will-change-transform { will-change: transform, opacity; }
      `}</style>
    </section>
  );
};

export default ContactSection;