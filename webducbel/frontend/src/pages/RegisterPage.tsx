import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { totalBags, totalWeightKg } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: address.trim() || undefined,
      });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đăng ký tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Cột Trái: Thương hiệu & Giá trị Thành viên (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#166534] text-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 self-start bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              Thành viên DucBel
            </div>
            <h2 className="text-2xl font-bold tracking-tight leading-snug">
              Gắn kết bền lâu cùng bữa cơm Việt.
            </h2>
            <p className="text-xs text-white/90 leading-relaxed">
              Tạo tài khoản để theo dõi lịch sử mua hàng, lưu sổ địa chỉ giao nhận và nhận chăm sóc chu đáo từ nông trại đến gian bếp gia đình.
            </p>
          </div>

          <div className="relative z-10 my-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[20px] text-[#ffdf9f] shrink-0">home_pin</span>
              <div className="text-xs">
                <p className="font-bold">Lưu địa chỉ nhận gạo</p>
                <p className="text-white/80">Tiện lợi, ghi nhớ nhanh cho các lần đặt hàng sau</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[20px] text-[#ffdf9f] shrink-0">local_shipping</span>
              <div className="text-xs">
                <p className="font-bold">Theo dõi đơn thời gian thực</p>
                <p className="text-white/80">Chủ động nắm bắt lộ trình từ kho lúa đến tận nhà</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
            <span>Gạo mới xát chuẩn VietGAP</span>
            <span className="font-bold text-[#ffdf9f]">100% An toàn</span>
          </div>
        </div>

        {/* Cột Phải: Form Đăng ký (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D1D5DB]/60 p-6 sm:p-10 shadow-xs flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Banner ngữ cảnh giữ giỏ */}
            {totalBags > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#DCFCE7] text-[#166534] shadow-xs">
                <span className="material-symbols-outlined text-[24px] shrink-0">shopping_bag</span>
                <div className="text-xs">
                  <p className="font-bold">Đăng ký để hoàn tất đơn hàng</p>
                  <p className="text-[#404940]">
                    Các sản phẩm đang chọn trong giỏ <strong className="text-[#166534]">({totalBags} bao · {totalWeightKg.toFixed(1)} kg)</strong> vẫn được giữ lại nguyên vẹn.
                  </p>
                </div>
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-[#121c2a] tracking-tight">Tạo tài khoản</h1>
              <p className="text-xs text-[#4B5563] mt-1">
                Đăng ký tài khoản khách hàng để đặt gạo và theo dõi đơn hàng thuận tiện hơn.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#121c2a]">
                    Họ và tên <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#121c2a]">
                    Số điện thoại <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#121c2a]">
                  Địa chỉ Email <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvanan@gmail.com"
                  className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#121c2a]">
                    Mật khẩu <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#121c2a]">
                    Xác nhận mật khẩu <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#121c2a]">
                  Địa chỉ giao gạo mặc định (tùy chọn)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#4B5563]">
              Đã có tài khoản?{' '}
              <Link
                to={`/dang-nhap?redirect=${encodeURIComponent(redirectUrl)}`}
                className="font-bold text-[#166534] hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

