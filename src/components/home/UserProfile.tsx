// UserProfile.tsx - Improved & Fixed Version
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
  EyeOff,
  Crown
} from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { getUserOrders } from '../../utils/api';
import OrderTrackingModal from '../modals/OrderTrackingModal';
import PriceDisplay from '../ui/PriceDisplay';

interface UserData {
  _id: string;
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
  storeName?: string;
  storeLogo?: string;
  storeLink?: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
  customerGroup?: string;
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
    product?: { name: string };
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
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string>('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserData>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?._id) {
      loadRecentOrders();
    }
  }, [user?._id]);

  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData: UserData = JSON.parse(savedUser);
        
        try {
          const response = await apiCall(`/api/customers/${userData._id}`, {
            method: 'GET'
          });
          
          if (response?.customer) {
            const freshUser = response.customer;
            setUser(freshUser);
            setFormData(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } else {
            setUser(userData);
            setFormData(userData);
          }
        } catch (error) {
          setUser(userData);
          setFormData(userData);
        }
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
      if (!user?.email) return;
      const orders = await getUserOrders(user.email);
      if (orders && Array.isArray(orders)) {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        setUserStats({ totalOrders, totalSpent });
        const sortedOrders = orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentOrders(sortedOrders);
      } else {
        setRecentOrders([]);
        setUserStats({ totalOrders: 0, totalSpent: 0 });
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setRecentOrders([]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let updatedData = { ...formData };
      
      const uploadPromises = [];
      
      if (avatarFile) {
        uploadPromises.push(
          (async () => {
            try {
              const avatarFormData = new FormData();
              avatarFormData.append('avatar', avatarFile);
              avatarFormData.append('customerId', user._id);
              
              const avatarResponse = await apiCall('/api/customers/upload-avatar', {
                method: 'POST',
                body: avatarFormData
              });
              
              if (avatarResponse?.success) {
                updatedData.avatar = avatarResponse.data.url;
                setAvatarFile(null);
                setAvatarPreview('');
                return true;
              }
              return false;
            } catch (error) {
              console.error('Error uploading avatar:', error);
              return false;
            }
          })()
        );
      }
      
      if (storeLogoFile) {
        uploadPromises.push(
          (async () => {
            try {
              const logoFormData = new FormData();
              logoFormData.append('storeLogo', storeLogoFile);
              logoFormData.append('customerId', user._id);
              
              const logoResponse = await apiCall('/api/customers/upload-store-logo', {
                method: 'POST',
                body: logoFormData
              });
              
              if (logoResponse?.success) {
                updatedData.storeLogo = logoResponse.data.storeLogo;
                setStoreLogoFile(null);
                setStoreLogoPreview('');
                return true;
              }
              return false;
            } catch (error) {
              console.error('Error uploading store logo:', error);
              return false;
            }
          })()
        );
      }
      
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }
      
      const response = await apiCall(`/api/customers/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.success) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        setFormData(updatedUser);
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.frontend.error(t('user_profile.image_size_error'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setSaving(true);
      try {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', file);
        avatarFormData.append('customerId', user?._id || '');
        
        const avatarResponse = await apiCall('/api/customers/upload-avatar', {
          method: 'POST',
          body: avatarFormData
        });
        
        if (avatarResponse?.success && avatarResponse.data?.url) {
          const updatedUser = { ...user, avatar: avatarResponse.data.url };
          setUser(updatedUser);
          setFormData(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          await apiCall(`/api/customers/profile/${user?._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name: user?.name || user?.firstName || '',
              email: user?.email || '',
              avatar: avatarResponse.data.url 
            })
          });
          
          setAvatarFile(null);
          setAvatarPreview('');
          smartToast.frontend.success(t('user_profile.avatar_updated_successfully'));
        } else {
          smartToast.frontend.error(avatarResponse?.message || t('user_profile.error_uploading_image'));
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        smartToast.frontend.error(t('user_profile.error_uploading_image'));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleStoreLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.frontend.error(t('user_profile.image_size_error'));
        return;
      }
      setStoreLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setStoreLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
      const response = await apiCall(`/api/customers/change-password/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('user_profile.loading_data')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="text-center bg-[#292929] rounded-2xl p-8 max-w-md w-full border border-[#3a3a3a]">
          <User className="w-16 h-16 text-[#3b82f6] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">{t('user_profile.user_not_found')}</h2>
          <Link to="/login" className="inline-block bg-[#1e40af] text-white px-6 py-3 rounded-xl hover:bg-[#3b82f6] transition-colors shadow-lg">
            {t('user_profile.login')}
          </Link>
        </div>
      </div>
    );
  }

  const isVIP = user.customerGroup === 'vip';

  return (
    <div className="min-h-screen bg-[#1a1a1a]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-20 sm:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-[#292929] rounded-2xl shadow-xl border border-[#3a3a3a] overflow-hidden">
              {/* Header with VIP Badge */}
              <div className={`relative p-6 ${
                isVIP 
                  ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-[#1e40af] to-[#3b82f6]'
              }`}>
                {/* VIP Crown Badge */}
                {isVIP && (
                  <div className="absolute -top-3 -right-3 animate-bounce">
                    <div className="bg-yellow-400 rounded-full p-3 shadow-lg border-4 border-yellow-300">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                )}

                {/* Avatar - Centered */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className={`w-28 h-28 rounded-full border-4 overflow-hidden bg-[#1a1a1a] ${
                      isVIP ? 'border-yellow-300 shadow-lg shadow-yellow-400/50' : 'border-white/30'
                    }`}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt={user.name || t('user_profile.user')} className="w-full h-full object-cover" />
                      ) : user.avatar || user.storeLogo ? (
                        <img 
                          src={buildImageUrl(user.avatar || user.storeLogo || '')} 
                          alt={user.storeName || user.name || t('user_profile.user')} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.currentTarget.src = buildImageUrl(''); }} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#3a3a3a]">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -left-2 bg-white text-[#1e40af] p-2 rounded-full shadow-lg hover:bg-[#1e40af] hover:text-white transition-colors cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* User Info - Centered */}
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
                    {user.storeName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || t('user_profile.user')}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm flex items-center gap-2 justify-center break-all">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Stats */}
              {user.role !== 'admin' && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-[#3a3a3a]">
                  <div className="text-center bg-[#1a1a1a] rounded-xl p-3">
                    <div className="bg-[#1e40af]/20 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Package className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <p className="text-xl font-bold text-white">{userStats.totalOrders}</p>
                    <p className="text-xs text-[#3b82f6] font-medium">{t('user_profile.orders')}</p>
                  </div>
                  <div className="text-center bg-[#1a1a1a] rounded-xl p-3">
                    <div className="bg-[#1e40af]/20 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <PriceDisplay price={userStats.totalSpent} className="text-xl font-bold text-white block" />
                    <p className="text-xs text-[#3b82f6] font-medium">{t('user_profile.spent')}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="p-3 sm:p-4">
                <nav className="space-y-1 sm:space-y-2">
                  {[
                    { id: 'profile', label: t('user_profile.personal_data'), icon: User },
                    { id: 'orders', label: t('user_profile.my_orders'), icon: Package, count: userStats.totalOrders, hide: user.role === 'admin' },
                    { id: 'settings', label: t('user_profile.settings'), icon: Settings }
                  ].filter(tab => !tab.hide).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-right px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${
                        activeTab === tab.id 
                          ? 'bg-[#1e40af] text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium truncate">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full ml-auto flex-shrink-0">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#3a3a3a]">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium truncate">{t('user_profile.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <div className="bg-[#292929] rounded-2xl shadow-xl border border-[#3a3a3a] overflow-hidden">
                {/* Header */}
                <div className="bg-[#1e40af]/10 p-4 sm:p-6 border-b border-[#3a3a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1e40af]/20 p-2 sm:p-3 rounded-xl">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#3b82f6]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{t('user_profile.personal_data')}</h3>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto bg-[#1e40af] text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-[#3b82f6] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t('user_profile.edit')}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? t('user_profile.saving') : t('user_profile.save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(user);
                        }}
                        className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
                      >
                        <X className="w-4 h-4" />
                        {t('user_profile.cancel')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Store Info */}
                  {(user.storeName || user.storeLink || isEditing) && (
                    <div className="pb-6 border-b border-[#3a3a3a]">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-4">{t('user_profile.store_information')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.store_name')}</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.storeName || ''}
                              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                              className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                            />
                          ) : (
                            <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white text-sm">{user.storeName || t('user_profile.not_specified')}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.phone_number')}</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.phoneNumber || formData.phone || ''}
                              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                              className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                            />
                          ) : (
                            <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white text-sm">{user.phoneNumber || user.phone || t('user_profile.not_specified')}</div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.store_link')}</label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={formData.storeLink || ''}
                              onChange={(e) => setFormData({...formData, storeLink: e.target.value})}
                              className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                              placeholder="https://example.com/store"
                            />
                          ) : (
                            user.storeLink ? (
                              <a href={user.storeLink} target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline break-all text-sm">{user.storeLink}</a>
                            ) : (
                              <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white text-sm">{t('user_profile.not_specified')}</div>
                            )
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.store_logo')}</label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="w-full h-32 bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden border-2 border-[#3a3a3a]">
                                {storeLogoPreview ? (
                                  <img src={storeLogoPreview} alt="preview" className="max-w-full max-h-full object-contain" />
                                ) : (formData.storeLogo || user.storeLogo) ? (
                                  <img 
                                    src={buildImageUrl(formData.storeLogo || user.storeLogo || '')} 
                                    alt={user.storeName || t('user_profile.store_logo')} 
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                  />
                                ) : (
                                  <div className="text-gray-400 text-center p-4">
                                    <Camera className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs">لا يوجد شعار للمتجر</p>
                                  </div>
                                )}
                              </div>
                              <label className="flex-1 bg-[#1e40af] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-xl cursor-pointer transition-colors text-center block text-sm shadow-lg">
                                <Camera className="w-4 h-4 inline-block ml-2" />
                                اختر صورة
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleStoreLogoChange} 
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden border-2 border-[#3a3a3a]">
                              {user.storeLogo ? (
                                <img 
                                  src={buildImageUrl(user.storeLogo)} 
                                  alt={user.storeName || t('user_profile.store_logo')} 
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                />
                              ) : (
                                <div className="text-gray-400 text-center p-4">
                                  <Camera className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-xs">غير محدد</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Info */}
                  <h4 className="text-base sm:text-lg font-bold text-white mb-4">{t('user_profile.basic_information')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.first_name')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                        />
                      ) : (
                        <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white text-sm">{user.firstName || t('user_profile.not_specified')}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.last_name')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                        />
                      ) : (
                        <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white text-sm">{user.lastName || t('user_profile.not_specified')}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.email')}</label>
                      <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.phone')}</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] text-sm"
                        />
                      ) : (
                        <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl text-white flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                          {user.phone || t('user_profile.not_specified')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Stats */}
                  {user.role !== 'admin' && (
                    <div className="pt-6 border-t border-[#3a3a3a]">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-4">{t('user_profile.account_stats')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl border border-[#3a3a3a] hover:border-[#1e40af] transition-colors">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-[#1e40af] p-2 rounded-lg">
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-[#3b82f6] font-medium">{t('user_profile.total_orders')}</p>
                              <p className="text-lg sm:text-xl font-bold text-white">{userStats.totalOrders}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl border border-[#3a3a3a] hover:border-[#1e40af] transition-colors">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-[#1e40af] p-2 rounded-lg">
                              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-[#3b82f6] font-medium">{t('user_profile.total_spent')}</p>
                              <PriceDisplay price={userStats.totalSpent} className="text-lg sm:text-xl font-bold text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl border border-[#3a3a3a] hover:border-[#1e40af] transition-colors">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-[#1e40af] p-2 rounded-lg">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-[#3b82f6] font-medium">{t('user_profile.member_since')}</p>
                              <p className="text-lg sm:text-xl font-bold text-white">
                                {new Date(user.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {isVIP && (
                          <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 sm:p-4 rounded-xl border-2 border-yellow-400 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="bg-yellow-400 p-2 rounded-lg">
                                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-white/90 font-medium">حالة العميل</p>
                                <p className="text-lg sm:text-xl font-bold text-yellow-300 flex items-center gap-1">⭐ VIP</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-[#292929] rounded-2xl shadow-xl p-4 sm:p-6 border border-[#3a3a3a]">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">{t('user_profile.recent_orders')}</h3>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-3 sm:p-4 hover:border-[#1e40af] transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm sm:text-base">{t('user_profile.order')} #{order.id}</h4>
                            <p className="text-xs sm:text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-[#3a3a3a]">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center mb-1">
                                <span className="text-white text-xs sm:text-sm">
                                  {item.productName || item.product?.name || t('user_profile.unspecified_product')} × {item.quantity}
                                </span>
                                <span className="text-[#3b82f6] text-xs sm:text-sm font-bold">
                                  <PriceDisplay price={item.totalPrice} />
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-[#3b82f6] text-xs italic mt-1">
                                {t('user_profile.and_more_products', { count: order.items.length - 2 })}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-[#3a3a3a]">
                          <div className="text-[#3b82f6] text-sm sm:text-base font-bold flex items-center gap-2">
                            <span>{t('user_profile.total')}:</span>
                            <PriceDisplay price={order.total} className="text-lg" />
                          </div>
                          <button
                            onClick={() => handleOrderTracking(order)}
                            className="w-full sm:w-auto bg-[#1e40af] text-white px-4 py-2 rounded-xl hover:bg-[#3b82f6] transition-colors text-xs sm:text-sm shadow-lg"
                          >
                            {t('user_profile.track_order')}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link 
                        to="/orders"
                        className="inline-block bg-[#1e40af] text-white px-6 py-3 rounded-xl hover:bg-[#3b82f6] transition-colors text-sm shadow-lg"
                      >
                        {t('user_profile.view_all_orders')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                    <Package className="w-16 h-16 text-[#3b82f6] mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">{t('user_profile.no_orders_yet')}</h4>
                    <p className="text-gray-400 mb-4">{t('user_profile.start_shopping')}</p>
                    <Link 
                      to="/products"
                      className="inline-flex items-center gap-2 bg-[#1e40af] text-white px-6 py-3 rounded-xl hover:bg-[#3b82f6] transition-colors text-sm shadow-lg"
                    >
                      {t('user_profile.browse_products')}
                      <Package className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-[#292929] rounded-2xl shadow-xl p-4 sm:p-6 border border-[#3a3a3a]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">{t('user_profile.change_password')}</h3>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="w-full sm:w-auto bg-[#1e40af] text-white px-4 py-2 rounded-xl hover:bg-[#3b82f6] transition-colors text-sm shadow-lg"
                    >
                      {showPasswordChange ? t('user_profile.hide') : t('user_profile.change')}
                    </button>
                  </div>
                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.current_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3b82f6]"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3b82f6]"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#3b82f6] mb-2">{t('user_profile.confirm_new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white focus:ring-2 focus:ring-[#3b82f6] pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3b82f6]"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full bg-[#1e40af] text-white px-6 py-2 rounded-xl hover:bg-[#3b82f6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg"
                      >
                        {saving ? t('user_profile.updating') : t('user_profile.update_password')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Security */}
                <div className="bg-[#292929] rounded-2xl shadow-xl p-4 sm:p-6 border border-[#3a3a3a]">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4">{t('user_profile.account_security')}</h3>
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl border border-[#3a3a3a]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6] flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white text-sm">{t('user_profile.email_verified')}</p>
                            <p className="text-xs sm:text-sm text-gray-400">{t('user_profile.email_confirmed')}</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl border border-[#3a3a3a]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6] flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white text-sm">{t('user_profile.phone')}</p>
                            <p className="text-xs sm:text-sm text-gray-400">{user.phone ? t('user_profile.verified') : t('user_profile.not_verified')}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${user.phone ? 'bg-green-500' : 'bg-gray-500'}`}></div>
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