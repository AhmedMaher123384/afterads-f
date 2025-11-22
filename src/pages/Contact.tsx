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

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
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

      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#7a7a7a]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#7a7a7a]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-[70px]">
        {/* Compact Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t('contact.title')}
            </h1>
          </div>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information - More Compact */}
          <div className="lg:col-span-1 space-y-4">
            {/* WhatsApp Quick Contact */}
            <div className="bg-gradient-to-br from-[#292929]/95 to-[#1a1a1a]/90 
                rounded-xl backdrop-blur-xl border border-white/10 p-4 animate-fadeInUp">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{t('contact.whatsapp.title')}</h3>
                  <p className="text-gray-300 text-xs">{t('contact.whatsapp.subtitle')}</p>
                </div>
              </div>
              <a
                href="https://wa.me/201069006131"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 
                    bg-green-600 text-white px-4 py-2 rounded-lg 
                    hover:bg-green-700 transition-all duration-300 font-medium text-sm"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>{t('contact.whatsapp.button')}</span>
              </a>
            </div>

            {/* Contact Details */}
            <div className="bg-gradient-to-br from-[#292929]/95 to-[#1a1a1a]/90 rounded-xl backdrop-blur-xl border border-white/10 p-4">
              <h2 className="text-lg font-bold text-[#18b5d5] mb-3">
                {t('contact.info.title')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">01069006131</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm break-all">info@afterads.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] rounded flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('contact.info.location_value')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-[#292929]/95 to-[#1a1a1a]/90 rounded-xl backdrop-blur-xl border border-white/10 p-4">
              <h3 className="text-lg font-bold text-[#18b5d5] mb-3">
                {t('contact.social.title')}
              </h3>
              <div className="flex justify-center gap-2">
                {[
                  { icon: FaInstagram, href: "https://www.instagram.com/afteradscom" },
                  { icon: FaWhatsapp, href: "https://wa.me/201069006131" },
                  { icon: FaTwitter, href: "https://x.com/afteradscom" },
                  { icon: FaFacebookF, href: "https://www.facebook.com/afteradscom" },
                  { icon: FaEnvelope, href: "mailto:info@afterads.com" },
                  { icon: FaPhone, href: "tel:+201069006131" }
                ].map((SocialIcon, index) => (
                  <a
                    key={index}
                    href={SocialIcon.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon w-8 h-8 bg-[#2a2a2a] border border-[#18b5d5]/30 rounded flex items-center justify-center hover:bg-[#18b5d5] transition-all duration-300"
                  >
                    <SocialIcon.icon className="w-3 h-3 text-[#18b5d5] hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form - More Compact */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#292929]/95 to-[#1a1a1a]/90 rounded-xl backdrop-blur-xl border border-white/10 p-6 animate-fadeInUp">
            <h2 className="text-xl font-bold text-[#18b5d5] mb-4">
              {t('contact.form.title')}
            </h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-500 mb-2">{t('contact.form.success_title')}</h3>
                <p className="text-gray-300 text-sm">{t('contact.form.success_message')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-3 py-2 text-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-white bg-[#2a2a2a]"
                      placeholder={t('contact.form.name_placeholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-2">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-3 py-2 text-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-white bg-[#2a2a2a]"
                      placeholder={t('contact.form.email_placeholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-300 mb-2">
                      {t('contact.form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input w-full px-3 py-2 text-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-white bg-[#2a2a2a]"
                      placeholder={t('contact.form.phone_placeholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-gray-300 mb-2">
                      {t('contact.form.subject')}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-3 py-2 text-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-white bg-[#2a2a2a]"
                      placeholder={t('contact.form.subject_placeholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-gray-300 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-input w-full px-3 py-2 text-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] transition-all duration-300 text-white bg-[#2a2a2a] resize-none"
                    placeholder={t('contact.form.message_placeholder')}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white py-2 px-4 rounded-lg hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('contact.form.send')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 animate-fadeInUp">
          <p className="text-gray-400 text-sm">
            <span className="font-bold text-[#18b5d5]">AfterAds</span> - {t('contact.notice.message')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;