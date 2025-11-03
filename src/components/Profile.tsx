import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { smartToast } from '../utils/toastConfig';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Clock,
  Package,
  Heart,
  ShoppingCart,
  Star,
  Award,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Crown,
  Gift
} from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../config/api';
import PriceDisplay from './ui/PriceDisplay';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  memberSince: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  preferredLanguage?: string;
  newsletter?: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    totalPrice?: number;
    addOns?: Array<{
      id: string;
      name: string;
      price: number;
      quantity?: number;
    }>;
  }[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security' | 'preferences'>('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      fetchUserProfile(userData.id);
      fetchUserOrders(userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserProfile = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiCall(`${API_ENDPOINTS.CUSTOMERS}/${userId}`);
      if (response.success) {
        setUser(response.data);
        setEditedUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      smartToast.frontend.error('خطأ في تحميل بيانات الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: number) => {
    try {
      const response = await apiCall(`${API_ENDPOINTS.ORDERS}?userId=${userId}`);
      if (response.success) {
        setOrders(response.data.slice(0, 5)); // آخر 5 طلبات
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        smartToast.frontend.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await apiCall(`${API_ENDPOINTS.CUSTOMERS}/${user?.id}/avatar`, {
          method: 'POST',
          body: formData
        });
        
        if (avatarResponse.success) {
          setEditedUser(prev => ({ ...prev, avatar: avatarResponse.data.avatar }));
        }
      }

      // Update profile data
      const response = await apiCall(`${API_ENDPOINTS.CUSTOMERS}/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify(editedUser)
      });

      if (response.success) {
        setUser(response.data);
        setEditMode(false);
        setAvatarFile(null);
        setAvatarPreview('');
        smartToast.frontend.success('تم تحديث الملف الشخصي بنجاح! ✨');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      smartToast.frontend.error('خطأ في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      smartToast.frontend.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      smartToast.frontend.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall(`${API_ENDPOINTS.CUSTOMERS}/${user?.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.success) {
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        smartToast.frontend.success('تم تغيير كلمة المرور بنجاح! 🔐');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      smartToast.frontend.error('خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    navigate('/');
    smartToast.frontend.success('تم تسجيل الخروج بنجاح');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': case 'مكتمل': return 'text-green-600 bg-green-100';
      case 'pending': case 'قيد الانتظار': return 'text-yellow-600 bg-yellow-100';
      case 'processing': case 'قيد المعالجة': return 'text-blue-600 bg-blue-100';
      case 'cancelled': case 'ملغي': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMembershipLevel = (totalSpent: number = 0) => {
    if (totalSpent >= 10000) return { level: 'ماسي', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' };
    if (totalSpent >= 5000) return { level: 'ذهبي', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (totalSpent >= 1000) return { level: 'فضي', icon: Star, color: 'text-gray-600', bg: 'bg-gray-100' };
    return { level: 'برونزي', icon: Gift, color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-6">لم نتمكن من تحميل بيانات الملف الشخصي</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const membership = getMembershipLevel(user.totalSpent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0  w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-x-16 -translate-y-16 sm:-translate-x-32 sm:-translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-white/5 rounded-full translate-x-24 translate-y-24 sm:translate-x-48 sm:translate-y-48"></div>
        
        <div className="relative container mx-auto px-3 sm:px-6 py-6 sm:py-12">
          <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 lg:flex-row">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-white/20 backdrop-blur-xl border-2 sm:border-4 border-white/30 overflow-hidden shadow-2xl">
                {avatarPreview || user.avatar ? (
                  <img 
                    src={avatarPreview || user.avatar} 
                    alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'المستخدم'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <User className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" />
                  </div>
                )}
              </div>
              
              {editMode && (
                <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-white transition-colors shadow-lg">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
              
              {/* Membership Badge */}
              <div className={`absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 ${membership.bg} ${membership.color} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-white sm:border-2`}>
                <membership.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-xs">{membership.level}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center lg:text-right text-white flex-1 px-2">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 flex items-center justify-center lg:justify-start gap-2 sm:gap-3 flex-wrap">
                <span className="break-words">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'المستخدم'}</span>
                {user.isEmailVerified && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400 flex-shrink-0" />
                )}
              </h1>
              
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 break-all">{user.email}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-xl px-2 sm:px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">عضو منذ {new Date(user.memberSince).getFullYear()}</span>
                </div>
                
                {user.totalOrders && (
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-xl px-2 sm:px-3 py-1 rounded-full">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{user.totalOrders} طلب</span>
                  </div>
                )}
                
                {user.loyaltyPoints && (
                  <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-xl px-2 sm:px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{user.loyaltyPoints} نقطة</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 w-full lg:w-auto">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-white/20 backdrop-blur-xl text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium border border-white/30 text-sm sm:text-base"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">تعديل الملف</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-green-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 font-medium disabled:opacity-50 flex-1 lg:flex-none text-sm sm:text-base"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">حفظ التغييرات</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedUser(user);
                      setAvatarFile(null);
                      setAvatarPreview('');
                    }}
                    className="bg-red-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 font-medium flex-1 lg:flex-none text-sm sm:text-base"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">إلغاء</span>
                  </button>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-red-500/20 backdrop-blur-xl text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium border border-red-400/30 text-sm sm:text-base"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex gap-2 sm:gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'profile', label: 'الملف الشخصي', icon: User },
              { id: 'orders', label: 'الطلبات', icon: Package },
              { id: 'security', label: 'الأمان', icon: Shield },
              { id: 'preferences', label: 'التفضيلات', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  المعلومات الشخصية
                </h3>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedUser.firstName || ''}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base">{user.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedUser.lastName || ''}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base">{user.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editedUser.email || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 font-medium bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex-1 text-sm sm:text-base break-all">{user.email}</p>
                      {user.isEmailVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={editedUser.phone || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="رقم الهاتف"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 font-medium bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex-1 text-sm sm:text-base">
                        {user.phone || 'غير محدد'}
                      </p>
                      {user.isPhoneVerified && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    العنوان
                  </label>
                  {editMode ? (
                    <textarea
                      value={editedUser.address || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      rows={3}
                      placeholder="العنوان الكامل"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base">
                      {user.address || 'غير محدد'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200/50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    إحصائيات سريعة
                  </h3>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl">
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{user.totalOrders || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-600">إجمالي الطلبات</p>
                    </div>
                    
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-green-600"><PriceDisplay price={user.totalSpent || 0} /></div>
                      <p className="text-xs sm:text-sm text-gray-600">إجمالي المشتريات</p>
                    </div>
                    
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{user.loyaltyPoints || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-600">نقاط الولاء</p>
                    </div>
                    
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl">
                      <membership.icon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
                      <p className="text-base sm:text-lg font-bold text-orange-600">{membership.level}</p>
                      <p className="text-xs sm:text-sm text-gray-600">مستوى العضوية</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 border-b border-gray-200/50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    آخر الطلبات
                  </h3>
                </div>
                
                <div className="p-4 sm:p-6">
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors gap-2 sm:gap-0">
                          <div>
                            <p className="font-medium text-gray-800 text-sm sm:text-base">#{order.orderNumber}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <div className="text-right sm:text-left">
                            <PriceDisplay price={order.total} className="font-bold text-gray-800 text-sm sm:text-base" />
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="w-full mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        عرض جميع الطلبات ←
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-500 text-sm sm:text-base">لا توجد طلبات بعد</p>
                      <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block">
                        تصفح المنتجات ←
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200/50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                جميع الطلبات
              </h3>
            </div>
            
            <div className="p-4 sm:p-6">
              {orders.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-gray-800">طلب #{order.orderNumber}</h4>
                          <p className="text-sm sm:text-base text-gray-600">{new Date(order.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <PriceDisplay price={order.total} className="text-lg sm:text-xl font-bold text-gray-800" />
                        </div>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">المنتجات:</h5>
                          <div className="space-y-2 sm:space-y-3">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-800 font-medium flex-1 pr-2 text-sm sm:text-base">
                                    {item.productName} × {item.quantity}
                                  </span>
                                  <span className="font-bold text-gray-800 flex-shrink-0 text-sm sm:text-base">
                                    <PriceDisplay price={item.totalPrice || (item.price * item.quantity)} />
                                  </span>
                                </div>
                                
                                {/* عرض المنتجات الإضافية */}
                                {item.addOns && item.addOns.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-gray-600 text-xs font-medium mb-1">المنتجات الإضافية:</div>
                                    {item.addOns.map((addOn, addOnIndex) => (
                                      <div key={addOnIndex} className="flex justify-between items-center text-xs text-gray-600 mr-3">
                                        <span>• {addOn.name} ({addOn.quantity || 1}×)</span>
                                        <span className="font-medium">
                                          <PriceDisplay price={addOn.price} />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {order.items.length > 2 && (
                              <div className="text-center text-gray-500 text-xs sm:text-sm italic">
                                و {order.items.length - 2} منتج آخر...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">لم تقم بأي طلبات بعد</p>
                  <Link 
                    to="/products" 
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    تصفح المنتجات
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 border-b border-gray-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  الأمان وكلمة المرور
                </h3>
              </div>
              
              <div className="p-4 sm:p-6">
                {!showPasswordChange ? (
                  <div className="text-center py-6 sm:py-8">
                    <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">تغيير كلمة المرور</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">قم بتحديث كلمة المرور لحماية حسابك</p>
                    <button
                      onClick={() => setShowPasswordChange(true)}
                      className="bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
                    >
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                      تغيير كلمة المرور
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="كلمة المرور الحالية"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="كلمة المرور الجديدة"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="تأكيد كلمة المرور الجديدة"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setShowPasswords({ current: false, new: false, confirm: false });
                        }}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  التفضيلات والإعدادات
                </h3>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl gap-3 sm:gap-0">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm sm:text-base">النشرة الإخبارية</h4>
                    <p className="text-xs sm:text-sm text-gray-600">تلقي آخر الأخبار والعروض</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedUser.newsletter || false}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, newsletter: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">اللغة المفضلة</h4>
                  <select
                    value={editedUser.preferredLanguage || 'ar'}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {editMode && (
                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;