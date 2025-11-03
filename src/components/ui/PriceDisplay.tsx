import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  showCurrency?: boolean;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'card' | 'checkout' | 'minimal';
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  className = '',
  showCurrency = true,
  showSign = false,
  size = 'md',
  variant = 'default'
}) => {
  const { i18n, t } = useTranslation();
  const { formatPrice, convertPrice, currentCurrency, isLoading, getCurrentCurrencySymbol } = useCurrency();
  
  const [formattedPrice, setFormattedPrice] = useState<string>('');
  const [formattedOriginalPrice, setFormattedOriginalPrice] = useState<string | undefined>(undefined);
  const [convertedPrice, setConvertedPrice] = useState<number>(price);
  const [convertedOriginalPrice, setConvertedOriginalPrice] = useState<number | undefined>(originalPrice);

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newConvertedPrice = await convertPrice(price);
        const newFormattedPrice = await formatPrice(price);
        
        setConvertedPrice(newConvertedPrice);
        setFormattedPrice(newFormattedPrice);

        if (originalPrice) {
          const newConvertedOriginalPrice = await convertPrice(originalPrice);
          const newFormattedOriginalPrice = await formatPrice(originalPrice);
          
          setConvertedOriginalPrice(newConvertedOriginalPrice);
          setFormattedOriginalPrice(newFormattedOriginalPrice);
        }
      } catch (error) {
        console.warn(t('price_display.update_error'), error);
        // Use default values in case of failure
        const symbol = getCurrentCurrencySymbol();
        setFormattedPrice(`${price.toFixed(2)} ${symbol}`);
        if (originalPrice) {
          setFormattedOriginalPrice(`${originalPrice.toFixed(2)} ${symbol}`);
        }
      }
    };

    updatePrices();
  }, [price, originalPrice, currentCurrency, convertPrice, formatPrice]);
  
  const isRTL = i18n.language === 'ar';
  const hasDiscount = originalPrice && originalPrice > price;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  // Variant styles
  const variantStyles = {
    default: 'text-gray-900',
    card: 'text-[#541029] font-bold',
    checkout: 'text-gray-800 font-semibold',
    minimal: 'text-gray-700'
  };
  
  const discountPercentage = hasDiscount && convertedOriginalPrice && convertedPrice
    ? Math.round(((convertedOriginalPrice - convertedPrice) / convertedOriginalPrice) * 100)
    : 0;

  // Show loading indicator if prices are being updated
  if (isLoading || !formattedPrice) {
    return (
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {/* Current Price */}
      <span className={`${sizeClasses[size]} ${variantStyles[variant]} font-bold`}>
        {showSign && price !== 0 && (price > 0 ? '+' : '')}
        {formattedPrice}
      </span>
      
      {/* Original Price (if discounted) */}
      {hasDiscount && formattedOriginalPrice && (
        <>
          <span className={`${sizeClasses[size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm']} text-gray-500 line-through`}>
            {formattedOriginalPrice}
          </span>
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default PriceDisplay;