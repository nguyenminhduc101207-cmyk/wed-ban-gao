import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#D1D5DB]/60 mt-16 pt-12 pb-8 text-[#121c2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[22px]">grass</span>
              </div>
              <span className="text-xl font-bold text-[#166534] tracking-tight">DucBel</span>
            </div>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Cung cấp các dòng gạo thuần nông sạch, xát mới vụ mùa, không chất tẩy mùi và bảo quản. Bữa cơm gia đình ngon ngọt bắt đầu từ hạt gạo lành.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              100% Gạo mới vụ mùa 2025
            </div>
          </div>

          {/* Cột 2: Danh mục */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider">
              Danh mục gạo
            </h4>
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li>
                <Link to="/san-pham?category=gao-thom" className="hover:text-[#166534] transition-colors">
                  Gạo thơm đặc sản
                </Link>
              </li>
              <li>
                <Link to="/san-pham?category=gao-deo" className="hover:text-[#166534] transition-colors">
                  Gạo dẻo vừa cơm
                </Link>
              </li>
              <li>
                <Link to="/san-pham?category=gao-lut" className="hover:text-[#166534] transition-colors">
                  Gạo lứt dinh dưỡng
                </Link>
              </li>
              <li>
                <Link to="/san-pham?category=gao-nep" className="hover:text-[#166534] transition-colors">
                  Gạo nếp làm bánh
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách & Cam kết */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider">
              Chính sách & Hỗ trợ
            </h4>
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li>
                <Link to="/chinh-sach-giao-hang" className="hover:text-[#166534] transition-colors">
                  Chính sách giao hàng tận cửa
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-giao-hang" className="hover:text-[#166534] transition-colors">
                  Đổi trả trong 7 ngày
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-giao-hang" className="hover:text-[#166534] transition-colors">
                  Cam kết bốc vác lên chung cư
                </Link>
              </li>
              <li>
                <Link to="/tai-khoan/don-hang" className="hover:text-[#166534] transition-colors">
                  Tra cứu tiến trình đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Kho */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider">
              Kho & Cửa Hàng
            </h4>
            <div className="space-y-2 text-sm text-[#4B5563]">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#166534] shrink-0 mt-0.5">location_on</span>
                <span>Số 45/12 Đường Số 8, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#166534] shrink-0">call</span>
                <span className="font-semibold text-[#121c2a]">0912 345 678</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#166534] shrink-0">mail</span>
                <span>hotro@ducbel.vn</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="border-t border-[#D1D5DB]/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4B5563] gap-2">
          <p>© 2026 DucBel — Cơm Lành Canh Ngọt. Giữ toàn quyền.</p>
          <p>Mô hình nông sản sạch giao tận bếp gia đình</p>
        </div>
      </div>
    </footer>
  );
};

