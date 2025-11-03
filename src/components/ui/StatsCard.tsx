import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'pink';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'blue',
  subtitle 
}) => {
  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-100',
      green: 'from-green-500 to-green-600 text-green-100',
      purple: 'from-purple-500 to-purple-600 text-purple-100',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-100',
      red: 'from-red-500 to-red-600 text-red-100',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-100',
      pink: 'from-pink-500 to-pink-600 text-pink-100'
    };
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('ar-SA');
    }
    return val;
  };

  return (
    <div className={`bg-gradient-to-r ${getColorClasses(color)} p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm opacity-80 mb-1`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
              {formatValue(value)}
            </h3>
            {change && (
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                change.type === 'increase' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs opacity-70 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-2xl sm:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2 sm:ml-3">
          {icon}
        </div>
      </div>
      
      {/* Progress Bar (optional visual enhancement) */}
      <div className="mt-3 sm:mt-4">
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min(100, Math.max(10, typeof value === 'number' ? (value % 100) : 50))}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

interface MiniStatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export const MiniStatsCard: React.FC<MiniStatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'gray' 
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('ar-SA');
    }
    return val;
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray-500 text-xs sm:text-sm truncate">{title}</p>
          <p className={`text-lg sm:text-xl font-bold text-${color}-600 truncate`}>
            {formatValue(value)}
          </p>
        </div>
        <div className="text-xl sm:text-2xl flex-shrink-0 ml-2">{icon}</div>
      </div>
    </div>
  );
};

interface StatsTrendCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  icon: string;
  color?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export const StatsTrendCard: React.FC<StatsTrendCardProps> = ({
  title,
  currentValue,
  previousValue,
  icon,
  color = 'blue',
  format = 'number'
}) => {
  const { t } = useTranslation();
  const { getCurrentCurrencySymbol } = useCurrency();
  const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString('ar-SA')} ${getCurrentCurrencySymbol()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('ar-SA');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</h3>
        <span className="text-2xl sm:text-3xl flex-shrink-0 ml-2">{icon}</span>
      </div>
      
      <div className="space-y-2">
        <div className={`text-2xl sm:text-3xl font-bold text-${color}-600 truncate`}>
          {formatValue(currentValue)}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className={`flex items-center text-xs sm:text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs sm:text-sm text-gray-500 truncate">
            {t('stats_card.from_previous_period')}
          </span>
        </div>
        
        <div className="text-xs text-gray-400 truncate">
          {t('stats_card.previous')}: {formatValue(previousValue)}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;