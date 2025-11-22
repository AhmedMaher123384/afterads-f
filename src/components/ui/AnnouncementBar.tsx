import React, { useEffect, useState, useRef } from 'react';
import { Megaphone, ArrowRight } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../config/api';
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
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        setLoading(true);
        const res = await apiCall(API_ENDPOINTS.ANNOUNCEMENT_BAR_ACTIVE);
        const announcement = res?.data ?? res;
        if (announcement && announcement.isActive !== false && announcement.content) {
          setData({
            content: announcement.content,
            link: announcement.link ?? null,
            backgroundColor: announcement.backgroundColor || '#000000',
            textColor: announcement.textColor || '#FFFFFF',
            isActive: announcement.isActive ?? true,
          });
        } else {
          setData(null);
        }
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  useEffect(() => {
    const updateOffset = () => {
      const el = barRef.current;
      if (el && data) {
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
  }, [data]);

  if (loading || !data) return null;

  const { content, link, backgroundColor, textColor } = data;

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 z-[9999] w-full shadow-lg"
      style={{ backgroundColor, color: textColor }}
    >
<div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-1 sm:py-1.5">
        <div className="flex    items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center" style={{ border: `2px solid ${textColor}40` }}>
              <Megaphone className="w-4 h-4" style={{ color: textColor }} />
            </div>
            <p className="text-sm sm:text-base font-semibold" style={{ color: textColor }}>
              {content}
            </p>
          </div>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-3 py-1 text-sm sm:text-base font-bold transition-all"
              style={{
                color: textColor,
                borderColor: textColor,
                borderWidth: 2,
                background: 'transparent',
              }}
            >
              <span className="relative z-10">{t('announcement_bar.click_here')}</span>
              <ArrowRight className={`w-4 h-4 relative z-10 ${isRTL ? 'rotate-180' : ''}`} style={{ color: textColor }} />
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: textColor }}
              />
              <span className="absolute -inset-8 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: textColor }}
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;