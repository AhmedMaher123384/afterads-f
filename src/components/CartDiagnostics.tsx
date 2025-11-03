import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, Database, User, ShoppingCart } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const CartDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. فحص تسجيل الدخول
    const userData = localStorage.getItem('user');
    if (!userData) {
      results.push({
        name: 'تسجيل الدخول',
        status: 'error',
        message: 'لم يتم تسجيل الدخول',
        details: 'يجب تسجيل الدخول أولاً لعرض سلة التسوق'
      });
    } else {
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          results.push({
            name: 'تسجيل الدخول',
            status: 'success',
            message: `مسجل دخول باسم: ${user.firstName || user.name || 'مستخدم'}`,
            details: `معرف المستخدم: ${user.id}`
          });
        } else {
          results.push({
            name: 'تسجيل الدخول',
            status: 'error',
            message: 'بيانات المستخدم غير صحيحة',
            details: 'يرجى تسجيل الخروج وإعادة تسجيل الدخول'
          });
        }
      } catch (error) {
        results.push({
          name: 'تسجيل الدخول',
          status: 'error',
          message: 'خطأ في بيانات المستخدم',
          details: 'بيانات المستخدم المحفوظة تالفة'
        });
      }
    }

    // 2. فحص الاتصال بالخادم
    try {
      await apiCall(API_ENDPOINTS.CATEGORIES);
      results.push({
        name: 'الاتصال بالخادم',
        status: 'success',
        message: 'الخادم يعمل بشكل طبيعي',
        details: 'تم الاتصال بنجاح'
      });
    } catch (error) {
      results.push({
        name: 'الاتصال بالخادم',
        status: 'error',
        message: 'لا يمكن الوصول للخادم',
        details: 'تأكد من الاتصال بالإنترنت'
      });
    }

    // 3. فحص سلة التسوق
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          const cartData = await apiCall(API_ENDPOINTS.USER_CART(user.id));
          results.push({
            name: 'سلة التسوق',
            status: 'success',
            message: `تم تحميل السلة بنجاح`,
            details: `عدد المنتجات: ${Array.isArray(cartData) ? cartData.length : 0}`
          });
        }
      } catch (error) {
        results.push({
          name: 'سلة التسوق',
          status: 'warning',
          message: 'السلة فارغة أو غير موجودة',
          details: 'هذا طبيعي إذا لم تضف منتجات بعد'
        });
      }
    }

    // 4. فحص البيانات المحفوظة محلياً
    const cachedCart = localStorage.getItem('cachedCartItems');
    const lastCartCount = localStorage.getItem('lastCartCount');
    
    if (cachedCart || lastCartCount) {
      results.push({
        name: 'البيانات المحفوظة',
        status: 'success',
        message: 'توجد بيانات محفوظة محلياً',
        details: `عدد المنتجات المحفوظة: ${lastCartCount || '0'}`
      });
    } else {
      results.push({
        name: 'البيانات المحفوظة',
        status: 'warning',
        message: 'لا توجد بيانات محفوظة محلياً',
        details: 'هذا طبيعي في الزيارة الأولى'
      });
    }

    // 5. فحص التوجيه
    const currentPath = window.location.pathname;
    if (currentPath === '/cart') {
      results.push({
        name: 'التوجيه',
        status: 'success',
        message: 'أنت في صفحة السلة الصحيحة',
        details: `المسار الحالي: ${currentPath}`
      });
    } else {
      results.push({
        name: 'التوجيه',
        status: 'warning',
        message: 'لست في صفحة السلة',
        details: `المسار الحالي: ${currentPath}`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6" />
              <h2 className="text-xl font-bold">تشخيص مشاكل سلة التسوق</h2>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>إعادة الفحص</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {isRunning ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">جاري فحص النظام...</p>
            </div>
          ) : (
            <>
              {/* ملخص النتائج */}
              <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
                {hasErrors ? (
                  <div className="flex items-center gap-3 text-red-700">
                    <XCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">تم العثور على مشاكل</h3>
                      <p className="text-sm">يرجى مراجعة النتائج أدناه لحل المشاكل</p>
                    </div>
                  </div>
                ) : hasWarnings ? (
                  <div className="flex items-center gap-3 text-yellow-700">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">تحذيرات</h3>
                      <p className="text-sm">النظام يعمل لكن هناك بعض التحذيرات</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">كل شيء يعمل بشكل طبيعي</h3>
                      <p className="text-sm">لا توجد مشاكل في النظام</p>
                    </div>
                  </div>
                )}
              </div>

              {/* نتائج التشخيص */}
              <div className="space-y-4">
                {diagnostics.map((diagnostic, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(diagnostic.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(diagnostic.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{diagnostic.name}</h4>
                        <p className="text-gray-700 mt-1">{diagnostic.message}</p>
                        {diagnostic.details && (
                          <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded">
                            {diagnostic.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* نصائح لحل المشاكل */}
              {hasErrors && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">نصائح لحل المشاكل:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• تأكد من تسجيل الدخول بشكل صحيح</li>
                    <li>• تأكد من تشغيل الخادم على المنفذ 3001</li>
                    <li>• جرب إعادة تحميل الصفحة</li>
                    <li>• امسح بيانات المتصفح وأعد تسجيل الدخول</li>
                    <li>• تأكد من اتصالك بالإنترنت</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDiagnostics; 