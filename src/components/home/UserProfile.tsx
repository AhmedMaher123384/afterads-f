// UserProfile.tsx - Optimized Version
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
  storeImage?: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
    customerGroup?: string; // ✅ إضافة

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
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [storeImage, setstoreImage] = useState<string>('');
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
      
      // ✅ جلب البيانات المحدثة من السيرفر
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
        // إذا فشل جلب البيانات، استخدم البيانات المحفوظة
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
// حل المشكلة - تعديل handleSave في UserProfile.tsx

const handleSave = async () => {
  if (!user) return;
  setSaving(true);
  try {
    let updatedData = { ...formData };
    
    // ✅ رفع الصور أولاً والانتظار حتى تنتهي جميعاً
    const uploadPromises = [];
    
    // رفع صورة الأفاتار
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
    
    // رفع شعار المتجر
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
    
    // رفع صورة المتجر
    if (storeImageFile) {
      uploadPromises.push(
        (async () => {
          try {
            const imageFormData = new FormData();
            imageFormData.append('storeImage', storeImageFile);
            imageFormData.append('customerId', user._id);
            
            const imageResponse = await apiCall('/api/customers/upload-store-image', {
              method: 'POST',
              body: imageFormData
            });
            
            if (imageResponse?.success) {
              updatedData.storeImage = imageResponse.data.storeImage;
              setStoreImageFile(null);
              setstoreImage('');
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error uploading store image:', error);
            return false;
          }
        })()
      );
    }
    
    // ✅ الانتظار حتى انتهاء جميع عمليات الرفع
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }
    
    // ✅ الآن تحديث البيانات بعد انتهاء جميع الرفعات
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

// تعديل handleAvatarChange - رفع فوري للصورة الشخصية

const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      smartToast.frontend.error(t('user_profile.image_size_error'));
      return;
    }
    
    // ✅ عرض preview فوراً
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // ✅ رفع الصورة فوراً للخادم
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
        // ✅ تحديث البيانات المحلية والخادم
        const updatedUser = { ...user, avatar: avatarResponse.data.url };
        setUser(updatedUser);
        setFormData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // ✅ تحديث الخادم أيضاً مع البيانات الأساسية
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

  const handleStoreImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.frontend.error(t('user_profile.image_size_error'));
        return;
      }
      setStoreImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setstoreImage(e.target?.result as string);
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
      <div className="min-h-screen bg-[#292929] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('user_profile.loading_data')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-2xl p-8 max-w-md">
          <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">{t('user_profile.user_not_found')}</h2>
          <Link to="/login" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors">
            {t('user_profile.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292929]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
               <div className="relative inline-block mb-4">
  <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-gray-700">
    {avatarPreview ? (
      <img src={avatarPreview} alt={user.name || t('user_profile.user')} className="w-full h-full object-cover" />
    ) : user.avatar || user.storeLogo ? (
      <img src={buildImageUrl(user.avatar || user.storeLogo || '')} alt={user.storeName || user.name || t('user_profile.user')} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = buildImageUrl(''); }} />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-600">
        <User className="w-12 h-12 text-white" />
      </div>
    )}
  </div>
  <label className="absolute -bottom-1 -right-1 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
    <Camera className="w-4 h-4" />
    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
  </label>
  {/* ✅ إزالة زر الحفظ الأخضر */}
</div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {user.storeName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || t('user_profile.user')}
                </h2>
                <p className="text-white/80 text-sm flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>

              {/* Stats */}
              {user.role !== 'admin' && (
                <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-700">
                  <div className="text-center">
                    <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold text-white">{userStats.totalOrders}</p>
                    <p className="text-xs text-blue-400">{t('user_profile.orders')}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-blue-500" />
                    </div>
                    <PriceDisplay price={userStats.totalSpent} className="text-xl font-bold text-white block" />
                    <p className="text-xs text-blue-400">{t('user_profile.spent')}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: t('user_profile.personal_data'), icon: User },
                    { id: 'orders', label: t('user_profile.my_orders'), icon: Package, count: userStats.totalOrders, hide: user.role === 'admin' },
                    { id: 'settings', label: t('user_profile.settings'), icon: Settings }
                  ].filter(tab => !tab.hide).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-colors flex items-center gap-3 ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mr-auto">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('user_profile.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600/20 p-6 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{t('user_profile.personal_data')}</h3>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t('user_profile.edit')}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? t('user_profile.saving') : t('user_profile.save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(user);
                        }}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        {t('user_profile.cancel')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Store Info */}
                  {(user.storeName || user.storeLink || isEditing) && (
                    <div className="mb-6 pb-6 border-b border-gray-700">
                      <h4 className="text-lg font-bold text-white mb-4">{t('user_profile.store_information')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.store_name')}</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.storeName || ''}
                              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="bg-gray-700 px-4 py-2 rounded-xl text-white">{user.storeName || t('user_profile.not_specified')}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.phone_number')}</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.phoneNumber || formData.phone || ''}
                              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="bg-gray-700 px-4 py-2 rounded-xl text-white">{user.phoneNumber || user.phone || t('user_profile.not_specified')}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.store_link')}</label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={formData.storeLink || ''}
                              onChange={(e) => setFormData({...formData, storeLink: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="https://example.com/store"
                            />
                          ) : (
                            user.storeLink ? (
                              <a href={user.storeLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{user.storeLink}</a>
                            ) : (
                              <div className="bg-gray-700 px-4 py-2 rounded-xl text-white">{t('user_profile.not_specified')}</div>
                            )
                          )}
                        </div>
         <div>
  <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.store_logo')}</label>
  {isEditing ? (
    <div className="space-y-3">
      {/* عرض الصورة الحالية أو المعاينة */}
      <div className="w-full h-32 bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-600">
        {storeLogoPreview ? (
          <img src={storeLogoPreview} alt="preview" className="max-w-full max-h-full object-contain" />
        ) : (formData.storeLogo || user.storeLogo) ? (
          <img 
            src={buildImageUrl(formData.storeLogo || user.storeLogo || '')} 
            alt={user.storeName || t('user_profile.store_logo')} 
            className="max-w-full max-h-full object-contain"
            onError={(e) => { 
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-gray-400 text-center p-4">
                  <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>لا توجد صورة</p>
                </div>`;
              }
            }} 
          />
        ) : (
          <div className="text-gray-400 text-center p-4">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">لا يوجد شعار للمتجر</p>
          </div>
        )}
      </div>
      
      {/* حقل رفع الصورة */}
      <div className="flex items-center gap-2">
        <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors text-center">
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
      
      {/* حقل إدخال رابط اختياري */}
      <details className="text-sm">
        <summary className="text-blue-400 cursor-pointer hover:text-blue-300">أو أدخل رابط الصورة</summary>
        <input
          type="text"
          value={formData.storeLogo || ''}
          onChange={(e) => setFormData({...formData, storeLogo: e.target.value})}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 mt-2"
          placeholder="https://example.com/logo.png"
        />
      </details>
    </div>
  ) : (
    <div className="w-full h-32 bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-600">
      {user.storeLogo ? (
        <img 
          src={buildImageUrl(user.storeLogo)} 
          alt={user.storeName || t('user_profile.store_logo')} 
          className="max-w-full max-h-full object-contain"
          onError={(e) => { 
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-gray-400 text-center p-4"><p>غير محدد</p></div>';
            }
          }} 
        />
      ) : (
        <div className="text-gray-400 text-center p-4">
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">غير محدد</p>
        </div>
      )}
    </div>
  )}
</div>
                     <div className="md:col-span-2">
  <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.store_image')}</label>
  {isEditing ? (
    <div className="space-y-3">
      {/* عرض الصورة الحالية أو المعاينة */}
      <div className="w-full h-48 bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-600">
        {storeImage ? (
          <img src={storeImage} alt="preview" className="w-full h-full object-cover" />
        ) : (formData.storeImage || user.storeImage) ? (
          <img 
            src={buildImageUrl(formData.storeImage || user.storeImage || '')} 
            alt={user.storeName || t('user_profile.store_image')} 
            className="w-full h-full object-cover"
            onError={(e) => { 
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-gray-400 text-center p-4">
                  <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>لا توجد صورة</p>
                </div>`;
              }
            }} 
          />
        ) : (
          <div className="text-gray-400 text-center p-4">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">لا توجد صورة للمتجر</p>
          </div>
        )}
      </div>
      
      {/* حقل رفع الصورة */}
      <div className="flex items-center gap-2">
        <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors text-center">
          <Camera className="w-4 h-4 inline-block ml-2" />
          اختر صورة
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleStoreImageChange} 
            className="hidden"
          />
        </label>
      </div>
      
      {/* حقل إدخال رابط اختياري */}
      <details className="text-sm">
        <summary className="text-blue-400 cursor-pointer hover:text-blue-300">أو أدخل رابط الصورة</summary>
        <input
          type="text"
          value={formData.storeImage || ''}
          onChange={(e) => setFormData({...formData, storeImage: e.target.value})}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 mt-2"
          placeholder="https://example.com/store-banner.jpg"
        />
      </details>
    </div>
  ) : (
    <div className="w-full h-48 bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-600">
      {user.storeImage ? (
        <img 
          src={buildImageUrl(user.storeImage)} 
          alt={user.storeName || t('user_profile.store_image')} 
          className="w-full h-full object-cover"
          onError={(e) => { 
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-gray-400 text-center p-4"><p>غير محدد</p></div>';
            }
          }} 
        />
      ) : (
        <div className="text-gray-400 text-center p-4">
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">غير محدد</p>
        </div>
      )}
    </div>
  )}
</div>
                      </div>
                    </div>
                  )}

                  {/* Personal Info */}
                  <h4 className="text-lg font-bold text-white mb-4">{t('user_profile.basic_information')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.first_name')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-700 px-4 py-2 rounded-xl text-white">{user.firstName || t('user_profile.not_specified')}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.last_name')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-700 px-4 py-2 rounded-xl text-white">{user.lastName || t('user_profile.not_specified')}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.email')}</label>
                      <div className="bg-gray-700 px-4 py-2 rounded-xl text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.phone')}</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="bg-gray-700 px-4 py-2 rounded-xl text-white flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-400" />
                          {user.phone || t('user_profile.not_specified')}
                        </div>
                      )}
                    </div>
                  </div>

               {/* Account Stats */}
{user.role !== 'admin' && (
  <div className="pt-6 border-t border-gray-700">
    <h4 className="text-lg font-bold text-white mb-4">{t('user_profile.account_stats')}</h4>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* بطاقة إجمالي الطلبات */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-400">{t('user_profile.total_orders')}</p>
            <p className="text-xl font-bold text-white">{userStats.totalOrders}</p>
          </div>
        </div>
      </div>

      {/* بطاقة إجمالي المبالغ المنفقة */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-400">{t('user_profile.total_spent')}</p>
            <PriceDisplay price={userStats.totalSpent} className="text-xl font-bold text-white" />
          </div>
        </div>
      </div>

      {/* بطاقة تاريخ الانضمام */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-400">{t('user_profile.member_since')}</p>
            <p className="text-lg font-bold text-white">
              {new Date(user.createdAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ بطاقة مجموعة العميل - جديدة */}
      <div className="bg-gray-700 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            user.customerGroup === 'vip' ? 'bg-purple-500' :
            user.customerGroup === 'wholesale' ? 'bg-blue-600' :
            user.customerGroup === 'retail' ? 'bg-green-500' :
            'bg-gray-500'
          }`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-400">مجموعة العميل</p>
            <p className="text-lg font-bold text-white">
              {user.customerGroup === 'vip' ? '⭐ VIP' :
               user.customerGroup === 'wholesale' ? '📦 جملة' :
               user.customerGroup === 'retail' ? '🛒 تجزئة' :
               '👤 عادي'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6">{t('user_profile.recent_orders')}</h3>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 hover:border-blue-500 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-white">{t('user_profile.order')} #{order.id}</h4>
                            <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-gray-600">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center mb-1">
                                <span className="text-white text-sm">
                                  {item.productName || item.product?.name || t('user_profile.unspecified_product')} × {item.quantity}
                                </span>
                                <span className="text-blue-400 text-sm font-medium">
                                  <PriceDisplay price={item.totalPrice} />
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-blue-400 text-xs italic mt-1">
                                {t('user_profile.and_more_products', { count: order.items.length - 2 })}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-blue-400 text-sm font-bold">
                            {t('user_profile.total')}: <PriceDisplay price={order.total} />
                          </div>
                          <button
                            onClick={() => handleOrderTracking(order)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                          >
                            {t('user_profile.track_order')}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link 
                        to="/orders"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        {t('user_profile.view_all_orders')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-700 rounded-xl">
                    <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">{t('user_profile.no_orders_yet')}</h4>
                    <p className="text-gray-400 mb-4">{t('user_profile.start_shopping')}</p>
                    <Link 
                      to="/products"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
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
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{t('user_profile.change_password')}</h3>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                    >
                      {showPasswordChange ? t('user_profile.hide') : t('user_profile.change')}
                    </button>
                  </div>
                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.current_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-400 mb-2">{t('user_profile.confirm_new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? t('user_profile.updating') : t('user_profile.update_password')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Security */}
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">{t('user_profile.account_security')}</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-white">{t('user_profile.email_verified')}</p>
                            <p className="text-sm text-gray-400">{t('user_profile.email_confirmed')}</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-white">{t('user_profile.phone')}</p>
                            <p className="text-sm text-gray-400">{user.phone ? t('user_profile.verified') : t('user_profile.not_verified')}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${user.phone ? 'bg-green-500' : 'bg-gray-500'}`}></div>
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