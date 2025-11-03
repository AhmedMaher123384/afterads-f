import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Palette } from 'lucide-react';

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

interface ProductOptionsBuilderProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  language: 'ar' | 'en';
  errors?: { [key: string]: string };
}

// Color Picker Component
const ColorPickerInput: React.FC<{
  value: string;
  onChange: (color: string) => void;
  language: 'ar' | 'en';
}> = ({ value, onChange, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  // Popular color presets
  const colorPresets = [
    '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F',
    '#00FF00', '#00CED1', '#0000FF', '#4169E1', '#8A2BE2', '#FF1493',
    '#FF69B4', '#FFC0CB', '#000000', '#808080', '#FFFFFF', '#8B4513',
    '#D2691E', '#CD853F', '#F5DEB3', '#FFFACD', '#E6E6FA', '#DDA0DD'
  ];

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all duration-200 cursor-pointer bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div 
          className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-inner flex items-center justify-center"
          style={{ backgroundColor: value }}
        >
          {!value && <Palette size={16} className="text-gray-400" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">
            {language === 'ar' ? 'اللون المختار' : 'Selected Color'}
          </div>
          <div className="text-xs text-gray-500 uppercase">{value}</div>
        </div>
        <div className="text-gray-400">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          {/* Color Presets */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              {language === 'ar' ? 'ألوان شائعة' : 'Popular Colors'}
            </div>
            <div className="grid grid-cols-8 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    value === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              {language === 'ar' ? 'لون مخصص' : 'Custom Color'}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    onChange(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'ar' ? 'تم' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductOptionsBuilder: React.FC<ProductOptionsBuilderProps> = ({
  options,
  onChange,
  language,
  errors = {}
}) => {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const addOption = () => {
    const optionNumber = options.length + 1;
    const newOption: ProductOption = {
      id: Date.now().toString(),
      type: 'dropdown',
      name: { 
        ar: `خيار ${optionNumber}`, 
        en: `Option ${optionNumber}` 
      },
      label: { 
        ar: `اختر خيار ${optionNumber}`, 
        en: `Choose Option ${optionNumber}` 
      },
      required: false,
      options: [],
      placeholder: { ar: '', en: '' },
      order: options.length
    };
    onChange([...options, newOption]);
    setExpandedOption(newOption.id);
  };

  const deleteOption = (optionId: string) => {
    onChange(options.filter(opt => opt.id !== optionId));
  };

  const updateOption = (optionId: string, updates: Partial<ProductOption>) => {
    onChange(options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    ));
  };

  const addOptionValue = (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return;

    // عدد القيم الحالية للخيار لإنشاء ترقيم بسيط
    const currentValuesCount = option.options?.length || 0;
    const nextNumber = currentValuesCount + 1;

    let defaultValue = '';
    let defaultLabelAr = '';
    let defaultLabelEn = '';
    let defaultColorCode = undefined;

    // تحديد القيم الافتراضية حسب نوع الخيار
    switch (option.type) {
      case 'color':
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        const colorNames = [
          { ar: 'أحمر', en: 'Red' },
          { ar: 'أخضر', en: 'Green' },
          { ar: 'أزرق', en: 'Blue' },
          { ar: 'أصفر', en: 'Yellow' },
          { ar: 'بنفسجي', en: 'Purple' },
          { ar: 'سماوي', en: 'Cyan' }
        ];
        const colorIndex = (currentValuesCount) % colors.length;
        defaultValue = colors[colorIndex];
        defaultLabelAr = colorNames[colorIndex].ar;
        defaultLabelEn = colorNames[colorIndex].en;
        defaultColorCode = colors[colorIndex];
        break;
      case 'dropdown':
      case 'radio':
        defaultValue = `option-${nextNumber}`;
        defaultLabelAr = `خيار ${nextNumber}`;
        defaultLabelEn = `Option ${nextNumber}`;
        break;
      case 'checkbox':
        defaultValue = `feature-${nextNumber}`;
        defaultLabelAr = `ميزة ${nextNumber}`;
        defaultLabelEn = `Feature ${nextNumber}`;
        break;
      default:
        defaultValue = `value-${nextNumber}`;
        defaultLabelAr = `قيمة ${nextNumber}`;
        defaultLabelEn = `Value ${nextNumber}`;
    }
    
    const newValue = {
      value: defaultValue,
      label: { ar: defaultLabelAr, en: defaultLabelEn },
      priceModifier: 0,
      colorCode: defaultColorCode
    };

    updateOption(optionId, {
      options: [...(option.options || []), newValue]
    });
  };

  const updateOptionValue = (optionId: string, valueIndex: number, updates: any) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || !option.options) return;

    const updatedOptions = option.options.map((value, index) =>
      index === valueIndex ? { ...value, ...updates } : value
    );

    updateOption(optionId, { options: updatedOptions });
  };

  const deleteOptionValue = (optionId: string, valueIndex: number) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || !option.options) return;

    const updatedOptions = option.options.filter((_, index) => index !== valueIndex);
    updateOption(optionId, { options: updatedOptions });
  };

  const optionTypes = [
    { value: 'dropdown', label: language === 'ar' ? 'قائمة منسدلة' : 'Dropdown' },
    { value: 'radio', label: language === 'ar' ? 'اختيار واحد' : 'Radio Buttons' },
    { value: 'checkbox', label: language === 'ar' ? 'اختيار متعدد' : 'Checkboxes' },
    { value: 'text', label: language === 'ar' ? 'نص' : 'Text Input' },
    { value: 'number', label: language === 'ar' ? 'رقم' : 'Number Input' },
    { value: 'color', label: language === 'ar' ? 'لون' : 'Color Picker' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'خيارات المنتج' : 'Product Options'}
        </h3>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {language === 'ar' ? 'إضافة خيار' : 'Add Option'}
        </button>
      </div>

      {options.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          {language === 'ar' ? 'لا توجد خيارات. اضغط "إضافة خيار" لبدء إضافة الخيارات.' : 'No options yet. Click "Add Option" to start adding options.'}
        </div>
      )}

      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={option.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="cursor-move text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => {
                    // Simple drag and drop implementation would go here
                    e.preventDefault();
                  }}
                >
                  <GripVertical size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedOption(expandedOption === option.id ? null : option.id)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  {expandedOption === option.id ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="font-medium">
                    {option.label[language] || (language === 'ar' ? 'خيار جديد' : 'New Option')}
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => deleteOption(option.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {expandedOption === option.id && (
              <div className="space-y-4">
                {/* Option Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'نوع الخيار' : 'Option Type'}
                  </label>
                  <select
                    value={option.type}
                    onChange={(e) => updateOption(option.id, { 
                      type: e.target.value as ProductOption['type'],
                      options: ['dropdown', 'radio', 'checkbox', 'color'].includes(e.target.value) ? (option.options || []) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {optionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Option Name & Label */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'اسم الخيار (عربي)' : 'Option Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={option.name.ar}
                      onChange={(e) => updateOption(option.id, {
                        name: { ...option.name, ar: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: اللون"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'اسم الخيار (إنجليزي)' : 'Option Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={option.name.en}
                      onChange={(e) => updateOption(option.id, {
                        name: { ...option.name, en: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Example: Color"
                    />
                  </div>
                </div>
                {errors[`productOption_${index}_name`] && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors[`productOption_${index}_name`]}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'تسمية الخيار (عربي)' : 'Option Label (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={option.label.ar}
                      onChange={(e) => updateOption(option.id, {
                        label: { ...option.label, ar: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: اختر اللون"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'تسمية الخيار (إنجليزي)' : 'Option Label (English)'}
                    </label>
                    <input
                      type="text"
                      value={option.label.en}
                      onChange={(e) => updateOption(option.id, {
                        label: { ...option.label, en: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Example: Choose Color"
                    />
                  </div>
                </div>
                {errors[`productOption_${index}_label`] && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors[`productOption_${index}_label`]}
                  </div>
                )}

                {/* Required Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${option.id}`}
                    checked={option.required}
                    onChange={(e) => updateOption(option.id, { required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`required-${option.id}`} className="text-sm text-gray-700">
                    {language === 'ar' ? 'خيار مطلوب' : 'Required Option'}
                  </label>
                </div>

                {/* Placeholder for text/number inputs */}
                {['text', 'number'].includes(option.type) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'النص التوضيحي (عربي)' : 'Placeholder (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={option.placeholder?.ar || ''}
                        onChange={(e) => updateOption(option.id, {
                          placeholder: { 
                            ar: e.target.value,
                            en: option.placeholder?.en || ''
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'النص التوضيحي (إنجليزي)' : 'Placeholder (English)'}
                      </label>
                      <input
                        type="text"
                        value={option.placeholder?.en || ''}
                        onChange={(e) => updateOption(option.id, {
                          placeholder: { 
                            ar: option.placeholder?.ar || '',
                            en: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Validation for number inputs */}
                {option.type === 'number' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'الحد الأدنى' : 'Minimum Value'}
                      </label>
                      <input
                        type="number"
                        value={option.validation?.min || ''}
                        onChange={(e) => updateOption(option.id, {
                          validation: { 
                            ...option.validation,
                            min: Number(e.target.value) || undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'الحد الأقصى' : 'Maximum Value'}
                      </label>
                      <input
                        type="number"
                        value={option.validation?.max || ''}
                        onChange={(e) => updateOption(option.id, {
                          validation: { 
                            ...option.validation,
                            max: Number(e.target.value) || undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Option Values for dropdown, radio, checkbox, color */}
                {['dropdown', 'radio', 'checkbox', 'color'].includes(option.type) && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'قيم الخيار' : 'Option Values'}
                        </label>
                        {/* نصائح مفيدة للمستخدم */}
                        <div className="text-xs text-gray-500 mt-1">
                          {option.type === 'color' && (
                            language === 'ar' 
                              ? 'القيمة: كود اللون (مثل #FF0000)، التسمية: اسم اللون'
                              : 'Value: Color code (e.g. #FF0000), Label: Color name'
                          )}
                          {(option.type === 'dropdown' || option.type === 'radio') && (
                            language === 'ar' 
                              ? 'القيمة: معرف فريد (مثل size-large)، التسمية: النص المعروض'
                              : 'Value: Unique ID (e.g. size-large), Label: Display text'
                          )}
                          {option.type === 'checkbox' && (
                            language === 'ar' 
                              ? 'القيمة: معرف الميزة (مثل feature-waterproof)، التسمية: وصف الميزة'
                              : 'Value: Feature ID (e.g. feature-waterproof), Label: Feature description'
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addOptionValue(option.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Plus size={14} />
                        {language === 'ar' ? 'إضافة قيمة' : 'Add Value'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(option.options || []).map((value, valueIndex) => (
                        <div key={valueIndex} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          option.type === 'color' 
                            ? 'bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start gap-4">
                            {/* Color Preview for color type */}
                            {option.type === 'color' && (
                              <div className="flex-shrink-0">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  {language === 'ar' ? 'معاينة اللون' : 'Color Preview'}
                                </div>
                                <ColorPickerInput
                                  value={value.colorCode || '#000000'}
                                  onChange={(color) => updateOptionValue(option.id, valueIndex, { colorCode: color, value: color })}
                                  language={language}
                                />
                              </div>
                            )}
                            
                            {/* Option Details */}
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {language === 'ar' ? 'القيمة' : 'Value'}
                                  </label>
                                  <input
                                    type="text"
                                    value={value.value}
                                    onChange={(e) => {
                                      const updates: any = { value: e.target.value };
                                      if (option.type === 'color' && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                        updates.colorCode = e.target.value;
                                      }
                                      updateOptionValue(option.id, valueIndex, updates);
                                    }}
                                    placeholder={(() => {
                                      switch (option.type) {
                                        case 'color':
                                          return language === 'ar' ? '#FF0000' : '#FF0000';
                                        case 'dropdown':
                                        case 'radio':
                                          return language === 'ar' ? 'size-large' : 'size-large';
                                        case 'checkbox':
                                          return language === 'ar' ? 'feature-waterproof' : 'feature-waterproof';
                                        default:
                                          return language === 'ar' ? 'القيمة' : 'Value';
                                      }
                                    })()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {language === 'ar' ? 'التسمية (عربي)' : 'Label (Arabic)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={value.label.ar}
                                    onChange={(e) => updateOptionValue(option.id, valueIndex, { 
                                      label: { ...value.label, ar: e.target.value }
                                    })}
                                    placeholder={(() => {
                                      switch (option.type) {
                                        case 'color':
                                          return 'أحمر';
                                        case 'dropdown':
                                        case 'radio':
                                          return 'كبير';
                                        case 'checkbox':
                                          return 'مقاوم للماء';
                                        default:
                                          return 'التسمية (عربي)';
                                      }
                                    })()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {language === 'ar' ? 'التسمية (إنجليزي)' : 'Label (English)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={value.label.en}
                                    onChange={(e) => updateOptionValue(option.id, valueIndex, { 
                                      label: { ...value.label, en: e.target.value }
                                    })}
                                    placeholder={(() => {
                                      switch (option.type) {
                                        case 'color':
                                          return 'Red';
                                        case 'dropdown':
                                        case 'radio':
                                          return 'Large';
                                        case 'checkbox':
                                          return 'Waterproof';
                                        default:
                                          return 'Label (English)';
                                      }
                                    })()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {language === 'ar' ? 'تعديل السعر' : 'Price Modifier'}
                                  </label>
                                  <input
                                    type="number"
                                    value={value.priceModifier}
                                    onChange={(e) => updateOptionValue(option.id, valueIndex, { 
                                      priceModifier: Number(e.target.value) || 0 
                                    })}
                                    placeholder={language === 'ar' ? 'تعديل السعر' : 'Price +/-'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteOptionValue(option.id, valueIndex)}
                                  className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Error display for this option value */}
                          {(errors[`productOption_${index}_value_${valueIndex}`] || 
                            errors[`productOption_${index}_value_${valueIndex}_label`]) && (
                            <div className="mt-2 space-y-1">
                              {errors[`productOption_${index}_value_${valueIndex}`] && (
                                <div className="text-red-500 text-xs">
                                  {errors[`productOption_${index}_value_${valueIndex}`]}
                                </div>
                              )}
                              {errors[`productOption_${index}_value_${valueIndex}_label`] && (
                                <div className="text-red-500 text-xs">
                                  {errors[`productOption_${index}_value_${valueIndex}_label`]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Error display for missing option values */}
                    {errors[`productOption_${index}_values`] && (
                      <div className="text-red-500 text-sm mt-2">
                        {errors[`productOption_${index}_values`]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductOptionsBuilder;