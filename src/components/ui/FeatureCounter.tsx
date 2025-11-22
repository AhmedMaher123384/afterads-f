// components/FeatureCounter.tsx
import React, { useState, useEffect } from 'react';
import { Palette, Settings, Headphones, Store } from 'lucide-react';

const useCountUp = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);
      if (progress >= 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, shouldStart]);
  return count;
};

interface FeatureCounterProps {
  icon: React.ElementType;
  number: string;
  label: string;
  shouldAnimate: boolean;
  delay?: number;
  variant?: 'primary' | 'secondary';
}

export const FeatureCounter: React.FC<FeatureCounterProps> = ({
  icon: Icon,
  number,
  label,
  shouldAnimate,
  delay = 0,
  variant = 'primary'
}) => {
  const [startAnimation, setStartAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isNumeric = !isNaN(parseInt(number));
  const targetNumber = isNumeric ? parseInt(number) : 0;
  const suffix = isNumeric ? number.replace(/\d+/, '') : number;

  const count = useCountUp(targetNumber, 2000, startAnimation);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setStartAnimation(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, delay]);

  const displayValue = isNumeric ? `${count}${suffix}` : number;
  const bgClass = variant === 'primary'
    ? 'bg-gradient-to-br from-[#18b5d5]/10 to-[#18b5d5]/5 border-[#18b5d5]/20 hover:from-[#18b5d5]/15 hover:to-[#18b5d5]/10'
    : 'bg-gradient-to-br from-[#292929]/30 to-[#292929]/20 border-[#ffffff]/30 hover:from-[#292929]/40 hover:to-[#292929]/30';
  const iconClass = variant === 'primary' ? 'text-[#18b5d5]' : 'text-[#ffffff]';
  const numberClass = variant === 'primary' ? 'text-[#ffffff]' : 'text-[#18b5d5]';

  return (
    <div className="text-center group">
      <div className={`${bgClass} border rounded-xl sm:rounded-2xl p-3 sm:p-8 transition-all duration-300 will-change-transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Icon className={`w-6 sm:w-10 h-6 sm:h-10 mx-auto mb-2 sm:mb-4 ${iconClass}`} />
        <div className={`text-lg sm:text-3xl font-bold ${numberClass} mb-1 sm:mb-2`}>
          {displayValue}
        </div>
        <div className="text-[#ffffff]/60 text-xs sm:text-sm">{label}</div>
      </div>
    </div>
  );
};