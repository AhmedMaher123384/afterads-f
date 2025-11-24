import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Users
} from 'lucide-react';
import { smartToast } from '../../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';
import ImageUploader from '../components/layout/ImageUploaderProps';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Spinner from '../../../components/ui/Spinner';

interface Testimonial {
  id: number;
  name: string;
  position?: string;
  testimonial: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

const TestimonialsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [testimonialSearchTerm, setTestimonialSearchTerm] = useState('');
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState('all');
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<{
    name: string;
    image: string | File | null;
    position: string;
    testimonial: string;
  }>({
    name: '',
    image: null,
    position: '',
    testimonial: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: string;
    id: number | string;
    name: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: '',
    id: 0,
    name: '',
    loading: false
  });

  const { data: testimonialsData, isLoading: testimonialsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.TESTIMONIALS, queryKey: ['testimonials'] });
  useEffect(() => {
    if (!testimonialsData) return;
    const arr = testimonialsData.testimonials || testimonialsData || [];
    setTestimonials(arr);
    setFilteredTestimonials(arr);
    setLoading(false);
  }, [testimonialsData]);

  // Filter testimonials based on search and filters
  const filterTestimonials = () => {
    let result = [...testimonials];

    if (testimonialSearchTerm) {
      const term = testimonialSearchTerm.toLowerCase();
      result = result.filter(testimonial =>
        testimonial.name.toLowerCase().includes(term) ||
        testimonial.position?.toLowerCase().includes(term) ||
        testimonial.testimonial.toLowerCase().includes(term)
      );
    }

    if (testimonialStatusFilter !== 'all') {
      switch (testimonialStatusFilter) {
        case 'active':
          result = result.filter(testimonial => testimonial.isActive);
          break;
        case 'inactive':
          result = result.filter(testimonial => !testimonial.isActive);
          break;
        case 'featured':
          result = result.filter(testimonial => testimonial.isFeatured);
          break;
      }
    }

    setFilteredTestimonials(result);
  };

  // Handle save testimonial
  const handleSaveTestimonial = async (testimonialData: any) => {
    try {
      const formData = new FormData();
      formData.append('name', testimonialData.name);
      formData.append('testimonial', testimonialData.testimonial);
      if (testimonialData.position) formData.append('position', testimonialData.position);
      if (testimonialData.image) {
        if (testimonialData.image instanceof File) {
          formData.append('image', testimonialData.image);
        } else if (typeof testimonialData.image === 'string') {
          if (testimonialData.image.startsWith('data:image')) {
            const arr = testimonialData.image.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], 'image.png', { type: mime });
            formData.append('image', file);
          } else {
            formData.append('existingImage', testimonialData.image);
          }
        }
      }

      if (editingTestimonial) {
        // Update existing testimonial
        const response = await apiCall(API_ENDPOINTS.TESTIMONIAL_BY_ID(editingTestimonial.id.toString()), {
          method: 'PUT',
          body: formData
        });
        // التأكد من أن الاستجابة تحتوي على البيانات الصحيحة
        const updatedTestimonial = response.testimonial || response;
        setTestimonials(testimonials.map(testimonial =>
          testimonial.id === editingTestimonial.id ? updatedTestimonial : testimonial
        ));
        smartToast.dashboard.success('تم تحديث الشهادة بنجاح');
      } else {
        // Add new testimonial
        const response = await apiCall(API_ENDPOINTS.TESTIMONIALS, {
          method: 'POST',
          body: formData
        });
        // التأكد من أن الاستجابة تحتوي على البيانات الصحيحة
        const newTestimonial = response.testimonial || response;
        setTestimonials([...testimonials, newTestimonial]);
        smartToast.dashboard.success('تم إضافة الشهادة بنجاح');
      }
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
      setNewTestimonial({
        name: '',
        image: null,
        position: '',
        testimonial: ''
      });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    } catch (error) {
      console.error('Error saving testimonial:', error);
      smartToast.dashboard.error('خطأ في حفظ الشهادة');
    }
  };

  // Handle add testimonial
  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setNewTestimonial({
      name: '',
      image: null,
      position: '',
      testimonial: ''
    });
    setIsTestimonialModalOpen(true);
  };

  // Handle edit testimonial
const handleEditTestimonial = (testimonial: Testimonial) => {
  console.log('📝 Editing testimonial data:', testimonial); // أضف هذا للتحقق
  
  setEditingTestimonial(testimonial);
  setNewTestimonial({
    name: testimonial.name || '',
    image: testimonial.image || null,
    position: testimonial.position || '',
    testimonial: testimonial.testimonial || ''
  });
  setIsTestimonialModalOpen(true);
  
  // تحقق من أن البيانات تم تعيينها
  setTimeout(() => {
    console.log('✅ New testimonial state after edit:', newTestimonial);
  }, 100);
};

  // Handle delete testimonial
  const handleDeleteTestimonial = async (testimonialId: number | string) => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await apiCall(API_ENDPOINTS.TESTIMONIAL_BY_ID(testimonialId.toString()), {
        method: 'DELETE'
      });
      
      // Remove the deleted testimonial from the list
      const updatedTestimonials = testimonials.filter(testimonial => testimonial.id !== Number(testimonialId));
      setTestimonials(updatedTestimonials);
      setFilteredTestimonials(updatedTestimonials);
      
      smartToast.dashboard.success(`تم حذف الشهادة "${deleteModal.name}" بنجاح`);
      closeDeleteModal();
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      smartToast.dashboard.error('فشل في حذف الشهادة');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Open delete modal
  const openDeleteModal = (type: string, id: number | string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
      loading: false
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  // Confirm delete
  const confirmDelete = () => {
    handleDeleteTestimonial(deleteModal.id);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTestimonial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  

  useEffect(() => {
    setLoading(testimonialsLoading);
  }, [testimonialsLoading]);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, testimonialSearchTerm, testimonialStatusFilter]);

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              نظام إدارة شهادات العملاء
            </h2>
            <p className="text-gray-200 text-lg">إدارة شاملة لآراء وتقييمات العملاء وتجاربهم</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleAddTestimonial}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold backdrop-blur-sm border border-white/30 shadow-lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة شهادة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في شهادات العملاء..."
              value={testimonialSearchTerm}
              onChange={(e) => setTestimonialSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] text-sm transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <select
            value={testimonialStatusFilter}
            onChange={(e) => setTestimonialStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] text-sm bg-white transition-all"
          >
            <option value="all">جميع الآراء</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="featured">مميز</option>
          </select>
          <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90 mb-1">النتائج المعروضة</p>
                <p className="text-2xl font-bold">{filteredTestimonials.length}</p>
              </div>
              <div className="text-left">
                <p className="text-xs opacity-90 mb-1">من إجمالي</p>
                <p className="text-2xl font-bold">{testimonials.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد آراء</h3>
          <p className="text-gray-600 mb-8 text-lg">ابدأ بإضافة شهادات العملاء</p>
          <button
            onClick={handleAddTestimonial}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-medium transform hover:scale-105"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة أول شهادة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              {/* Header */}
            <div className="bg-white border-b-4 border-[#203f61] p-5">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-4">
      {testimonial.image ? (
        <img
          src={buildImageUrl(testimonial.image)}
          alt={testimonial.name}
          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-md"
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-[#203f61]/10 to-[#2a537e]/10 rounded-xl flex items-center justify-center border border-[#203f61]/20">
          <Users className="w-8 h-8 text-[#203f61]" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-lg text-gray-900">{testimonial.name}</h3>
        {testimonial.position && (
          <p className="text-gray-600 text-sm mt-1">{testimonial.position}</p>
        )}
      </div>
    </div>
    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
      testimonial.isActive 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-gray-50 text-gray-700 border border-gray-200'
    }`}>
      {testimonial.isActive ? '✓ نشط' : '✗ غير نشط'}
    </span>
  </div>
</div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    "{testimonial.testimonial}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 font-medium">
                    📅 {new Date(testimonial.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                       handleEditTestimonial(testimonial)
                        setIsTestimonialModalOpen(true);
                      }}
                      className="p-2.5 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal('testimonial', testimonial.id, testimonial.name)}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing testimonial */}
   {isTestimonialModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
        <h3 className="text-2xl font-bold">
          {editingTestimonial ? '✏️ تعديل الشهادة' : '➕ إضافة شهادة جديدة'}
        </h3>
        {/* أضف تحقق من البيانات */}
        <div className="text-sm opacity-80 mt-2">
          {editingTestimonial && `تعديل: ${editingTestimonial.name}`}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
            <input
              type="text"
              name="name"
              value={newTestimonial.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
              placeholder="أدخل اسم العميل"
            />
            {/* تحقق من القيمة */}
            <div className="text-xs text-gray-500 mt-1">القيمة الحالية: "{newTestimonial.name}"</div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">المنصب</label>
            <input
              type="text"
              name="position"
              value={newTestimonial.position}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
              placeholder="أدخل منصب العميل (اختياري)"
            />
            <div className="text-xs text-gray-500 mt-1">القيمة الحالية: "{newTestimonial.position}"</div>
          </div>
          
          <div>
            <ImageUploader
              value={
                typeof newTestimonial.image === 'string'
                  ? (newTestimonial.image.startsWith('data:image') ? newTestimonial.image : buildImageUrl(newTestimonial.image))
                  : ''
              }
              onChange={(val) =>
                setNewTestimonial(prev => ({
                  ...prev,
                  image: typeof val === 'string' ? val : (Array.isArray(val) ? (val[0] || null) : null)
                }))
              }
              label="الصورة"
              multiple={false}
              accept="image/*"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الشهادة</label>
            <textarea
              name="testimonial"
              value={newTestimonial.testimonial}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
              placeholder="أدخل نص الشهادة"
            />
            <div className="text-xs text-gray-500 mt-1">القيمة الحالية: "{newTestimonial.testimonial.substring(0, 50)}..."</div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              setIsTestimonialModalOpen(false);
              setEditingTestimonial(null);
              setNewTestimonial({
                name: '',
                image: null,
                position: '',
                testimonial: ''
              });
            }}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              console.log('💾 Saving testimonial data:', newTestimonial);
              handleSaveTestimonial(newTestimonial);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            {editingTestimonial ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {loading && <Spinner overlay />}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="⚠️ تأكيد الحذف"
        message={`هل أنت متأكد من حذف الشهادة "${deleteModal.name}"؟\nلا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        confirmText={deleteModal.loading ? 'جاري الحذف...' : 'حذف'}
        cancelText="إلغاء"
      />
    </div>
  );
};

export default TestimonialsManagement;