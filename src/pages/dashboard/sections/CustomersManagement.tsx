import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Plus, Edit2, Trash2, AlertCircle, X, User, Mail, Phone, MapPin, Lock, Users, UserX, UserCheck, Calendar, Shield, UserPlus } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';

interface Customer {
  _id: string;
  id: number;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  name: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
  customerGroup?: 'vip' | 'regular' | 'wholesale' | 'retail' | 'inactive'; // ✅ إضافة
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}
const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { data: customersData, isLoading: customersLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CUSTOMERS, queryKey: ['customers'] });
  const loading = customersLoading;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
const [formData, setFormData] = useState<Partial<Customer>>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  name: '',
  city: '',
  address: '',
  status: 'active',
  customerGroup: 'regular' // ✅ إضافة
});

        console.log("customerGroup", formData.customerGroup)


  useEffect(() => {
    if (!customersData) return;
    const arr = Array.isArray(customersData) ? customersData : (customersData.customers || customersData || []);
    setCustomers(arr);
    setError('');
  }, [customersData]);

 const openModal = (customer?: Customer) => {
  if (customer) {
    setEditingCustomer(customer);
    setFormData({
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      name: customer.name,
      city: customer.city,
      address: customer.address,
      status: customer.status,
      customerGroup: customer.customerGroup || 'regular', // ✅ إضافة
      password: ''
    });
  } else {
    setEditingCustomer(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      name: '',
      city: '',
      address: '',
      status: 'active',
      customerGroup: 'regular' // ✅ إضافة
    });
  }
  setIsModalOpen(true);
};

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      name: '',
      city: '',
      address: '',
      status: 'active'
    });
  };

const handleSubmit = async (e: React.MouseEvent) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.email || !formData.phone || !formData.name) {
    setError('الرجاء ملء جميع الحقول المطلوبة');
    return;
  }

  if (!editingCustomer && !formData.password) {
    setError('كلمة المرور مطلوبة للعملاء الجدد');
    return;
  }

  try {
    const endpoint = editingCustomer
      ? API_ENDPOINTS.CUSTOMER_BY_ID(editingCustomer._id)
      : API_ENDPOINTS.CUSTOMERS;
    const method = editingCustomer ? 'PUT' : 'POST';
    const dataToSend = { ...formData };
    if (editingCustomer && !dataToSend.password) {
      delete (dataToSend as any).password;
    }
    await apiCall(endpoint, {
      method,
      body: JSON.stringify(dataToSend),
    });

    {
      setSuccess(editingCustomer ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح');
      closeModal();
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    }
  } catch (err) {
    setError('حدث خطأ أثناء حفظ العميل');
  }
};

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiCall(API_ENDPOINTS.CUSTOMER_BY_ID(deleteTargetId), { method: 'DELETE' });
      setSuccess('تم حذف العميل بنجاح');
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء حذف العميل');
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            إدارة العملاء
          </h2>
          <p className="text-gray-200">إضافة وتعديل وحذف بيانات العملاء بكفاءة عالية</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
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

    {/* Customers Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي العملاء</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{customers.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">العملاء النشطين</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {customers.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">غير النشطين</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {customers.filter(c => c.status === 'inactive').length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <UserX className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">عملاء جدد اليوم</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
  {customers.filter(c => c.createdAt && new Date(c.createdAt).toDateString() === new Date().toDateString()).length}             </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>

    {loading && <Spinner overlay />}

    {/* Customers Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {customers.length === 0 ? (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد عملاء</h3>
            <p className="text-gray-500 mb-8 text-lg">ابدأ بإضافة عملاء جدد للنظام</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إضافة عميل جديد
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#203f61]">
              <tr>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الاسم</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">البريد الإلكتروني</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الهاتف</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">المدينة</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">المجموعة</th>

                <th className="text-right py-4 px-6 text-sm font-semibold text-white">تاريخ التسجيل</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
               
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                        {customer.firstName && customer.lastName && (
                          <div className="text-xs text-gray-500">
                            {customer.firstName} {customer.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium truncate max-w-[200px]">{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{customer.city || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {customer.status === 'active' ? '✓ نشط' : '✗ غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
    customer.customerGroup === 'vip' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : customer.customerGroup === 'wholesale'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : customer.customerGroup === 'retail'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    {customer.customerGroup === 'vip' ? '⭐ VIP' :
     customer.customerGroup === 'wholesale' ? '📦 جملة' :
     customer.customerGroup === 'retail' ? '🛒 تجزئة' :
     '👤 عادي'}
  </span>
</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatDate(customer.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(customer)}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
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
          <div className="sticky z-10 top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {editingCustomer ? '✏️ تعديل العميل' : '➕ إضافة عميل جديد'}
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
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="الاسم الأول"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم العائلة
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="اسم العائلة"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder="example@email.com"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder="01XXXXXXXXX"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كلمة المرور {!editingCustomer && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingCustomer}
                      minLength={6}
                      placeholder={editingCustomer ? 'اتركه فارغاً إذا كنت لا تريد تغييره' : 'أدخل كلمة المرور'}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {!editingCustomer && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      يجب أن تكون كلمة المرور 6 أحرف على الأقل
                    </p>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#203f61]" />
                  معلومات الموقع
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      المدينة
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="أدخل المدينة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      العنوان
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                      placeholder="أدخل العنوان الكامل"
                    />
                  </div>
                </div>
              </div>

           {/* Status */}
<div className="border-t pt-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    <Shield className="w-5 h-5 text-[#203f61]" />
    الحالة والمجموعة
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        حالة الحساب
      </label>
      <select
        name="status"
        value={formData.status}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
      >
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
    </div>
    
    {/* ✅ إضافة حقل المجموعة */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        مجموعة العميل
      </label>
      <select
        name="customerGroup"
        value={formData.customerGroup}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
      >
        <option value="regular">عادي</option>
        <option value="vip">VIP</option>
        <option value="wholesale">جملة</option>
        <option value="retail">تجزئة</option>
        <option value="inactive">غير نشط</option>
      </select>
    </div>
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
                {editingCustomer ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ConfirmationModal
      isOpen={isConfirmOpen}
      title="تأكيد حذف العميل"
      message="هل أنت متأكد من حذف هذا العميل؟"
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

export default CustomersManagement;