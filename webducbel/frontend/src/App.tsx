import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StaffOrdersPage } from './pages/StaffOrdersPage';
import { PolicyPage } from './pages/PolicyPage';

// Admin Portal Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductCreatePage } from './pages/admin/AdminProductCreatePage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const CustomerLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-[#FFFBF2] text-[#121c2a]">
    <Header />
    <main className="flex-1 pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const NotFound: React.FC = () => (
  <div className="max-w-md mx-auto text-center py-20 px-4">
    <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
      <span className="material-symbols-outlined text-[32px]">sentiment_dissatisfied</span>
    </div>
    <h1 className="text-2xl font-bold text-[#121c2a] mb-2">404 - Không tìm thấy trang</h1>
    <p className="text-sm text-[#4B5563] mb-6">
      Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
    </p>
    <Link
      to="/"
      className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D]"
    >
      Về trang chủ DucBel
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Facing Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/san-pham" element={<ProductListPage />} />
              <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
              <Route path="/gio-hang" element={<CartPage />} />
              <Route path="/thanh-toan" element={<CheckoutPage />} />
              <Route path="/dat-hang-thanh-cong/:code" element={<OrderSuccessPage />} />
              <Route path="/tai-khoan/don-hang" element={<MyOrdersPage />} />
              <Route path="/tai-khoan/don-hang/:id" element={<OrderDetailPage />} />
              <Route path="/dang-nhap" element={<LoginPage />} />
              <Route path="/dang-ky" element={<RegisterPage />} />
              <Route path="/nhan-vien/don-hang" element={<StaffOrdersPage />} />
              <Route path="/chinh-sach-giao-hang" element={<PolicyPage />} />
              <Route path="/lien-he" element={<PolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Portal Routes (TechCore Design System) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/create" element={<AdminProductCreatePage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
