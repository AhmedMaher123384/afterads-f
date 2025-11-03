const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } = require('firebase/firestore');
const ExcelJS = require('exceljs');

// Initialize Firebase with existing config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to format Arabic date
function formatArabicDate(date) {
  return new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format Arabic time
function formatArabicTime(date) {
  return new Date(date).toLocaleTimeString('ar-SA');
}

// Generate Excel Invoice for Single Order
async function generateExcelInvoice(order) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('فاتورة الطلب');

  // Set RTL direction
  worksheet.views = [{ rightToLeft: true }];

  // Header styling
  const headerStyle = {
    font: { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };

  // Company header with better styling
  worksheet.mergeCells('A1:F3');
  worksheet.getCell('A1').value = 'After Ads - فاتورة ضريبية مبسطة';
  worksheet.getCell('A1').style = headerStyle;
  worksheet.getRow(1).height = 40;

  // Add company info section
  worksheet.mergeCells('A4:F4');
  worksheet.getCell('A4').value = 'شركة After Ads للتسويق الرقمي';
  worksheet.getCell('A4').style = {
    font: { name: 'Arial', size: 12, bold: true },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } }
  };

  // Invoice details section with better styling
  const labelStyle = {
    font: { name: 'Arial', size: 11, bold: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const valueStyle = {
    font: { name: 'Arial', size: 11 },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // Invoice details
  worksheet.getCell('A6').value = 'رقم الفاتورة:';
  worksheet.getCell('A6').style = labelStyle;
  worksheet.getCell('B6').value = `INV-${order.id}-${new Date().getFullYear()}`;
  worksheet.getCell('B6').style = valueStyle;
  
  worksheet.getCell('A7').value = 'تاريخ الفاتورة:';
  worksheet.getCell('A7').style = labelStyle;
  worksheet.getCell('B7').value = formatArabicDate(order.createdAt);
  worksheet.getCell('B7').style = valueStyle;
  
  worksheet.getCell('A8').value = 'وقت الفاتورة:';
  worksheet.getCell('A8').style = labelStyle;
  worksheet.getCell('B8').value = formatArabicTime(order.createdAt);
  worksheet.getCell('B8').style = valueStyle;

  // Customer details
  worksheet.getCell('D6').value = 'اسم العميل:';
  worksheet.getCell('D6').style = labelStyle;
  worksheet.getCell('E6').value = order.customerName || 'غير محدد';
  worksheet.getCell('E6').style = valueStyle;
  
  worksheet.getCell('D7').value = 'رقم الهاتف:';
  worksheet.getCell('D7').style = labelStyle;
  worksheet.getCell('E7').value = order.customerPhone || 'غير محدد';
  worksheet.getCell('E7').style = valueStyle;
  
  worksheet.getCell('D8').value = 'البريد الإلكتروني:';
  worksheet.getCell('D8').style = labelStyle;
  worksheet.getCell('E8').value = order.customerEmail || 'غير محدد';
  worksheet.getCell('E8').style = valueStyle;

  // Items header with better styling
  const itemsStartRow = 11;
  
  // Add items section title
  worksheet.mergeCells(`A${itemsStartRow-1}:F${itemsStartRow-1}`);
  worksheet.getCell(`A${itemsStartRow-1}`).value = 'تفاصيل المنتجات - Product Details';
  worksheet.getCell(`A${itemsStartRow-1}`).style = {
    font: { name: 'Arial', size: 14, bold: true },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  
  const itemHeaderStyle = {
    font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  
  const itemHeaders = ['المنتج - Product', 'الكمية - Qty', 'السعر - Price', 'الإجمالي - Total'];
  itemHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(itemsStartRow, index + 1);
    cell.value = header;
    cell.style = itemHeaderStyle;
  });
  
  worksheet.getRow(itemsStartRow).height = 25;

  // Items data with alternating colors
  let currentRow = itemsStartRow + 1;
  order.items.forEach((item, index) => {
    const isEvenRow = index % 2 === 0;
    const itemRowStyle = {
      font: { name: 'Arial', size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isEvenRow ? 'F8F9FA' : 'FFFFFF' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    worksheet.getCell(currentRow, 1).value = item.productName || 'غير محدد';
    worksheet.getCell(currentRow, 1).style = itemRowStyle;
    
    worksheet.getCell(currentRow, 2).value = item.quantity || 0;
    worksheet.getCell(currentRow, 2).style = { ...itemRowStyle, alignment: { horizontal: 'center' } };
    
    worksheet.getCell(currentRow, 3).value = `${(item.price || 0).toFixed(2)} SAR`;
    worksheet.getCell(currentRow, 3).style = { ...itemRowStyle, alignment: { horizontal: 'right' } };
    
    worksheet.getCell(currentRow, 4).value = `${((item.totalPrice || item.price * item.quantity) || 0).toFixed(2)} SAR`;
    worksheet.getCell(currentRow, 4).style = { ...itemRowStyle, alignment: { horizontal: 'right' } };
    
    worksheet.getRow(currentRow).height = 20;
    currentRow++;
  });

  // Totals section with better styling
  currentRow += 2;
  
  // Add totals section title
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = 'ملخص الفاتورة - Invoice Summary';
  worksheet.getCell(`A${currentRow}`).style = {
    font: { name: 'Arial', size: 14, bold: true },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  currentRow += 2;
  
  const totalLabelStyle = {
    font: { name: 'Arial', size: 12, bold: true },
    alignment: { horizontal: 'right' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const totalValueStyle = {
    font: { name: 'Arial', size: 12, bold: true },
    alignment: { horizontal: 'right' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  // Merge cells for totals
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.getCell(`C${currentRow}`).value = 'المجموع الفرعي - Subtotal:';
  worksheet.getCell(`C${currentRow}`).style = totalLabelStyle;
  worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
  worksheet.getCell(`E${currentRow}`).value = `${(order.subtotal || order.total || 0).toFixed(2)} SAR`;
  worksheet.getCell(`E${currentRow}`).style = totalValueStyle;
  

  
  if (order.couponDiscount && order.couponDiscount > 0) {
    currentRow++;
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'خصم الكوبون - Discount:';
    worksheet.getCell(`C${currentRow}`).style = totalLabelStyle;
    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.getCell(`E${currentRow}`).value = `-${order.couponDiscount.toFixed(2)} SAR`;
    worksheet.getCell(`E${currentRow}`).style = { ...totalValueStyle, font: { ...totalValueStyle.font, color: { argb: 'FF0000' } } };
  }
  
  currentRow++;
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.getCell(`C${currentRow}`).value = 'المجموع النهائي - Total:';
  worksheet.getCell(`C${currentRow}`).style = {
    ...totalLabelStyle,
    font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } }
  };
  worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
  worksheet.getCell(`E${currentRow}`).value = `${(order.total || 0).toFixed(2)} SAR`;
  worksheet.getCell(`E${currentRow}`).style = {
    ...totalValueStyle,
    font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } }
  };
  
  // Add footer
  currentRow += 3;
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = 'شكراً لك على ثقتك في After Ads - Thank you for trusting After Ads';
  worksheet.getCell(`A${currentRow}`).style = {
    font: { name: 'Arial', size: 12, bold: true, italic: true },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } }
  };

  // Set column widths
  worksheet.getColumn('A').width = 25;
  worksheet.getColumn('B').width = 25;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 20;
  worksheet.getColumn('E').width = 20;
  worksheet.getColumn('F').width = 20;

  return workbook;
}



// Generate Monthly Statistics Excel Report
async function generateMonthlyStatsExcel(year, month) {
  const workbook = new ExcelJS.Workbook();
  
  // Get orders for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const ordersQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', startDate.toISOString()),
    where('createdAt', '<=', endDate.toISOString()),
    orderBy('createdAt', 'desc')
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  
  const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Summary Sheet with enhanced styling
  const summarySheet = workbook.addWorksheet('ملخص الشهر');
  summarySheet.views = [{ rightToLeft: true }];
  
  // Header with better styling
  summarySheet.mergeCells('A1:F1');
  summarySheet.getCell('A1').value = `تقرير إحصائيات شهر ${month}/${year} - Monthly Report`;
  summarySheet.getCell('A1').style = {
    font: { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  summarySheet.getRow(1).height = 40;
  
  // Statistics with better formatting
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  
  const labelStyle = {
    font: { name: 'Arial', size: 12, bold: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const valueStyle = {
    font: { name: 'Arial', size: 12 },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  summarySheet.getCell('A3').value = 'إجمالي الطلبات - Total Orders:';
  summarySheet.getCell('A3').style = labelStyle;
  summarySheet.getCell('B3').value = totalOrders;
  summarySheet.getCell('B3').style = valueStyle;
  
  summarySheet.getCell('A4').value = 'إجمالي الإيرادات - Total Revenue:';
  summarySheet.getCell('A4').style = labelStyle;
  summarySheet.getCell('B4').value = `${totalRevenue.toFixed(2)} SAR`;
  summarySheet.getCell('B4').style = valueStyle;
  
  summarySheet.getCell('A5').value = 'متوسط قيمة الطلب - Average Order Value:';
  summarySheet.getCell('A5').style = labelStyle;
  summarySheet.getCell('B5').value = `${averageOrderValue.toFixed(2)} SAR`;
  summarySheet.getCell('B5').style = valueStyle;
  
  summarySheet.getCell('A6').value = 'الطلبات المكتملة - Completed Orders:';
  summarySheet.getCell('A6').style = labelStyle;
  summarySheet.getCell('B6').value = completedOrders;
  summarySheet.getCell('B6').style = valueStyle;
  
  summarySheet.getCell('A7').value = 'الطلبات قيد المعالجة - Processing Orders:';
  summarySheet.getCell('A7').style = labelStyle;
  summarySheet.getCell('B7').value = processingOrders;
  summarySheet.getCell('B7').style = valueStyle;
  
  summarySheet.getCell('A8').value = 'الطلبات المعلقة - Pending Orders:';
  summarySheet.getCell('A8').style = labelStyle;
  summarySheet.getCell('B8').value = pendingOrders;
  summarySheet.getCell('B8').style = valueStyle;
  
  summarySheet.getCell('A9').value = 'الطلبات المُلغاة - Cancelled Orders:';
  summarySheet.getCell('A9').style = labelStyle;
  summarySheet.getCell('B9').value = cancelledOrders;
  summarySheet.getCell('B9').style = valueStyle;
  
  // Orders Details Sheet with enhanced formatting
  const ordersSheet = workbook.addWorksheet('تفاصيل الطلبات');
  ordersSheet.views = [{ rightToLeft: true }];
  
  // Enhanced headers
  const headers = [
    'رقم الطلب - Order ID',
    'اسم العميل - Customer Name', 
    'رقم الهاتف - Phone',

    'المبلغ - Amount',
    'الحالة - Status',
    'التاريخ - Date',
    'الوقت - Time'
  ];
  
  const headerStyle = {
    font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  
  headers.forEach((header, index) => {
    const cell = ordersSheet.getCell(1, index + 1);
    cell.value = header;
    cell.style = headerStyle;
  });
  
  ordersSheet.getRow(1).height = 30;
  
  // Orders data with alternating colors and better formatting
  orders.forEach((order, index) => {
    const row = index + 2;
    const isEvenRow = index % 2 === 0;
    const rowStyle = {
      font: { name: 'Arial', size: 10 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isEvenRow ? 'F8F9FA' : 'FFFFFF' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    ordersSheet.getCell(row, 1).value = order.id || 'غير محدد';
    ordersSheet.getCell(row, 1).style = rowStyle;
    
    ordersSheet.getCell(row, 2).value = order.customerName || 'غير محدد';
    ordersSheet.getCell(row, 2).style = rowStyle;
    
    ordersSheet.getCell(row, 3).value = order.customerPhone || 'غير محدد';
    ordersSheet.getCell(row, 3).style = rowStyle;
    
    ordersSheet.getCell(row, 4).value = `${(order.total || 0).toFixed(2)} SAR`;
    ordersSheet.getCell(row, 4).style = { ...rowStyle, alignment: { horizontal: 'right' } };
    
    ordersSheet.getCell(row, 5).value = getStatusText(order.status);
    ordersSheet.getCell(row, 5).style = rowStyle;
    
    ordersSheet.getCell(row, 6).value = formatArabicDate(order.createdAt);
    ordersSheet.getCell(row, 6).style = rowStyle;
    
    ordersSheet.getCell(row, 7).value = formatArabicTime(order.createdAt);
    ordersSheet.getCell(row, 7).style = rowStyle;
    
    ordersSheet.getRow(row).height = 25;
  });
  

  
  // Auto-fit columns with better widths
  summarySheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 35 : 20;
  });
  
  ordersSheet.columns.forEach((column, index) => {
    const widths = [15, 20, 15, 25, 15, 15, 15, 20, 15];
    column.width = widths[index] || 15;
  });
  

  
  return workbook;
}

// Generate Daily Statistics Excel Report
async function generateDailyStatsExcel(year, month, day) {
  const workbook = new ExcelJS.Workbook();
  
  // Get orders for the day
  const startDate = new Date(year, month - 1, day, 0, 0, 0);
  const endDate = new Date(year, month - 1, day, 23, 59, 59);
  
  const ordersQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', startDate.toISOString()),
    where('createdAt', '<=', endDate.toISOString()),
    orderBy('createdAt', 'desc')
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  
  const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Summary Sheet with enhanced styling
  const summarySheet = workbook.addWorksheet('ملخص اليوم');
  summarySheet.views = [{ rightToLeft: true }];
  
  // Header with better styling
  summarySheet.mergeCells('A1:F1');
  summarySheet.getCell('A1').value = `تقرير إحصائيات يوم ${day}/${month}/${year} - Daily Report`;
  summarySheet.getCell('A1').style = {
    font: { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  summarySheet.getRow(1).height = 40;
  
  // Statistics with better formatting
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  
  const labelStyle = {
    font: { name: 'Arial', size: 12, bold: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const valueStyle = {
    font: { name: 'Arial', size: 12 },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  summarySheet.getCell('A3').value = 'إجمالي الطلبات - Total Orders:';
  summarySheet.getCell('A3').style = labelStyle;
  summarySheet.getCell('B3').value = totalOrders;
  summarySheet.getCell('B3').style = valueStyle;
  
  summarySheet.getCell('A4').value = 'إجمالي الإيرادات - Total Revenue:';
  summarySheet.getCell('A4').style = labelStyle;
  summarySheet.getCell('B4').value = `${totalRevenue.toFixed(2)} SAR`;
  summarySheet.getCell('B4').style = valueStyle;
  
  summarySheet.getCell('A5').value = 'متوسط قيمة الطلب - Average Order Value:';
  summarySheet.getCell('A5').style = labelStyle;
  summarySheet.getCell('B5').value = `${averageOrderValue.toFixed(2)} SAR`;
  summarySheet.getCell('B5').style = valueStyle;
  
  summarySheet.getCell('A6').value = 'الطلبات المكتملة - Completed Orders:';
  summarySheet.getCell('A6').style = labelStyle;
  summarySheet.getCell('B6').value = completedOrders;
  summarySheet.getCell('B6').style = valueStyle;
  
  summarySheet.getCell('A7').value = 'الطلبات قيد المعالجة - Processing Orders:';
  summarySheet.getCell('A7').style = labelStyle;
  summarySheet.getCell('B7').value = processingOrders;
  summarySheet.getCell('B7').style = valueStyle;
  
  summarySheet.getCell('A8').value = 'الطلبات المعلقة - Pending Orders:';
  summarySheet.getCell('A8').style = labelStyle;
  summarySheet.getCell('B8').value = pendingOrders;
  summarySheet.getCell('B8').style = valueStyle;
  
  summarySheet.getCell('A9').value = 'الطلبات المُلغاة - Cancelled Orders:';
  summarySheet.getCell('A9').style = labelStyle;
  summarySheet.getCell('B9').value = cancelledOrders;
  summarySheet.getCell('B9').style = valueStyle;
  
  // Orders Details Sheet
  const ordersSheet = workbook.addWorksheet('تفاصيل الطلبات');
  ordersSheet.views = [{ rightToLeft: true }];
  
  // Enhanced headers
  const headers = [
    'رقم الطلب - Order ID',
    'اسم العميل - Customer Name', 
    'رقم الهاتف - Phone',
    'البريد الإلكتروني - Email',
    'المبلغ - Amount',
    'الحالة - Status',
    'التاريخ - Date',
    'الوقت - Time'
  ];
  
  const headerStyle = {
    font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  
  headers.forEach((header, index) => {
    const cell = ordersSheet.getCell(1, index + 1);
    cell.value = header;
    cell.style = headerStyle;
  });
  
  ordersSheet.getRow(1).height = 30;
  
  // Orders data with alternating colors
  orders.forEach((order, index) => {
    const row = index + 2;
    const isEvenRow = index % 2 === 0;
    const rowStyle = {
      font: { name: 'Arial', size: 10 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isEvenRow ? 'F8F9FA' : 'FFFFFF' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    ordersSheet.getCell(row, 1).value = order.id || 'غير محدد';
    ordersSheet.getCell(row, 1).style = rowStyle;
    
    ordersSheet.getCell(row, 2).value = order.customerName || 'غير محدد';
    ordersSheet.getCell(row, 2).style = rowStyle;
    
    ordersSheet.getCell(row, 3).value = order.customerPhone || 'غير محدد';
    ordersSheet.getCell(row, 3).style = rowStyle;
    
    ordersSheet.getCell(row, 4).value = order.customerEmail || 'غير محدد';
    ordersSheet.getCell(row, 4).style = rowStyle;
    
    ordersSheet.getCell(row, 5).value = `${(order.total || 0).toFixed(2)} SAR`;
    ordersSheet.getCell(row, 5).style = { ...rowStyle, alignment: { horizontal: 'right' } };
    
    ordersSheet.getCell(row, 6).value = getStatusText(order.status);
    ordersSheet.getCell(row, 6).style = rowStyle;
    
    ordersSheet.getCell(row, 7).value = formatArabicDate(order.createdAt);
    ordersSheet.getCell(row, 7).style = rowStyle;
    
    ordersSheet.getCell(row, 8).value = formatArabicTime(order.createdAt);
    ordersSheet.getCell(row, 8).style = rowStyle;
    
    ordersSheet.getRow(row).height = 25;
  });
  
  // Hourly breakdown sheet with enhanced styling
  const hourlySheet = workbook.addWorksheet('الإحصائيات بالساعة');
  hourlySheet.views = [{ rightToLeft: true }];
  
  // Header for hourly sheet
  hourlySheet.mergeCells('A1:C1');
  hourlySheet.getCell('A1').value = 'الإحصائيات بالساعة - Hourly Statistics';
  hourlySheet.getCell('A1').style = {
    font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    }
  };
  hourlySheet.getRow(1).height = 30;
  
  // Hourly headers
  const hourlyHeaders = ['الساعة - Hour', 'عدد الطلبات - Orders', 'الإيرادات - Revenue'];
  hourlyHeaders.forEach((header, index) => {
    const cell = hourlySheet.getCell(3, index + 1);
    cell.value = header;
    cell.style = headerStyle;
  });
  
  // Hourly breakdown
  const hourlyStats = {};
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { orders: 0, revenue: 0 };
    }
    hourlyStats[hour].orders++;
    hourlyStats[hour].revenue += order.total || 0;
  });
  
  let row = 4;
  for (let hour = 0; hour < 24; hour++) {
    const stats = hourlyStats[hour] || { orders: 0, revenue: 0 };
    const isEvenRow = (hour) % 2 === 0;
    const rowStyle = {
      font: { name: 'Arial', size: 10 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isEvenRow ? 'F8F9FA' : 'FFFFFF' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    hourlySheet.getCell(row, 1).value = `${hour.toString().padStart(2, '0')}:00`;
    hourlySheet.getCell(row, 1).style = rowStyle;
    
    hourlySheet.getCell(row, 2).value = stats.orders;
    hourlySheet.getCell(row, 2).style = { ...rowStyle, alignment: { horizontal: 'center' } };
    
    hourlySheet.getCell(row, 3).value = `${stats.revenue.toFixed(2)} SAR`;
    hourlySheet.getCell(row, 3).style = { ...rowStyle, alignment: { horizontal: 'right' } };
    
    row++;
  }
  

  
  // Auto-fit columns
  summarySheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 35 : 20;
  });
  
  ordersSheet.columns.forEach((column, index) => {
    const widths = [15, 20, 15, 25, 15, 15, 15, 20, 15];
    column.width = widths[index] || 15;
  });
  

  
  hourlySheet.columns.forEach(column => {
    column.width = 20;
  });
  
  return workbook;
}

// Helper function to get status text in Arabic
function getStatusText(status) {
  const statusMap = {
    'pending': 'في الانتظار',
    'confirmed': 'مؤكد',
    'preparing': 'قيد التحضير',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي'
  };
  return statusMap[status] || status;
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { type, orderId, year, month, day, format } = JSON.parse(event.body || '{}');

    switch (type) {
      case 'single-order':
        if (!orderId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Order ID is required' })
          };
        }

        // Get order from database
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (!orderDoc.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Order not found' })
          };
        }

        const order = { id: orderDoc.id, ...orderDoc.data() };

        // Generate Excel invoice (PDF option removed)
        const workbook = await generateExcelInvoice(order);
        const buffer = await workbook.xlsx.writeBuffer();
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="invoice-${orderId}.xlsx"`
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true
        };
        break;

      case 'monthly-stats':
        if (!year || !month) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Year and month are required' })
          };
        }

        const monthlyWorkbook = await generateMonthlyStatsExcel(parseInt(year), parseInt(month));
        const monthlyBuffer = await monthlyWorkbook.xlsx.writeBuffer();
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="monthly-stats-${year}-${month}.xlsx"`
          },
          body: monthlyBuffer.toString('base64'),
          isBase64Encoded: true
        };

      case 'daily-stats':
        if (!year || !month || !day) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Year, month, and day are required' })
          };
        }

        const dailyWorkbook = await generateDailyStatsExcel(parseInt(year), parseInt(month), parseInt(day));
        const dailyBuffer = await dailyWorkbook.xlsx.writeBuffer();
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="daily-stats-${year}-${month}-${day}.xlsx"`
          },
          body: dailyBuffer.toString('base64'),
          isBase64Encoded: true
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid type specified' })
        };
    }

  } catch (error) {
    console.error('Invoice generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate invoice',
        details: error.message 
      })
    };
  }
};