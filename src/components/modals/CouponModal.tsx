import { useState, useEffect } from 'react';
import { smartToast } from '../../utils/toastConfig';
import { X, Plus, Gift, Tag } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../config/api';

interface Coupon {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minimumAmount?: number;
  usageLimit?: number;
  expiryDate?: string;
  isActive: boolean;
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponAdded: () => void;
  editCoupon?: any;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, onCouponAdded, editCoupon }) => {
  const [coupon, setCoupon] = useState<Coupon>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: undefined,
    minimumAmount: undefined,
    usageLimit: undefined,
    expiryDate: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);

  // Update coupon state when editCoupon is provided
  useEffect(() => {
    if (editCoupon) {
      setCoupon({
        code: editCoupon.code || '',
        name: editCoupon.name || '',
        description: editCoupon.description || '',
        discountType: editCoupon.discountType || 'percentage',
        discountValue: editCoupon.discountValue || 0,
        maxDiscount: editCoupon.maxDiscount,
        minimumAmount: editCoupon.minimumAmount,
        usageLimit: editCoupon.usageLimit,
        expiryDate: editCoupon.expiryDate || '',
        isActive: editCoupon.isActive !== undefined ? editCoupon.isActive : true
      });
    } else {
      // Reset to default values when adding new coupon
      setCoupon({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        maxDiscount: undefined,
        minimumAmount: undefined,
        usageLimit: undefined,
        expiryDate: '',
        isActive: true
      });
    }
  }, [editCoupon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCoupon(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'discountValue') {
      // discountValue is required, so always keep it as a number
      setCoupon(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) || 0 }));
    } else if (name === 'maxDiscount' || name === 'minimumAmount' || name === 'usageLimit') {
      // Optional number fields - use undefined for empty values
      setCoupon(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) || undefined }));
    } else {
      setCoupon(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateCouponCode = () => {
    const prefix = coupon.name.toUpperCase().replace(/\s/g, '').slice(0, 4);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setCoupon(prev => ({
      ...prev,
      code: `${prefix}${randomNum}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const couponData = {
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue.toString()),
        minimumOrderValue: coupon.minimumAmount ? parseFloat(coupon.minimumAmount.toString()) : null,
        maxUsageCount: coupon.usageLimit ? parseInt(coupon.usageLimit.toString()) : null,
        expiryDate: coupon.expiryDate || null,
        isActive: coupon.isActive
      };

      if (editCoupon) {
        // Update existing coupon
        await apiCall(`${API_ENDPOINTS.COUPONS}/${editCoupon.id}`, {
          method: 'PUT',
          body: JSON.stringify(couponData)
        });
        smartToast.dashboard.success('تم تحديث الكوبون بنجاح');
      } else {
        // Create new coupon
        await apiCall(API_ENDPOINTS.COUPONS, {
          method: 'POST',
          body: JSON.stringify(couponData)
        });
        smartToast.dashboard.success('تم إضافة الكوبون بنجاح');
      }

      onCouponAdded();
      onClose();
      
      // Reset form only if adding new coupon
      if (!editCoupon) {
        setCoupon({
          code: '',
          name: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          maxDiscount: undefined,
          minimumAmount: undefined,
          usageLimit: undefined,
          expiryDate: '',
          isActive: true
        });
      }
    } catch (error) {
      console.error(`Error ${editCoupon ? 'updating' : 'adding'} coupon:`, error);
      smartToast.dashboard.error(`فشل في ${editCoupon ? 'تحديث' : 'إضافة'} الكوبون`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black text-sm ml-3">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{editCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
              <p className="text-gray-300 text-sm">{editCoupon ? 'تحديث بيانات الكوبون' : 'إنشاء كوبون خصم جديد للعملاء'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  المعلومات الأساسية
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم الكوبون *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={coupon.name}
                        onChange={handleInputChange}
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="مثال: خصم الجمعة البيضاء"
                        required
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
                          value={coupon.code}
                          onChange={handleInputChange}
                          maxLength={20}
                          pattern="[A-Z0-9_\-]+"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-mono"
                          placeholder="SAVE50"
                          required
                        />
                        
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      وصف الكوبون *
                    </label>
                    <textarea
                      name="description"
                      value={coupon.description}
                      onChange={handleInputChange}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black h-20 resize-none"
                      placeholder="وصف مفصل للكوبون وشروط الاستخدام"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        نوع الخصم *
                      </label>
                      <select
                        name="discountType"
                        value={coupon.discountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      >
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed">مبلغ ثابت (ر.س)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        قيمة الخصم *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="discountValue"
                          value={coupon.discountValue}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="0"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {coupon.discountType === 'percentage' ? '%' : 'ر.س'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">⚙️</span>
                  الإعدادات المتقدمة
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupon.discountType === 'percentage' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الحد الأقصى للخصم (ر.س)
                        </label>
                        <input
                          type="number"
                          name="maxDiscount"
                          value={coupon.maxDiscount ?? ''}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="اختياري"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الحد الأدنى للطلب (ر.س)
                      </label>
                      <input
                        type="number"
                        name="minimumAmount"
                        value={coupon.minimumAmount ?? ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="اختياري"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        عدد مرات الاستخدام
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={coupon.usageLimit ?? ''}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="اختياري"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        تاريخ الانتهاء
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={coupon.expiryDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gradient-to-r from-gray-300 to-gray-300 rounded-lg border border-gray-600">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={coupon.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-gray-600 bg-white border-gray-300 rounded focus:gray-500 focus:ring-2"
                    />
                    <label htmlFor="isActive" className="mr-3 text-sm font-medium text-black-800">
                      تفعيل الكوبون (يمكن للعملاء استخدامه)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Coupon Preview */}
              <div className="bg-gray-100 rounded-xl border border-gray-300 overflow-hidden">
                <div className="bg-black px-4 py-3">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    معاينة الكوبون
                  </h3>
                </div>
                <div className="p-4">
                  <div className="bg-black rounded-xl p-4 text-white relative overflow-hidden">
                    
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-2">
                        {coupon.name || 'اسم الكوبون'}
                      </h4>
                      <div className="bg-white bg-opacity-30 rounded-lg px-3 py-2 mb-3 font-mono text-center">
                        <span className="font-bold text-xl">
                          {coupon.code || 'COUPON_CODE'}
                        </span>
                      </div>
                      <p className="text-sm mb-3 opacity-90">
                        {coupon.description || 'وصف الكوبون'}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>خصم: {coupon.discountValue || 0}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${coupon.isActive ? 'bg-gray-600' : 'bg-red-500'}`}>
                          {coupon.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">نصائح لكوبون فعال</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• اختر كود قصير وسهل التذكر</li>
                      <li>• حدد شروط واضحة للاستخدام</li>
                      <li>• ضع حد أقصى لتجنب الخسائر الكبيرة</li>
                      <li>• راقب استخدام الكوبون بانتظام</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex items-center justify-center px-6 py-3 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {editCoupon ? 'تحديث الكوبون' : 'حفظ الكوبون'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;