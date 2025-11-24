import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Plus, Edit2, Trash2, AlertCircle, X, Folder, CheckCircle, Layers, FileText, Settings, Image, ArrowUpDown, AlignRight, Grid } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import ImageUploader from '../components/layout/ImageUploaderProps';

interface Category {
  _id: string;
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  categoryType: 'regular' | 'themes';
  isActive: boolean;
  parentId?: number | null;
  order: number;
  seoTitle?: string;
  seoTitle_ar?: string;
  seoTitle_en?: string;
  seoDescription?: string;
  seoDescription_ar?: string;
  seoDescription_en?: string;
}

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CATEGORIES, queryKey: ['categories'] });
  const loading = categoriesLoading;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    name_ar: '',
    name_en: '',
    description: '',
    description_ar: '',
    description_en: '',
    image: '',
    categoryType: 'regular',
    isActive: true,
    parentId: null,
    order: 0,
    seoTitle: '',
    seoTitle_ar: '',
    seoTitle_en: '',
    seoDescription: '',
    seoDescription_ar: '',
    seoDescription_en: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!categoriesData) return;
    const arr = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData);
    setCategories(arr);
    setError('');
  }, [categoriesData]);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        name_ar: '',
        name_en: '',
        description: '',
        description_ar: '',
        description_en: '',
        image: '',
        categoryType: 'regular',
        isActive: true,
        parentId: null,
        order: 0,
        seoTitle: '',
        seoTitle_ar: '',
        seoTitle_en: '',
        seoDescription: '',
        seoDescription_ar: '',
        seoDescription_en: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      name_ar: '',
      name_en: '',
      description: '',
      description_ar: '',
      description_en: '',
      image: '',
      categoryType: 'regular',
      isActive: true,
      parentId: null,
      order: 0,
      seoTitle: '',
      seoTitle_ar: '',
      seoTitle_en: '',
      seoDescription: '',
      seoDescription_ar: '',
      seoDescription_en: ''
    });
    setImageFile(null);
  };

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingCategory
        ? API_ENDPOINTS.CATEGORY_BY_ID(editingCategory._id)
        : API_ENDPOINTS.CATEGORIES;
      const method = editingCategory ? 'PUT' : 'POST';
      const submitFormData = new FormData();
      submitFormData.append('name', (formData.name || '').toString());
      submitFormData.append('name_ar', (formData.name_ar || '').toString());
      submitFormData.append('name_en', (formData.name_en || '').toString());
      submitFormData.append('description', (formData.description || '').toString());
      submitFormData.append('description_ar', (formData.description_ar || '').toString());
      submitFormData.append('description_en', (formData.description_en || '').toString());
      submitFormData.append('categoryType', (formData.categoryType || 'regular').toString());
      submitFormData.append('isActive', String(formData.isActive ?? true));
      if (formData.parentId !== undefined && formData.parentId !== null) {
        submitFormData.append('parentId', String(formData.parentId));
      }
      submitFormData.append('order', String(formData.order ?? 0));
      submitFormData.append('seoTitle', (formData.seoTitle || '').toString());
      submitFormData.append('seoTitle_ar', (formData.seoTitle_ar || '').toString());
      submitFormData.append('seoTitle_en', (formData.seoTitle_en || '').toString());
      submitFormData.append('seoDescription', (formData.seoDescription || '').toString());
      submitFormData.append('seoDescription_ar', (formData.seoDescription_ar || '').toString());
      submitFormData.append('seoDescription_en', (formData.seoDescription_en || '').toString());

      if (imageFile) {
        submitFormData.append('mainImage', imageFile);
      } else if (typeof formData.image === 'string' && formData.image.startsWith('data:image')) {
        const file = base64ToFile(formData.image, 'category-image.png');
        submitFormData.append('mainImage', file);
      } else if (typeof formData.image === 'string' && formData.image) {
        submitFormData.append('image', formData.image);
      }

      await apiCall(endpoint, {
        method,
        body: submitFormData,
      });

      {
        setSuccess(editingCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
        closeModal();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('حدث خطأ أثناء حفظ الفئة');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(deleteTargetId), { method: 'DELETE' });
      setSuccess('تم حذف الفئة بنجاح');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء حذف الفئة');
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Folder className="w-8 h-8" />
            إدارة الفئات
          </h2>
          <p className="text-gray-200">إضافة وتعديل وحذف الفئات بكفاءة عالية</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
          إضافة فئة جديدة
        </button>
      </div>
    </div>

    {/* Success Message */}
    {!isModalOpen && success && (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <span className="font-medium">{success}</span>
      </div>
    )}

    {/* Error Message */}
    {!isModalOpen && error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <span className="font-medium">{error}</span>
      </div>
    )}

    {/* Categories Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي الفئات</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
            <Folder className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">الفئات النشطة</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {categories.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
    </div>

    {loading && <Spinner overlay />}

    {/* Categories Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {categories.length === 0 ? (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Folder className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد فئات</h3>
            <p className="text-gray-500 mb-8 text-lg">ابدأ بإضافة فئات جديدة</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إضافة فئة جديدة
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#203f61]">
              <tr>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">ID</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الاسم</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الاسم بالعربي</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الترتيب</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      #{category.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-md">
                        <Folder className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name_ar}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      category.isActive 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {category.isActive ? '✓ نشط' : '✗ غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{category.order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {editingCategory ? '✏️ تعديل الفئة' : '➕ إضافة فئة جديدة'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            {isModalOpen && error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#203f61]" />
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم الرئيسي *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="أدخل الاسم الرئيسي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم بالعربي
                    </label>
                    <input
                      type="text"
                      name="name_ar"
                      value={formData.name_ar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="أدخل الاسم بالعربي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم بالإنجليزي
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="Enter name in English"
                    />
                  </div>

                  
                </div>
              </div>

              {/* Descriptions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlignRight className="w-5 h-5 text-[#203f61]" />
                  الوصف
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الوصف بالعربي
                    </label>
                    <textarea
                      name="description_ar"
                      value={formData.description_ar}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                      placeholder="أدخل وصف الفئة بالعربي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الوصف بالإنجليزي
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                      placeholder="Enter category description in English"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#203f61]" />
                  الإعدادات
                </h3>
                <div>
                  <ImageUploader
                    value={
                      typeof formData.image === 'string' && formData.image
                        ? (
                            formData.image.startsWith('data:image') || formData.image.startsWith('http')
                              ? formData.image
                              : buildImageUrl(formData.image)
                          )
                        : ''
                    }
                    onChange={(value) => {
                      const img = Array.isArray(value) ? (value[0] || '') : (value as string);
                      setFormData(prev => ({ ...prev, image: img }));
                    }}
                    onFileSelect={(file) => setImageFile(file)}
                    label="صورة الفئة"
                    multiple={false}
                    required={false}
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#203f61] border-gray-300 rounded focus:ring-[#203f61]"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    الفئة نشطة ومتاحة للاستخدام
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
              <button
                onClick={closeModal}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {editingCategory ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ConfirmationModal
      isOpen={isConfirmOpen}
      title="تأكيد حذف الفئة"
      message="هل أنت متأكد من حذف هذه الفئة؟"
      confirmText="حذف"
      cancelText="إلغاء"
      onConfirm={performDelete}
      onCancel={() => {
        setConfirmOpen(false);
        setDeleteTargetId(null);
      }}
    />
  </div>
);
};

export default CategoriesManagement;