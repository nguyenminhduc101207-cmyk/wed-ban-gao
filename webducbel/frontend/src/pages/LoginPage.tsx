import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { totalBags, totalWeightKg } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Cột trái: Hình ảnh & Thông điệp mộc mạc gia đình (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white border border-[#D1D5DB]/60 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Gạo sạch chuẩn vị cơm nhà
            </div>
            <h2 className="text-2xl font-bold text-[#121c2a] tracking-tight leading-snug">
              Bữa cơm nhà bắt đầu từ hạt gạo ngon.
            </h2>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Đồng hành cùng gia đình Việt với những mẻ gạo xát mới, giữ trọn hương vị phù sa và dinh dưỡng tự nhiên từ các vùng đất chuyên canh trù phú.
            </p>
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xs my-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiBLS0RjwHkspBomDD7M-c5tiX3cHeAlGpO06DF1dtbsREJJ7xBVfqrUoSxPuCrsI9ZAG6Hwo_8lc4WpQC9f7o5haNq3ixPCXG0_aI-9LP6Mx3HRnrOZ3IicF_KGsLuV2WrbQ2AbFv5i_0sE_IMjSjoUdzOgkQO91JRoxmHx_RlbQEiYY2-YxAICbFq3bnin4_yHVMDa-2Spsh00mcxBqskHf2vzY_mcMt042xVvs"
                alt="Bữa cơm gia đình ấm cúng"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-[#D1D5DB]/40 space-y-2.5 text-xs text-[#4B5563]">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[18px] shrink-0 mt-0.5">spa</span>
              <span><strong>Gạo nguyên chất 100%:</strong> Không chất bảo quản, giữ trọn cám gạo thơm lúa mới.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[18px] shrink-0 mt-0.5">local_shipping</span>
              <span><strong>Gạo nặng có người lo:</strong> Giao tận cửa, kiểm tra gạo thơm trước khi thanh toán.</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Đăng nhập & Giữ giỏ hàng (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D1D5DB]/60 p-6 sm:p-10 shadow-xs flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Banner giữ giỏ */}
            {totalBags > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#DCFCE7] text-[#166534] shadow-xs">
                <span className="material-symbols-outlined text-[24px] shrink-0">shopping_bag</span>
                <div className="text-xs">
                  <p className="font-bold">Đăng nhập để tiếp tục đặt hàng</p>
                  <p className="text-[#404940]">
                    Các sản phẩm bạn đã chọn <strong className="text-[#166534]">({totalBags} bao · {totalWeightKg.toFixed(1)} kg)</strong> vẫn được lưu giữ an toàn.
                  </p>
                </div>
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-[#121c2a] tracking-tight">Đăng nhập</h1>
              <p className="text-xs text-[#4B5563] mt-1">
                Đăng nhập để quản lý đơn hàng, theo dõi giao nhận và lưu địa chỉ nhận gạo.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full h-11 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#121c2a]">
                    Mật khẩu <span className="text-[#B91C1C]">*</span>
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#4B5563]">
              Chưa có tài khoản?{' '}
              <Link
                to={`/dang-ky?redirect=${encodeURIComponent(redirectUrl)}`}
                className="font-bold text-[#166534] hover:underline"
              >
                Đăng ký tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

