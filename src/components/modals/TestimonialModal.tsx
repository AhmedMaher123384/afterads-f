import React, { useState, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl } from '../../config/api';

interface Testimonial {
  id: number;
  name: string;
  position?: string;
  image?: string;
  testimonial: string;
  rating?: number;
  isActive?: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, testimonialData: Partial<Testimonial>) => void;
  editingTestimonial?: Testimonial | null;
  initialData?: Partial<Testimonial>;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTestimonial,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    position: '',
    image: '',
    testimonial: '',
    rating: 5,
    isActive: true,
    featured: false
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingTestimonial) {
      setFormData({
        name: editingTestimonial.name,
        position: editingTestimonial.position || '',
        image: editingTestimonial.image,
        testimonial: editingTestimonial.testimonial,
        rating: editingTestimonial.rating || 5,
        isActive: editingTestimonial.isActive !== undefined ? editingTestimonial.isActive : true,
        featured: editingTestimonial.featured || false
      });
      if (editingTestimonial.image) {
        setImagePreview(buildImageUrl(editingTestimonial.image));
      } else {
        setImagePreview('');
      }
    } else if (initialData) {
      setFormData({
        name: initialData.name || '',
        position: initialData.position || '',
        image: initialData.image || '',
        testimonial: initialData.testimonial || '',
        rating: initialData.rating || 5,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        featured: initialData.featured || false
      });
      if (initialData.image) {
        setImagePreview(buildImageUrl(initialData.image));
      } else {
        setImagePreview('');
      }
    } else {
      setFormData({
        name: '',
        position: '',
        image: '',
        testimonial: '',
        rating: 5,
        isActive: true,
        featured: false
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [editingTestimonial, initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.dashboard.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      smartToast.dashboard.error('اسم العميل مطلوب');
      return;
    }

    if (!formData.testimonial?.trim()) {
      smartToast.dashboard.error('نص الشهادة مطلوب');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name || '');
      submitFormData.append('position', formData.position || '');
      submitFormData.append('testimonial', formData.testimonial || '');
      submitFormData.append('rating', (formData.rating || 5).toString());
      submitFormData.append('isActive', (formData.isActive !== undefined ? formData.isActive : true).toString());
      submitFormData.append('featured', (formData.featured || false).toString());
      
      // Add image file if selected
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }
      
      const testimonialData: Partial<Testimonial> = {
        name: formData.name,
        position: formData.position,
        testimonial: formData.testimonial,
        rating: formData.rating,
        isActive: formData.isActive,
        featured: formData.featured
      };
      
      await onSave(submitFormData, testimonialData);
      onClose();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      smartToast.dashboard.error('فشل في حفظ الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      position: '',
      image: '',
      testimonial: '',
      rating: 5,
      isActive: true,
      featured: false
    });
    setImageFile(null);
    setImagePreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-black border-b border-black">
          <h2 className="text-2xl font-bold text-white">
            {editingTestimonial ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              اسم العميل *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="أدخل اسم العميل"
              required
            />
          </div>

          {/* Customer Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              منصب العميل
            </label>
            <input
              type="text"
              name="position"
              value={formData.position || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="أدخل منصب أو وظيفة العميل"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              صورة العميل
            </label>
            <div className="border-2 border-dashed border-black rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Customer preview"
                    className="mx-auto h-32 w-32 object-cover rounded-full"
                  />
                  <div className="flex justify-center gap-2">
                    <label className="cursor-pointer bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      <Upload className="w-4 h-4 inline mr-2" />
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg hover:bg-black transition-colors inline-block">
                      <Upload className="w-4 h-4 inline mr-2" />
                      اختر صورة العميل
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF حتى 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التقييم
            </label>
            <select
              name="rating"
              value={formData.rating || 5}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value={5}>5 نجوم</option>
              <option value={4}>4 نجوم</option>
              <option value={3}>3 نجوم</option>
              <option value={2}>2 نجوم</option>
              <option value={1}>1 نجمة</option>
            </select>
          </div>

          {/* Status Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                نشط
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured || false}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="mr-2 block text-sm text-gray-900">
                مميز
              </label>
            </div>
          </div>

          {/* Testimonial Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نص الشهادة *
            </label>
            <textarea
              name="testimonial"
              value={formData.testimonial || ''}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="أدخل نص الشهادة..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-gray-50 px-6 py-4 -mx-6 -mb-6 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الحفظ...' : (editingTestimonial ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialModal;