import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../config/api';

interface Category {
  id: number;
  name: string;
  description: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  image: string;
  parentId?: number | null;
  createdAt?: string;
}

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategory?: Category | null;
  parentCategoryId?: number | null;
}

const SubcategoryModal: React.FC<SubcategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subcategory,
  parentCategoryId 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    image: string;
    parentId: number | null;
  }>({
    name: '',
    description: '',
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    image: '',
    parentId: parentCategoryId || null
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!subcategory;

  // Fetch parent categories
  const fetchCategories = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.CATEGORIES, {
        method: 'GET'
      });
      
      if (Array.isArray(response)) {
        // Filter only main categories (without parentId)
        const mainCategories = response.filter(cat => !cat.parentId);
        setCategories(mainCategories);
      } else if (response.success && response.data) {
        const mainCategories = response.data.filter((cat: Category) => !cat.parentId);
        setCategories(mainCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      smartToast.dashboard.error('فشل في تحميل التصنيفات الرئيسية');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      if (subcategory) {
        setFormData({
          name: subcategory.name,
          description: subcategory.description,
          name_ar: subcategory.name_ar || '',
          name_en: subcategory.name_en || '',
          description_ar: subcategory.description_ar || '',
          description_en: subcategory.description_en || '',
          image: subcategory.image,
          parentId: subcategory.parentId || null
        });
        if (subcategory.image) {
          setImagePreview(buildImageUrl(subcategory.image));
        }
      } else {
        setFormData({
          name: '',
          description: '',
          name_ar: '',
          name_en: '',
          description_ar: '',
          description_en: '',
          image: '',
          parentId: parentCategoryId || null
        });
        setImagePreview('');
      }
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, subcategory, parentCategoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'parentId' ? (value ? parseInt(value) : null) : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name_ar.trim() && !formData.name_en.trim()) {
      newErrors.name = 'يجب إدخال اسم التصنيف الفرعي في لغة واحدة على الأقل';
    }

    if (!formData.description_ar.trim() && !formData.description_en.trim()) {
      newErrors.description = 'يجب إدخال وصف التصنيف الفرعي في لغة واحدة على الأقل';
    }

    if (!formData.parentId) {
      newErrors.parentId = 'يجب اختيار التصنيف الرئيسي';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      
      // Add multilingual fields
      submitFormData.append('name_ar', formData.name_ar.trim());
      submitFormData.append('name_en', formData.name_en.trim());
      submitFormData.append('description_ar', formData.description_ar.trim());
      submitFormData.append('description_en', formData.description_en.trim());
      submitFormData.append('parentId', formData.parentId!.toString());
      
      // Keep backward compatibility
      submitFormData.append('name', formData.name_ar.trim() || formData.name_en.trim());
      submitFormData.append('description', formData.description_ar.trim() || formData.description_en.trim());

      if (imageFile) {
        submitFormData.append('mainImage', imageFile);
      }

      const endpoint = isEditing
        ? `/api/subcategories/${subcategory!.id}`
        : '/api/subcategories';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(buildApiUrl(endpoint), {
        method,
        body: submitFormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في حفظ التصنيف الفرعي');
      }

      smartToast.dashboard.success(`تم ${isEditing ? 'تحديث' : 'إضافة'} التصنيف الفرعي بنجاح!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      smartToast.dashboard.error((error as Error).message || 'حدث خطأ أثناء حفظ التصنيف الفرعي');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? 'تعديل التصنيف الفرعي' : 'إضافة تصنيف فرعي جديد'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-xl p-1 flex">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('ar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguage === 'ar'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguage === 'en'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف الرئيسي *
              </label>
              <select
                name="parentId"
                value={formData.parentId || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                  errors.parentId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">اختر التصنيف الرئيسي</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar || category.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="text-red-500 text-sm mt-1">{errors.parentId}</p>
              )}
            </div>

            {/* Subcategory Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedLanguage === 'ar' ? 'اسم التصنيف الفرعي *' : 'Subcategory Name *'}
              </label>
              <input
                type="text"
                name={selectedLanguage === 'ar' ? 'name_ar' : 'name_en'}
                value={selectedLanguage === 'ar' ? formData.name_ar : formData.name_en}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={selectedLanguage === 'ar' ? 'أدخل اسم التصنيف الفرعي' : 'Enter subcategory name'}
                dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Subcategory Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedLanguage === 'ar' ? 'وصف التصنيف الفرعي *' : 'Subcategory Description *'}
              </label>
              <textarea
                name={selectedLanguage === 'ar' ? 'description_ar' : 'description_en'}
                value={selectedLanguage === 'ar' ? formData.description_ar : formData.description_en}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={selectedLanguage === 'ar' ? 'أدخل وصف التصنيف الفرعي' : 'Enter subcategory description'}
                dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Subcategory Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة التصنيف الفرعي
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-32 h-32 object-cover rounded-xl border border-gray-300"
                  />
                </div>
              )}

              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-black transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'اختر صورة للتصنيف الفرعي'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF حتى 10MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث التصنيف الفرعي' : 'إضافة التصنيف الفرعي')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryModal;