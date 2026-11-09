import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalBags } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/san-pham' },
    { label: 'Chính sách giao hàng', path: '/chinh-sach-giao-hang' },
    { label: 'Liên hệ', path: '/lien-he' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D1D5DB]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#166534] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[24px]">grass</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-[#166534] tracking-tight">
                DucBel
              </span>
              <span className="text-[11px] text-[#795900] tracking-wider uppercase font-semibold">
                Vị Ngọt Phù Sa
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#4B5563] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm loại gạo bạn cần (ST25, lài sữa...)"
                className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg text-sm text-[#121c2a] placeholder:text-[#4B5563]/70 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2 transition-all"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Account Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden xl:flex flex-col">
                      <span className="text-xs font-semibold text-[#121c2a] leading-tight truncate max-w-[120px]">
                        {user.fullName}
                      </span>
                      <span className="text-[11px] text-[#4B5563]">
                        {user.role === 'ADMIN'
                          ? 'Quản trị'
                          : user.role === 'STAFF'
                          ? 'Nhân viên'
                          : 'Khách hàng'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#4B5563] hidden xl:inline">
                      expand_more
                    </span>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#D1D5DB]/60 py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-[#D1D5DB]/40">
                        <p className="text-sm font-bold text-[#121c2a]">{user.fullName}</p>
                        <p className="text-xs text-[#4B5563] truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/tai-khoan/don-hang"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#121c2a] hover:bg-[#DCFCE7] hover:text-[#166534] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        Đơn hàng của tôi
                      </Link>
                      {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                        <Link
                          to="/nhan-vien/don-hang"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#795900] hover:bg-[#ffdf9f]/30 transition-colors font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                          Xử lý đơn (Nhân viên)
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#B91C1C] hover:bg-[#ffdad6]/40 transition-colors font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                          Trang Quản trị Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#B91C1C] hover:bg-[#ffdad6]/40 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/dang-nhap"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#166534] text-white hover:bg-[#14532D] shadow-sm transition-all"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Cart Link */}
            <Link
              to="/gio-hang"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#DCFCE7] text-[#166534] font-semibold text-sm hover:bg-[#DCFCE7]/80 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span className="hidden sm:inline">Giỏ hàng</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#166534] text-white min-w-[20px]">
                {totalBags}
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4B5563] hover:text-[#121c2a] focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Bar - Desktop */}
        <div className="border-t border-[#D1D5DB]/40 hidden md:block">
          <nav className="flex items-center space-x-6 py-2 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#166534] font-bold border-b-2 border-[#166534]'
                      : 'text-[#4B5563] hover:text-[#121c2a]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#D1D5DB]/40 space-y-3">
            <form onSubmit={handleSearch} className="relative flex items-center mb-3">
              <span className="material-symbols-outlined absolute left-3 text-[#4B5563] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm loại gạo..."
                className="w-full h-10 pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </form>
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-[#DCFCE7] text-[#166534] font-bold'
                      : 'text-[#121c2a] hover:bg-[#eff4ff]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/tai-khoan/don-hang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-[#166534] font-semibold bg-[#eff4ff]"
                >
                  Đơn hàng của tôi
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

