// components/AnnouncementBarManagement.tsx
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, X, Calendar, AlertCircle, Link as LinkIcon, Power, PowerOff } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../../config/api';

// تعريف نوع البيانات للإعلان
interface Announcement {
  _id: string;
  content: string;
  link: string | null;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const AnnouncementBarManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<Omit<Announcement, '_id' | 'createdAt' | 'updatedAt'>>({
    content: '',
    link: '',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    isActive: true
  });

  

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await apiCall(API_ENDPOINTS.ANNOUNCEMENT_BAR);
      const data = Array.isArray(result) ? result : (result?.data || []);
      setAnnouncements(data);
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result: any;

      if (editingAnnouncement) {
        result = await apiCall(`announcement-bar/${editingAnnouncement._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        result = await apiCall(API_ENDPOINTS.ANNOUNCEMENT_BAR, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }

      if (result?.success !== false) {
        if (editingAnnouncement) {
          setSuccess('تم تحديث شريط الإعلان بنجاح');
        } else {
          setSuccess('تم إنشاء شريط الإعلان بنجاح');
        }
        await fetchAnnouncements();
        setIsModalOpen(false);
        resetForm();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('حدث خطأ أثناء الحفظ');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      content: announcement.content,
      link: announcement.link || '',
      backgroundColor: announcement.backgroundColor,
      textColor: announcement.textColor,
      isActive: announcement.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    setError('');

    try {
      const result = await apiCall(`announcement-bar/${deleteTargetId}`, {
        method: 'DELETE',
      });

      if (result?.success !== false) {
        setSuccess('تم حذف شريط الإعلان بنجاح');
        await fetchAnnouncements();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiCall(`announcement-bar/${id}/toggle`, {
        method: 'PATCH',
      });

      if (result?.success !== false) {
        setSuccess(result?.message || '');
        await fetchAnnouncements();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('حدث خطأ أثناء تغيير الحالة');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      link: '',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      isActive: true
    });
    setEditingAnnouncement(null);
  };

  const activeCount = announcements.filter(a => a.isActive).length;

  const Spinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#203f61] mx-auto"></div>
        <p className="mt-4 text-gray-700 font-medium">جاري المعالجة...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Megaphone className="w-8 h-8" />
              إدارة شريط الإعلان
            </h2>
            <p className="text-gray-200">إنشاء وإدارة إعلانات الموقع الظاهرة في الأعلى</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white text-[#203f61] px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            إضافة إعلان جديد
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">إجمالي الإعلانات</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{announcements.length}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">الإعلانات النشطة</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Power className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">غير نشطة</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{announcements.length - activeCount}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
              <PowerOff className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {loading && <Spinner />}

      {/* Announcements Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {announcements.length === 0 ? (
          <div className="p-8">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Megaphone className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد إعلانات</h3>
              <p className="text-gray-500 text-lg mb-6">لم يتم إضافة أي إعلانات بعد</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                إضافة أول إعلان
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#203f61]">
                <tr>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">المحتوى</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">الألوان</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">الرابط</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">التاريخ</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((announcement) => (
                  <tr key={announcement._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 line-clamp-2 font-medium">{announcement.content}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: announcement.backgroundColor }}
                            title={`خلفية: ${announcement.backgroundColor}`}
                          ></div>
                          <span className="text-xs text-gray-600 font-mono">{announcement.backgroundColor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: announcement.textColor }}
                            title={`نص: ${announcement.textColor}`}
                          ></div>
                          <span className="text-xs text-gray-600 font-mono">{announcement.textColor}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {announcement.link ? (
                        <a 
                          href={announcement.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{announcement.link}</span>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">لا يوجد</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleActive(announcement._id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                            announcement.isActive
                              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {announcement.isActive ? (
                            <>
                              <Power className="w-4 h-4" />
                              نشط
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-4 h-4" />
                              غير نشط
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="font-medium">{formatDate(announcement.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedAnnouncement(announcement)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 border border-blue-200 transform hover:scale-105"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingAnnouncement ? '✏️ تعديل الإعلان' : '➕ إضافة إعلان جديد'}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المحتوى *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#203f61] focus:outline-none transition-colors resize-none"
                  rows="3"
                  placeholder="أدخل محتوى الإعلان..."
                  required
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الرابط (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#203f61] focus:outline-none transition-colors"
                  placeholder="https://example.com"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    لون الخلفية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#203f61] focus:outline-none transition-colors font-mono"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    لون النص
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#203f61] focus:outline-none transition-colors font-mono"
                      placeholder="#FFFFFF"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  معاينة
                </label>
                <div 
                  className="w-full px-6 py-4 rounded-xl text-center font-medium"
                  style={{ 
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor
                  }}
                >
                  {formData.content || 'معاينة الإعلان...'}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#203f61] rounded focus:ring-2 focus:ring-[#203f61]"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  تفعيل الإعلان فوراً
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الحفظ...' : editingAnnouncement ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">📋 تفاصيل الإعلان</h3>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Content */}
              <div className="border-b pb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-3">المحتوى</label>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedAnnouncement.content}</p>
                </div>
              </div>

              {/* Preview */}
              <div className="border-b pb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-3">المعاينة</label>
                <div 
                  className="w-full px-6 py-4 rounded-xl text-center font-medium shadow-md"
                  style={{ 
                    backgroundColor: selectedAnnouncement.backgroundColor,
                    color: selectedAnnouncement.textColor
                  }}
                >
                  {selectedAnnouncement.content}
                </div>
              </div>

              {/* Link */}
              {selectedAnnouncement.link && (
                <div className="border-b pb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-3">الرابط</label>
                  <a 
                    href={selectedAnnouncement.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-4 py-3 rounded-xl border border-blue-200"
                  >
                    <LinkIcon className="w-5 h-5" />
                    {selectedAnnouncement.link}
                  </a>
                </div>
              )}

              {/* Status */}
              <div className="border-b pb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-3">الحالة</label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  selectedAnnouncement.isActive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {selectedAnnouncement.isActive ? (
                    <>
                      <Power className="w-4 h-4" />
                      نشط
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-4 h-4" />
                      غير نشط
                    </>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">تاريخ الإنشاء</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-[#203f61]" />
                    {formatDate(selectedAnnouncement.createdAt)}
                  </div>
                </div>
                {selectedAnnouncement.updatedAt && selectedAnnouncement.updatedAt !== selectedAnnouncement.createdAt && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">تاريخ التحديث</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Calendar className="w-4 h-4 text-[#203f61]" />
                      {formatDate(selectedAnnouncement.updatedAt)}
                    </div>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">لون الخلفية</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedAnnouncement.backgroundColor }}
                    ></div>
                    <span className="font-mono text-sm font-medium">{selectedAnnouncement.backgroundColor}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">لون النص</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedAnnouncement.textColor }}
                    ></div>
                    <span className="font-mono text-sm font-medium">{selectedAnnouncement.textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 text-center mb-6">
                هل أنت متأكد من أنك تريد حذف هذا الإعلان؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={performDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementBarManagement;