import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../Sidebar";
import ProductsManagement from "../../sections/ProductsTab";
import CategoriesManagement from "../../sections/CategoriesManagement";
import BlogManagement from "../../sections/BlogManagement";
import CustomersManagement from "../../sections/CustomersManagement";
import CouponsManagement from "../../sections/CouponsManagement";
import CommentsManagement from "../../sections/CommentsManagement";
import Overview from "../../sections/Overview";
import OrdersPage from "../../sections/OrdersPage";
import InvoiceManagement from "../../sections/InvoiceManagement";
import StaticPagesManagement from "../../sections/StaticPagesManagement";
import TestimonialsManagement from "../../sections/TestimonialsManagement";
import ClientsManagement from "../../sections/ClientsManagement";
import AnalyticsDashboard from "../../sections/AnalyticsDashboard";
import EmployeeManagement from "../../sections/EmployeeManagement";
import ThemeCardsManagement from "../../sections/ThemeCardsManagement";
import ThemeWorksManagement from "../../sections/ThemeWorksManagement";
import DocumentationManagement from "../../sections/DocumentationManagement";
import AnnouncementBarManagement from '../../sections/AnnouncementBarManagement';

const AdminLayout: React.FC = () => {

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* الشريط الجانبي */}
      <div className="relative z-50 h-full overflow-y-auto">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 bg-gray-100 h-full overflow-y-auto p-4 relative z-10">
        <Routes>
          <Route path="products" element={<ProductsManagement />} />
          {/* تقدر تضيف باقي الصفحات هنا زي */}
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="documentation" element={<DocumentationManagement />} />
          <Route path="customers" element={<CustomersManagement />} />
          <Route path="coupons" element={<CouponsManagement />} />
          <Route path="comments" element={<CommentsManagement />} />
          <Route path="" element={<Overview />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="static-pages" element={<StaticPagesManagement />} />
          <Route path="testimonials" element={<TestimonialsManagement />} />
          <Route path="clients" element={<ClientsManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="theme-cards" element={<ThemeCardsManagement />} />
          <Route path="theme-works" element={<ThemeWorksManagement />} />
          <Route path="announcement-bar" element={<AnnouncementBarManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminLayout;