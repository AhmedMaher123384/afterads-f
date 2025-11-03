import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../config/api';
import { createPortfolioCategory, updatePortfolioCategory } from '../../utils/api';

interface PortfolioCategory {
  id: number;
  name: string;
  createdAt?: string;
}

interface PortfolioCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: PortfolioCategory | null;
}

const PortfolioCategoryModal: React.FC<PortfolioCategoryModalProps> = ({ isOpen, onClose, onSuccess, category }) => {
  const [formData, setFormData] = useState<{
    name: string;
  }>({
    name: ''
  });


  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!category;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, category]);

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم التصنيف مطلوب';
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
      // Prepare data for API call
      const categoryData = {
        name: formData.name
      };
      
      let response;
      if (isEditing && category) {
        response = await updatePortfolioCategory(category.id.toString(), categoryData);
      } else {
        response = await createPortfolioCategory(categoryData);
      }
      
      if (response.success) {
        smartToast.dashboard.success(isEditing ? 'تم تحديث التصنيف بنجاح' : 'تم إضافة التصنيف بنجاح');
        onSuccess();
      } else {
        smartToast.dashboard.error(response.message || 'حدث خطأ أثناء حفظ التصنيف');
      }
    } catch (error) {
      console.error('Error saving portfolio category:', error);
      smartToast.dashboard.error('حدث خطأ أثناء حفظ التصنيف');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'تعديل تصنيف Portfolio' : 'إضافة تصنيف Portfolio جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم التصنيف *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل اسم التصنيف"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>



          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isEditing ? 'تحديث التصنيف' : 'إضافة التصنيف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioCategoryModal;