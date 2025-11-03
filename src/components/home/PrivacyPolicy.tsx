import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ArrowLeft, ArrowRight, Mail, Phone, Calendar, User, Lock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] relative overflow-hidden" dir="rtl">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }

          .animate-slideInRight {
            animation: slideInRight 0.7s ease-out forwards;
          }

          .animate-scaleIn {
            animation: scaleIn 0.5s ease-out forwards;
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
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

          /* Mobile-specific responsive styles */
          @media (max-width: 640px) {
            .mobile-text-responsive {
              font-size: clamp(1.5rem, 4vw, 2.5rem);
              line-height: 1.2;
            }
            
            .mobile-padding {
              padding: 1rem;
            }
            
            .mobile-margin {
              margin: 0.5rem 0;
            }
            
            .mobile-grid {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }
          }

          @media (max-width: 480px) {
            .ultra-mobile-text {
              font-size: clamp(1.25rem, 3.5vw, 2rem);
            }
            
            .ultra-mobile-padding {
              padding: 0.75rem;
            }
          }
        `}
      </style>

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(122, 122, 122, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 90% 80%, rgba(122, 122, 122, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(24, 181, 213, 0.1) 0%, transparent 70%)`,
          backgroundSize: '100% 100%',
        }}></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#7a7a7a]/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#18b5d5]/10 rounded-full blur-3xl animate-pulse animate-pulse-delay-1"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#7a7a7a]/15 rounded-full blur-3xl animate-pulse animate-pulse-delay-05"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 mt-[70px] sm:mt-[80px]">
        {/* Enhanced Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-scaleIn">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 group animate-float">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#7a7a7a]/40 to-[#18b5d5]/30 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110 animate-glow"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#18b5d5]/30 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#7a7a7a] filter drop-shadow-[0_0_12px_rgba(122,122,122,0.9)]" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#ffffff] mobile-text-responsive ultra-mobile-text text-center leading-tight">
              {t('privacy_policy.title_part1')} <span className="gradient-text block sm:inline">{t('privacy_policy.title_part2')}</span>
            </h1>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 group animate-float hidden sm:block">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d5]/30 to-[#7a7a7a]/40 blur-sm transform rotate-0 transition-all duration-500 group-hover:scale-110 animate-glow"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#7a7a7a]/30 to-[#7a7a7a]/40 backdrop-blur-md border border-[#7a7a7a]/40 transform rotate-0 transition-all duration-500 group-hover:scale-110"
                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#18b5d5] filter drop-shadow-[0_0_12px_rgba(24,181,213,0.9)]" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/15 p-3 sm:p-4 max-w-xs sm:max-w-2xl mx-auto animate-slideInRight mobile-padding ultra-mobile-padding">
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5]" />
              <span className="text-gray-100 font-bold text-sm sm:text-base">{t('privacy_policy.last_updated')}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#292929]/95 via-[#7a7a7a]/30 to-[#292929]/90 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/15 shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12 mobile-padding ultra-mobile-padding">
            {/* Introduction */}
            <div className="mb-6 sm:mb-8 lg:mb-12 animate-fadeInUp">
              <div className="bg-[#7a7a7a]/15 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 mobile-padding ultra-mobile-padding hover-lift">
                <p className="text-base sm:text-lg leading-relaxed text-gray-100">
                  {t('privacy_policy.introduction')}
                </p>
              </div>
            </div>

            {/* Section 1: Definitions */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.definitions_title')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { key: 'agency', label: t('privacy_policy.definitions.agency_label'), text: t('privacy_policy.definitions.agency_text') },
                  { key: 'user', label: t('privacy_policy.definitions.user_label'), text: t('privacy_policy.definitions.user_text') },
                  { key: 'personal_data', label: t('privacy_policy.definitions.personal_data_label'), text: t('privacy_policy.definitions.personal_data_text') },
                ].map((item, index) => (
                  <div
                    key={item.key}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-slideInRight mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                      <span className="font-bold text-white text-sm sm:text-base flex-shrink-0">{item.label}</span>
                      <span className="text-gray-100 text-sm sm:text-base leading-relaxed">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Agreement */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.agreement_title')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  t('privacy_policy.agreement.point1'),
                  t('privacy_policy.agreement.point2'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-scaleIn mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="text-gray-100 text-sm sm:text-base leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Data Collection */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.data_collection_title')}
              </h2>
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#18b5d5] mb-3 sm:mb-4">{t('privacy_policy.data_collection.subtitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mobile-grid">
                  {[
                    t('privacy_policy.data_collection.full_name'),
                    t('privacy_policy.data_collection.contact_info'),
                    t('privacy_policy.data_collection.payment_info'),
                    t('privacy_policy.data_collection.technical_info'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-slideInRight mobile-padding ultra-mobile-padding hover-lift"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="font-bold text-white text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#18b5d5] mb-3 sm:mb-4">{t('privacy_policy.data_usage.subtitle')}</h3>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    t('privacy_policy.data_usage.process_orders'),
                    t('privacy_policy.data_usage.communication'),
                    t('privacy_policy.data_usage.improve_experience'),
                    t('privacy_policy.data_usage.compliance'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3 bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-scaleIn mobile-padding ultra-mobile-padding hover-lift"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] flex-shrink-0" />
                      <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#7a7a7a]/15 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift">
                <p className="text-gray-100 font-medium text-sm sm:text-base leading-relaxed">
                  {t('privacy_policy.data_protection_note')}
                </p>
              </div>
            </div>

            {/* Section 4: Data Sharing */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.data_sharing_title')}
              </h2>
              <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{t('privacy_policy.data_sharing.subtitle')}</p>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: t('privacy_policy.data_sharing.payment_providers_label'), text: t('privacy_policy.data_sharing.payment_providers_text') },
                  { label: t('privacy_policy.data_sharing.authorities_label'), text: t('privacy_policy.data_sharing.authorities_text') },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-slideInRight mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                      <span className="font-bold text-white text-sm sm:text-base flex-shrink-0">{item.label}:</span>
                      <span className="text-gray-100 text-sm sm:text-base leading-relaxed">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Data Protection */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.data_protection_title')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  t('privacy_policy.data_protection.ssl'),
                  t('privacy_policy.data_protection.no_disclosure'),
                  t('privacy_policy.data_protection.access_control'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] flex-shrink-0" />
                    <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: User Rights */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.user_rights_title')}
              </h2>
              <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">{t('privacy_policy.user_rights.subtitle')}</p>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {[
                  t('privacy_policy.user_rights.know_data'),
                  t('privacy_policy.user_rights.correct_delete'),
                  t('privacy_policy.user_rights.object_marketing'),
                  t('privacy_policy.user_rights.file_complaint'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] flex-shrink-0" />
                    <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#7a7a7a]/15 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift">
                <p className="text-gray-100 text-sm sm:text-base">
                  {t('privacy_policy.user_rights.contact_note')}{' '}
                  <span className="font-bold text-[#18b5d5]">support@afterads.com</span>
                </p>
              </div>
            </div>

            {/* Section 7: Terms of Use */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.terms_of_use_title')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  t('privacy_policy.terms_of_use.age_requirement'),
                  t('privacy_policy.terms_of_use.account_responsibility'),
                  t('privacy_policy.terms_of_use.legal_use'),
                  t('privacy_policy.terms_of_use.account_suspension'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Intellectual Property */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.intellectual_property_title')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  t('privacy_policy.intellectual_property.ownership'),
                  t('privacy_policy.intellectual_property.usage_prohibition'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 9: Policy Updates */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.policy_updates_title')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  t('privacy_policy.policy_updates.modification_right'),
                  t('privacy_policy.policy_updates.notification'),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-gray-100 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 10: Applicable Law */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.applicable_law_title')}
              </h2>
              <div className="bg-[#7a7a7a]/15 p-4 sm:p-6 rounded-lg sm:rounded-xl animate-fadeInUp mobile-padding ultra-mobile-padding hover-lift">
                <p className="text-gray-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {t('privacy_policy.applicable_law.content')}
                </p>
              </div>
            </div>

            {/* Enhanced Contact Section */}
            <div className="mb-6 sm:mb-8 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('privacy_policy.contact_title')}
              </h2>
              <div className="bg-[#7a7a7a]/15 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scaleIn mobile-padding ultra-mobile-padding hover-lift">
                <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{t('privacy_policy.contact.subtitle')}</p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:scale-[1.02] transition-transform duration-300 p-2 rounded-lg hover:bg-[#7a7a7a]/10">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] flex-shrink-0" />
                      <span className="text-gray-100 text-sm sm:text-base">{t('privacy_policy.contact.email_label')}</span>
                    </div>
                    <span className="font-bold text-[#18b5d5] text-sm sm:text-base break-all">info@afterads.com</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:scale-[1.02] transition-transform duration-300 p-2 rounded-lg hover:bg-[#7a7a7a]/10">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#18b5d5] flex-shrink-0" />
                      <span className="text-gray-100 text-sm sm:text-base">{t('privacy_policy.contact.phone_label')}</span>
                    </div>
                    <span className="font-bold text-[#18b5d5] text-sm sm:text-base">01069006131</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Back Button */}
            <div className="text-center animate-fadeInUp">
              <Link
                to="/"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#18b5d5] to-[#7a7a7a] text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-[#20c5e5] hover:to-[#8a8a8a] transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-sm sm:text-base hover-lift animate-glow"
              >
                {isRTL ? <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                {t('privacy_policy.back_to_home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;