import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Package, 
  Clock, 
  Star,
  Settings,
  LogOut,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { getUserOrders } from '../../utils/api';
import OrderTrackingModal from '../modals/OrderTrackingModal';
import PriceDisplay from '../ui/PriceDisplay';

interface UserData {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  items?: Array<{
    id: string;
    productName?: string;
    product?: {
      name: string;
    };
    quantity: number;
    price: number;
    totalPrice: number;
    addOns?: Array<{
      id: string;
      name: string;
      price: number;
      quantity?: number;
    }>;
  }>;
}

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [userStats, setUserStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserData>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadRecentOrders();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setFormData(userData);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      smartToast.frontend.error(t('user_profile.error_loading_user_data'));
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      if (!user?.email) {
        console.log('❌ [UserProfile] No user email found for loading orders');
        return;
      }
      
      console.log('🔄 [UserProfile] Loading orders for email:', user.email);
      const orders = await getUserOrders(user.email);
      console.log('📦 [UserProfile] Orders response:', orders);
      
      if (orders && Array.isArray(orders)) {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        setUserStats({ totalOrders, totalSpent });
        const sortedOrders = orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentOrders(sortedOrders);
        console.log('✅ [UserProfile] Recent orders loaded successfully:', sortedOrders.length, 'orders');
        console.log('📊 [UserProfile] User stats calculated:', { totalOrders, totalSpent });
      } else {
        console.log('ℹ️ [UserProfile] No orders found or invalid response format');
        setRecentOrders([]);
        setUserStats({ totalOrders: 0, totalSpent: 0 });
      }
    } catch (error) {
      console.error('❌ [UserProfile] Error loading recent orders:', error);
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          console.log('ℹ️ [UserProfile] No orders found for user (404)');
          setRecentOrders([]);
          setUserStats({ totalOrders: 0, totalSpent: 0 });
        } else if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          smartToast.frontend.error(t('user_profile.connection_error'));
          setRecentOrders([]);
        } else {
          smartToast.frontend.error(t('user_profile.error_loading_orders'));
          setRecentOrders([]);
        }
      } else {
        smartToast.frontend.error(t('user_profile.unexpected_error_orders'));
        setRecentOrders([]);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const response = await apiCall(`/api/customers/profile/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (response.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        smartToast.frontend.success(t('user_profile.data_updated_successfully'));
      } else {
        smartToast.frontend.error(response.message || t('user_profile.error_updating_data'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      smartToast.frontend.error(t('user_profile.error_updating_data'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.frontend.error(t('user_profile.image_size_error'));
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

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      formData.append('userId', user.id.toString());
      
      const response = await apiCall('upload-attachments', {
         method: 'POST',
         body: formData
       });
      
      if (response.success) {
        const newAvatarUrl = response.data.url;
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : prev);
        
        if (user) {
          const updatedUser = { ...user, avatar: newAvatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setAvatarFile(null);
        setAvatarPreview('');
        smartToast.frontend.success(t('user_profile.avatar_updated_successfully'));
      } else {
        smartToast.frontend.error(response.message || t('user_profile.error_uploading_image'));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      smartToast.frontend.error(t('user_profile.error_uploading_image'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      smartToast.frontend.error(t('user_profile.password_mismatch'));
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      smartToast.frontend.error(t('user_profile.password_length_error'));
      return;
    }
    
    setSaving(true);
    try {
      const response = await apiCall(`/api/customers/change-password/${user.id}`, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
        smartToast.frontend.success(t('user_profile.password_changed_successfully'));
      } else {
        smartToast.frontend.error(response.message || t('user_profile.error_changing_password'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      smartToast.frontend.error(t('user_profile.error_changing_password'));
    } finally {
      setSaving(false);
    }
  };

  const handleOrderTracking = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setSelectedOrder(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/');
    smartToast.frontend.success(t('user_profile.logout_success'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-[#18b5d8]/20 text-[#18b5d8]';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-[#18b5d8]/10 text-[#18b5d8]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('order_status.pending');
      case 'processing': return t('order_status.processing');
      case 'delivered': return t('order_status.delivered');
      case 'cancelled': return t('order_status.cancelled');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18b5d8]"></div>
            </div>
          </div>
          <p className="text-white text-lg sm:text-xl font-black">{t('user_profile.loading_data')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 text-center max-w-md mx-auto border border-white/20 shadow-2xl hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500">
            <User className="w-16 h-16 text-[#18b5d8] mx-auto mb-4 animate-[glow_3.5s_ease-in-out_infinite]" />
            <h2 className="text-xl font-black text-white mb-2">{t('user_profile.user_not_found')}</h2>
            <Link to="/login" className="inline-block bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-black shadow-lg hover:shadow-xl hover:scale-105 transform">{t('user_profile.login')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929] relative overflow-hidden overflow-x-hidden" dir="rtl">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8] via-transparent to-[#16a2c7]"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #18b5d8 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #16a2c7 0%, transparent 50%)`,
          backgroundSize: '100px 100px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(24, 181, 216, 0.3)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 10px rgba(24, 181, 216, 0.7)); transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-[110px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
              {/* User Avatar & Basic Info */}
              <div className="bg-gradient-to-r from-[#18b5d8]/20 to-[#16a2c7]/20 p-6 text-white text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-[#18b5d8]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#18b5d8]/50">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || t('user_profile.user')} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-[#18b5d8] animate-[glow_3.5s_ease-in-out_infinite]" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 bg-[#18b5d8] text-[#292929] p-2 rounded-full shadow-lg hover:bg-[#16a2c7] transition-all duration-300 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {avatarFile && (
                    <div className="absolute -top-2 -left-2">
                      <button
                        onClick={handleAvatarUpload}
                        disabled={saving}
                        className="bg-white text-[#292929] p-2 rounded-full shadow-lg hover:bg-[#18b5d8]/20 transition-all duration-300 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || t('user_profile.user')}</h2>
                <p className="text-[#18b5d8] text-sm mt-1">{user.email}</p>
                {user.loyaltyPoints && (
                  <div className="mt-4 bg-[#18b5d8]/20 rounded-lg px-4 py-2 inline-block">
                    <span className="text-sm font-bold text-white">{user.loyaltyPoints} {t('user_profile.loyalty_points')}</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: t('user_profile.personal_data'), icon: User },
                    { id: 'orders', label: t('user_profile.my_orders'), icon: Package, count: userStats.totalOrders },
                    { id: 'settings', label: t('user_profile.settings'), icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-right px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 group ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-[#18b5d8]/20 to-[#16a2c7]/20 text-white border border-[#18b5d8]/50 shadow-lg' 
                          : 'text-[#18b5d8] hover:bg-[#18b5d8]/10 hover:text-white'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 group-hover:text-[#16a2c7] transition-colors duration-300" />
                      <span className="font-bold">{tab.label}</span>
                      {tab.count && (
                        <span className="bg-[#18b5d8]/20 text-white text-xs px-2 py-1 rounded-full mr-auto">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
                
                <div className="mt-6 pt-4 border-t border-[#18b5d8]/30">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-3 rounded-2xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all duration-300 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">{t('user_profile.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 relative overflow-hidden">
                {/* Decorative Circle */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-white">{t('user_profile.personal_data')}</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t('user_profile.edit')}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? t('user_profile.saving') : t('user_profile.save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(user);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        <X className="w-4 h-4" />
                        {t('user_profile.cancel')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.first_name')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white"
                        placeholder={t('user_profile.first_name')}
                      />
                    ) : (
                      <div className="bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl text-white border border-[#18b5d8]/30">{user.firstName || t('user_profile.not_specified')}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.last_name')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white"
                        placeholder={t('user_profile.last_name')}
                      />
                    ) : (
                      <div className="bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl text-white border border-[#18b5d8]/30">{user.lastName || t('user_profile.not_specified')}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.email')}</label>
                    <div className="bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl text-white flex items-center gap-2 border border-[#18b5d8]/30">
                      <Mail className="w-4 h-4 text-[#18b5d8]" />
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.phone')}</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white"
                        placeholder={t('user_profile.phone')}
                      />
                    ) : (
                      <div className="bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl text-white flex items-center gap-2 border border-[#18b5d8]/30">
                        <Phone className="w-4 h-4 text-[#18b5d8]" />
                        {user.phone || t('user_profile.not_specified')}
                      </div>
                    )}
                  </div>

                </div>

                {/* Account Stats */}
                <div className="mt-8 pt-6 border-t border-[#18b5d8]/30">
                  <h4 className="text-lg font-black text-white mb-4">{t('user_profile.account_stats')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-2xl border border-[#18b5d8]/30 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#18b5d8] p-2 rounded-lg">
                          <Package className="w-5 h-5 text-[#292929]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#18b5d8]">{t('user_profile.total_orders')}</p>
                          <p className="text-xl font-black text-white">{userStats.totalOrders}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-2xl border border-[#18b5d8]/30 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#18b5d8] p-2 rounded-lg">
                          <Star className="w-5 h-5 text-[#292929]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#18b5d8]">{t('user_profile.total_spent')}</p>
                          <PriceDisplay price={userStats.totalSpent} className="text-xl font-black text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-2xl border border-[#18b5d8]/30 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#18b5d8] p-2 rounded-lg">
                          <Clock className="w-5 h-5 text-[#292929]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#18b5d8]">{t('user_profile.member_since')}</p>
                          <p className="text-xl font-black text-white">
                            {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 relative overflow-hidden">
                {/* Decorative Circle */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                <h3 className="text-2xl font-black text-white mb-6">{t('user_profile.recent_orders')}</h3>
                
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <div key={order.id} className="bg-white/5 backdrop-blur-2xl border border-[#18b5d8]/30 rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300 animate-shimmer" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-black text-white">{t('user_profile.order')} #{order.id}</h4>
                            <p className="text-sm text-[#18b5d8]">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        {/* عرض تفاصيل المنتجات */}
                        {order.items && order.items.length > 0 && (
                          <div className="mb-4 pt-3 border-t border-[#18b5d8]/20">
                            <div className="space-y-2">
                              {order.items.slice(0, 2).map((item, itemIndex) => {
                                const productName = item.productName || item.product?.name || t('user_profile.unspecified_product');
                                return (
                                  <div key={itemIndex} className="flex justify-between items-center">
                                    <span className="text-white text-sm font-medium flex-1 ml-2">
                                      {productName} × {item.quantity}
                                    </span>
                                    <span className="text-[#18b5d8] text-sm font-bold">
                                      <PriceDisplay price={item.totalPrice} />
                                    </span>
                                  </div>
                                );
                              })}
                              {order.items.length > 2 && (
                                <div className="text-[#18b5d8] text-xs italic mt-2">
                                  {t('user_profile.and_more_products', { count: order.items.length - 2 })}
                                </div>
                              )}
                            </div>
                            
                            {/* عرض المنتجات الإضافية */}
                            {order.items.some(item => item.addOns && item.addOns.length > 0) && (
                              <div className="mt-3 pt-2 border-t border-[#18b5d8]/10">
                                <div className="text-[#18b5d8] text-xs font-bold mb-1">{t('user_profile.additional_products')}:</div>
                                {order.items.map((item, itemIndex) => 
                                  item.addOns?.map((addOn, addOnIndex) => (
                                    <div key={`${itemIndex}-${addOnIndex}`} className="text-white text-xs ml-2 mb-1">
                                      • {addOn.name} ({addOn.quantity || 1}×) - <PriceDisplay price={addOn.price} />
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-[#18b5d8] text-sm font-bold">
                            {t('user_profile.total')}: <PriceDisplay price={order.total} />
                          </div>
                          <button
                            onClick={() => handleOrderTracking(order)}
                            className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-4 py-2 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                          >
                            {t('user_profile.track_order')}
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-6">
                      <Link 
                        to="/orders"
                        className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        {t('user_profile.view_all_orders')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 text-center max-w-md mx-auto border border-white/20 shadow-2xl hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500">
                      <Package className="w-16 h-16 text-[#18b5d8] mx-auto mb-4 animate-[glow_3.5s_ease-in-out_infinite]" />
                      <h4 className="text-lg font-black text-white mb-2">{t('user_profile.no_orders_yet')}</h4>
                      <p className="text-[#18b5d8] mb-4">{t('user_profile.start_shopping')}</p>
                      <Link 
                        to="/products"
                        className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 inline-flex items-center gap-2 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        {t('user_profile.browse_products')}
                        <Package className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 relative overflow-hidden">
                  {/* Decorative Circle */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white">{t('user_profile.change_password')}</h3>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-4 py-2 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      {showPasswordChange ? t('user_profile.hide') : t('user_profile.change')}
                    </button>
                  </div>
                  
                  {showPasswordChange && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.current_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white pr-12"
                            placeholder={t('user_profile.current_password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7] transition-colors duration-300"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white pr-12"
                            placeholder={t('user_profile.new_password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7] transition-colors duration-300"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-[#18b5d8] mb-2">{t('user_profile.confirm_new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-[#18b5d8]/50 rounded-2xl focus:ring-2 focus:ring-[#18b5d8] focus:border-transparent transition-all bg-white/5 backdrop-blur-2xl text-white pr-12"
                            placeholder={t('user_profile.confirm_new_password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7] transition-colors duration-300"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white px-6 py-3 rounded-2xl hover:from-[#16a2c7] hover:to-[#18b5d8] transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? t('user_profile.updating') : t('user_profile.update_password')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Security */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)] transition-all duration-500 relative overflow-hidden">
                  {/* Decorative Circle */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-black text-white mb-4">{t('user_profile.account_security')}</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-2xl border border-[#18b5d8]/30 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-[#18b5d8]" />
                          <div>
                            <p className="font-bold text-white">{t('user_profile.email_verified')}</p>
                            <p className="text-sm text-[#18b5d8]">{t('user_profile.email_confirmed')}</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-2xl border border-[#18b5d8]/30 hover:shadow-[0_0_15px_rgba(24,181,216,0.4)] transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-[#18b5d8]" />
                          <div>
                            <p className="font-bold text-white">{t('user_profile.phone')}</p>
                            <p className="text-sm text-[#18b5d8]">{user.phone ? t('user_profile.verified') : t('user_profile.not_verified')}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${user.phone ? 'bg-green-500' : 'bg-[#18b5d8]/50'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <OrderTrackingModal
        order={selectedOrder}
        isOpen={showTrackingModal}
        onClose={closeTrackingModal}
      />
    </div>
  );
};

export default UserProfile;