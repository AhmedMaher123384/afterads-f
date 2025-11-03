import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Search, Filter, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { smartToast } from '../utils/toastConfig';
import logo from '../assets/logo.webp';

interface Client {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.CLIENTS, {
        method: 'GET'
      });
      
      // Handle different response formats
      const clientsData = response.clients || response.data || response || [];
      setClients(clientsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('حدث خطأ في تحميل العملاء');
      smartToast.dashboard.error('حدث خطأ في تحميل العملاء');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete client
  const handleDeleteClient = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    try {
      const response = await apiCall(API_ENDPOINTS.CLIENT_BY_ID(id), {
        method: 'DELETE'
      });
      
      // Check if deletion was successful (response contains message)
      if (response.message && response.message.includes('successfully')) {
        setClients(prev => prev.filter(client => client.id !== id));
        smartToast.dashboard.success('تم حذف العميل بنجاح');
      } else {
        smartToast.dashboard.error('فشل في حذف العميل');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      smartToast.dashboard.error('حدث خطأ في حذف العميل');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle client logo click
  const handleClientClick = (website?: string) => {
    if (website) {
      // Ensure the URL has a protocol
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter clients
  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchClients}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 space-x-reverse">
              <img src={logo} alt=" AfterAds" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900"> AfterAds </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">الرئيسية</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">المنتجات</Link>
              <Link to="/clients" className="text-blue-600 font-medium">العملاء</Link>
              <Link to="/testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">الآراء</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">اتصل بنا</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            عملاؤنا المميزون
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            نفخر بثقة عملائنا وشراكتنا الناجحة معهم في تحقيق أهدافهم
          </p>
        </div>
      </section>

      {/* Admin Controls */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">إدارة العملاء</h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة عميل جديد
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">استكشف عملاءنا</h2>
            <p className="text-lg text-gray-600">ابحث واكتشف قصص نجاح عملائنا المميزين</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl bg-white"
              />
            </div>
            <button
              onClick={fetchClients}
              disabled={loading}
              className="inline-flex items-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className={`w-6 h-6 ml-3 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">لا يوجد عملاء</h3>
              <p className="text-gray-500 text-lg mb-4">لا يوجد عملاء يطابقون البحث</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة أول عميل
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClients.map((client, idx) => (
                <div key={(client as any).id ?? `${client.name}-${client.website ?? ''}-${(client as any).createdAt ?? ''}-${idx}`} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-8 relative">
                    {/* Client Logo Section */}
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className={`w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-white ${
                          client.website ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''
                        }`}
                        onClick={() => handleClientClick(client.website)}
                        title={client.website ? `زيارة موقع ${client.name}` : ''}
                      >
                        {client.logo ? (
                          <img
                            src={buildImageUrl(client.logo)}
                            alt={client.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <User className="w-10 h-10 text-blue-500" />
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to="/dashboard"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="تحرير العميل"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Client Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {client.name}
                    </h3>
                    
                    {/* Website Link */}
                    {client.website && (
                      <button
                        onClick={() => handleClientClick(client.website)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        زيارة الموقع
                      </button>
                    )}
                    
                    {/* Partnership Badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">شريك نشط</span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(client.createdAt)}
                      </span>
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src={logo} alt="AfterAds" className="h-8 w-auto mx-auto mb-4 filter brightness-0 invert" />
            <p className="text-gray-400">
              © 2025 AfterAds وكالة. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Clients;