import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CurrencyService, { SUPPORTED_CURRENCIES, CurrencyInfo } from '../services/currencyService';

// Currency interface
export interface Currency {
  code: string;
  symbol: string;
  symbolEn: string;
  name: string;
  nameAr: string;
  flag: string;
}

// Available currencies - العملات المدعومة فقط
export const CURRENCIES: Currency[] = [
  {
    code: 'SAR',
    symbol: 'ر.س',
    symbolEn: 'SAR',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    flag: '🇸🇦'
  },
  {
    code: 'USD',
    symbol: '$',
    symbolEn: 'USD',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي',
    flag: '🇺🇸'
  },
  {
    code: 'EGP',
    symbol: 'ج.م',
    symbolEn: 'EGP',
    name: 'Egyptian Pound',
    nameAr: 'جنيه مصري',
    flag: '🇪🇬'
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    symbolEn: 'AED',
    name: 'UAE Dirham',
    nameAr: 'درهم إماراتي',
    flag: '🇦🇪'
  }
];

interface CurrencyContextType {
  currentCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => Promise<number>;
  formatPrice: (price: number) => string;
  getCurrentCurrencySymbol: () => string;
  currencies: Currency[];
  refreshRates: () => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(CURRENCIES[0]); // Default to SAR
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({
    SAR: 1,
    USD: 0.27, // Default fallback rates
    EGP: 8.25,
    AED: 0.98
  });

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      const currency = CURRENCIES.find(c => c.code === savedCurrency);
      if (currency) {
        setCurrentCurrency(currency);
      }
    }
    
    // تحديث أسعار الصرف عند التحميل
    const loadInitialRates = async () => {
      try {
        const rates = await CurrencyService.fetchExchangeRates();
        setExchangeRates({
          SAR: rates.SAR,
          USD: rates.USD,
          EGP: rates.EGP,
          AED: rates.AED
        });
      } catch (error) {
        console.warn('فشل في تحميل أسعار الصرف الأولية:', error);
        // Keep default rates
      }
    };
    
    loadInitialRates();
  }, []);

  // تحديث العملة عند تغيير اللغة
  useEffect(() => {
    // إذا لم يكن هناك عملة محفوظة، استخدم العملة الافتراضية بناءً على اللغة
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (!savedCurrency) {
      // العملة الافتراضية هي الريال السعودي
      setCurrentCurrency(CURRENCIES[0]); // SAR
    }
  }, [i18n.language]);

  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('selectedCurrency', currency.code);
  };

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      const rates = await CurrencyService.refreshRates();
      setExchangeRates({
        SAR: rates.SAR,
        USD: rates.USD,
        EGP: rates.EGP,
        AED: rates.AED
      });
    } catch (error) {
      console.warn('فشل في تحديث أسعار الصرف:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertPrice = async (price: number): Promise<number> => {
    try {
      // تحويل من الريال السعودي (العملة الأساسية) إلى العملة المحددة
      return await CurrencyService.convertFromSAR(price, currentCurrency.code);
    } catch (error) {
      console.warn('فشل في تحويل السعر:', error);
      return price; // إرجاع السعر الأصلي في حالة الفشل
    }
  };

  const formatPrice = (price: number): string => {
    try {
      // Safety check for i18n initialization
      if (!i18n || !i18n.language) {
        const currencySymbol = getCurrentCurrencySymbol();
        return `${currencySymbol} ${price.toFixed(2)}`;
      }

      // Use cached exchange rates for synchronous conversion
      const rate = exchangeRates[currentCurrency.code] || 1;
      const convertedPrice = price * rate;
      
      const isRTL = i18n.language === 'ar';
      const currencySymbol = getCurrentCurrencySymbol();
      
      // Format number based on language
      const formattedNumber = convertedPrice.toLocaleString(
        i18n.language === 'ar' ? 'ar-SA' : 'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

      // Return formatted price with currency symbol
      if (isRTL) {
        return `${formattedNumber} ${currencySymbol}`;
      } else {
        return `${currencySymbol} ${formattedNumber}`;
      }
    } catch (error) {
      console.warn('فشل في تنسيق السعر:', error);
      const currencySymbol = getCurrentCurrencySymbol();
      return `${price.toFixed(2)} ${currencySymbol}`;
    }
  };

  const getCurrentCurrencySymbol = () => {
    // Safety check for i18n initialization
    if (!i18n || !i18n.language) {
      return currentCurrency.symbolEn; // Default to English symbol
    }
    return i18n.language === 'ar' ? currentCurrency.symbol : currentCurrency.symbolEn;
  };

  const value = {
    currentCurrency,
    setCurrency,
    convertPrice,
    formatPrice,
    getCurrentCurrencySymbol,
    currencies: CURRENCIES,
    refreshRates,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};