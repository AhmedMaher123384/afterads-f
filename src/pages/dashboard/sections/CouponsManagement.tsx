import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Plus, Edit2, Trash2, AlertCircle, X, Tag, Percent, DollarSign, Calendar, TrendingUp, XCircle, CheckCircle } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import { smartToast } from '../../../utils/toastConfig';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';

interface Coupon {
  _id: string;
  id: number;
  name: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CouponsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    name: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minimumAmount: 0,
    usageLimit: undefined,
    expiryDate: '',
    isActive: true
  });

  const { data: couponsResp, isLoading: loading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.COUPONS, queryKey: ['coupons'] });
  useEffect(() => {
    if (!couponsResp) return;
    const arr = Array.isArray(couponsResp) ? couponsResp : (couponsResp.coupons || couponsResp || []);
    setCoupons(arr);
    setError('');
  }, [couponsResp]);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minimumAmount: coupon.minimumAmount,
        usageLimit: coupon.usageLimit,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
        isActive: coupon.isActive
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        maxDiscount: 0,
        minimumAmount: 0,
        usageLimit: undefined,
        expiryDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minimumAmount: 0,
      usageLimit: undefined,
      expiryDate: '',
      isActive: true
    });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.discountValue) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      smartToast.dashboard.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const endpoint = editingCoupon
        ? API_ENDPOINTS.COUPON_BY_ID(editingCoupon._id)
        : API_ENDPOINTS.COUPONS;
      const method = editingCoupon ? 'PUT' : 'POST';
      await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      {
        const msg = editingCoupon ? 'تم تحديث الكوبون بنجاح' : 'تم إضافة الكوبون بنجاح';
        setSuccess(msg);
        smartToast.dashboard.success(msg);
        closeModal();
        queryClient.invalidateQueries({ queryKey: ['coupons'] });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'حدث خطأ أثناء حفظ الكوبون';
      setError(msg);
      smartToast.dashboard.error(msg);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiCall(API_ENDPOINTS.COUPON_BY_ID(deleteTargetId), { method: 'DELETE' });
      setSuccess('تم حذف الكوبون بنجاح');
      smartToast.dashboard.success('تم حذف الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'حدث خطأ أثناء حذف الكوبون';
      setError(msg);
      smartToast.dashboard.error(msg);
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Tag className="w-8 h-8" />
            إدارة الكوبونات
          </h2>
          <p className="text-gray-200">إضافة وتعديل وحذف كوبونات الخصم بكفاءة عالية</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
          إضافة كوبون جديد
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

    {/* Coupons Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي الكوبونات</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{coupons.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
            <Tag className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">الكوبونات النشطة</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">المنتهية</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {coupons.filter(c => isExpired(c.expiryDate)).length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <XCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي الاستخدام</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>

    {loading && <Spinner overlay />}

    {/* Coupons Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {coupons.length === 0 ? (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Tag className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد كوبونات</h3>
            <p className="text-gray-500 mb-8 text-lg">ابدأ بإنشاء كوبون خصم جديد</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إنشاء كوبون جديد
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
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الكود</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الخصم</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الاستخدام</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الصلاحية</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      #{coupon.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{coupon.name}</div>
                        {coupon.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">{coupon.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-mono text-sm font-bold shadow-md">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900">
                        {coupon.discountType === 'percentage' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Percent className="w-4 h-4" />
                            {coupon.discountValue}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            {coupon.discountValue} جنيه
                          </span>
                        )}
                      </div>
                      {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          حد أقصى: {coupon.maxDiscount} جنيه
                        </div>
                      )}
                      {coupon.minimumAmount && coupon.minimumAmount > 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          حد أدنى: {coupon.minimumAmount} جنيه
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div className="text-sm font-semibold text-gray-900">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className={`text-sm font-medium ${
                        isExpired(coupon.expiryDate) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatDate(coupon.expiryDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      coupon.isActive && !isExpired(coupon.expiryDate)
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {coupon.isActive && !isExpired(coupon.expiryDate) ? '✓ نشط' : '✗ غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(coupon)}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
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
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {editingCoupon ? '✏️ تعديل الكوبون' : '➕ إضافة كوبون جديد'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم الكوبون *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="مثال: خصم الصيف"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كود الكوبون *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all uppercase font-mono font-bold"
                      placeholder="SUMMER2024"
                    />
                    <button
                      onClick={generateRandomCode}
                      className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:shadow-lg transition-all font-medium whitespace-nowrap"
                    >
                      توليد عشوائي
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                    placeholder="وصف مختصر للكوبون"
                  />
                </div>
              </div>

              {/* Discount Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#203f61]" />
                  إعدادات الخصم
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        نوع الخصم *
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
                      >
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed">مبلغ ثابت (جنيه)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        قيمة الخصم *
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الحد الأقصى للخصم (جنيه)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="اتركه فارغاً لعدم وجود حد أقصى"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الحد الأدنى لقيمة الطلب (جنيه)
                    </label>
                    <input
                      type="number"
                      name="minimumAmount"
                      value={formData.minimumAmount}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#203f61]" />
                  إعدادات الاستخدام
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        عدد مرات الاستخدام
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit || ''}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="اتركه فارغاً لاستخدام غير محدود"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        تاريخ انتهاء الصلاحية
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
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
                    الكوبون نشط ومتاح للاستخدام
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
                {editingCoupon ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ConfirmationModal
      isOpen={isConfirmOpen}
      title="تأكيد حذف الكوبون"
      message="هل أنت متأكد من حذف هذا الكوبون؟"
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

export default CouponsManagement;