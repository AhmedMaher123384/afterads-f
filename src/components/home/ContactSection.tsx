import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaWhatsapp, FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

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
    <section data-section="contact" className="py-8 sm:py-12 bg-[#292929] relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ffffff]/10 backdrop-blur-lg border border-[#18b5d5]/30 text-[#18b5d5] px-4 py-2 rounded-full mb-4 shadow-lg shadow-[#18b5d5]/10">
            <Send className="w-4 h-4 animate-pulse" />
            <span className="font-bold text-sm">{t('home.contact.contact_us_now')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
            {t('home.contact.lets_talk_business')}
          </h2>
          <p className="text-sm text-[#ffffff]/80 max-w-2xl mx-auto leading-relaxed font-light">
            {t('home.contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Contact Information Side */}
          <div className="flex flex-col">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6 border border-[#18b5d5]/20 h-full">
              <h3 className="text-xl font-bold text-[#18b5d5] mb-6 text-right">
                {t('home.contact.contact_info')}
              </h3>
              
              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center gap-3 group hover:bg-[#18b5d5]/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-[#18b5d5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-white font-medium text-base">01069006131</p>
                    <p className="text-gray-400 text-sm">الهاتف</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 group hover:bg-[#18b5d5]/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-[#18b5d5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-white font-medium text-base break-all">info@afterads.com</p>
                    <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 group hover:bg-[#18b5d5]/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-[#18b5d5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-white font-medium text-base">المملكة العربية السعودية</p>
                    <p className="text-gray-400 text-sm">الموقع</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6 pt-6 border-t border-[#18b5d5]/20">
                <h4 className="text-lg font-bold text-[#18b5d5] mb-4 text-right">
                  {t('home.contact.follow_us')}
                </h4>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://wa.me/201069006131"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#2a2a2a] border border-[#18b5d5]/30 rounded-lg flex items-center justify-center hover:bg-[#18b5d5] transition-all duration-300 group"
                  >
                    <FaWhatsapp className="w-4 h-4 text-[#18b5d5] group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href="https://www.instagram.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#2a2a2a] border border-[#18b5d5]/30 rounded-lg flex items-center justify-center hover:bg-[#18b5d5] transition-all duration-300 group"
                  >
                    <FaInstagram className="w-4 h-4 text-[#18b5d5] group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href="https://x.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#2a2a2a] border border-[#18b5d5]/30 rounded-lg flex items-center justify-center hover:bg-[#18b5d5] transition-all duration-300 group"
                  >
                    <FaTwitter className="w-4 h-4 text-[#18b5d5] group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href="https://www.facebook.com/afteradscom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#2a2a2a] border border-[#18b5d5]/30 rounded-lg flex items-center justify-center hover:bg-[#18b5d5] transition-all duration-300 group"
                  >
                    <FaFacebookF className="w-4 h-4 text-[#18b5d5] group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Form Side */}
          <div
            ref={formRef}
            className="backdrop-blur-lg bg-[#ffffff]/10 rounded-xl p-6 border border-[#18b5d5]/30 shadow-lg shadow-[#18b5d5]/20 opacity-0 scale-95 will-change-transform transition-all duration-700 h-full flex flex-col"
          >
            <div className="mb-6 text-right">
              <h3 className="text-xl font-bold text-white mb-2">{t('home.contact.send_message')}</h3>
              <p className="text-[#ffffff]/80 text-sm">{t('home.contact.team_ready')}</p>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('home.contact.name_placeholder')}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-lg px-4 py-3 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 text-base text-right"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('home.contact.email_placeholder')}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-lg px-4 py-3 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 text-base text-right"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('home.contact.message_placeholder')}
                rows={5}
                className="w-full bg-[#ffffff]/10 backdrop-blur-md border border-[#18b5d5]/30 rounded-lg px-4 py-3 text-white placeholder-[#ffffff]/50 focus:border-[#18b5d5]/50 focus:bg-[#18b5d5]/10 focus:outline-none focus:ring-2 focus:ring-[#18b5d5]/30 transition-all duration-300 resize-none text-base text-right flex-1"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] text-white font-bold py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-[#0d8aa3] hover:to-[#18b5d5] hover:shadow-lg hover:shadow-[#18b5d5]/30 transition-all duration-300 text-base flex items-center justify-center gap-2 group transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t('home.contact.send_button')}</span>
                <Send className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
        .animate-card-reveal { animation: card-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .will-change-transform { will-change: transform, opacity; }
      `}</style>
    </section>
  );
};

export default ContactSection;