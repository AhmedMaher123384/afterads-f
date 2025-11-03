import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Printer,
  Mail,
  Share2
} from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { buildApiUrl } from '../../config/api';

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  attachments?: {
    images?: string[];
    text?: string;
  };
}

interface Order {
  id: string | number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  couponDiscount?: number;
  couponCode?: string;
  discount?: number;
  status?: string;
  createdAt?: string;
}

interface InvoiceManagementProps {
  orders: Order[];
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ orders }) => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (order.customerPhone?.includes(searchTerm) || false);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.createdAt || new Date());
    const today = new Date();
    let matchesDate = true;
    
    if (dateFilter === 'today') {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = orderDate >= weekAgo;
    } else if (dateFilter === 'month') {
      matchesDate = orderDate.getMonth() === today.getMonth() && 
                   orderDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Generate invoice for single order
  const generateSingleInvoice = async (orderId: string | number) => {
    setIsGenerating(true);
    try {
      const orderIdStr = typeof orderId === 'string' ? orderId : orderId.toString();
      
      const response = await fetch(buildApiUrl('invoices/single'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderIdStr
        })
      });
  
      if (!response.ok) {
        throw new Error('فشل في إنشاء الفاتورة');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderIdStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
      smartToast.dashboard.success(`تم تحميل فاتورة الطلب #${orderIdStr} بنجاح`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      smartToast.dashboard.error('فشل في إنشاء الفاتورة');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print PDF invoice for single order
  const printInvoicePDF = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>فاتورة الطلب - ${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 15mm;
            }

            body {
              font-family: 'PingARLT', Arial, sans-serif !important;
              background: #ffffff;
              color: #000000;
              line-height: 1.3;
              font-size: 12px;
              height: 100vh;
              overflow: hidden;
            }

            .invoice-container {
              width: 100%;
              height: 100%;
              background: #ffffff;
              border: 2px solid #000000;
              display: flex;
              flex-direction: column;
            }

            .header {
              background: #000000;
              color: #ffffff;
              padding: 12px 20px;
              text-align: center;
              border-bottom: 2px solid #000000;
            }

            .header h1 {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 4px;
            }

            .header p {
              font-size: 11px;
              opacity: 0.9;
            }

            .content {
              flex: 1;
              padding: 15px 20px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .info-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 11px;
            }

            .info-item {
              text-align: center;
            }

            .info-item strong {
              display: block;
              color: #000000;
              font-weight: 600;
              margin-bottom: 3px;
            }

            .customer-section {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              overflow: hidden;
            }

            .customer-header {
              background: #6c757d;
              color: #ffffff;
              padding: 8px 15px;
              font-weight: 600;
              font-size: 12px;
            }

            .customer-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              padding: 10px 15px;
              font-size: 10px;
            }

            .customer-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }

            .customer-item strong {
              color: #000000;
              font-weight: 600;
            }

            .products-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000000;
              font-size: 10px;
              flex: 1;
            }

            .products-table th {
              background: #000000;
              color: #ffffff;
              padding: 6px 4px;
              text-align: center;
              font-weight: 600;
              border: 1px solid #000000;
            }

            .products-table td {
              padding: 4px;
              text-align: center;
              border: 1px solid #dee2e6;
              vertical-align: top;
            }

            .products-table tbody tr:nth-child(even) {
              background: #f8f9fa;
            }

            .totals-section {
              background: #f8f9fa;
              border: 2px solid #000000;
              padding: 12px 15px;
            }

            .totals-breakdown {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .subtotal-row, .delivery-row, .discount-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              padding: 3px 0;
            }

            .discount-row {
              color: #dc3545;
            }

            .total-divider {
              border-top: 1px solid #000000;
              margin: 6px 0 3px 0;
            }

            .final-total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
              font-weight: 700;
              color: #000000;
              padding: 3px 0;
            }

            .footer {
              text-align: center;
              padding: 8px 15px;
              background: #f8f9fa;
              border-top: 1px solid #dee2e6;
              color: #6c757d;
              font-size: 9px;
              line-height: 1.4;
            }

            .footer p {
              margin-bottom: 2px;
            }

            @media print {
              body { 
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-size: 11px;
              }
              
              .invoice-container {
                height: auto;
                min-height: 100vh;
                page-break-inside: avoid;
              }
              
              .products-table {
                page-break-inside: avoid;
              }
              
              .customer-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>فاتورة الطلب</h1>
              <p>رقم الفاتورة: INV-${order.id}-${new Date().getFullYear()}</p>
            </div>

            <div class="content">
              <div class="info-row">
                <div class="info-item">
                  <strong>تاريخ الطلب</strong>
                  ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                </div>
                <div class="info-item">
                  <strong>وقت الطلب</strong>
                  ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'}) : 'غير محدد'}
                </div>
                <div class="info-item">
                  <strong>رقم الطلب</strong>
                  ${order.id}
                </div>
              </div>

              <div class="customer-section">
                <div class="customer-header">بيانات العميل</div>
                <div class="customer-grid">
                  <div class="customer-item">
                    <strong>الاسم:</strong>
                    <span>${order.customerName}</span>
                  </div>
                  <div class="customer-item">
                    <strong>الهاتف:</strong>
                    <span>${order.customerPhone || 'غير محدد'}</span>
                  </div>
                  <div class="customer-item">
                    <strong>البريد:</strong>
                    <span>${order.customerEmail || 'غير محدد'}</span>
                  </div>

                </div>
              </div>

              <table class="products-table">
                <thead>
                  <tr>
                    <th style="width: 30%">المنتج</th>
                    <th style="width: 10%">الكمية</th>
                    <th style="width: 15%">السعر</th>
                    <th style="width: 30%">المواصفات</th>
                    <th style="width: 15%">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.quantity}</td>
                      <td>${item.price.toFixed(2)} ر.س</td>
                      <td>${item.selectedOptions ? Object.entries(item.selectedOptions).map(([key, value]) => 
                        `${key}: ${value}`).join(', ') : 'بدون مواصفات'}</td>
                      <td>${item.totalPrice.toFixed(2)} ر.س</td>
                    </tr>`).join('')}
                </tbody>
              </table>

              <div class="totals-section">
                <div class="totals-breakdown">
                  <div class="subtotal-row">
                    <span>المجموع الفرعي:</span>
                    <span>${(order.subtotal || order.total).toFixed(2)} ر.س</span>
                  </div>
                  
                  ${order.couponDiscount && order.couponDiscount > 0 ? `
                  <div class="discount-row">
                    <span>خصم الكوبون${order.couponCode ? ` (${order.couponCode})` : ''}:</span>
                    <span>-${order.couponDiscount.toFixed(2)} ر.س</span>
                  </div>` : ''}
                  ${order.discount && order.discount > 0 ? `
                  <div class="discount-row">
                    <span>خصم إضافي:</span>
                    <span>-${order.discount.toFixed(2)} ر.س</span>
                  </div>` : ''}
                  <div class="total-divider"></div>
                  <div class="final-total-row">
                    <span>المجموع النهائي:</span>
                    <span>${order.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p><strong>after ads</strong> | هاتف: 966501234567+ | البريد: support@afterads.com | الموقع: www.afterads.com</p>
                <p>شكراً لثقتكم بنا</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Generate monthly statistics report
  const generateMonthlyReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(buildApiUrl('invoices/monthly-stats'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير الشهري');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-report-${selectedYear}-${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      smartToast.dashboard.success(`تم تحميل التقرير الشهري لشهر ${selectedMonth}/${selectedYear} بنجاح`);
    } catch (error) {
      console.error('Error generating monthly report:', error);
      smartToast.dashboard.error('فشل في إنشاء التقرير الشهري');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate daily statistics report
  const generateDailyReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(buildApiUrl('invoices/daily-stats'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير اليومي');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-report-${selectedYear}-${selectedMonth}-${selectedDay}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      smartToast.dashboard.success(`تم تحميل التقرير اليومي لتاريخ ${selectedDay}/${selectedMonth}/${selectedYear} بنجاح`);
    } catch (error) {
      console.error('Error generating daily report:', error);
      smartToast.dashboard.error('فشل في إنشاء التقرير اليومي');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return { color: 'text-black bg-gray-50', icon: CheckCircle };
      case 'confirmed':
        return { color: 'text-black bg-gray-50', icon: CheckCircle };
      case 'preparing':
        return { color: 'text-black bg-gray-50', icon: Clock };
      default:
        return { color: 'text-black bg-gray-50', icon: AlertCircle };
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'preparing': 'قيد التحضير',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-black rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📄 نظام إدارة الفواتير</h1>
            <p className="text-gray-300">إنشاء فواتير احترافية وتقارير إحصائية مفصلة</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <div className="text-gray-300">إجمالي الطلبات</div>
          </div>
        </div>
      </div>

      {/* Statistics Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Report */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center ml-4">
              <BarChart3 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">التقرير الشهري</h3>
              <p className="text-gray-600">إحصائيات مفصلة للشهر المحدد</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2024, month - 1).toLocaleDateString('ar-SA', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateMonthlyReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 ml-2" />
              )}
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل التقرير الشهري'}
            </button>
          </div>
        </div>

        {/* Daily Report */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center ml-4">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">التقرير اليومي</h3>
              <p className="text-gray-600">إحصائيات مفصلة لليوم المحدد</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اليوم</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateDailyReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 ml-2" />
              )}
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل التقرير اليومي'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">فواتير الطلبات</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} من {orders.length} طلب
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="preparing">قيد التحضير</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status || 'pending');
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{order.total.toFixed(2)} ر.س</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 ml-1" />
                        {getStatusText(order.status || 'pending')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'تاريخ غير محدد'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateSingleInvoice(order.id.toString())}
                          disabled={isGenerating}
                          className="p-2 text-black hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                          title="تحميل فاتورة Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printInvoicePDF(order)}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                          title="طباعة فاتورة PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">لم يتم العثور على طلبات تطابق المعايير المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;