import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Phone, Mail, MapPin, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  showInFooter: boolean;
  createdAt: string;
}

interface FooterSectionProps {
  staticPages: StaticPage[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ staticPages }) => {
  const { t } = useTranslation();
  return (
    <footer data-section="footer" className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] py-16 lg:py-20">
      {/* خلفية هادئة مع تأثير خفيف */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/5 via-transparent to-[#18b5d8]/5"></div>
        {/* نقاط هادئة */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#18b5d8]/20 rounded-full animate-pulse"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* الجزء الرئيسي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-12">
            
            {/* قسم البراند الراقي */}
            <div className="lg:col-span-1 text-center lg:text-right">
              <div className="mb-8">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#18b5d8] to-[#0f8aa3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#18b5d8]/20">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      غِيم
                    </h3>
                    <p className="text-sm text-[#18b5d8]/80 font-medium">AfterAds</p>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8">
                  براند سعودي متميز في تصميم عبايات وجاكيتات التخرج بأعلى معايير الجودة والأناقة
                </p>

                
              </div>
            </div>

            {/* الروابط السريعة */}
            <div className="text-center lg:text-right">
              <h4 className="font-semibold text-white mb-6 text-lg">{t('footer.quick_links')}</h4>
              <div className="space-y-3">
                {[
                  { to: "/", label: t('footer.home') },
                  { to: "/products", label: t('footer.products') },
                  { to: "/about", label: t('footer.about_us') },
                  { to: "/contact", label: t('footer.contact_us') },
                  { to: "/privacy-policy", label: t('footer.privacy_policy') },
                  { to: "/terms-and-conditions", label: t('footer.terms_conditions') }
                ].map((link, index) => (
                  <Link
                    key={index}
                    to={link.to}
                    className="block text-gray-400 hover:text-[#18b5d8] transition-colors duration-200 text-sm py-1"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* الصفحات الثابتة من قاعدة البيانات */}
                {staticPages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/page/${page.slug}`}
                    className="block text-gray-400 hover:text-[#18b5d8] transition-colors duration-200 text-sm py-1"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="text-center lg:text-right">
              <h4 className="font-semibold text-white mb-6 text-lg">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-[#18b5d8]" />
                  <span className="text-sm">+201069006131</span>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-[#18b5d8]" />
                  <span className="text-sm">info@ghem.store</span>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-[#18b5d8]" />
                  <span className="text-sm">المملكة العربية السعودية</span>
                </div>
              </div>
            </div>
          </div>

          {/* خط الفاصل الأنيق */}
          <div className="border-t border-gray-800 mb-8"></div>

          {/* قسم حقوق الطبع والنشر */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              © 2025 افتر ادز -  AfterAds | جميع الحقوق محفوظة
            </p>
            <p className="text-gray-500 text-xs">
              تم التطوير بواسطة <span className="text-[#18b5d8] font-medium">ArtCode</span>
            </p>
          </div>
        </div>
      </div>

      {/* CSS للأنيميشن الهادئ */}
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default FooterSection;