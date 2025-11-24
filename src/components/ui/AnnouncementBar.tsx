import React, { useEffect, useState, useRef } from 'react';
import { Megaphone, X } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTranslation } from 'react-i18next';

interface AnnouncementBarData {
  _id?: string;
  content: string;
  link?: string | null;
  backgroundColor: string;
  textColor: string;
  isActive?: boolean;
}

const AnnouncementBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [data, setData] = useState<AnnouncementBarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);

  const { data: announcementResp, isLoading } = useApiQuery<any>({ 
    endpoint: API_ENDPOINTS.ANNOUNCEMENT_BAR_ACTIVE, 
    queryKey: ['announcement-bar-active'] 
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    const res = announcementResp;
    const announcement = res?.data ?? res;
    if (announcement && announcement.isActive !== false && announcement.content) {
      setData({
        content: announcement.content,
        link: announcement.link ?? null,
        backgroundColor: announcement.backgroundColor || '#000000',
        textColor: announcement.textColor || '#FFFFFF',
        isActive: announcement.isActive ?? true,
      });
      setIsVisible(true); // إظهار الإعلان عند تحديث البيانات
    } else {
      setData(null);
    }
    setLoading(false);
  }, [announcementResp, isLoading]);

  // تحديث ارتفاع الإعلان في CSS variable
  useEffect(() => {
    const updateOffset = () => {
      const el = barRef.current;
      if (el && data && isVisible && !isScrollingDown) {
        const h = el.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--announcement-offset', `${Math.ceil(h)}px`);
      } else {
        document.documentElement.style.removeProperty('--announcement-offset');
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => {
      window.removeEventListener('resize', updateOffset);
      document.documentElement.style.removeProperty('--announcement-offset');
    };
  }, [data, isVisible, isScrollingDown]);

  // الكشف عن اتجاه السكرول
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolling = Math.abs(currentScrollY - lastScrollYRef.current) > 5;

      if (isScrolling) {
        const scrollingDown = currentScrollY > lastScrollYRef.current;
        setIsScrollingDown(scrollingDown);

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrollingDown(false);
        }, 1000);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // إخفاء الإعلان
  const handleClose = () => {
    setIsVisible(false);
  };

  if (loading || !data || !isVisible) return null;

  const { content, link, backgroundColor, textColor } = data;

  return (
    <div
      ref={barRef}
      className={`fixed top-0 left-0 right-0 z-[9999] w-full shadow-lg transition-transform duration-500 ease-in-out ${
        isScrollingDown ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-center relative">
          
          {/* النص في المنتصف */}
          <a
            href={link || '#'}
            onClick={(e) => {
              if (!link) e.preventDefault();
            }}
            className={`text-center cursor-pointer transition-opacity ${
              link ? 'hover:opacity-80' : ''
            }`}
            style={{ color: textColor }}
          >
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {content}
            </p>
          </a>

          {/* زر الإغلاق - على حسب اتجاه الصفحة */}
          <button
            onClick={handleClose}
            className={`absolute p-1.5 sm:p-2 rounded-lg transition-all hover:bg-white/10 active:scale-95 flex-shrink-0 ${
              isRTL ? 'left-0' : 'right-0'
            }`}
            style={{ color: textColor }}
            aria-label="Close announcement"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;