import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  BarChart3, 
  Eye, 
  TrendingUp,
  ShoppingCart,
  Users,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import { smartToast } from '../../../utils/toastConfig';
import Spinner from '../../../components/ui/Spinner';


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
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface Customer {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  lastLogin?: string;
  createdAt: string;
  status?: 'active' | 'inactive';
  cartItemsCount?: number;
  wishlistItemsCount?: number;
}

interface Coupon {
  id: number;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt?: string;
}

interface VisitorStats {
  totalVisitors: number;
  monthlyVisitors: number;
  dailyVisitors: number;
}

interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 0,
    monthlyVisitors: 0,
    dailyVisitors: 0
  });
  const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.ORDERS);
      const ordersArray = Array.isArray(response) ? response : response?.orders || response?.data || [];
      setOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      smartToast.dashboard.error('فشل في جلب الطلبات');
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS);
      const customersArray = Array.isArray(response) ? response : response?.customers || response?.data || [];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
      smartToast.dashboard.error('فشل في جلب العملاء');
    }
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.COUPONS);
      const couponsArray = Array.isArray(response) ? response : response?.coupons || response?.data || [];
      setCoupons(couponsArray);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      smartToast.dashboard.error('فشل في جلب الكوبونات');
    }
  };

  // Fetch visitor stats
  const fetchVisitorStats = async () => {
    try {
      // In a real app, you would fetch this from an analytics API
      // For now, we'll use mock data
      setVisitorStats({
        totalVisitors: 12500,
        monthlyVisitors: 3200,
        dailyVisitors: 120
      });
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      smartToast.dashboard.error('فشل في جلب إحصائيات الزوار');
    }
  };

  // Generate daily sales data based on orders
  const generateDailySalesData = () => {
    if (orders.length === 0) {
      // If no orders, create empty data for last 30 days
      const today = new Date();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const emptyData = last30Days.map(date => {
        const dateObj = new Date(date);
        return {
          date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
          sales: 0,
          orders: 0
        };
      });

      setDailySalesData(emptyData);
      return;
    }

    // Group orders by date
    const salesByDate: { [key: string]: { sales: number; orders: number } } = {};

    // Initialize data for last 30 days with 0 values
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    // Initialize all dates with 0
    last30Days.forEach(date => {
      salesByDate[date] = { sales: 0, orders: 0 };
    });

    // Add real order data
    orders.forEach(order => {
      if (order.status === 'delivered' || order.status === 'confirmed') {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (salesByDate[date]) {
          salesByDate[date].sales += order.total;
          salesByDate[date].orders += 1;
        }
      }
    });

    // Convert to array with formatted dates and sort by date
    const data = last30Days.map(date => {
      const dateObj = new Date(date);
      return {
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        sales: salesByDate[date].sales,
        orders: salesByDate[date].orders
      };
    });

    setDailySalesData(data);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    // Total sales
    const totalSales = orders.reduce((total, order) => total + order.total, 0);

    // Products sold
    const productsSold = orders.reduce((total, order) => 
      total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    );

    // Average order value
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // Growth calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastYear;
    });

    const currentMonthSales = currentMonthOrders.reduce((total, order) => total + order.total, 0);
    const lastMonthSales = lastMonthOrders.reduce((total, order) => total + order.total, 0);
    const currentMonthItems = currentMonthOrders.reduce((total, order) => 
      total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    );
    const lastMonthItems = lastMonthOrders.reduce((total, order) => 
      total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    );
    const currentMonthAvg = currentMonthOrders.length > 0 ? currentMonthSales / currentMonthOrders.length : 0;
    const lastMonthAvg = lastMonthOrders.length > 0 ? lastMonthSales / lastMonthOrders.length : 0;

    const salesGrowth = lastMonthSales === 0 && currentMonthSales > 0 ? 100 : 
                       lastMonthSales === 0 && currentMonthSales === 0 ? 0 : 
                       ((currentMonthSales - lastMonthSales) / lastMonthSales * 100);
    
    const itemsGrowth = lastMonthItems === 0 && currentMonthItems > 0 ? 100 : 
                       lastMonthItems === 0 && currentMonthItems === 0 ? 0 : 
                       ((currentMonthItems - lastMonthItems) / lastMonthItems * 100);
    
    const avgGrowth = lastMonthAvg === 0 && currentMonthAvg > 0 ? 100 : 
                     lastMonthAvg === 0 && currentMonthAvg === 0 ? 0 : 
                     ((currentMonthAvg - lastMonthAvg) / lastMonthAvg * 100);

    return {
      totalSales,
      productsSold,
      averageOrderValue,
      salesGrowth,
      itemsGrowth,
      avgGrowth
    };
  };

// Calculate top products
const getTopProducts = () => {
  const productSales: { [key: string]: number } = {};
  
  // ✅ بدون فلترة حالة الطلب - زي الكود القديم بالضبط
  orders.forEach(order => {
    order.items.forEach(item => {
      if (productSales[item.productName]) {
        productSales[item.productName] += item.quantity;
      } else {
        productSales[item.productName] = item.quantity;
      }
    });
  });
  
  // ✅ ترتيب وأخذ أول 5
  return Object.entries(productSales)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([productName, quantity]) => ({ 
      productName, 
      quantity: quantity as number 
    }));
};

  // Calculate order status distribution
  const getOrderStatusDistribution = () => {
    return [
      { status: 'delivered', label: 'مكتملة', count: orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
      { status: 'confirmed', label: 'مؤكدة', count: orders.filter(o => o.status === 'confirmed').length, color: '#059669' },
      { status: 'preparing', label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: '#F59E0B' },
      { status: 'pending', label: 'معلقة', count: orders.filter(o => o.status === 'pending').length, color: '#EAB308' },
      { status: 'cancelled', label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' }
    ];
  };

// Calculate customer metrics
const getCustomerMetrics = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30*24*60*60*1000);
  
  const newCustomersThisMonth = customers.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;
  
  // Calculate customer spending
  const customerSpending: { [key: string]: number } = {};
  orders.forEach(order => {
    customerSpending[order.customerName] = (customerSpending[order.customerName] || 0) + order.total;
  });
  
  const topCustomer = Object.entries(customerSpending)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  // Calculate returning customers
  const customerOrderCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    customerOrderCounts[order.customerName] = (customerOrderCounts[order.customerName] || 0) + 1;
  });
  
  const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const totalCustomersWithOrders = Object.keys(customerOrderCounts).length;
  const returningCustomerPercentage = totalCustomersWithOrders > 0 
    ? (returningCustomers / totalCustomersWithOrders) * 100 
    : 0;

  // ✅ حساب عملاء لديهم عناصر في السلة
  let customersWithCart = 0;
  
  try {
    // 1. عد العملاء الذين لديهم طلبات نشطة (pending, confirmed, preparing)
    const customersWithActiveOrders = new Set<string>();
    orders.forEach(order => {
      if (['pending', 'confirmed', 'preparing'].includes(order.status)) {
        customersWithActiveOrders.add(order.customerEmail || order.customerName);
      }
    });
    
    customersWithCart = customersWithActiveOrders.size;
    
    // 2. إضافة العملاء من بيانات الـ API (إذا كان الـ API يرجع cartItemsCount)
    customers.forEach(customer => {
      if (customer.cartItemsCount && customer.cartItemsCount > 0) {
        customersWithCart++;
      }
    });
    
  } catch (error) {
    console.warn('Error calculating customers with cart:', error);
    customersWithCart = 0;
  }

  return {
    totalCustomers: customers.length,
    newCustomersThisMonth,
    avgOrdersPerCustomer: customers.length > 0 ? orders.length / customers.length : 0,
    topCustomerSpending: topCustomer ? topCustomer[1] : 0,
    returningCustomers,
    returningCustomerPercentage,
    customersWithCart // ✅ إضافة العدد الجديد
  };
};

  // Calculate coupon metrics
  const getCouponMetrics = () => {
    const activeCoupons = coupons.filter(c => c.isActive).length;
    const ordersWithCoupons = orders.filter(o => o.couponDiscount && o.couponDiscount > 0).length;
    const totalDiscount = orders.reduce((total, order) => total + (order.couponDiscount || 0), 0);
    const ordersWithCouponsCount = orders.filter(o => o.couponDiscount && o.couponDiscount > 0).length;
    
    const avgDiscount = ordersWithCouponsCount > 0 
      ? totalDiscount / ordersWithCouponsCount 
      : 0;

    return {
      activeCoupons,
      usageRate: orders.length > 0 ? (ordersWithCoupons / orders.length) * 100 : 0,
      totalDiscount,
      avgDiscount
    };
  };

// في السطر ~345
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchCoupons(),
        fetchVisitorStats()
      ]);
      // ✅ لا تستدعي generateDailySalesData هنا
    } catch (error) {
      console.error('Error loading analytics ', error);
      smartToast.dashboard.error('فشل في تحميل بيانات التحليلات');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

// ✅ أضف useEffect جديد لتوليد البيانات عندما تتغير الطلبات
useEffect(() => {
  if (orders.length > 0) {
    generateDailySalesData();
  }
}, [orders]); // سيعمل تلقائياً عندما تُحمّل الطلبات

  if (loading) {
    return <Spinner overlay />;
  }

// في السطر ~364 تقريباً (قبل return مباشرة)
const metrics = calculateMetrics();
const topProducts = getTopProducts(); // ✅ تأكد من استدعائها هنا
const orderStatusDistribution = getOrderStatusDistribution();
const customerMetrics = getCustomerMetrics();
const couponMetrics = getCouponMetrics();

 return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" />
              نظام التحليلات والإحصائيات
            </h2>
            <p className="text-gray-200">تحليل شامل ومتقدم لأداء المتجر والمبيعات مع رؤى تفصيلية لاتخاذ قرارات مدروسة</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-lg flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalSales.toLocaleString('ar-SA')} ر.س
              </div>
              <div className="text-sm text-gray-600">إجمالي المبيعات</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
            <span className="text-green-600 font-medium">
              {metrics.salesGrowth >= 0 ? `+${metrics.salesGrowth.toFixed(1)}%` : `${metrics.salesGrowth.toFixed(1)}%`}
            </span>
            <span className="text-gray-600 mr-2">من الشهر الماضي</span>
          </div>
        </div>

        {/* Products Sold */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-lg flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.productsSold}
              </div>
              <div className="text-sm text-gray-600">المنتجات المباعة</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
            <span className="text-green-600 font-medium">
              {metrics.itemsGrowth >= 0 ? `+${metrics.itemsGrowth.toFixed(1)}%` : `${metrics.itemsGrowth.toFixed(1)}%`}
            </span>
            <span className="text-gray-600 mr-2">من الشهر الماضي</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.averageOrderValue.toFixed(0)} ر.س
              </div>
              <div className="text-sm text-gray-600">متوسط قيمة الطلب</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
            <span className="text-green-600 font-medium">
              {metrics.avgGrowth >= 0 ? `+${metrics.avgGrowth.toFixed(1)}%` : `${metrics.avgGrowth.toFixed(1)}%`}
            </span>
            <span className="text-gray-600 mr-2">من الشهر الماضي</span>
          </div>
        </div>

        {/* Visitors Stats */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-lg flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {visitorStats.monthlyVisitors.toLocaleString('ar-SA')}
              </div>
              <div className="text-sm text-gray-600">الزوار الشهريين</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-900 font-medium">
              {visitorStats.dailyVisitors} يومياً
            </span>
            <span className="text-gray-600 mr-2">متوسط الزوار</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#203f61] text-white px-6 py-4">
            <h3 className="text-lg font-bold flex items-center">
              <BarChart3 className="w-5 h-5 ml-2" />
              المبيعات الشهرية
            </h3>
          </div>
          <div className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#203f61" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#203f61] text-white px-6 py-4">
            <h3 className="text-lg font-bold">🏆 أعلى المنتجات مبيعاً</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.productName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#203f61] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-600">{product.quantity} قطعة مباعة</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#203f61] h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min((product.quantity / Math.max(...topProducts.map(p => p.quantity))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#203f61] text-white px-6 py-4">
            <h3 className="text-lg font-bold">توزيع حالات الطلبات</h3>
          </div>
          <div className="p-6 space-y-3">
            {orderStatusDistribution.map(item => (
              <div key={item.status} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#203f61] text-white px-6 py-4">
            <h3 className="text-lg font-bold">تحليل العملاء</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">إجمالي العملاء</span>
              <span className="font-bold text-gray-900">{customerMetrics.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">عملاء جدد هذا الشهر</span>
              <span className="font-bold text-green-600">+{customerMetrics.newCustomersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">متوسط الطلبات لكل عميل</span>
              <span className="font-bold text-blue-600">{customerMetrics.avgOrdersPerCustomer.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">أعلى عميل إنفاقاً</span>
              <span className="font-bold text-purple-600">{customerMetrics.topCustomerSpending.toFixed(0)} ر.س</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">العملاء المتكررين</span>
              <span className="font-bold text-indigo-600">{customerMetrics.returningCustomers}</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">نسبة العملاء المتكررين</span>
              <span className="font-bold text-teal-600">{customerMetrics.returningCustomerPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">عملاء لديهم عناصر في السلة</span>
              <span className="font-bold text-orange-600">{customerMetrics.customersWithCart}</span>
            </div>
          </div>
        </div>

        {/* Coupon Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#203f61] text-white px-6 py-4">
            <h3 className="text-lg font-bold">أداء الكوبونات</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">الكوبونات النشطة</span>
              <span className="font-bold text-gray-900">{couponMetrics.activeCoupons}</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">معدل الاستخدام</span>
              <span className="font-bold text-green-600">{couponMetrics.usageRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">إجمالي الخصم المطبق</span>
              <span className="font-bold text-red-600">{couponMetrics.totalDiscount.toFixed(0)} ر.س</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-sm text-gray-600">متوسط قيمة الخصم</span>
              <span className="font-bold text-orange-600">{couponMetrics.avgDiscount.toFixed(0)} ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;