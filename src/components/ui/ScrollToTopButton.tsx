import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

const ScrollToTopButton: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 400);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden md:block">
      <button
        onClick={scrollToTop}
        aria-label={t('scroll_to_top.scroll_up')}
        className="flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-300"
      >
        {/* Long upward arrow */}
        <div className="flex flex-col items-center" style={{ color: "#18b5d5" }}>
          <div className="text-lg font-bold">▲</div>
          <div className="w-0.5 h-6 bg-current"></div>
        </div>

        {/* Vertical text */}
        <span className="text-white text-sm tracking-widest [writing-mode:vertical-rl]">
          {t('scroll_to_top.scroll_up')}
        </span>
      </button>
    </div>
  );
};

export default ScrollToTopButton;