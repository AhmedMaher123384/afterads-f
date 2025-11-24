import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Grid,
  FileText,
  ShoppingCart,
  Users,
  Tag,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  PenSquare,
  Star,
  Briefcase,
  Megaphone
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserSection from './sections/UserSection';

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
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MenuItem {
  path: string;
  name: string;
  icon: JSX.Element;
  badge?: number;
  role?: 'admin' | 'staff' | 'both';
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface UserSectionProps {
  currentUser: any;
  onLogout: () => void;
  icons: { LogOut: any };
  isOpen?: boolean; // إضافة هذا السطر
}

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalBlogPosts: number;
  pendingOrders: number;
  activeCoupons: number;
  totalTestimonials: number;
  totalClients: number;
  totalComments: number;
}

interface SidebarProps {
  currentUser?: { role: 'admin' | 'staff' };
  stats?: Stats;
  customers?: Customer[];
  orders?: any[];
  staticPages?: any[];
  users?: any[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser = { role: 'admin' },
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const savedUser = (() => {
    try {
      const raw = localStorage.getItem('adminUser');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const currentPath = location.pathname.split('/').pop() || 'overview';

  const toggleSidebar = () => setIsOpen(!isOpen);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    // مسح جميع بيانات المصادقة
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // توجيه إلى صفحة تسجيل الدخول
    navigate('/login');
  };

  const isTokenExpired = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return true;
    try {
      const payload = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padding = '='.repeat((4 - payload.length % 4) % 4);
      const decoded = atob(payload + padding);
      const { exp } = JSON.parse(decoded);
      return Date.now() >= exp * 1000;
    } catch (e) {
      console.error('Error decoding token:', e);
      return true;
    }
  };

  useEffect(() => {
    const checkToken = () => {
      if (isTokenExpired()) {
        handleLogout();
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuSections: MenuSection[] = [
    {
      title: 'لوحة التحكم',
      items: [
        {
          path: '',
          name: 'نظرة عامة',
          icon: <BarChart3 className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'الكتالوج',
      items: [
        {
          path: 'products',
          name: 'المنتجات',
          icon: <Package className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'categories',
          name: 'التصنيفات',
          icon: <Grid className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'blog',
          name: 'المدونة',
          icon: <PenSquare className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'المبيعات',
      items: [
        {
          path: 'orders',
          name: 'الطلبات',
          icon: <ShoppingCart className="w-5 h-5" />,
          role: 'both'
        },
        {
          path: 'customers',
          name: 'العملاء',
          icon: <Users className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'invoices',
          name: 'إدارة الفواتير',
          icon: <FileText className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
     {
      title: 'إدارة الثيم',
      items: [

        {
          path: 'theme-works',
          name: 'شركائنا',
          icon: <Briefcase className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'theme-cards',
          name: 'بطاقات الثيم',
          icon: <Star className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'العروض',
      items: [
        {
          path: 'coupons',
          name: 'الكوبونات',
          icon: <Tag className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'إدارة المحتوى',
      items: [
        {
          path: 'static-pages',
          name: ' صفحات ثابتة',
          icon: <FileText className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'documentation',
          name: 'التوثيق',
          icon: <FileText className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'announcement-bar',
          name: 'شريط الإعلانات',
          icon: <Megaphone className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'testimonials',
          name: 'شهادة العملاء',
          icon: <MessageSquare className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'clients',
          name: 'عملائنا',
          icon: <Users className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'comments',
          name: 'التعليقات',
          icon: <MessageSquare className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'الإعدادات المتقدمة',
      items: [
        {
          path: 'analytics',
          name: 'التحليلات',
          icon: <TrendingUp className="w-5 h-5" />,
          role: 'admin'
        },
        {
          path: 'employees',
          name: 'إدارة الموظفين',
          icon: <Users className="w-5 h-5" />,
          role: 'admin'
        }
      ]
    },
    {
      title: 'الحساب',
      items: [
        {
          path: 'logout',
          name: 'تسجيل الخروج',
          icon: <LogOut className="w-5 h-5" />,
          role: 'both'
        }
      ]
    }
  ];

  const filterItemsByRole = (items: MenuItem[]) =>
    items.filter(item => !item.role || item.role === 'both' || item.role === currentUser.role);

  return (
    <div
      className={`bg-gray-900 text-white h-full pt-8 ${isOpen ? 'w-72' : 'w-20'
        } duration-300 relative flex flex-col`}
      dir="rtl"
    >
      <button
        onClick={toggleSidebar}
        className={`fixed top-9 w-8 h-8 border-2 border-gray-900 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all duration-200 z-[9999] shadow-lg ${isOpen ? 'right-[270px]' : 'right-16'
          }`}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="px-5 mb-6">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="text-2xl text-blue-400">
            <Home className="w-8 h-8" />
          </div>
          <h1 className={`text-xl font-bold duration-200 ${!isOpen && 'hidden'}`}>
            لوحة التحكم
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
        <style>{`
          nav::-webkit-scrollbar { width: 6px; }
          nav::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 3px; }
          nav::-webkit-scrollbar-thumb:hover { background: #6B7280; }
        `}</style>

        <div className="space-y-6 pb-4">
          {menuSections.map((section, sectionIndex) => {
            const filteredItems = filterItemsByRole(section.items);
            if (filteredItems.length === 0) return null;

            return (
              <div key={sectionIndex}>
                {isOpen && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {filteredItems.map((item, index) => {
                    // إذا كان العنصر هو تسجيل الخروج، اعرض قسم المستخدم مع مودال التأكيد
                    if (item.path === 'logout') {
                      return (
                        <div key={index} className="px-2">
                          <UserSection
                            currentUser={{ ...savedUser, role: currentUser.role }}
                            onLogout={handleLogout}
                            icons={{ LogOut }}
                            isOpen={isOpen}
                          />
                        </div>
                      );
                    }

                    // العناصر العادية
                    return (
                      <Link
                        key={index}
                        to={`/admin/${item.path}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                          ${!isOpen ? 'justify-center' : ''}
                          ${currentPath === item.path
                            ? 'bg-white text-black shadow-lg'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        title={!isOpen ? item.name : undefined}
                      >
                        <div className="relative flex-shrink-0">
                          {item.icon}
                          {!isOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-xl z-50">
                              {item.name}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                        <span className={`flex-1 text-right duration-200 ${!isOpen && 'hidden'}`}>
                          {item.name}
                        </span>
                        {isOpen && item.badge !== undefined && (
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold
                              ${currentPath === item.path ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'}
                            `}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;