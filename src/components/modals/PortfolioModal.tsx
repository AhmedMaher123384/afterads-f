import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../config/api';
import { getPortfolioCategories, createPortfolio, updatePortfolio } from '../../utils/api';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  mainImage: string;
  projectUrl?: string;
  categoryId: number | null;
}

interface PortfolioCategory {
  id: number;
  name: string;
  description: string;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  portfolio?: Portfolio | null;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, onSuccess, portfolio }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainImage: null as File | string | null,
    projectUrl: '',
    categoryId: null as number | null
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (portfolio) {
        setFormData({
          title: portfolio.title || '',
          description: portfolio.description || '',
          mainImage: portfolio.mainImage || null,
          projectUrl: portfolio.projectUrl || '',
          categoryId: portfolio.categoryId
        });
        if (portfolio.mainImage) {
          setImagePreview(buildImageUrl(portfolio.mainImage));
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, portfolio]);

  const fetchCategories = async () => {
    try {
      const response = await getPortfolioCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
        title: '',
        description: '',
        mainImage: null,
        projectUrl: '',
        categoryId: null
      });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        smartToast.dashboard.error('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        smartToast.dashboard.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setImageFile(file);
      setFormData(prev => ({ ...prev, mainImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'اسم العمل مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'وصف العمل مطلوب';
    }
    
    if (!portfolio && !imageFile) {
      newErrors.image = 'صورة العمل مطلوبة';
    }
    
    if (formData.projectUrl && !isValidUrl(formData.projectUrl)) {
      newErrors.projectUrl = 'رابط العمل غير صحيح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = formData.mainImage;
      
      // Upload image if a new file is selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        try {
          const imageResponse = await apiCall(API_ENDPOINTS.UPLOAD_ATTACHMENTS, {
            method: 'POST',
            body: imageFormData, 
            headers: {} // Let browser set Content-Type for FormData
          });
          
          if (imageResponse.imagePaths && imageResponse.imagePaths.length > 0) {
            imageUrl = imageResponse.imagePaths[0];
          } else {
            throw new Error('فشل في رفع الصورة'); 
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          smartToast.dashboard.error('فشل في رفع الصورة');
          setLoading(false);
          return;
        }
      }
      
      // Prepare data for API call
      const portfolioData = {
        title: formData.title,
        description: formData.description,
        projectUrl: formData.projectUrl,
        categoryId: formData.categoryId,
        mainImage: imageUrl
      };
      
      console.log('Portfolio data to send:', portfolioData);
      console.log('Portfolio ID:', portfolio?.id);
      
      let response;
      if (portfolio) {
        console.log('Updating portfolio with ID:', portfolio.id);
        response = await updatePortfolio(portfolio.id.toString(), portfolioData);
      } else {
        console.log('Creating new portfolio');
        response = await createPortfolio(portfolioData);
      }
      
      console.log('API Response:', response);
      
      if (response.success) {
        smartToast.dashboard.success(portfolio ? 'تم تحديث العمل بنجاح' : 'تم إضافة العمل بنجاح');
        resetForm();
        onClose();
        onSuccess();
      } else {
        console.error('API Error:', response);
        smartToast.dashboard.error(response.message || 'حدث خطأ أثناء حفظ العمل');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      smartToast.dashboard.error('حدث خطأ أثناء حفظ العمل');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {portfolio ? 'تعديل العمل' : 'إضافة عمل جديد'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                المعلومات الأساسية
              </h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم العمل *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسم العمل"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وصف العمل *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل وصف العمل"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رابط العمل
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="projectUrl"
                      value={formData.projectUrl}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors.projectUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com"
                    />
                    <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.projectUrl && <p className="text-red-500 text-sm mt-1">{errors.projectUrl}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    التصنيف
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          {/* Image Upload */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                صورة العمل
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الصورة المميزة {!portfolio && '*'}
                  <span className="text-xs text-gray-500 mr-2">(يمكن السحب والإفلات)</span>
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, mainImage: null }));
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="portfolio-image"
                    />
                    <label htmlFor="portfolio-image" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          اضغط لاختيار صورة أو اسحبها هنا
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF حتى 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                {errors.mainImage && <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>}
              </div>
            </div>



          {/* Submit Buttons */}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
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
            {loading ? 'جاري الحفظ...' : (
              portfolio ? 'تحديث العمل' : 'إضافة العمل'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;