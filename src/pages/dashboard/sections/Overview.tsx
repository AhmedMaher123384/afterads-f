import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- تعريف الواجهات ---
interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface Testimonial {
  id: number;
  name: string;
  position: string;
  testimonial: string;
  image?: string;
}

interface Client {
  id: number;
  name: string;
  description: string;
  logo?: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: string;
  createdAt: string;
  categories: string[];
  slug: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  postId: number;
  createdAt: string;
  approved: boolean;
}

interface StoreStats {
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  yearOrders: number;
  pendingOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  averageOrderValue: number;
  totalProducts: number;
  activeProducts: number;
  unavailableProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  totalCustomers: number;
  activeCustomers: number;
  totalBlogPosts: number;
  totalTestimonials: number;
  totalClients: number;
  totalComments: number;
  wishlistItemsCount: number;
  monthlyTarget: number;
  progressPercentage: number;
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { ShoppingCart, Package, Users, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, MessageCircle, Award, Briefcase, AlertTriangle, BarChart3, Eye } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { smartToast } from '../../../utils/toastConfig';
import Spinner from '../../../components/ui/Spinner';

// --- وظيفة حساب الإحصائيات ---
const calculateStats = (
  orders: Order[],
  products: Product[],
  customers: Customer[],
  testimonials: Testimonial[],
  clients: Client[],
  blogPosts: BlogPost[],
  comments: Comment[],
  monthlyTarget: number
): StoreStats => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const todayOrders = orders.filter(order => new Date(order.createdAt) >= today).length;
  const weekOrders = orders.filter(order => new Date(order.createdAt) >= weekStart).length;
  const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthStart).length;
  const yearOrders = orders.filter(order => new Date(order.createdAt) >= yearStart).length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const monthRevenue = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= monthStart;
  }).reduce((sum, order) => sum + order.total, 0);

  const yearRevenue = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= yearStart;
  }).reduce((sum, order) => sum + order.total, 0);

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const inProgressOrders = orders.filter(order => ['confirmed', 'preparing', 'shipped'].includes(order.status)).length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isAvailable).length;
  const unavailableProducts = products.filter(p => !p.isAvailable).length;
  const outOfStockProducts = products.filter(p => p.quantity === 0).length;
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;

  const totalBlogPosts = blogPosts.length;
  const totalTestimonials = testimonials.length;
  const totalClients = clients.length;
  const totalComments = comments.length;

  const totalOrders = orders.length;
  const wishlistItemsCount = 0;

  return {
    totalOrders,
    todayOrders,
    weekOrders,
    monthOrders,
    yearOrders,
    pendingOrders,
    completedOrders,
    inProgressOrders,
    totalRevenue,
    monthRevenue,
    yearRevenue,
    averageOrderValue,
    totalProducts,
    activeProducts,
    unavailableProducts,
    outOfStockProducts,
    lowStockProducts,
    totalValue,
    totalCustomers,
    activeCustomers,
    totalBlogPosts,
    totalTestimonials,
    totalClients,
    totalComments,
    wishlistItemsCount,
    monthlyTarget,
    progressPercentage: monthlyTarget > 0 ? (monthRevenue / monthlyTarget) * 100 : 0,
  };
};

// --- مكونات البطاقات ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold flex items-center ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// --- مكون الصفحة ---
const NewOverviewPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('dashboardMonthlyTarget');
    const parsed = saved ? parseInt(saved, 10) : 50000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 50000;
  });
  const [monthlyTargetInput, setMonthlyTargetInput] = useState<number>(monthlyTarget);
  const navigate = useNavigate();
  const [visitTotal, setVisitTotal] = useState<number>(0);
  const { data: ordersData, isLoading: ordersLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.ORDERS, queryKey: ['orders'] });
  const { data: productsData, isLoading: productsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.PRODUCTS, queryKey: ['products'] });
  const { data: customersData, isLoading: customersLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CUSTOMERS, queryKey: ['customers'] });
  const { data: testimonialsData, isLoading: testimonialsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.TESTIMONIALS, queryKey: ['testimonials'] });
  const { data: clientsData, isLoading: clientsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CLIENTS, queryKey: ['clients'] });
  const { data: blogPostsData, isLoading: blogPostsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.BLOG_POSTS, queryKey: ['blog-posts'] });
  const { data: commentsData, isLoading: commentsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.COMMENTS, queryKey: ['comments'] });
  const { data: visitsData, isLoading: visitsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.VISITS_COUNTER, queryKey: ['visits-counter'] });

  useEffect(() => {
    const loadData = async () => {
      return;
      try {
        setLoading(true);
        setError(null);

        const [
          fetchedOrdersRes,
          fetchedProductsRes,
          fetchedCustomersRes,
          fetchedTestimonialsRes,
          fetchedClientsRes,
          fetchedBlogPostsRes,
          fetchedCommentsRes,
          fetchedVisitsRes
        ] = await Promise.all([
          apiCall(API_ENDPOINTS.ORDERS),
          apiCall(API_ENDPOINTS.PRODUCTS),
          apiCall(API_ENDPOINTS.CUSTOMERS),
          apiCall(API_ENDPOINTS.TESTIMONIALS),
          apiCall(API_ENDPOINTS.CLIENTS),
          apiCall(API_ENDPOINTS.BLOG_POSTS),
          apiCall(API_ENDPOINTS.COMMENTS),
          apiCall(API_ENDPOINTS.VISITS_COUNTER),
        ]);

        const fetchedOrders = Array.isArray(fetchedOrdersRes) ? fetchedOrdersRes : (fetchedOrdersRes?.data || fetchedOrdersRes?.orders || []);
        const fetchedProducts = Array.isArray(fetchedProductsRes) ? fetchedProductsRes : (fetchedProductsRes?.data || fetchedProductsRes?.products || []);
        const fetchedCustomers = Array.isArray(fetchedCustomersRes) ? fetchedCustomersRes : (fetchedCustomersRes?.data || fetchedCustomersRes?.customers || []);
        const fetchedTestimonials = Array.isArray(fetchedTestimonialsRes) ? fetchedTestimonialsRes : (fetchedTestimonialsRes?.data || fetchedTestimonialsRes?.testimonials || []);
        const fetchedClients = Array.isArray(fetchedClientsRes) ? fetchedClientsRes : (fetchedClientsRes?.data || fetchedClientsRes?.clients || []);
        const fetchedBlogPosts = Array.isArray(fetchedBlogPostsRes) ? fetchedBlogPostsRes : (fetchedBlogPostsRes?.data || fetchedBlogPostsRes?.posts || []);
        const fetchedComments = Array.isArray(fetchedCommentsRes) ? fetchedCommentsRes : (fetchedCommentsRes?.data || fetchedCommentsRes?.comments || []);
        // زيارات: قد تعود على شكل { success, data: { total, daily } }
        const visitsData = (fetchedVisitsRes && typeof fetchedVisitsRes === 'object')
          ? (fetchedVisitsRes.data || fetchedVisitsRes)
          : {};
        const totalVisits = typeof visitsData.total === 'number' ? visitsData.total : 0;

        if (!Array.isArray(fetchedProducts)) throw new Error("البيانات المرجعة من API للمنتجات ليست مصفوفة.");
        if (!Array.isArray(fetchedOrders)) throw new Error("البيانات المرجعة من API للطلبات ليست مصفوفة.");
        if (!Array.isArray(fetchedCustomers)) throw new Error("البيانات المرجعة من API للعملاء ليست مصفوفة.");
        if (!Array.isArray(fetchedTestimonials)) throw new Error("البيانات المرجعة من API للشهادات ليست مصفوفة.");
        if (!Array.isArray(fetchedClients)) throw new Error("البيانات المرجعة من API للعملاء (clients) ليست مصفوفة.");
        if (!Array.isArray(fetchedBlogPosts)) throw new Error("البيانات المرجعة من API للمقالات ليست مصفوفة.");
        if (!Array.isArray(fetchedComments)) throw new Error("البيانات المرجعة من API للتعليقات ليست مصفوفة.");

        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
        setCustomers(fetchedCustomers);
        setTestimonials(fetchedTestimonials);
        setClients(fetchedClients);
        setBlogPosts(fetchedBlogPosts);
        setComments(fetchedComments);
        setVisitTotal(totalVisits);

        const calculatedStats = calculateStats(
          fetchedOrders,
          fetchedProducts,
          fetchedCustomers,
          fetchedTestimonials,
          fetchedClients,
          fetchedBlogPosts,
          fetchedComments,
          monthlyTarget
        );
        setStats(calculatedStats);

      } catch (err: any) {
        console.error('Error loading data for NewOverviewPage:', err);
        setError(err.message || 'فشل في تحميل البيانات');
        smartToast.dashboard.error(err.message || 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [monthlyTarget]);

  useEffect(() => {
    setLoading(
      ordersLoading || productsLoading || customersLoading || testimonialsLoading ||
      clientsLoading || blogPostsLoading || commentsLoading || visitsLoading
    );
    setError(null);
  }, [
    ordersLoading, productsLoading, customersLoading, testimonialsLoading,
    clientsLoading, blogPostsLoading, commentsLoading, visitsLoading
  ]);

  useEffect(() => {
    if (ordersData) {
      const arr = Array.isArray(ordersData) ? ordersData : (ordersData?.data || ordersData?.orders || []);
      setOrders(arr);
    }
  }, [ordersData]);

  useEffect(() => {
    if (productsData) {
      const arr = Array.isArray(productsData) ? productsData : (productsData?.data || productsData?.products || []);
      setProducts(arr);
    }
  }, [productsData]);

  useEffect(() => {
    if (customersData) {
      const arr = Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.customers || []);
      setCustomers(arr);
    }
  }, [customersData]);

  useEffect(() => {
    if (testimonialsData) {
      const arr = Array.isArray(testimonialsData) ? testimonialsData : (testimonialsData?.data || testimonialsData?.testimonials || []);
      setTestimonials(arr);
    }
  }, [testimonialsData]);

  useEffect(() => {
    if (clientsData) {
      const arr = Array.isArray(clientsData) ? clientsData : (clientsData?.data || clientsData?.clients || []);
      setClients(arr);
    }
  }, [clientsData]);

  useEffect(() => {
    if (blogPostsData) {
      const arr = Array.isArray(blogPostsData) ? blogPostsData : (blogPostsData?.data || blogPostsData?.posts || []);
      setBlogPosts(arr);
    }
  }, [blogPostsData]);

  useEffect(() => {
    if (commentsData) {
      const arr = Array.isArray(commentsData) ? commentsData : (commentsData?.data || commentsData?.comments || []);
      setComments(arr);
    }
  }, [commentsData]);

  useEffect(() => {
    if (visitsData) {
      const vd = (visitsData && typeof visitsData === 'object') ? (visitsData.data || visitsData) : {};
      const total = typeof vd.total === 'number' ? vd.total : 0;
      setVisitTotal(total);
    }
  }, [visitsData]);

  useEffect(() => {
    const calculated = calculateStats(
      orders,
      products,
      customers,
      testimonials,
      clients,
      blogPosts,
      comments,
      monthlyTarget
    );
    setStats(calculated);
  }, [orders, products, customers, testimonials, clients, blogPosts, comments, monthlyTarget]);

  // --- بيانات الرسم البياني (useMemo) ---
  const salesData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const monthlyData = [];
    
    for (let i = 0; i <= currentMonth; i++) {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthTotal = monthOrders.reduce((sum, order) => sum + order.total, 0);
      
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                         'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      monthlyData.push({
        name: monthNames[i],
        مبيعات: monthTotal
      });
    }
    
    return monthlyData;
  }, [orders]);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'مكتملة', value: stats.completedOrders, color: '#10B981' },
      { name: 'قيد التنفيذ', value: stats.inProgressOrders, color: '#F59E0B' },
      { name: 'معلقة', value: stats.pendingOrders, color: '#EF4444' },
    ];
  }, [stats]);

  const latestOrders = useMemo(() => 
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  const latestComments = useMemo(() =>
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [comments]
  );

  const topProducts = useMemo(() => products.slice(0, 3), [products]);

  if (loading) {
    return <Spinner overlay />;
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-lg">{error || 'لا توجد إحصائيات لعرضها.'}</div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = "bg-black", change = null }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color?: string; 
    change?: string | null; 
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`${color} p-3 rounded-full text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== null && (
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  );

  // يتم جلب إجمالي الزيارات من الـ API ويُعرض أدناه

  const additionalStats = {
    totalCategories: 10,
    activeCoupons: 5,
  };

  return (
    <div className="p-6 space-y-6">
      {/* --- رأس الصفحة --- */}
      <div className="bg-gradient-to-r bg-[#203f61] to-bg-[#2a537e] rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">النظرة العامة الجديدة</h2>
        <p className="text-gray-300 mb-4">إحصائيات محدثة ومحللة من منظور مختلف</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            {new Date().toLocaleDateString('ar-SA')}
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            التارجت الشهري: {stats.monthlyTarget.toLocaleString()} ر.س
          </div>
        </div>
      </div>

      {/* --- بطاقة التقدم --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            تقدم التارجت الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">{stats.progressPercentage.toFixed(1)}%</span>
            <span className="text-sm text-gray-500">من {stats.monthlyTarget.toLocaleString()} ر.س</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full"
              style={{ width: `${Math.min(100, stats.progressPercentage)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            المبلغ المحقق هذا الشهر: {stats.monthRevenue.toLocaleString()} ر.س
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={monthlyTargetInput}
              onChange={(e) => setMonthlyTargetInput(parseInt(e.target.value || '0', 10) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
            />
            <button
              onClick={() => {
                const value = Number.isFinite(monthlyTargetInput) && monthlyTargetInput > 0 ? monthlyTargetInput : 50000;
                setMonthlyTarget(value);
                localStorage.setItem('dashboardMonthlyTarget', String(value));
              }}
              className="px-4 py-2 bg-[#203f61] text-white rounded-lg hover:bg-[#2a537e]"
            >
              تحديث الهدف
            </button>
          </div>
        </CardContent>
      </Card>

      {/* --- الصف الأول من البطاقات --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الطلبات" value={stats.totalOrders} icon={ShoppingCart} color="bg-blue-600" />
        <StatCard title="إجمالي المبيعات" value={`${stats.totalRevenue.toLocaleString()} ر.س`} icon={DollarSign} color="bg-green-600" />
        <StatCard title="إجمالي المنتجات" value={stats.totalProducts} icon={Package} color="bg-purple-600" />
        <StatCard title="العملاء المسجلين" value={stats.totalCustomers} icon={Users} color="bg-gray-800" />
      </div>

      {/* --- الصف الثاني من البطاقات --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="الطلبات المكتملة" value={stats.completedOrders} icon={CheckCircle} color="bg-green-800" />
        <StatCard title="الطلبات قيد التنفيذ" value={stats.inProgressOrders} icon={Clock} color="bg-yellow-600" />
        <StatCard title="الطلبات المعلقة" value={stats.pendingOrders} icon={AlertCircle} color="bg-red-600" />
        <StatCard title="المنتجات المفعلة" value={stats.activeProducts} icon={Package} color="bg-teal-600" />
      </div>

      {/* --- الصف الثالث من البطاقات --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="عدد المقالات" value={stats.totalBlogPosts} icon={MessageCircle} color="bg-indigo-600" />
        <StatCard title="عدد الشهادات" value={stats.totalTestimonials} icon={Award} color="bg-amber-600" />
        <StatCard title="عدد العملاء" value={stats.totalClients} icon={Briefcase} color="bg-emerald-600" />
        <StatCard title="عدد التعليقات" value={stats.totalComments} icon={MessageCircle} color="bg-cyan-600" />
      </div>

      {/* --- الصف الرابع من البطاقات --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="عدد التصنيفات" value={additionalStats.totalCategories} icon={Package} color="bg-orange-600" />
        <StatCard title="الكوبونات النشطة" value={additionalStats.activeCoupons} icon={DollarSign} color="bg-pink-600" />
        <StatCard title="إجمالي الزوار" value={visitTotal} icon={Eye} color="bg-blue-500" />
        <StatCard 
          title="مبيعات هذا العام" 
          value={`${stats.yearRevenue.toLocaleString()} ر.س`} 
          icon={BarChart3} 
          color="bg-indigo-600"
          change={`${stats.yearOrders} طلب هذا العام`}
        />
      </div>

      {/* --- الرسوم البيانية --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              تحليل المبيعات السنوية ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()} ر.س`, 'المبيعات']}
                    labelFormatter={(label) => `الشهر: ${label}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="مبيعات" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
              توزيع الطلبات حسب الحالة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'عدد الطلبات']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry, index) => (
                      <span style={{ color: entry.color, fontSize: '12px' }}>
                        {statusData[index].name}
                      </span>
                    )}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {stats.totalOrders > 0 ? ((entry.value / stats.totalOrders) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- الصف الخامس من البطاقات --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 ml-2 text-[#203f61]" />
                آخر 5 طلبات جديدة
              </CardTitle>
              <button onClick={() => navigate('orders')} className="text-sm font-medium text-[#203f61] hover:underline transition-all">
                عرض الكل ←
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {latestOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#203f61] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {order.id}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 mb-1">{order.total.toLocaleString()} ر.س</p>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status === 'pending' ? 'قيد المراجعة' :
                         order.status === 'confirmed' ? 'مؤكد' :
                         order.status === 'preparing' ? 'قيد التحضير' :
                         order.status === 'delivered' ? 'تم التسليم' :
                         order.status === 'shipped' ? 'تم الشحن' :
                         order.status === 'cancelled' ? 'ملغي' : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

 {/* --- آخر 5 تعليقات --- */}
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center">
        <MessageCircle className="w-5 h-5 ml-2 text-[#203f61]" />
        أحدث التعليقات
      </CardTitle>
      <button onClick={() => navigate('comments')} className="text-sm font-medium text-[#203f61] hover:underline transition-all">
        عرض الكل ←
      </button>
    </div>
  </CardHeader>
  <CardContent>
    {latestComments.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-gray-400 text-sm">لا توجد تعليقات بعد</p>
      </div>
    ) : (
      <div className="space-y-3">
        {latestComments.map(comment => (
          <div key={comment.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#203f61] rounded-full flex items-center justify-center text-white text-sm font-bold">
                {(((comment as any).userName || comment.author || (comment as any).userEmail || 'غير معروف') as string).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{(comment as any).userName || comment.author || (comment as any).userEmail || 'غير معروف'}</p>
                <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 pr-10">{comment.content || ''}</p>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

  {/* --- أفضل 3 منتجات مبيعاً --- */}
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 ml-2 text-[#203f61]" />
          المنتجات الأكثر مبيعاً
        </CardTitle>
        <button onClick={() => navigate('products')} className="text-sm font-medium text-[#203f61] hover:underline transition-all">
          عرض الكل ←
        </button>
      </div>
    </CardHeader>
    <CardContent>
      {topProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">لا توجد منتجات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#203f61] to-[#305070] rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-[#203f61] text-lg">{product.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400">ر.س</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</div>

      {/* --- تنبيهات --- */}
      {(stats.unavailableProducts > 0 || stats.outOfStockProducts > 0) && (
        <Card className="bg-orange-50 border border-orange-200">
          {/* --- تغيير الهيدر لتصميم أوضح --- */}
          <div className="flex items-center justify-between mb-4 bg-[#203f61] text-white p-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-white" />
              <h3 className="text-xl font-bold">تنبيهات التوفر</h3>
            </div>
          </div>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {stats.unavailableProducts > 0 && <li>يوجد {stats.unavailableProducts} منتج غير متوفر.</li>}
              {stats.outOfStockProducts > 0 && <li>يوجد {stats.outOfStockProducts} منتج خارج المخزون.</li>}
            </ul>
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default NewOverviewPage;