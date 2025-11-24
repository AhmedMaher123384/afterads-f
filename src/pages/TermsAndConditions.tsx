import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, Phone, Calendar, User, Lock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();

  // Memoized data arrays for better performance
  const definitionsData = useMemo(() => [
    { 
      label: t('terms_and_conditions.definitions.agency'), 
      text: t('terms_and_conditions.definitions.agency_text') 
    },
    { 
      label: t('terms_and_conditions.definitions.user'), 
      text: t('terms_and_conditions.definitions.user_text') 
    },
    { 
      label: t('terms_and_conditions.definitions.products'), 
      text: t('terms_and_conditions.definitions.products_text') 
    },
  ], [t]);

  const agreementData = useMemo(() => [
    t('terms_and_conditions.agreement.point1'),
    t('terms_and_conditions.agreement.point2'),
  ], [t]);

  const userResponsibilitiesData = useMemo(() => [
    t('terms_and_conditions.user_responsibilities.point1'),
    t('terms_and_conditions.user_responsibilities.point2'),
    t('terms_and_conditions.user_responsibilities.point3'),
    t('terms_and_conditions.user_responsibilities.point4'),
  ], [t]);

  const paymentTermsData = useMemo(() => [
    t('terms_and_conditions.payment_terms.point1'),
    t('terms_and_conditions.payment_terms.point2'),
    t('terms_and_conditions.payment_terms.point3'),
  ], [t]);

  const cancellationRefundsData = useMemo(() => [
    t('terms_and_conditions.cancellation_refunds.point1'),
    t('terms_and_conditions.cancellation_refunds.point2'),
    t('terms_and_conditions.cancellation_refunds.point3'),
  ], [t]);

  const intellectualPropertyData = useMemo(() => [
    t('terms_and_conditions.intellectual_property.point1'),
    t('terms_and_conditions.intellectual_property.point2'),
  ], [t]);

  const limitationLiabilityData = useMemo(() => [
    t('terms_and_conditions.limitation_liability.point1'),
    t('terms_and_conditions.limitation_liability.point2'),
    t('terms_and_conditions.limitation_liability.point3'),
  ], [t]);

  const modificationsData = useMemo(() => [
    t('terms_and_conditions.modifications.point1'),
    t('terms_and_conditions.modifications.point2'),
  ], [t]);

  // Memoized render functions for better performance
  const renderDefinitionItem = useCallback((item: { label: string; text: string }, index: number) => (
    <div
      key={index}
      className="bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-slideInRight mobile-padding ultra-mobile-padding"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
        <span className="font-bold text-white text-sm sm:text-base flex-shrink-0">{item.label}</span>
        <span className="text-gray-100 text-sm sm:text-base leading-relaxed">{item.text}</span>
      </div>
    </div>
  ), []);

  const renderSimpleItem = useCallback((item: string, index: number, animationClass: string = 'animate-scaleIn') => (
    <div
      key={index}
      className={`bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-[#7a7a7a]/25 transition-all duration-300 ${animationClass} mobile-padding ultra-mobile-padding`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <p className="text-gray-100 text-sm sm:text-base leading-relaxed">{item}</p>
    </div>
  ), []);

  const renderListItem = useCallback((item: string, index: number) => (
    <div
      key={index}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-slideInRight mobile-padding ultra-mobile-padding"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a] flex-shrink-0" />
      <span className="text-gray-100 text-sm sm:text-base leading-relaxed">{item}</span>
    </div>
  ), []);

  const renderListItemWithAnimation = useCallback((item: string, index: number, animationClass: string) => (
    <div
      key={index}
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-[#7a7a7a]/15 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-[#7a7a7a]/25 transition-all duration-300 ${animationClass} mobile-padding ultra-mobile-padding`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a] flex-shrink-0" />
      <span className="text-gray-100 text-sm sm:text-base leading-relaxed">{item}</span>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#292929] text-white" dir="rtl">
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
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
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
            animation: slideInRight 0.6s ease-out forwards;
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

          /* Mobile Responsive Classes */
          @media (max-width: 640px) {
            .mobile-text-responsive {
              font-size: 1.25rem !important;
              line-height: 1.75rem !important;
            }
            .mobile-padding {
              padding: 1rem !important;
            }
          }

          @media (max-width: 480px) {
            .ultra-mobile-text {
              font-size: 1.125rem !important;
              line-height: 1.625rem !important;
            }
            .ultra-mobile-padding {
              padding: 0.75rem !important;
            }
          }
        `}
      </style>
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7a7a7a]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#18b5d5]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#7a7a7a]/10 to-[#18b5d5]/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#7a7a7a] rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#18b5d5] rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-[#7a7a7a] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-[#18b5d5] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fadeInUp">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[#18b5d5] to-[#7a7a7a] bg-clip-text text-transparent mb-4 sm:mb-6 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 20px rgba(24, 181, 213, 0.5)' }}>
                {t('terms_and_conditions.title')}
              </h1>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 mobile-text-responsive">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#7a7a7a]" />
                <span>{t('terms_and_conditions.last_updated')}: 15 ديسمبر 2024</span>
              </div>
              <p className="text-gray-100 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mobile-text-responsive ultra-mobile-text">
                {t('terms_and_conditions.introduction')}
              </p>
            </div>

            {/* Section 1: Definitions */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.definitions.title')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {definitionsData.map(renderDefinitionItem)}
              </div>
            </div>

            {/* Section 2: Agreement */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.agreement.title')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {agreementData.map((item, index) => renderSimpleItem(item, index))}
              </div>
            </div>

            {/* Section 3: User Responsibilities */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.user_responsibilities.title')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {userResponsibilitiesData.map(renderListItem)}
              </div>
            </div>

            {/* Section 4: Payment Terms */}
             <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
               <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                 <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                 {t('terms_and_conditions.payment_terms.title')}
               </h2>
               <div className="space-y-2 sm:space-y-3">
                 {paymentTermsData.map((item, index) => renderListItemWithAnimation(item, index, 'animate-scaleIn'))}
               </div>
             </div>

             {/* Section 5: Cancellation and Refunds */}
             <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
               <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                 <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                 {t('terms_and_conditions.cancellation_refunds.title')}
               </h2>
               <div className="space-y-3">
                 {cancellationRefundsData.map((item, index) => renderListItemWithAnimation(item, index, 'animate-fadeInUp'))}
               </div>
             </div>

            {/* Section 6: Intellectual Property */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.intellectual_property.title')}
              </h2>
              <div className="space-y-3">
                {intellectualPropertyData.map((item, index) => renderSimpleItem(item, index, 'animate-fadeInUp'))}
              </div>
            </div>

            {/* Section 7: Limitation of Liability */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.limitation_liability.title')}
              </h2>
              <div className="space-y-3">
                {limitationLiabilityData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-[#7a7a7a]/15 p-4 rounded-xl border border-white/10 hover:bg-[#7a7a7a]/25 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-5 h-5 text-[#7a7a7a]" />
                    <span className="text-gray-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Modifications to Terms */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.modifications.title')}
              </h2>
              <div className="space-y-3">
                {modificationsData.map((item, index) => renderSimpleItem(item, index, 'animate-fadeInUp'))}
              </div>
            </div>

            {/* Section 9: Applicable Law */}
            <div className="mb-6 sm:mb-8 lg:mb-10 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.applicable_law.title')}
              </h2>
              <div className="bg-[#7a7a7a]/15 p-4 sm:p-6 rounded-xl border border-white/10 animate-fadeInUp mobile-padding ultra-mobile-padding">
                <p className="text-gray-100 text-sm sm:text-base lg:text-lg">
                  {t('terms_and_conditions.applicable_law.text')}
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mb-6 sm:mb-8 animate-fadeInUp">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#18b5d5] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mobile-text-responsive ultra-mobile-text" style={{ textShadow: '0 0 8px rgba(24, 181, 213, 0.5)' }}>
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#7a7a7a] flex-shrink-0" />
                {t('terms_and_conditions.contact.title')}
              </h2>
              <div className="bg-[#7a7a7a]/15 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scaleIn mobile-padding ultra-mobile-padding">
                <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{t('terms_and_conditions.contact.description')}</p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:scale-[1.02] transition-transform duration-300 p-2 rounded-lg hover:bg-[#7a7a7a]/10">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a] flex-shrink-0" />
                      <span className="text-gray-100 text-sm sm:text-base">{t('terms_and_conditions.contact.email_label')}</span>
                    </div>
                    <span className="font-bold text-[#7a7a7a] text-sm sm:text-base break-all">info@afterads.com</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:scale-[1.02] transition-transform duration-300 p-2 rounded-lg hover:bg-[#7a7a7a]/10">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#7a7a7a] flex-shrink-0" />
                      <span className="text-gray-100 text-sm sm:text-base">{t('terms_and_conditions.contact.phone_label')}</span>
                    </div>
                    <span className="font-bold text-[#7a7a7a] text-sm sm:text-base">01069006131</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center animate-fadeInUp">
              <Link
                to="/"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#7a7a7a] to-[#4a4a4a] text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-[#8a8a8a] hover:to-[#5a5a5a] transition-all duration-300 transform hover:scale-105 font-bold shadow-lg text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('terms_and_conditions.back_to_home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;