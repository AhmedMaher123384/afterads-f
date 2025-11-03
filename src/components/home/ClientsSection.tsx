import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from 'react-i18next';

interface Client {
  id: number;
  logo?: string;
  website?: string;
}

interface ClientsSectionProps {
  clients: Client[];
}

const styles = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .gradient-text {
    background: linear-gradient(90deg, #18b5d8 0%, #18b5d8 50%, #0d8aa3 100%);
    background-size: 200% auto;
    animation: shimmer 4s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .transition-smooth {
    transition: all 0.5s ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const ClientsSection: React.FC<ClientsSectionProps> = ({ clients }) => {
  const { t } = useTranslation();
  const settings = {
    dots: false,
    infinite: true,
    speed: 8000,
    slidesToShow: 6,
    slidesToScroll: 1,
    cssEase: "linear",
    autoplay: true,
    autoplaySpeed: 0,
    pauseOnHover: false,
    pauseOnFocus: false,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 6 } },
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 3 } },
    ],
  };

  if (!clients || clients.length === 0) return null;

  return (
    <>
      <style>{styles}</style>
      <section
        data-section="clients"
        className="py-20 bg-[#292929] relative overflow-hidden w-full"
      >
        <div className="relative z-10 w-full">
          {/* العنوان */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-[#18b5d8]/10 border border-[#18b5d8]/20 text-[#18b5d8] px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
              <span className="font-semibold">{t('clients.title')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('clients.subtitle')}{" "}
            </h2>
          </div>

          {/* الكاروسيل */}
          <Slider {...settings}>
            {clients.map((client) =>
              client.logo ? (
                <div key={client.id} className="px-2 sm:px-3">
                  <a
                    href={
                      client.website
                        ? client.website.startsWith("http")
                          ? client.website
                          : `https://${client.website}`
                        : "#"
                    }
                    target={client.website ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    onClick={(e) => !client.website && e.preventDefault()}
                    className="block flex items-center justify-center"
                  >
                    <img
                      src={client.logo}
                      alt={t('clients.client_logo', { id: client.id })}
                      loading="lazy"
                      className="h-16 sm:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-smooth"
                    />
                  </a>
                </div>
              ) : null
            )}
          </Slider>
        </div>
      </section>
    </>
  );
};

export default ClientsSection;