import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';
import arProductDetail from './locales/ar/product_detail.json';
import enProductDetail from './locales/en/product_detail.json';
import arProductCard from './locales/ar/product_card.json';
import enProductCard from './locales/en/product_card.json';
import arProduct from './locales/ar/product.json';
import enProduct from './locales/en/product.json';

const resources = {
  ar: {
    translation: arCommon,
    common: arCommon,
    product_detail: arProductDetail,
    product_card: arProductCard,
    product: arProduct
  },
  en: {
    translation: enCommon,
    common: enCommon,
    product_detail: enProductDetail,
    product_card: enProductCard,
    product: enProduct
  }
};

// Debug logging
console.log('i18n config - arProductDetail:', arProductDetail);
console.log('i18n config - resources:', resources);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Set Arabic as the default language
    fallbackLng: 'ar',
    defaultNS: 'translation',
    ns: ['translation', 'common', 'product_detail', 'product_card', 'product'],
    debug: true,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'querystring', 'cookie', 'sessionStorage'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupSessionStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;