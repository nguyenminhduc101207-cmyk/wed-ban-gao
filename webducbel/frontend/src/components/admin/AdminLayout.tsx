import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Guard: Phân quyền ADMIN
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#191b23]">Đang kiểm tra quyền quản trị viên...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={'/dang-nhap?redirect=' + encodeURIComponent(location.pathname)} replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-[#c2c6d6]/60">
          <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">block</span>
          </div>
          <h2 className="text-xl font-bold text-[#191b23] mb-2">Truy cập bị từ chối (403)</h2>
          <p className="text-xs text-[#424754] mb-6">
            Tài khoản <strong>{user.email}</strong> không có quyền truy cập vào cổng quản trị {BRAND_CONFIG.adminPortalTitle}.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#0058be] text-white text-xs font-bold hover:bg-[#2170e4]"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Tổng quan & Báo cáo', path: '/admin', icon: 'dashboard', exact: true },
    { label: 'Quản lý Đơn hàng', path: '/admin/orders', icon: 'shopping_cart' },
    { label: 'Sản phẩm gạo', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Danh mục gạo', path: '/admin/categories', icon: 'category' },
    { label: 'Quản lý Kho hàng', path: '/admin/inventory', icon: 'warehouse' },
    { label: 'Khách hàng', path: '/admin/customers', icon: 'group' },
    { label: 'Nhân sự & Phân quyền', path: '/admin/staff', icon: 'admin_panel_settings' },
    { label: 'Báo cáo phân tích', path: '/admin/reports', icon: 'analytics' },
    { label: 'Cài đặt & Vùng giao', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#191b23] font-sans flex antialiased">
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-[#131b2e] flex-col fixed top-0 bottom-0 left-0 z-50 py-6 border-r border-white/5 select-none">
        {/* Brand */}
        <div className="px-6 mb-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0058be] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">data_usage</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                {BRAND_CONFIG.name}
              </h1>
              <span className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path || location.pathname === item.path + '/dashboard'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0058be] text-white shadow-xs'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pt-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Xem website ngoài</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#ffdad6] hover:bg-[#ba1a1a]/20 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. DRAWER MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-[#131b2e] flex flex-col py-6 z-10">
            <div className="px-6 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[#0058be] text-[22px]">data_usage</span>
                <span className="font-bold text-sm">{BRAND_CONFIG.name} Admin</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-[#0058be] text-white' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 3. MAIN WRAPPER */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* TopNavBar */}
        <header className="h-16 bg-white border-b border-[#c2c6d6]/60 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-[#424754] hover:bg-[#f2f3fd]"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#424754]">
              <span className="font-semibold text-[#191b23]">{BRAND_CONFIG.name}</span>
              <span>/</span>
              <span className="font-medium text-[#0058be]">Hệ thống quản trị</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings"
              className="p-2 rounded-full text-[#424754] hover:bg-[#f2f3fd] transition-colors"
              title="Cài đặt hệ thống"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#c2c6d6]/50">
              <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'AD'}
              </div>
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-[#191b23] truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-[#0058be] font-semibold mt-0.5">
                  Quản trị viên
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
