import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { FaInstagram, FaWhatsapp, FaTwitter, FaFacebookF, FaEnvelope, FaPhone } from 'react-icons/fa';

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }

          .animate-slideInFromLeft {
            animation: slideInFromLeft 0.8s ease-out forwards;
          }

          .animate-slideInFromRight {
            animation: slideInFromRight 0.8s ease-out forwards;
          }

          .animate-bounceIn {
            animation: bounceIn 0.6s ease-out forwards;
          }

          .animate-pulse {
            animation: pulse 4s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.25;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.35;
            }
          }

          .animate-pulse-delay-1 {
            animation-delay: 1s;
          }

          .animate-pulse-delay-05 {
            animation-delay: 0.5s;
          }

          h2:hover, h3:hover {
            filter: brightness(1.2);
            transition: filter 0.3s ease;
          }

          .form-input:focus {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(24, 181, 213, 0.2);
          }

          .social-icon:hover {
            transform: scale(1.15) translateY(-3px);
            box-shadow: 0 8px 25px rgba(24, 181, 213, 0.4);
          }
        `}
      </style>

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(122, 122, 122, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 90% 80%, rgba(122, 122, 122, 0.2) 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
        }}></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#7a7a7a]/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#7a7a7a]/15 rounded-full blur-3xl animate-pulse animate-pulse-delay-1"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#7a7a7a]/15 rounded-full blur-3xl animate-pulse animate-pulse-delay-05"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-[80px]">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fadeInUp">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 group">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/40 to-[#292929]/40 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/20 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#7a7a7a] filter drop-shadow-[0_0_12px_rgba(122,122,122,0.9)]" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#ffffff]">
              {t('contact.title')}
            </h1>
            <div className="relative w-16 h-16 group">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/40 to-[#292929]/40 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#292929]/20 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#7a7a7a] filter drop-shadow-[0_0_12px_rgba(122,122,122,0.9)]" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/15 p-4 max-w-2xl mx-auto animate-fadeInUp">
            <p className="text-base sm:text-lg text-gray-100 max-w-2xl mx-auto px-4">
              {t('contact.description')}
            </p>
          </div>
        </div>

        {/* WhatsApp Quick Contact */}
        <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 
            rounded-2xl backdrop-blur-xl border border-white/15 shadow-2xl 
            p-5 sm:p-6 animate-bounceIn mb-6 sm:mb-8 flex flex-col items-center text-center max-w-md mx-auto">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-3 sm:mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] 
                rounded-xl flex items-center justify-center shadow-md">
              <FaWhatsapp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">{t('contact.whatsapp.title')}</h3>
              <p className="text-gray-200 text-xs sm:text-sm">{t('contact.whatsapp.subtitle')}</p>
            </div>
          </div>

          {/* Button */}
          <div className="w-full flex justify-center">
            <a
              href="https://wa.me/201069006131"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-3/4 inline-flex items-center justify-center gap-2 
                  bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white 
                  px-6 py-3 rounded-lg 
                  hover:from-[#8a8a8a] hover:to-[#5a5a5a] 
                  transition-all duration-300 font-medium text-sm sm:text-base shadow-lg
                  transform hover:scale-105 hover:-translate-y-1"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>{t('contact.whatsapp.button')}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8 animate-slideInFromLeft">
            <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                {t('contact.info.title')}
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4 group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('contact.info.phone')}</h3>
                    <p className="text-gray-100 text-base">01069006131</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('contact.info.email')}</h3>
                    <p className="text-gray-100 text-base break-all">info@afterads.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('contact.info.location')}</h3>
                    <p className="text-gray-100 text-base">{t('contact.info.location_value')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('contact.info.hours')}</h3>
                    <p className="text-gray-100 text-base">{t('contact.info.hours_value')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Notice */}
            <div className="bg-[#7a7a7a]/15 rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <MessageSquare className="w-6 h-6 text-[#7a7a7a]" />
                <h3 className="text-xl font-bold text-[#18b5d5]" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                  {t('contact.notice.title')}
                </h3>
              </div>
              <p className="text-gray-100 font-medium text-center text-base">
                {t('contact.notice.message')}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-8 animate-slideInFromRight">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
              {t('contact.form.title')}
            </h2>
            
            {isSubmitted ? (
              <div className="text-center py-12 animate-bounceIn">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-500 mb-2">{t('contact.form.success_title')}</h3>
                <p className="text-gray-100">{t('contact.form.success_message')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-100 mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-gray-100 bg-[#292929]/50"
                    placeholder={t('contact.form.name_placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-gray-100 bg-[#292929]/50"
                    placeholder={t('contact.form.email_placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-100 mb-2">
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-gray-100 bg-[#292929]/50"
                    placeholder={t('contact.form.phone_placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-100 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="form-input w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-gray-100 bg-[#292929]/50"
                    placeholder={t('contact.form.subject_placeholder')}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-100 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="form-input w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-gray-100 bg-[#292929]/50 resize-none"
                    placeholder={t('contact.form.message_placeholder')}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white py-3 px-6 rounded-lg hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('contact.form.send')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Social Media & Additional Info */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-8 text-center animate-fadeInUp">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
            {t('contact.social.title')}
          </h3>
          <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
            <a
              href="https://www.instagram.com/afteradscom"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://wa.me/201069006131"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://x.com/afteradscom"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaTwitter className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://www.facebook.com/afteradscom"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaFacebookF className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="mailto:info@afterads.com"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="tel:+201069006131"
              className="social-icon group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#18b5d5]/20 to-[#18b5d5]/5 border border-[#18b5d5]/30 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-[#18b5d5] hover:bg-[#18b5d5]/10 transition-all duration-400"
            >
              <FaPhone className="w-5 h-5 sm:w-6 sm:h-6 text-[#18b5d5] group-hover:text-white transition-colors duration-300" />
            </a>
          </div>
          <p className="text-gray-100 text-base sm:text-lg">
            <span className="font-bold text-[#18b5d5]">AfterAds</span> - وكالة سعودية للمنتجات الرقمية
          </p>
          <p className="text-gray-300 mt-2 text-sm sm:text-base">نشارككم الابتكار والتميز</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;