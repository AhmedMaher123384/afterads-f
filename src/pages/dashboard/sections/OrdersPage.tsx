import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, 
  Eye, Edit, Trash2, Check, X,
  TrendingUp, AlertTriangle, Package, Users, DollarSign
} from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Spinner from '../../../components/ui/Spinner';

// تعريف الأنواع (Types)
interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  attachments?: {
    images?: string[];
    text?: string;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  couponDiscount?: number;
  loyaltyRedeemed?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface OrderStats {
  pending: number;
  confirmed: number;
  preparing: number;
  delivered: number;
  cancelled: number;
  total: number;
}

interface OrderFilters {
  searchTerm: string;
  status: string;
    hasLoyalty?: boolean;  

}

// مكون بطاقة الإحصائية
const StatCard = ({ title, value, icon: Icon, color }: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  color: string; 
}) => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-full`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// مكون حالة الطلب
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { text: string; color: string }> = {
    pending: { text: 'قيد المراجعة', color: 'bg-gray-100 text-black border-gray-300' },
    confirmed: { text: 'مؤكد', color: 'bg-gray-200 text-black border-gray-400' },
    preparing: { text: 'قيد التحضير', color: 'bg-gray-300 text-black border-gray-500' },
    delivered: { text: 'تم التسليم', color: 'bg-black text-white border-black' },
    cancelled: { text: 'ملغي', color: 'bg-gray-600 text-white border-gray-700' },
  };

  const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
      {config.text}
    </span>
  );
};

const OrdersPage: React.FC = () => {
  // الحالات (States)
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderFilters, setOrderFilters] = useState<OrderFilters>({
    searchTerm: '',
    status: 'all'
  });
  const [editingOrderNotes, setEditingOrderNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // دالة جلب الطلبات
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiCall(API_ENDPOINTS.ORDERS);
      // التأكد من أن الاستجابة تحتوي على البيانات بشكل صحيح
      const ordersData = Array.isArray(response) ? response : response?.orders || response?.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // toast.error('فشل في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  // دالة حساب الإحصائيات
  const calculateOrderStats = (): OrderStats => {
    const stats: OrderStats = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivered: 0,
      cancelled: 0,
      total: orders.length
    };

    orders.forEach(order => {
      switch (order.status) {
        case 'pending': stats.pending++; break;
        case 'confirmed': stats.confirmed++; break;
        case 'preparing': stats.preparing++; break;
        case 'delivered': stats.delivered++; break;
        case 'cancelled': stats.cancelled++; break;
      }
    });

    return stats;
  };

  // دالة تصفية الطلبات
 const filterOrders = (filters: OrderFilters) => {
  let result = [...orders];

  if (filters.status !== 'all' && filters.status !== '') {
    result = result.filter(order => order.status === filters.status);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter(order =>
      order.customerName.toLowerCase().includes(term) ||
      order.customerPhone.includes(filters.searchTerm) ||
      order.customerEmail.toLowerCase().includes(term) ||
      order.id.toString().includes(filters.searchTerm)
    );
  }

  // ✅ فلتر نقاط الولاء
  if (filters.hasLoyalty) {
    result = result.filter(order => order.loyaltyRedeemed && order.loyaltyRedeemed > 0);
  }

  setFilteredOrders(result);
};

// دالة تحديث حالة الطلب
const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
  try {
    // التحقق من صحة الحالة
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status:', newStatus);
      return;
    }

    console.log('🔄 Updating order status:', { orderId, newStatus });

    const response = await apiCall(API_ENDPOINTS.ORDER_STATUS(orderId), {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });

    if (response && (response.success !== false)) {
      // تحديث الحالة المحلية
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );
      
      // إعادة تطبيق الفلاتر
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      );
      
      let result = [...updatedOrders];
      if (orderFilters.status !== 'all' && orderFilters.status !== '') {
        result = result.filter(order => order.status === orderFilters.status);
      }
      if (orderFilters.searchTerm) {
        const term = orderFilters.searchTerm.toLowerCase();
        result = result.filter(order =>
          order.customerName.toLowerCase().includes(term) ||
          order.customerPhone.includes(orderFilters.searchTerm) ||
          order.customerEmail.toLowerCase().includes(term) ||
          order.id.toString().includes(orderFilters.searchTerm)
        );
      }
      setFilteredOrders(result);

      console.log('✅ Order status updated successfully');
    } else {
      console.error('❌ Failed to update order status:', response);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

  // دالة تحرير ملاحظات الطلب
  const handleEditOrderNotes = (orderId: number, currentNotes: string) => {
    setEditingOrderNotes(orderId);
    setNoteText(currentNotes);
  };

  const handleSaveOrderNotes = async (orderId: number) => {
    try {
      await apiCall(`/api/orders/${orderId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes: noteText })
      });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, notes: noteText } : order
      ));
      filterOrders(orderFilters); // إعادة التصفية بعد التحديث
      setEditingOrderNotes(null);
      setNoteText('');
      // toast.success('تم تحديث ملاحظات الطلب بنجاح');
    } catch (error) {
      console.error('Error updating order notes:', error);
      // toast.error('فشل في تحديث ملاحظات الطلب');
    }
  };

// دالة حذف الطلب (تنفيذ فعلي بدون نافذة تأكيد افتراضية)
const handleDeleteOrder = async (orderId: number) => {
  if (!orderId) {
    console.error('Invalid order ID');
    return;
  }

  try {
    console.log('🗑️ Deleting order:', orderId);

    const response = await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderId), {
      method: 'DELETE',
    });

    if (response && (response.success !== false)) {
      // إزالة الطلب من القائمة
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      
      // تطبيق الفلاتر على القائمة المحدثة
      let result = [...updatedOrders];
      if (orderFilters.status !== 'all' && orderFilters.status !== '') {
        result = result.filter(order => order.status === orderFilters.status);
      }
      if (orderFilters.searchTerm) {
        const term = orderFilters.searchTerm.toLowerCase();
        result = result.filter(order =>
          order.customerName.toLowerCase().includes(term) ||
          order.customerPhone.includes(orderFilters.searchTerm) ||
          order.customerEmail.toLowerCase().includes(term) ||
          order.id.toString().includes(orderFilters.searchTerm)
        );
      }
      setFilteredOrders(result);

      console.log('✅ Order deleted successfully');
    } else {
      console.error('❌ Failed to delete order:', response);
    }
  } catch (error) {
    console.error('Error deleting order:', error);
  }
};  

  const handleCancelEditNotes = () => {
    setEditingOrderNotes(null);
    setNoteText('');
  };

  // دالة فتح مودال العرض (يمكن تكاملها لاحقاً)
  const openOrderModal = (order: Order) => {
    console.log("Opening order details modal for order ID:", order.id);
    // setIsOrderModalOpen(true);
    // setSelectedOrder(order);
  };

 const openDeleteModal = (type: string, id: number, name: string) => {
  if (type === 'order') {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  }
};

  const confirmDelete = async () => {
    if (deleteTargetId !== null) {
      await handleDeleteOrder(deleteTargetId);
    }
    setIsConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // دالة معالجة تغيير الحالة
  const handleStatusFilterChange = (value: string) => {
    const newFilters = { ...orderFilters, status: value };
    setOrderFilters(newFilters);
    filterOrders(newFilters);
  };

  // دالة معالجة البحث
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    const newFilters = { ...orderFilters, searchTerm: term };
    setOrderFilters(newFilters);
    filterOrders(newFilters);
  };

  // دالة لحساب لون الحالة
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-black border-gray-300';
      case 'confirmed': return 'bg-gray-200 text-black border-gray-400';
      case 'preparing': return 'bg-gray-300 text-black border-gray-500';
      case 'delivered': return 'bg-black text-white border-black';
      case 'cancelled': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // دالة لحساب نص الحالة
  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'قيد التحضير';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    fetchOrders();
  }, []);

  // حساب الإحصائيات
  const stats = calculateOrderStats();

  return (
    <div className="p-6 space-y-6">
      {loading && <Spinner overlay />}
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8" />
              نظام إدارة الطلبات
            </h2>
            <p className="text-gray-200 mt-2">متابعة ومعالجة جميع طلبات العملاء بكفاءة عالية</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              {new Date().toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="في الانتظار" value={stats.pending} icon={AlertTriangle} color="bg-yellow-600 text-white" />
        <StatCard title="مؤكد" value={stats.confirmed} icon={TrendingUp} color="bg-blue-600 text-white" />
        <StatCard title="قيد التحضير" value={stats.preparing} icon={Package} color="bg-purple-600 text-white" />
        <StatCard title="تم التسليم" value={stats.delivered} icon={Check} color="bg-green-600 text-white" />
        <StatCard title="ملغية" value={stats.cancelled} icon={X} color="bg-red-600 text-white" />
      </div>

      {/* بطاقة البحث والتصفية */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في الطلبات..."
              value={orderFilters.searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] text-sm transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={orderFilters.status}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] text-sm bg-white transition-all"
          >
            <option value="all">جميع الطلبات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="preparing">قيد التحضير</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغي</option>
          </select>

          <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90 mb-1">النتائج المعروضة</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <div className="text-left">
                <p className="text-xs opacity-90 mb-1">من إجمالي</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الطلبات */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* بطاقة الطلب (للموبايل) */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">طلب #{order.id}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{order.customerName}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
            <div className="grid grid-cols-2 gap-4 mb-4">
  <div className="bg-gray-50 rounded-lg p-3">
    <span className="text-gray-600 text-sm block mb-1">المبلغ الإجمالي</span>
    <div className="font-bold text-lg text-[#203f61]">{order.total.toFixed(2)} ر.س</div>
    
    {/* ✅ عرض خصم نقاط الولاء */}
    {order.loyaltyRedeemed && order.loyaltyRedeemed > 0 && (
      <div className="mt-2 flex items-center gap-1 text-xs">
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          خصم {order.loyaltyRedeemed.toFixed(0)} نقطة
        </span>
      </div>
    )}
  </div>
  <div className="bg-gray-50 rounded-lg p-3">
    <span className="text-gray-600 text-sm block mb-1">عدد المنتجات</span>
    <div className="font-bold text-lg text-[#203f61]">{order.items.length}</div>
  </div>
</div>

                {/* قسم الملاحظات */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">الملاحظات</span>
                    <button
                      onClick={() => handleEditOrderNotes(order.id, order.notes || '')}
                      className="p-1 text-[#203f61] hover:text-[#2a537e] hover:bg-gray-50 rounded transition-colors"
                      title="تحرير الملاحظات"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  {editingOrderNotes === order.id ? (
                    <div className="flex items-center gap-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] resize-none"
                        rows={2}
                        placeholder="أضف ملاحظة..."
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveOrderNotes(order.id)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="حفظ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditNotes}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="إلغاء"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      {order.notes ? (
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">لا توجد ملاحظات</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => openOrderModal(order)}
                    className="flex-1 bg-[#203f61] text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#2a537e] transition-all duration-300"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                    className="flex-1 bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-100 transition-all duration-300 border border-red-200"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* جدول الطلبات (للكمبيوتر) */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#203f61]">
  <tr>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">رقم الطلب</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">العميل</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">المبلغ</th>
    {/* ✅ عمود جديد لنقاط الولاء */}
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">نقاط الولاء</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الحالة</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الملاحظات</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">التاريخ</th>
    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الإجراءات</th>
  </tr>
</thead>
               <tbody className="bg-white divide-y divide-gray-200">
  {filteredOrders.map((order) => (
    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-gray-900">#{order.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900">{order.customerName}</div>
          <div className="text-sm text-gray-500">{order.customerPhone}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-bold text-[#203f61]">{order.total.toFixed(2)} ر.س</div>
      </td>
      
      {/* ✅ خلية نقاط الولاء الجديدة */}
      <td className="px-6 py-4 whitespace-nowrap">
        {order.loyaltyRedeemed && order.loyaltyRedeemed > 0 ? (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {order.loyaltyRedeemed.toFixed(0)} نقطة
            </span>
            <span className="text-xs text-green-600 font-medium">
              خصم {order.loyaltyRedeemed.toFixed(2)} ر.س
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">لا يوجد</span>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={order.status}
          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
          className={`text-sm font-medium px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}
        >
          <option value="pending">قيد المراجعة</option>
          <option value="confirmed">مؤكد</option>
          <option value="preparing">قيد التحضير</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغي</option>
        </select>
      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {editingOrderNotes === order.id ? (
                            <div className="flex items-center gap-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] resize-none"
                                rows={2}
                                placeholder="أضف ملاحظة..."
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleSaveOrderNotes(order.id)}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                  title="حفظ"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEditNotes}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                  title="إلغاء"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                {order.notes ? (
                                  <p className="text-sm text-gray-700 line-clamp-2">{order.notes}</p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">لا توجد ملاحظات</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleEditOrderNotes(order.id, order.notes || '')}
                                className="p-1 text-[#203f61] hover:text-[#2a537e] hover:bg-gray-50 rounded transition-colors"
                                title="تحرير الملاحظات"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="p-2 text-white bg-[#203f61] hover:bg-[#2a537e] rounded-xl transition-all duration-300"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-red-200"
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
          </div>
        </div>

      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="تأكيد حذف الطلب"
        message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default OrdersPage;