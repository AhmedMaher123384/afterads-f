import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Link,
  Calendar,
  CheckCircle,
  X,
  Eye,
  Image,
  Search,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../../config/api';
import { smartToast } from '../../../utils/toastConfig';
import ImageUploader from '../components/layout/ImageUploaderProps';

interface ThemeWork {
  id: number;
  imageMobile: string;
  imageTablet: string;
  imageDesktop: string;
  link: string;
  clientName?: string;
  clientImage?: string;
  clientOpinion?: string;
  workDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ThemeWorksManagement: React.FC = () => {
  const [works, setWorks] = useState<ThemeWork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWork, setEditingWork] = useState<ThemeWork | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<ThemeWork>>({
    imageMobile: '',
    imageTablet: '',
    imageDesktop: '',
    link: '',
    clientName: '',
    clientImage: '',
    clientOpinion: '',
    workDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  });

  const fetchWorks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(API_ENDPOINTS.THEME_WORKS.LIST);
      const data = Array.isArray(res) ? res : res?.data || res?.items || [];
      setWorks(data);
    } catch (err) {
      console.error('Error fetching theme works:', err);
      setError('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const filteredWorks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return works.filter(w =>
      w.link?.toLowerCase().includes(term) ||
      w.clientName?.toLowerCase().includes(term) ||
      w.clientOpinion?.toLowerCase().includes(term) ||
      String(w.id).includes(term)
    );
  }, [works, searchTerm]);

  const openModal = (work?: ThemeWork) => {
    if (work) {
      setEditingWork(work);
      // ✅ إصلاح: بناء الصور بشكل صحيح
      setFormData({
        imageMobile: buildImageUrl(work.imageMobile || ''),
        imageTablet: buildImageUrl(work.imageTablet || ''),
        imageDesktop: buildImageUrl(work.imageDesktop || ''),
        link: work.link,
        clientName: work.clientName || '',
        clientImage: work.clientImage ? buildImageUrl(work.clientImage) : '',
        clientOpinion: work.clientOpinion || '',
        workDate: (work.workDate || '').slice(0, 10),
        isActive: work.isActive,
      });
    } else {
      setEditingWork(null);
      setFormData({
        imageMobile: '',
        imageTablet: '',
        imageDesktop: '',
        link: '',
        clientName: '',
        clientImage: '',
        clientOpinion: '',
        workDate: new Date().toISOString().slice(0, 10),
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWork(null);
  };

  const isDataUrl = (val?: string) => !!val && /^data:image\/\w+;base64,/.test(val);
  
  const dataURLToBlob = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return { blob: new Blob([array], { type: mime }), mime };
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.imageMobile) errors.push('صورة الهاتف مطلوبة');
    if (!formData.imageTablet) errors.push('صورة التابلت مطلوبة');
    if (!formData.imageDesktop) errors.push('صورة الكمبيوتر مطلوبة');
    if (!formData.link) errors.push('الرابط مطلوب');
    if (formData.link && !/^https?:\/\/.+/.test(formData.link)) errors.push('يجب أن يكون الرابط URL صحيح يبدأ بـ http أو https');
    if ((formData.clientName || '').length > 200) errors.push('اسم العميل يجب ألا يتجاوز 200 حرف');
    if ((formData.clientOpinion || '').length > 1000) errors.push('رأي العميل يجب ألا يتجاوز 1000 حرف');
    if (errors.length) {
      smartToast.dashboard.error(errors[0]);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const isCreate = !editingWork;
      const shouldUseFormData = isCreate || isDataUrl(formData.imageMobile) || isDataUrl(formData.imageTablet) || isDataUrl(formData.imageDesktop) || isDataUrl(formData.clientImage);

      if (shouldUseFormData) {
        const fd = new FormData();
        
        if (isDataUrl(formData.imageMobile)) {
          const { blob, mime } = dataURLToBlob(formData.imageMobile!);
          const ext = (mime.split('/')[1] || 'png').toLowerCase();
          fd.append('imageMobile', blob, `mobile.${ext}`);
        }
        if (isDataUrl(formData.imageTablet)) {
          const { blob, mime } = dataURLToBlob(formData.imageTablet!);
          const ext = (mime.split('/')[1] || 'png').toLowerCase();
          fd.append('imageTablet', blob, `tablet.${ext}`);
        }
        if (isDataUrl(formData.imageDesktop)) {
          const { blob, mime } = dataURLToBlob(formData.imageDesktop!);
          const ext = (mime.split('/')[1] || 'png').toLowerCase();
          fd.append('imageDesktop', blob, `desktop.${ext}`);
        }
        if (isDataUrl(formData.clientImage)) {
          const { blob, mime } = dataURLToBlob(formData.clientImage!);
          const ext = (mime.split('/')[1] || 'png').toLowerCase();
          fd.append('clientImage', blob, `client.${ext}`);
        }

        fd.append('link', formData.link || '');
        fd.append('clientName', formData.clientName || '');
        fd.append('clientOpinion', formData.clientOpinion || '');
        if (formData.workDate) fd.append('workDate', new Date(formData.workDate).toISOString());
        fd.append('isActive', String(!!formData.isActive));

        if (isCreate) {
          await apiCall(API_ENDPOINTS.THEME_WORKS.CREATE, {
            method: 'POST',
            body: fd,
          });
          smartToast.dashboard.success('تم إضافة عمل جديد بنجاح');
        } else {
          await apiCall(API_ENDPOINTS.THEME_WORKS.UPDATE(editingWork!.id), {
            method: 'PUT',
            body: fd,
          });
          smartToast.dashboard.success('تم تحديث العمل بنجاح');
        }
      } else {
        const payload = {
          link: formData.link,
          clientName: formData.clientName || '',
          clientOpinion: formData.clientOpinion || '',
          workDate: formData.workDate ? new Date(formData.workDate).toISOString() : undefined,
          isActive: !!formData.isActive,
        };

        await apiCall(API_ENDPOINTS.THEME_WORKS.UPDATE(editingWork!.id), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        smartToast.dashboard.success('تم تحديث العمل بنجاح');
      }

      closeModal();
      fetchWorks();
    } catch (error) {
      console.error('Error saving theme work:', error);
      smartToast.dashboard.error('فشل في حفظ البيانات');
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (deleteTargetId == null) return;
    try {
      await apiCall(API_ENDPOINTS.THEME_WORKS.DELETE(deleteTargetId), { method: 'DELETE' });
      smartToast.dashboard.success('تم حذف العمل بنجاح');
      setConfirmOpen(false);
      setDeleteTargetId(null);
      fetchWorks();
    } catch (error) {
      console.error('Error deleting theme work:', error);
      smartToast.dashboard.error('فشل في حذف العمل');
    }
  };

  const getImageUrl = (path: string) => {
    return buildImageUrl(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {loading && <Spinner overlay />}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8 mb-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8" />
              نظام إدارة أعمالنا
            </h1>
            <p className="text-gray-200 text-lg">إدارة شاملة لأعمالنا مع صور الهاتف والتابلت والكمبيوتر</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30  font-semibold backdrop-blur-sm border border-white/30 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة عمل جديد
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في أعمالنا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] text-sm transition-all"
            />
            <Search className="absolute left-3 top-1/2  w-4 h-4 text-gray-400" />
          </div>
          <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90 mb-1">النتائج المعروضة</p>
                <p className="text-2xl font-bold">{filteredWorks.length}</p>
              </div>
              <div className="text-left">
                <p className="text-xs opacity-90 mb-1">من إجمالي</p>
                <p className="text-2xl font-bold">{works.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">الأعمال النشطة</p>
            <p className="text-2xl font-bold text-gray-900">{works.filter(w => w.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5" />
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Works Grid */}
      {filteredWorks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Briefcase className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد أعمال</h3>
          <p className="text-gray-600 mb-8 text-lg">ابدأ بإضافة أعمالك المميزة</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-xl hover:shadow-xl  shadow-lg font-medium transform hover:scale-105"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة أول عمل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <div key={work.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl  ">
              {/* Header */}
              <div className="bg-white border-b-4 border-[#203f61] p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {work.isActive ? (
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">عمل رقم #{work.id}</h3>
                      {work.workDate && (
                        <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(work.workDate).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    work.isActive 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {work.isActive ? '✓ نشط' : '✗ غير نشط'}
                  </span>
                </div>
              </div>

              {/* Images Preview */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 mb-2 shadow-sm">
                      <img 
                        src={getImageUrl(work.imageDesktop)} 
                        alt="Desktop" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-200 mb-2 shadow-sm">
                      <img 
                        src={getImageUrl(work.imageTablet)} 
                        alt="Tablet" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Tablet className="w-3 h-3" />
                      <span>Tablet</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-gray-200 mb-2 shadow-sm">
                      <img 
                        src={getImageUrl(work.imageMobile)} 
                        alt="Mobile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {(work.clientName || work.clientImage) && (
                  <div className="mb-4 flex items-center gap-3">
                    {work.clientImage && (
                      <img
                        src={getImageUrl(work.clientImage)}
                        alt="Client"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => { e.currentTarget.src = 'https://tse1.mm.bing.net/th/id/OIP.M6p4cLkcKW9PWIObAjYi8gHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3'; }}
                      />
                    )}
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">اسم العميل:</span>
                      <span className="ml-2 font-semibold">{work.clientName || 'غير محدد'}</span>
                    </div>
                  </div>
                )}
                {work.clientOpinion && (
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      "{work.clientOpinion}"
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <a
                    href={work.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#203f61] hover:text-[#2a537e] font-medium text-sm transition-colors"
                  >
                    <Link className="w-4 h-4" />
                    <span>زيارة الموقع</span>
                  </a>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(work)}
                      className="p-2.5 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg  shadow-md hover:shadow-lg transform hover:scale-105"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(work.id)}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg  border border-red-200 hover:border-red-300 transform hover:scale-105"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editingWork ? '✏️ تعديل العمل' : '➕ إضافة عمل جديد'}
                    </h2>
                    <p className="text-gray-200 text-sm mt-1">
                      {editingWork ? `تعديل العمل رقم #${editingWork.id}` : 'أرفع صور الهاتف والتابلت والكمبيوتر'}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <ImageUploader
                    label="صورة الهاتف *"
                    value={formData.imageMobile || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, imageMobile: val as string }))}
                    required
                  />
                </div>
                <div>
                  <ImageUploader
                    label="صورة التابلت *"
                    value={formData.imageTablet || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, imageTablet: val as string }))}
                    required
                  />
                </div>
                <div>
                  <ImageUploader
                    label="صورة الكمبيوتر *"
                    value={formData.imageDesktop || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, imageDesktop: val as string }))}
                    required
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم العميل</label>
                  <input
                    type="text"
                    value={formData.clientName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="أدخل اسم العميل"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="صورة العميل"
                    value={formData.clientImage || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, clientImage: val as string }))}
                  />
                </div>
              </div>

              {/* Link & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رابط العمل *</label>
                  <input
                    type="url"
                    value={formData.link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com/project"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ بـ http أو https</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ العمل</label>
                  <input
                    type="date"
                    value={formData.workDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, workDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  />
                </div>
              </div>

              {/* Client Opinion */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رأي العميل</label>
                <textarea
                  value={formData.clientOpinion || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientOpinion: e.target.value }))}
                  maxLength={1000}
                  rows={4}
                  placeholder="اكتب رأي العميل (اختياري)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">الحد الأقصى 1000 حرف</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-5 h-5 text-[#203f61] border-gray-300 rounded focus:ring-[#203f61]"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">هذا العمل نشط</label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingWork ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="⚠️ تأكيد حذف العمل"
        message="هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء."
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

export default ThemeWorksManagement;