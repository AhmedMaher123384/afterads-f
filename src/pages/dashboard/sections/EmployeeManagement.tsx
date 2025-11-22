import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Activity,
  LogIn,
  Key,
  Shield,
  Settings,
  X
} from 'lucide-react';
import { smartToast } from '../../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/ui/Spinner';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  password?: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

const EmployeeManagement: React.FC = () => {
   const navigate = useNavigate();
     const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<ActivityLog[]>([]);
  const [activeLogsTab, setActiveLogsTab] = useState<'activity' | 'login'>('activity');
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  // --- إضافة حالات ووظائف PIN ---
  const [isPinAuthenticated, setIsPinAuthenticated] = useState<boolean>(() => {
    const savedPinAuth = sessionStorage.getItem('pinAuthenticated');
    const savedPinTime = sessionStorage.getItem('pinAuthTime');
    if (savedPinAuth === 'true' && savedPinTime) {
      const timeDiff = Date.now() - parseInt(savedPinTime);
      return timeDiff < 30 * 60 * 1000; // 30 دقيقة
    }
    return false;
  });

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinLoading, setPinLoading] = useState<boolean>(false);
  const [pinAuthTime, setPinAuthTime] = useState<number | null>(() => {
    const savedPinTime = sessionStorage.getItem('pinAuthTime');
    return savedPinTime ? parseInt(savedPinTime) : null;
  });

  // مدة انتهاء جلسة PIN (30 دقيقة بالميلي ثانية)
  const PIN_SESSION_DURATION = 30 * 60 * 1000;

  // دالة التحقق من PIN
  const handlePinSubmit = async () => {
    if (!pinInput.trim()) {
      setPinError('يرجى إدخال رمز PIN');
      return;
    }
    setPinLoading(true);
    setPinError('');
    try {
      const response = await apiCall(API_ENDPOINTS.ADMIN_PIN_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });

      if (response.success) {
        const authTime = Date.now();
        setIsPinAuthenticated(true);
        setShowPinModal(false);
        setPinInput('');
        setPinAuthTime(authTime);
        // حفظ حالة PIN في sessionStorage
        sessionStorage.setItem('pinAuthenticated', 'true');
        sessionStorage.setItem('pinAuthTime', authTime.toString());
        smartToast.dashboard.success('تم التحقق من الهوية بنجاح - الجلسة ستنتهي خلال 30 دقيقة من عدم النشاط');
      } else {
        setPinError(response.message || 'رمز PIN غير صحيح');
        setPinInput('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setPinError('خطأ في التحقق من رمز PIN');
      setPinInput('');
    } finally {
      setPinLoading(false);
    }
  };

  // دالة إعادة تعيين PIN
  const resetPinAuthentication = () => {
    setIsPinAuthenticated(false);
    setPinInput('');
    setPinError('');
    setPinLoading(false);
    setPinAuthTime(null);
    sessionStorage.removeItem('pinAuthenticated');
    sessionStorage.removeItem('pinAuthTime');
  };

  // دالة تحديث وقت آخر نشاط للـ PIN
  const updatePinActivity = useCallback(() => {
    if (isPinAuthenticated) {
      const currentTime = Date.now();
      setPinAuthTime(currentTime);
      sessionStorage.setItem('pinAuthTime', currentTime.toString());
    }
  }, [isPinAuthenticated]);

  // التحقق من الحاجة لطلب PIN عند تحميل المكون
  useEffect(() => {
    if (!isPinAuthenticated) {
      setShowPinModal(true);
    }
    updatePinActivity(); // تحديث النشاط عند التحميل
  }, [isPinAuthenticated, updatePinActivity]);

  // أضف هذا useEffect:
useEffect(() => {
  // عند دخول الصفحة، نعيد تعيين الحالة ونعرض PIN
  setIsPinAuthenticated(false);
  setShowPinModal(true);
  setPinInput('');
  setPinError('');
}, []); // تعتمد على [] لتشغيله مرة واحدة عند التحميل

  // إضافة مستمعات الأحداث لتحديث وقت النشاط
  useEffect(() => {
    if (!isPinAuthenticated) return;
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      updatePinActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isPinAuthenticated, updatePinActivity]);

  // مراقبة انتهاء جلسة PIN
  useEffect(() => {
    if (!isPinAuthenticated || !pinAuthTime) return;
    const checkPinExpiry = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - pinAuthTime;
      if (timeDiff >= PIN_SESSION_DURATION) {
        resetPinAuthentication();
        smartToast.dashboard.warning('انتهت جلسة PIN بسبب عدم النشاط - يرجى إعادة المصادقة');
      }
    };

    const interval = setInterval(checkPinExpiry, 60000);
    checkPinExpiry();
    return () => clearInterval(interval);
  }, [isPinAuthenticated, pinAuthTime, PIN_SESSION_DURATION]);
  // --- نهاية إضافة PIN ---

  // Fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiCall(API_ENDPOINTS.USERS);
      console.log('🔍 Raw API response:', response);
      
      if (response.success) {
        let usersArray: any[];
        
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data && Array.isArray(response.data.users)) {
          usersArray = response.data.users;
        } else if (Array.isArray(response)) {
          usersArray = response;
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          usersArray = [];
        }
        
        console.log('🔍 Users array:', usersArray);
        
        const usersData = usersArray.map((user: any) => ({
          id: user._id || user.id || '',
          username: user.email || user.username || '',
          name: user.name || user.fullName || user.firstName || 'غير معروف',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || user.userRole || 'staff',
          isActive: user.isActive || user.active || true,
          createdAt: user.createdAt || user.created_at || new Date().toISOString(),
          lastLogin: user.lastLogin || user.last_login || new Date().toISOString(),
          password: undefined
        }));
        
        console.log('✅ Processed users ', usersData);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        console.error('❌ API response not successful:', response);
        smartToast.dashboard.error('فشل في جلب الموظفين: استجابة غير ناجحة');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.message && error.message.includes('401')) {
        smartToast.dashboard.error('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminUser');
      } else {
        smartToast.dashboard.error('فشل في جلب الموظفين');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Filter users based on search and filters
  const filterUsers = () => {
    let result = [...users];

    if (userSearchTerm) {
      const term = userSearchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (userRoleFilter !== 'all') {
      result = result.filter(user => user.role === userRoleFilter);
    }

    setFilteredUsers(result);
  };

  // Handle save user
const handleSaveUser = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newUser.email || !newUser.name || !newUser.role) {
    smartToast.dashboard.error('البريد الإلكتروني والاسم الكامل والدور مطلوبة');
    return;
  }
  
  if (!editingUser && !newUser.password) {
    smartToast.dashboard.error('كلمة المرور مطلوبة للموظف الجديد');
    return;
  }
  if (newUser.password && newUser.password.length < 6) {
    smartToast.dashboard.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  setIsLoadingUsers(true);
  try {
    if (editingUser && editingUser.id) {
      console.log('🔄 Updating user with ID:', editingUser.id);
      
      const userData = {
        name: newUser.name || editingUser.name,
        email: newUser.email || editingUser.email,
        phone: newUser.phone || editingUser.phone,
        role: newUser.role || editingUser.role,
        ...(newUser.password && { password: newUser.password })
      };

      const response = await apiCall(API_ENDPOINTS.USER_BY_ID(editingUser.id), {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        const updatedUsers = users.map(user =>
          user.id === editingUser.id 
            ? { 
                ...editingUser, 
                ...userData,
                username: userData.email
              } 
            : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        smartToast.dashboard.success('تم تحديث الموظف بنجاح');
      } else {
        throw new Error(response.message || 'فشل في تحديث الموظف');
      }
    } else {
      const userData = {
        name: newUser.name || '',
        email: newUser.email || '',
        password: newUser.password,
        role: newUser.role || 'staff'
      };

      const response = await apiCall(API_ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        const newUserItem = {
          id: response.data._id,
          username: userData.email,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: true,
          createdAt: new Date().toISOString(),
          phone: '',
          lastLogin: new Date().toISOString(),
          password: undefined
        };
        setUsers([...users, newUserItem]);
        setFilteredUsers([...users, newUserItem]);
        smartToast.dashboard.success('تم إضافة الموظف بنجاح');
      } else {
        throw new Error(response.message || 'فشل في إضافة الموظف');
      }
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    setNewUser({ username: '', name: '', email: '', phone: '', role: 'staff', password: '' });
  } catch (error) {
    console.error('Error saving user:', error);
    smartToast.dashboard.error('خطأ في حفظ الموظف');
  } finally {
    setIsLoadingUsers(false);
  }
};

  // Handle delete user
const handleDeleteUser = async () => {
  if (!userToDelete || !userToDelete.id) return; // <-- التحقق من userToDelete ووجود id بداخله
  
  setIsLoadingUsers(true);
  try {
    // حفظ الـ id في متغير محلي لضمان ثبات القيمة عند تنفيذ الطلب
    const userIdToDelete = userToDelete.id;
    
    const response = await apiCall(API_ENDPOINTS.USER_BY_ID(userIdToDelete), { // <-- استخدام المتغير المحلي
      method: 'DELETE'
    });
    
    if (response.success) {
      const updatedUsers = users.filter(user => user.id !== userIdToDelete); // <-- استخدام المتغير المحلي
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      smartToast.dashboard.success('تم حذف الموظف بنجاح');
    } else {
      smartToast.dashboard.error('فشل في حذف الموظف');
    }
    
    setShowDeleteUserModal(false);
    setUserToDelete(null);
  } catch (error) {
    console.error('Error deleting user:', error);
    smartToast.dashboard.error('خطأ في حذف الموظف');
  } finally {
    setIsLoadingUsers(false);
  }
};

  // Handle password change
const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!editingUser || !editingUser.id) {
    smartToast.dashboard.error('خطأ: لم يتم تحديد المستخدم');
    return;
  }
  
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    smartToast.dashboard.error('كلمة المرور الجديدة وتأكيدها غير متطابقين');
    return;
  }
  
  if (passwordData.newPassword.length < 6) {
    smartToast.dashboard.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }
  
  try {
    const response = await apiCall(API_ENDPOINTS.USER_BY_ID(editingUser.id) + '/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword: passwordData.newPassword })
    });
    
    if (response.success) {
      smartToast.dashboard.success('تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setEditingUser(null);
    } else {
      smartToast.dashboard.error(response.message || 'فشل في تغيير كلمة المرور');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    smartToast.dashboard.error('خطأ في تغيير كلمة المرور');
  }
};

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.ACTIVITY_LOGS);
      setActivityLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      smartToast.dashboard.error('فشل في جلب سجلات النشاط');
    }
  };

  // Fetch login logs
  const fetchLoginLogs = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGIN_LOGS);
      setLoginLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching login logs:', error);
      smartToast.dashboard.error('فشل في جلب سجلات الدخول');
    }
  };

  // Handle user search
  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
  };

  // Load users on component mount and when filters change
  useEffect(() => {
    if (isPinAuthenticated) { // تأكد من أن المستخدم مصادق عليه قبل الجلب
      fetchUsers();
    }
  }, [isPinAuthenticated]); // اعتمد على حالة PIN بدلاً من []

  useEffect(() => {
    filterUsers();
  }, [users, userSearchTerm, userRoleFilter]);

  if (isLoadingUsers && !showPinModal) {
    return <div className="p-6">جاري التحميل...</div>;
  }

return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            إدارة الموظفين
          </h2>
          <p className="text-gray-200">إدارة حسابات الموظفين وصلاحياتهم في النظام بكفاءة عالية</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة موظف جديد
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Key className="w-5 h-5" />
            تغيير كلمة مروري
          </button>
          <button
            onClick={() => setShowChangePinModal(true)}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Shield className="w-5 h-5" />
            تغيير رمز PIN
          </button>
          <button 
            onClick={() => {
              setActiveLogsTab('activity');
              setShowLogsModal(true);
              fetchActivityLogs();
            }}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Activity className="w-5 h-5" />
            سجلات النشاط
          </button>
          <button 
            onClick={() => {
              setActiveLogsTab('login');
              setShowLogsModal(true);
              fetchLoginLogs();
            }}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <LogIn className="w-5 h-5" />
            سجلات الدخول
          </button>
        </div>
      </div>
    </div>

    {/* Search and Filter */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="البحث في الموظفين..."
            value={userSearchTerm}
            onChange={handleUserSearch}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white min-w-[150px]"
        >
          <option value="all">جميع الأدوار</option>
          <option value="admin">مدير</option>
          <option value="staff">موظف</option>
        </select>
      </div>
    </div>

    {/* Employee Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي الموظفين</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{filteredUsers.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">المديرين</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{filteredUsers.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">الموظفين</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{filteredUsers.filter(u => u.role === 'staff').length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>

    {/* Employees List */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {filteredUsers.length === 0 ? (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا يوجد موظفين</h3>
            <p className="text-gray-500 mb-8 text-lg">ابدأ بإضافة موظفين للنظام</p>
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إضافة أول موظف
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#203f61]">
              <tr>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الموظف</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">البريد الإلكتروني</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الدور</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">تاريخ الإنضمام</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-md">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {user.role === 'admin' ? '✓ مدير' : '✓ موظف'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      ✓ نشط
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewUser({ ...user });
                          setShowUserModal(true);
                        }}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                   <button
  onClick={() => {
    setEditingUser(user);
    setNewUser({ ...user, password: '' });
    setShowPasswordModal(true);
  }}
  className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-300 border border-green-200 hover:border-green-300 transform hover:scale-105"
  title="تغيير كلمة المرور"
>
  <Key className="w-4 h-4" />
</button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteUserModal(true);
                        }}
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

    {/* User Modal */}
    {showUserModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <h3 className="text-2xl font-bold">
              {editingUser ? '✏️ تعديل الموظف' : '➕ إضافة موظف جديد'}
            </h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={newUser.name || ''}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الهاتف</label>
                <input
                  type="tel"
                  value={newUser.phone || ''}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الدور</label>
                <select
                  value={newUser.role || 'staff'}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'staff' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
                >
                  <option value="staff">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setNewUser({ username: '', name: '', email: '', phone: '', role: 'staff', password: '' });
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingUser ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {isLoadingUsers && <Spinner overlay />}

    {/* Delete User Modal */}
    <ConfirmationModal
      isOpen={showDeleteUserModal}
      title="⚠️ تأكيد الحذف"
      message={`هل أنت متأكد من حذف الموظف "${userToDelete?.name || ''}"؟\nلا يمكن التراجع عن هذا الإجراء.`}
      onConfirm={handleDeleteUser}
      onCancel={() => {
        setShowDeleteUserModal(false);
        setUserToDelete(null);
      }}
      confirmText={isLoadingUsers ? 'جاري الحذف...' : 'حذف'}
      cancelText="إلغاء"
    />

    {/* Change Password Modal */}
    {showPasswordModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <h3 className="text-2xl font-bold">🔑 تغيير كلمة المرور</h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  تغيير
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Change PIN Modal */}
    {showChangePinModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <h3 className="text-2xl font-bold">🛡️ تغيير رمز PIN</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رمز PIN الجديد</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أدخل 4 أرقام"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تأكيد رمز PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                  placeholder="أعد إدخال 4 أرقام"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowChangePinModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  تغيير
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Logs Modal */}
    {showLogsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {activeLogsTab === 'activity' ? '📊 سجلات النشاط' : '🔐 سجلات الدخول'}
              </h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8 space-x-reverse">
                <button
                  onClick={() => {
                    setActiveLogsTab('activity');
                    fetchActivityLogs();
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeLogsTab === 'activity'
                      ? 'border-[#203f61] text-[#203f61]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  سجلات النشاط
                </button>
                <button
                  onClick={() => {
                    setActiveLogsTab('login');
                    fetchLoginLogs();
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeLogsTab === 'login'
                      ? 'border-[#203f61] text-[#203f61]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  سجلات الدخول
                </button>
              </nav>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#203f61]">
                  <tr>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeLogsTab === 'activity' ? activityLogs : loginLogs).map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-900 font-medium">{log.userId}</td>
                      <td className="py-4 px-6 text-gray-900">{log.description}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(log.timestamp).toLocaleString('ar-SA')}</td>
                      <td className="py-4 px-6 text-gray-600">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">التحقق من الأمان</h3>
              <p className="text-gray-600 mt-2">يرجى إدخال رمز PIN للوصول إلى إدارة الموظفين</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handlePinSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رمز PIN</label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="****"
                  inputMode="numeric"
                  maxLength={4}
                />
                {pinError && <p className="text-red-500 text-sm mt-1">{pinError}</p>}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={pinLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {pinLoading ? 'جاري التحقق...' : 'التحقق'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;