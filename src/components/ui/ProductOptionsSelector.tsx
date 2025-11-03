import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Palette, Sparkles } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ProductOption {
  id: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color';
  name: {
    ar: string;
    en: string;
  };
  label: {
    ar: string;
    en: string;
  };
  required: boolean;
  options?: Array<{
    value: string;
    label: {
      ar: string;
      en: string;
    };
    priceModifier: number;
    colorCode?: string;
  }>;
  placeholder?: {
    ar: string;
    en: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

interface SelectedOption {
  optionId: string;
  optionName: { ar: string; en: string };
  value: string | string[];
  priceModifier: number;
}

interface ProductOptionsSelectorProps {
  options: ProductOption[];
  onSelectionChange: (selectedOptions: SelectedOption[], totalPriceModifier: number) => void;
  language: string;
}

const ProductOptionsSelector: React.FC<ProductOptionsSelectorProps> = ({
  options,
  onSelectionChange,
  language
}) => {
  const { t } = useTranslation(['product_detail']);
  const { formatPrice } = useCurrency();
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getLocalizedContent = (field: 'name' | 'label' | 'placeholder', option: ProductOption) => {
    return language === 'ar' ? option[field]?.ar : option[field]?.en;
  };

  // Helper function to get smart placeholder based on option type
  const getSmartPlaceholder = (option: ProductOption) => {
    // If custom placeholder exists, use it
    if (option.placeholder) {
      return getLocalizedContent('placeholder', option);
    }
    
    // Generate smart placeholder based on type
    switch (option.type) {
      case 'dropdown':
      case 'radio':
        return language === 'ar' ? 'اختر...' : 'Choose...';
      case 'text':
        return language === 'ar' ? 'أدخل النص...' : 'Enter text...';
      case 'number':
        return language === 'ar' ? 'أدخل رقم...' : 'Enter number...';
      case 'color':
        return language === 'ar' ? 'اختر لون...' : 'Choose color...';
      default:
        return language === 'ar' ? 'اختر...' : 'Choose...';
    }
  };

  const getLocalizedOptionLabel = (option: { label: { ar: string; en: string } }) => {
    return language === 'ar' ? option.label.ar : option.label.en;
  };

  const handleOptionChange = (optionId: string, value: string | string[], priceModifier: number) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return;

    setSelectedOptions(prev => {
      const filtered = prev.filter(opt => opt.optionId !== optionId);
      if (value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        return [...filtered, {
          optionId,
          optionName: option.name,
          value,
          priceModifier
        }];
      }
      return filtered;
    });
  };

  useEffect(() => {
    const totalPriceModifier = selectedOptions.reduce((total, option) => {
      if (Array.isArray(option.value)) {
        const optionDef = options.find(opt => opt.id === option.optionId);
        return total + option.value.reduce((sum, val) => {
          const optionValue = optionDef?.options?.find(opt => opt.value === val);
          return sum + (optionValue?.priceModifier || 0);
        }, 0);
      }
      return total + option.priceModifier;
    }, 0);

    onSelectionChange(selectedOptions, totalPriceModifier);
    
    // Auto-validate when selections change
    validateOptions();
  }, [selectedOptions, options]);

  const validateOptions = () => {
    const newErrors: { [key: string]: string } = {};
    
    options.forEach(option => {
      if (option.required) {
        const selectedOption = selectedOptions.find(opt => opt.optionId === option.id);
        const optionLabel = getLocalizedContent('label', option);
        
        if (!selectedOption || 
            (Array.isArray(selectedOption.value) && selectedOption.value.length === 0) ||
            (!Array.isArray(selectedOption.value) && !selectedOption.value)) {
          
          // Generate specific error message based on option type
          switch (option.type) {
            case 'dropdown':
            case 'radio':
              newErrors[option.id] = language === 'ar' 
                ? `يرجى اختيار "${optionLabel}"` 
                : `Please select "${optionLabel}"`;
              break;
            case 'text':
              newErrors[option.id] = language === 'ar' 
                ? `يرجى إدخال "${optionLabel}"` 
                : `Please enter "${optionLabel}"`;
              break;
            case 'number':
              newErrors[option.id] = language === 'ar' 
                ? `يرجى إدخال رقم لـ "${optionLabel}"` 
                : `Please enter a number for "${optionLabel}"`;
              break;
            case 'color':
              newErrors[option.id] = language === 'ar' 
                ? `يرجى اختيار لون لـ "${optionLabel}"` 
                : `Please choose a color for "${optionLabel}"`;
              break;
            case 'checkbox':
              newErrors[option.id] = language === 'ar' 
                ? `يرجى اختيار على الأقل خيار واحد من "${optionLabel}"` 
                : `Please select at least one option from "${optionLabel}"`;
              break;
            default:
              newErrors[option.id] = language === 'ar' 
                ? `"${optionLabel}" مطلوب` 
                : `"${optionLabel}" is required`;
          }
        }
      }
      
      // Additional validation for text and number inputs
      if (option.type === 'text' || option.type === 'number') {
        const selectedOption = selectedOptions.find(opt => opt.optionId === option.id);
        if (selectedOption && selectedOption.value) {
          const value = selectedOption.value as string;
          
          if (option.validation?.min && value.length < option.validation.min) {
            newErrors[option.id] = language === 'ar' 
              ? `الحد الأدنى ${option.validation.min} أحرف` 
              : `Minimum ${option.validation.min} characters`;
          }
          
          if (option.validation?.max && value.length > option.validation.max) {
            newErrors[option.id] = language === 'ar' 
              ? `الحد الأقصى ${option.validation.max} أحرف` 
              : `Maximum ${option.validation.max} characters`;
          }
          
          if (option.validation?.pattern && !new RegExp(option.validation.pattern).test(value)) {
            newErrors[option.id] = language === 'ar' 
              ? 'تنسيق غير صحيح' 
              : 'Invalid format';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sortedOptions = [...options].sort((a, b) => a.order - b.order);

  const renderOption = (option: ProductOption) => {
    const selectedOption = selectedOptions.find(opt => opt.optionId === option.id);
    const hasError = errors[option.id];

    switch (option.type) {
      case 'dropdown':
        return (
          <div key={option.id} className={`bg-[#2a2a2a]/90 rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 ${
            hasError 
              ? 'border-red-400/60 bg-red-900/10 shadow-lg shadow-red-500/20' 
              : 'border-[#18b5d8]/30'
          }`}>
            <label className={`block text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
              hasError ? 'text-red-300' : 'text-white'
            }`}>
              <div className={`w-1.5 h-5 rounded-full transition-colors duration-300 ${
                hasError ? 'bg-red-400' : 'bg-[#18b5d8]'
              }`}></div>
              {getLocalizedContent('label', option)}
              {option.required && (
                <span className={`text-lg transition-colors duration-300 ${
                  hasError ? 'text-red-400 animate-pulse' : 'text-[#18b5d8]'
                }`}>*</span>
              )}
              {hasError && (
                <span className="text-red-400 text-sm font-normal animate-pulse">
                  ({language === 'ar' ? 'مطلوب' : 'Required'})
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedOption?.value || ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    // Clear selection
                    handleOptionChange(option.id, '', 0);
                  } else {
                    const selectedOpt = option.options?.find(opt => opt.value === e.target.value);
                    if (selectedOpt) {
                      handleOptionChange(option.id, selectedOpt.value, selectedOpt.priceModifier);
                    }
                  }
                }}
                className={`w-full p-4 rounded-lg border-2 bg-[#1a1a1a]/90 text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#18b5d8]/50 appearance-none cursor-pointer ${
                  hasError
                    ? 'border-red-400/60 focus:border-red-400'
                    : 'border-[#18b5d8]/30 focus:border-[#18b5d8]'
                }`}
              >
                <option value="" className="bg-[#1a1a1a] text-gray-400">
                  {selectedOption?.value ? 
                    (language === 'ar' ? '-- إلغاء الاختيار --' : '-- Clear Selection --') :
                    (getLocalizedContent('placeholder', option) || 
                      (language === 'ar' ? 'اختر خياراً...' : 'Select an option...'))
                  }
                </option>
                {option.options?.map(opt => {
                  const priceText = opt.priceModifier !== 0 ? 
                    ` (${opt.priceModifier > 0 ? '+' : ''}${formatPrice(Math.abs(opt.priceModifier))})` : '';
                  return (
                    <option 
                      key={opt.value} 
                      value={opt.value}
                      className="bg-[#1a1a1a] text-white"
                    >
                      {getLocalizedOptionLabel(opt)}{priceText}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {hasError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                  {hasError}
                </p>
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={option.id} className={`bg-[#2a2a2a]/90 rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 ${
            hasError 
              ? 'border-red-400/60 bg-red-900/10 shadow-lg shadow-red-500/20' 
              : 'border-[#18b5d8]/30'
          }`}>
            <label className={`block text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
              hasError ? 'text-red-300' : 'text-white'
            }`}>
              <div className={`w-1.5 h-5 rounded-full transition-colors duration-300 ${
                hasError ? 'bg-red-400' : 'bg-[#18b5d8]'
              }`}></div>
              {getLocalizedContent('label', option)}
              {option.required && (
                <span className={`text-lg transition-colors duration-300 ${
                  hasError ? 'text-red-400 animate-pulse' : 'text-[#18b5d8]'
                }`}>*</span>
              )}
              {hasError && (
                <span className="text-red-400 text-sm font-normal animate-pulse">
                  ({language === 'ar' ? 'مطلوب' : 'Required'})
                </span>
              )}
            </label>
            <div className="space-y-3">
              {option.options?.map(opt => {
                const isSelected = selectedOption?.value === opt.value;
                const priceText = opt.priceModifier !== 0 ? 
                  ` (${opt.priceModifier > 0 ? '+' : ''}${formatPrice(Math.abs(opt.priceModifier))})` : '';
                
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      // If already selected, deselect it
                      if (selectedOption?.value === opt.value) {
                        handleOptionChange(option.id, '', 0);
                      } else {
                        handleOptionChange(option.id, opt.value, opt.priceModifier);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? 'border-[#18b5d8] bg-[#18b5d8]/20 shadow-lg shadow-[#18b5d8]/30'
                        : 'border-[#18b5d8]/30 bg-[#1a1a1a]/90 hover:border-[#18b5d8]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected ? 'border-[#18b5d8] bg-[#18b5d8]' : 'border-gray-400'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-white font-medium">{getLocalizedOptionLabel(opt)}</span>
                      </div>
                      {opt.priceModifier !== 0 && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          opt.priceModifier > 0 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {priceText}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {hasError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                  {hasError}
                </p>
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={option.id} className={`bg-[#2a2a2a]/90 rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 ${
            hasError 
              ? 'border-red-400/60 bg-red-900/10 shadow-lg shadow-red-500/20' 
              : 'border-[#18b5d8]/30'
          }`}>
            <label className={`block text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
              hasError ? 'text-red-300' : 'text-white'
            }`}>
              <div className={`w-1.5 h-5 rounded-full transition-colors duration-300 ${
                hasError ? 'bg-red-400' : 'bg-[#18b5d8]'
              }`}></div>
              {getLocalizedContent('label', option)}
              {option.required && (
                <span className={`text-lg transition-colors duration-300 ${
                  hasError ? 'text-red-400 animate-pulse' : 'text-[#18b5d8]'
                }`}>*</span>
              )}
              {hasError && (
                <span className="text-red-400 text-sm font-normal animate-pulse">
                  ({language === 'ar' ? 'مطلوب' : 'Required'})
                </span>
              )}
            </label>
            <div className="space-y-3">
              {option.options?.map(opt => {
                const isSelected = Array.isArray(selectedOption?.value) && selectedOption.value.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      const currentValues = Array.isArray(selectedOption?.value) ? selectedOption.value : [];
                      const newValues = isSelected 
                        ? currentValues.filter(v => v !== opt.value)
                        : [...currentValues, opt.value];
                      handleOptionChange(option.id, newValues, opt.priceModifier);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? 'border-[#18b5d8] bg-[#18b5d8]/20 shadow-lg shadow-[#18b5d8]/30'
                        : 'border-[#18b5d8]/30 bg-[#1a1a1a]/90 hover:border-[#18b5d8]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected ? 'border-[#18b5d8] bg-[#18b5d8]' : 'border-gray-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-white font-medium">{getLocalizedOptionLabel(opt)}</span>
                      </div>
                      {opt.priceModifier !== 0 && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          opt.priceModifier > 0 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {opt.priceModifier > 0 ? '+' : ''}{formatPrice(Math.abs(opt.priceModifier))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {hasError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                  {hasError}
                </p>
              </div>
            )}
          </div>
        );

      case 'color':
        return (
          <div key={option.id} className={`bg-gradient-to-br from-[#2a2a2a]/90 via-[#1f1f1f]/85 to-[#1a1a1a]/90 rounded-3xl p-8 border backdrop-blur-lg shadow-2xl transition-all duration-300 ${
            hasError 
              ? 'border-red-400/60 bg-red-900/10 shadow-lg shadow-red-500/20' 
              : 'border-[#18b5d8]/30'
          }`}>
            <label className={`block text-xl font-bold mb-6 flex items-center gap-4 transition-colors duration-300 ${
              hasError ? 'text-red-300' : 'text-white'
            }`}>
              <div className={`w-3 h-8 rounded-full shadow-lg transition-colors duration-300 ${
                hasError ? 'bg-gradient-to-b from-red-400 via-red-500 to-red-600' : 'bg-gradient-to-b from-[#18b5d8] via-[#0ea5e9] to-[#0284c7]'
              }`}></div>
              <Palette className={`w-6 h-6 transition-colors duration-300 ${
                hasError ? 'text-red-400' : 'text-[#18b5d8]'
              }`} />
              {getLocalizedContent('label', option)}
              {option.required && (
                <span className={`text-2xl transition-colors duration-300 ${
                  hasError ? 'text-red-400 animate-pulse' : 'text-[#18b5d8] animate-pulse'
                }`}>*</span>
              )}
              {hasError && (
                <span className="text-red-400 text-sm font-normal animate-pulse">
                  ({language === 'ar' ? 'مطلوب' : 'Required'})
                </span>
              )}
            </label>
            
            {/* Selected Color Display - Ultra Modern */}
            {selectedOption?.value && (
              <div className="mb-8 p-6 bg-gradient-to-br from-[#18b5d8]/25 via-[#0ea5e9]/20 to-[#0284c7]/25 rounded-3xl backdrop-blur-md border border-[#18b5d8]/50 shadow-2xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                
                <div className="relative flex items-center gap-6">
                  <div className="relative group">
                    <div 
                      className="w-12 h-12 rounded-2xl border-3 border-white/60 shadow-lg ring-2 ring-[#18b5d8]/40 transition-all duration-300 group-hover:scale-105"
                      style={{ backgroundColor: option.options?.find(opt => opt.value === selectedOption.value)?.colorCode || selectedOption.value as string }}
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#18b5d8] to-[#0ea5e9] rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {/* Hover Glow Effect - Simplified */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    {/* Glow Ring - Simplified */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#18b5d8]/20 to-[#0ea5d8]/20 blur-lg scale-125 -z-10"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#18b5d8]" />
                      {language === 'ar' ? 'اللون المختار' : 'Selected Color'}
                    </div>
                    <div className="text-[#18b5d8] font-semibold text-lg mb-3">
                      {getLocalizedOptionLabel(option.options?.find(opt => opt.value === selectedOption.value) || { label: { ar: '', en: '' } })}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {option.options?.find(opt => opt.value === selectedOption.value)?.priceModifier !== 0 && (
                        <div className={`px-4 py-2 rounded-2xl text-sm font-bold inline-flex items-center gap-2 ${
                          (option.options?.find(opt => opt.value === selectedOption.value)?.priceModifier || 0) > 0 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/40 shadow-lg' 
                            : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/40 shadow-lg'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            (option.options?.find(opt => opt.value === selectedOption.value)?.priceModifier || 0) > 0 ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          {(option.options?.find(opt => opt.value === selectedOption.value)?.priceModifier || 0) > 0 ? '+' : ''}{formatPrice(Math.abs(option.options?.find(opt => opt.value === selectedOption.value)?.priceModifier || 0))}
                        </div>
                      )}
                      
                      {/* Clear Selection Button */}
                      <button
                        type="button"
                        onClick={() => handleOptionChange(option.id, '', 0)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/40 rounded-2xl hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400/60 transition-all duration-300 font-medium text-sm flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                          <div className="w-2 h-0.5 bg-current"></div>
                        </div>
                        {language === 'ar' ? 'إلغاء الاختيار' : 'Clear Selection'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Options Grid - Improved Spacing */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
              {option.options?.map((opt, index) => {
                const isSelected = selectedOption?.value === opt.value;
                return (
                  <div key={opt.value} className="relative group flex flex-col items-center" style={{ animationDelay: `${index * 50}ms` }}>
                    <button
                      type="button"
                      onClick={() => handleOptionChange(option.id, opt.value, opt.priceModifier)}
                      className={`relative w-12 h-12 rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                        isSelected
                          ? 'border-[#18b5d8] ring-2 ring-[#18b5d8]/50 scale-110 shadow-lg z-10'
                          : 'border-white/40 hover:border-[#18b5d8]/80 shadow-md hover:ring-2 hover:ring-[#18b5d8]/30'
                      } focus:outline-none focus:ring-2 focus:ring-[#18b5d8]/60`}
                      style={{ 
                        backgroundColor: opt.colorCode || opt.value,
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Selection Indicator - Smaller */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <Check className="w-4 h-4 text-[#18b5d8]" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Glow Effect - Simplified */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      
                      {/* Glow Ring - Simplified */}
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#18b5d8]/20 to-[#0ea5e9]/20 blur-lg scale-125' 
                          : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#18b5d8]/10 to-[#0ea5e9]/10 blur-md scale-110'
                      } -z-10`}></div>
                    </button>
                    
                    {/* Simplified Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg backdrop-blur-sm border border-white/10">
                      <div className="font-medium text-center">{getLocalizedOptionLabel(opt)}</div>
                      {opt.priceModifier !== 0 && (
                        <div className={`text-center font-medium mt-1 text-xs flex items-center justify-center gap-1 ${
                          opt.priceModifier > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${opt.priceModifier > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          {opt.priceModifier > 0 ? '+' : ''}{formatPrice(Math.abs(opt.priceModifier))}
                        </div>
                      )}
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                    </div>
                    
                    {/* Color Name Label - Compact */}
                    <div className="mt-2 text-center">
                      <div className="text-white/80 text-xs font-medium truncate px-2 py-1 bg-white/5 rounded-lg backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10 group-hover:text-white max-w-16">
                        {getLocalizedOptionLabel(opt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasError && <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
              <span className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">!</span>
              {hasError}
            </p>}
          </div>
        );

      case 'text':
      case 'number':
        return (
          <div key={option.id} className={`bg-[#2a2a2a]/90 rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 ${
            hasError 
              ? 'border-red-400/60 bg-red-900/10 shadow-lg shadow-red-500/20' 
              : 'border-[#18b5d8]/30'
          }`}>
            <label className={`block text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
              hasError ? 'text-red-300' : 'text-white'
            }`}>
              <div className={`w-1.5 h-5 rounded-full transition-colors duration-300 ${
                hasError ? 'bg-red-400' : 'bg-[#18b5d8]'
              }`}></div>
              {getLocalizedContent('label', option)}
              {option.required && (
                <span className={`text-lg transition-colors duration-300 ${
                  hasError ? 'text-red-400 animate-pulse' : 'text-[#18b5d8]'
                }`}>*</span>
              )}
              {hasError && (
                <span className="text-red-400 text-sm font-normal animate-pulse">
                  ({language === 'ar' ? 'مطلوب' : 'Required'})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={option.type}
                placeholder={getSmartPlaceholder(option)}
                value={selectedOption?.value as string || ''}
                onChange={(e) => handleOptionChange(option.id, e.target.value, 0)}
                className={`w-full p-3 rounded-lg border bg-[#1a1a1a]/90 text-white focus:outline-none transition-all duration-200 ${
                  hasError 
                    ? 'border-red-400/60 bg-red-900/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30' 
                    : 'border-[#18b5d8]/40 focus:border-[#18b5d8] focus:ring-2 focus:ring-[#18b5d8]/30'
                }`}
                min={option.validation?.min}
                max={option.validation?.max}
              />
            </div>
            {hasError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                  {hasError}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sortedOptions.map(renderOption)}
    </div>
  );
};

export default ProductOptionsSelector;