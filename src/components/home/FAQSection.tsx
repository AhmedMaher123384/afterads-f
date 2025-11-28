import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import faq from '../../assets/faqs.webp';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: number;
  title: string;
  icon: string;
  faqs: FAQ[];
}

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setTimeout(() => {
              setVisibleCards((prev) => [...prev, index]);
            }, index * 50);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.faq-card');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const toggleCategory = (id: number) => {
    setOpenCategory(openCategory === id ? null : id);
    setOpenFAQ(null);
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const faqCategories: FAQCategory[] = [
    {
      id: 1,
      title: 'المنتجات والمنتجات الرقمية',
      icon: '🛒', 
           faqs: [
        {
          id: 1,
          question: 'هل المنتجات والمنتجات الرقمية قابلة للاسترجاع أو الاستبدال؟',
          answer: 'المنتجات الرقمية لا يمكن استرجاعها بعد الشراء، لكن نضمن لك الدعم الفني والإصلاح لأي مشكلة تواجهك.',
        },
        {
          id: 2,
          question: 'كيف أستلم المنتج أو المنتج بعد الدفع؟',
          answer: 'بمجرد إتمام عملية الدفع، يتم إرسال الملفات أو تفاصيل المنتج على بريدك الإلكتروني أو من خلال حسابك على الموقع.',
        },
        {
          id: 3,
          question: 'هل أحتاج خبرة تقنية لاستخدام المنتجات الرقمية (مثل الثيمات أو التصاميم)؟',
          answer: 'لا، نقدم لك دليل استخدام بسيط، بالإضافة إلى إمكانية طلب منتج التثبيت أو التخصيص.',
        },
      ],
    },
    {
      id: 2,
      title: 'المواقع والتطبيقات',
      icon: '🌐',
      faqs: [
        {
          id: 4,
          question: 'كم يستغرق وقت تنفيذ موقع أو تطبيق؟',
          answer: 'يعتمد على حجم المشروع، عادة يبدأ التنفيذ من أسبوعين إلى 8 أسابيع حسب المتطلبات.',
        },
        {
          id: 5,
          question: 'هل أستطيع تعديل الموقع أو التطبيق بعد تسليمه؟',
          answer: 'نعم، نوفر لك لوحة تحكم سهلة، وإذا احتجت تخصيص إضافي نحن نوفر دعم ومنتجات ما بعد التسليم.',
        },
        {
          id: 6,
          question: 'هل تقدمون استضافة مع المواقع؟',
          answer: 'نعم، لدينا باقات استضافة سريعة وآمنة، أو يمكننا ربط موقعك بالاستضافة الخاصة بك.',
        },
      ],
    },
    {
      id: 3,
      title: 'التصميم والجرافيك',
      icon: '🎨',
      faqs: [
        {
          id: 7,
          question: 'هل يمكن تعديل التصميم بعد استلامه؟',
          answer: 'نعم، نقدم عدد معين من التعديلات المجانية (عادة 2-3 تعديلات)، وبعدها يمكنك طلب تعديلات إضافية برسوم رمزية.',
        },
        {
          id: 8,
          question: 'ما هي صيغة الملفات التي سأستلمها؟',
          answer: 'ستحصل على الملفات بصيغ متعددة مثل JPG, PNG, PDF، وبالنسبة للتصاميم الاحترافية نوفر لك ملفات مفتوحة المصدر (AI, PSD).',
        },
      ],
    },
    {
      id: 4,
      title: 'التسويق الرقمي',
      icon: '📈',
      faqs: [
        {
          id: 9,
          question: 'هل تضمنون لي نتائج محددة من الحملات التسويقية؟',
          answer: 'لا يمكن ضمان أرقام محددة لأن النتائج تعتمد على عوامل السوق والجمهور، لكن نستخدم أفضل الاستراتيجيات لزيادة وصولك ومبيعاتك.',
        },
        {
          id: 10,
          question: 'هل تقدمون تقارير عن الأداء؟',
          answer: 'نعم، نرسل لك تقارير شهرية/أسبوعية فيها إحصائيات وتحليلات واضحة عن أداء الحملات.',
        },
      ],
    },
    {
      id: 5,
      title: 'ثيمات سلة',
      icon: '🎭',
      faqs: [
        {
          id: 11,
          question: 'هل الثيمات متوافقة مع جميع متاجر سلة؟',
          answer: 'نعم، الثيمات مصممة خصيصًا لتتوافق مع منصة سلة بجميع الإصدارات.',
        },
        {
          id: 12,
          question: 'هل أستطيع تخصيص الثيم بنفسي؟',
          answer: 'نعم، نوفر لك إعدادات سهلة التخصيص، وإن احتجت تخصيص متقدم يمكننا تنفيذه لك.',
        },
        {
          id: 13,
          question: 'هل أحتاج خبرة برمجية لاستخدام الثيم؟',
          answer: 'لا إطلاقًا، كل شيء بسيط وسهل الإعداد، ولو واجهتك أي مشكلة فريق الدعم معاك.',
        },
        {
          id: 14,
          question: 'هل الثيم يجي مع تحديثات مستقبلية؟',
          answer: 'نعم، تحصل على تحديثات مجانية للثيم مدى الحياة.',
        },
      ],
    },
    {
      id: 6,
      title: 'الدفع والدعم',
      icon: '💳',
      faqs: [
        {
          id: 15,
          question: 'ما هي طرق الدفع المتاحة؟',
          answer: 'نوفر الدفع عبر البطاقات البنكية، وطرق دفع إلكترونية أخرى.',
        },
        {
          id: 16,
          question: 'هل في دعم فني بعد الشراء؟',
          answer: 'نعم، نقدم دعم فني مجاني لمدة معينة بعد الشراء (مثلاً 30 يوم)، وبعدها ممكن تختار باقات دعم شهرية.',
        },
      ],
    },
  ];

  return (
    <section
      data-section="faq"
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-[#292929] relative overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-[#18b5d8]/20 border border-[#18b5d8]/30 text-[#18b5d8] px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 backdrop-blur-md hover:bg-[#18b5d8]/30 transition-all duration-300">
            <span className="font-semibold text-sm sm:text-base">{t('home.faq.frequent_questions')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            كل ما تريد <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18b5d5] to-[#0d8aa3] animate-pulse">معرفتة</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed px-4">
            {t('home.faq.subtitle')}
          </p>
        </div>

     

        {/* قسم الفئات */}
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-4 sm:gap-6">
          {faqCategories.map((category, index) => (
            <div
              key={category.id}
              data-index={category.id}
              className={`faq-card transform transition-all duration-300 ease-out will-change-transform will-change-opacity ${
                visibleCards.includes(category.id)
                  ? 'translate-y-0 opacity-100 scale-100'
                  : 'translate-y-8 opacity-0 scale-95'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="bg-[#333333]/90 backdrop-blur-lg border border-gray-600/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between text-right hover:bg-white/10 transition-all duration-200 active:scale-95"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <span className={`text-xl sm:text-2xl md:text-3xl transition-transform duration-300 ${openCategory === category.id ? 'scale-110' : ''}`}>
                      {category.icon}
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">{category.title}</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-[#18b5d8]/20 border border-[#18b5d8]/30 flex items-center justify-center transition-all duration-300 ${
                        openCategory === category.id
                          ? 'bg-[#18b5d8] border-[#18b5d8] rotate-180 scale-110'
                          : 'hover:bg-[#18b5d8]/30 hover:scale-105'
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
                          openCategory === category.id ? 'text-white' : 'text-[#18b5d8]'
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {openCategory === category.id && (
                  <div className="border-t border-gray-600/40 bg-[#2a2a2a]/95">
                    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                      {category.faqs.map((faq, faqIndex) => (
                        <div
                          key={faq.id}
                          className={`transform transition-all duration-200 ease-out ${
                            openCategory === category.id
                              ? 'translate-y-0 opacity-100'
                              : 'translate-y-4 opacity-0'
                          }`}
                          style={{ transitionDelay: `${faqIndex * 25}ms` }}
                        >
                          <div className="bg-[#373737]/70 border border-gray-500/30 rounded-lg sm:rounded-xl overflow-hidden hover:border-[#18b5d8]/40 hover:shadow-lg transition-all duration-200">
                            <button
                              onClick={() => toggleFAQ(faq.id)}
                              className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right flex justify-between items-center hover:bg-white/10 transition-all duration-200 active:scale-95"
                            >
                              <span className="text-gray-200 font-medium text-sm sm:text-base md:text-lg pr-2 sm:pr-3 md:pr-4">{faq.question}</span>
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-[#18b5d8]/20 border border-[#18b5d8]/30 flex items-center justify-center transition-all duration-200 ${
                                    openFAQ === faq.id
                                      ? 'bg-[#18b5d8] border-[#18b5d8] scale-110'
                                      : 'hover:bg-[#18b5d8]/30 hover:scale-105'
                                  }`}
                                >
                                  {openFAQ === faq.id ? (
                                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  ) : (
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-[#18b5d8]" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {openFAQ === faq.id && (
                              <div
                                className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 border-t border-gray-500/30 transform transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                style={{ transitionDelay: `${faqIndex * 50}ms` }}
                              >
                                <div className="pt-3 sm:pt-4">
                                  <p className="text-gray-200 leading-relaxed text-right text-sm sm:text-base">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transform,
          .transition-all {
            transform: none !important;
            transition: none !important;
            opacity: 1 !important;
            scale: 1 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FAQSection;