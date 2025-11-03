import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { smartToast } from '../utils/toastConfig'; 
import logo from '../assets/logo.webp'; 

interface Testimonial {
  id: number;
  name: string;
  position?: string;
  image?: string;
  testimonial: string;
  createdAt: string;
  updatedAt: string;
}

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.TESTIMONIALS, {
        method: 'GET'
      });
      
      // Handle different response formats
      const testimonialsData = response.testimonials || response.data || response || [];
      setTestimonials(testimonialsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('حدث خطأ في تحميل الشهادات');
      smartToast.dashboard.error('حدث خطأ في تحميل الشهادات');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete testimonial
  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) {
      return;
    }

    try {
      const response = await apiCall(API_ENDPOINTS.TESTIMONIAL_BY_ID(id), {
        method: 'DELETE'
      });
      
      if (response.success) {
        setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
        smartToast.dashboard.success('تم حذف الشهادة بنجاح');
      } else {
        smartToast.dashboard.error('فشل في حذف الشهادة');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      smartToast.dashboard.error('حدث خطأ في حذف الشهادة');
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

  // Filter testimonials
  useEffect(() => {
    let filtered = testimonials;

    if (searchTerm) {
      filtered = filtered.filter(testimonial =>
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.testimonial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (testimonial.position && testimonial.position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTestimonials(filtered);
  }, [testimonials, searchTerm]);

  // Load testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الشهادات...</p>
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
            onClick={fetchTestimonials}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <img src={logo} alt="AfterAds" className="h-10 w-auto filter brightness-0 invert" />
              <span className="text-3xl font-bold">آراء عملائنا المميزين</span>
            </Link>
            <nav className="flex space-x-8 space-x-reverse">
              <Link to="/" className="text-white/80 hover:text-white transition-colors font-medium">
                الرئيسية
              </Link>
              <Link to="/products" className="text-white/80 hover:text-white transition-colors font-medium">
                المنتجات
              </Link>
              <Link to="/services" className="text-white/80 hover:text-white transition-colors font-medium">
                المنتجات
              </Link>
              <Link to="/testimonials" className="text-white font-bold border-b-2 border-white pb-1">
                شهادات العملاء
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            شهادات عملائنا
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            اكتشف ما يقوله عملاؤنا عن منتجاتنا ومنتجاتنا
          </p>
        </div>
      </section>

      {/* Admin Controls */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">إدارة الشهادات</h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة شهادة جديدة
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">اكتشف تجارب عملائنا</h2>
              <p className="text-gray-600">آراء حقيقية من عملاء راضين عن منتجاتنا ومنتجاتنا</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في آراء العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>
              
              <button
                onClick={fetchTestimonials}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                تحديث الآراء
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            جميع الشهادات
          </h2>
          
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">لا توجد شهادات تطابق البحث</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة أول شهادة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTestimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-8 relative">
                    {/* Quote Icon */}
                    <div className="absolute top-4 left-4 text-6xl text-blue-100 font-serif leading-none">
                      "
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg">
                        {testimonial.image ? (
                          <img
                            src={buildImageUrl(testimonial.image)}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <div className="mr-4 flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{testimonial.name}</h3>
                        {testimonial.position && (
                          <p className="text-sm text-gray-600 mb-2">{testimonial.position}</p>
                        )}
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to="/dashboard"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="تحرير الشهادة"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="حذف الشهادة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-6 relative z-10">
                      {testimonial.testimonial}
                    </p>
                    
                    {/* Date */}
                    <div className="text-sm text-gray-500 border-t border-gray-100 pt-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(testimonial.createdAt)}
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
            <img src={logo} alt=" AfterAds" className="h-8 w-auto mx-auto mb-4 filter brightness-0 invert" />
            <p className="text-gray-400">
              © 2025 افتر ادز. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Testimonials;