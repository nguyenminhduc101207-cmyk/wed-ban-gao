import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { DeliveryZone, PaymentMethod } from '../types';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Quote từ server
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [serverQuote, setServerQuote] = useState<{
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    totalWeightKg: number;
    totalBags: number;
  } | null>(null);

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/dang-nhap?redirect=/thanh-toan');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // 2. Điền thông tin người nhận từ tài khoản
  useEffect(() => {
    if (user) {
      setRecipientName(user.fullName || '');
      setRecipientPhone(user.phone || '');
      setRecipientAddress(user.address || '');
    }
  }, [user]);

  // 3. Tải danh sách vùng giao hàng
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zones = await api.deliveryZones.getAll();
        setDeliveryZones(zones);
        if (zones.length > 0) {
          setSelectedZoneId(zones[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load delivery zones', err);
      }
    };
    fetchZones();
  }, []);

  // 4. Lấy báo giá chính thức từ server khi giỏ hoặc vùng giao đổi
  useEffect(() => {
    if (items.length === 0 || !selectedZoneId) return;

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const q = await api.orders.calculateQuote({
          items: items.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
          deliveryZoneId: selectedZoneId,
        });
        setServerQuote({
          subtotal: q.subtotal,
          deliveryFee: q.deliveryFee,
          totalAmount: q.totalAmount,
          totalWeightKg: q.totalWeightKg,
          totalBags: q.totalBags,
        });
      } catch (err: any) {
        console.warn('Quote error', err);
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuote();
  }, [items, selectedZoneId]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="shopping_bag"
          title="Giỏ hàng chưa có sản phẩm"
          description="Vui lòng chọn loại gạo bạn muốn mua trước khi thanh toán."
          actionText="Về trang sản phẩm"
          onAction={() => navigate('/san-pham')}
        />
      </div>
    );
  }

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);

  // Tính tiền hiển thị
  const fallbackSubtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const fallbackFee = selectedZone ? Number(selectedZone.fee) : 25000;
  const displaySubtotal = serverQuote ? serverQuote.subtotal : fallbackSubtotal;
  const displayFee = serverQuote ? serverQuote.deliveryFee : fallbackFee;
  const displayTotal = serverQuote ? serverQuote.totalAmount : displaySubtotal + displayFee;
  const displayWeight = serverQuote ? serverQuote.totalWeightKg : items.reduce((s, i) => s + i.lineWeight, 0);
  const displayBags = serverQuote ? serverQuote.totalBags : items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!recipientName.trim()) {
      setSubmitError('Vui lòng nhập họ tên người nhận hàng');
      return;
    }
    if (!recipientPhone.trim()) {
      setSubmitError('Vui lòng nhập số điện thoại nhận hàng');
      return;
    }
    if (!recipientAddress.trim()) {
      setSubmitError('Vui lòng nhập địa chỉ nhận hàng chi tiết');
      return;
    }
    if (!selectedZoneId) {
      setSubmitError('Vui lòng chọn khu vực giao hàng');
      return;
    }

    setSubmitting(true);
    const idempotencyKey = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const order = await api.orders.createOrder({
        items: items.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
        deliveryZoneId: selectedZoneId,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientAddress: recipientAddress.trim(),
        paymentMethod,
        note: note.trim() || undefined,
        idempotencyKey,
      });

      clearCart();
      navigate(`/dat-hang-thanh-cong/${order.orderCode}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#D1D5DB]/60 shadow-xs mb-6">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#dee9fc] -z-0">
            <div className="h-full bg-[#166534] w-1/2 rounded-full"></div>
          </div>
          <Link to="/gio-hang" className="relative z-10 flex flex-col items-center group">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <span className="mt-1.5 text-xs text-[#166534] font-semibold">1. Giỏ hàng</span>
          </Link>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-[#DCFCE7]">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <span className="mt-1.5 text-xs text-[#166534] font-bold">2. Đặt hàng & Giao nhận</span>
          </div>
          <div className="relative z-10 flex flex-col items-center opacity-50">
            <div className="w-9 h-9 rounded-full bg-[#dee9fc] text-[#4B5563] flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="mt-1.5 text-xs text-[#4B5563]">3. Hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Account Verification Banner */}
      {user && (
        <div className="bg-white rounded-2xl p-4 border border-[#D1D5DB]/60 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div>
              <span className="text-xs text-[#4B5563]">Đã đăng nhập với tài khoản:</span>
              <p className="text-xs font-bold text-[#121c2a]">
                {user.fullName} <span className="text-[#166534]">({user.email})</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Content */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: THÔNG TIN GIAO & THANH TOÁN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. THÔNG TIN NHẬN HÀNG */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D1D5DB]/40">
              <span className="material-symbols-outlined text-[#166534] text-[22px]">location_on</span>
              <h2 className="text-base font-bold text-[#121c2a]">1. Thông tin người nhận gạo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#121c2a]">
                  Họ và tên người nhận <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
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
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#121c2a]">
                Địa chỉ giao hàng (số nhà, ngõ, tên đường, phường/xã) <span className="text-[#B91C1C]">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Số 45/12 Đường Số 8, Phường Linh Chiểu, TP. Thủ Đức..."
                className="w-full p-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </div>
          </section>

          {/* B. KHU VỰC VÀ PHÍ GIAO HÀNG */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D1D5DB]/40">
              <span className="material-symbols-outlined text-[#166534] text-[22px]">conveyor_belt</span>
              <h2 className="text-base font-bold text-[#121c2a]">2. Khu vực và biểu phí giao hàng</h2>
            </div>

            <div className="space-y-2.5">
              {deliveryZones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <label
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#166534] bg-[#DCFCE7]/40 ring-1 ring-[#166534]'
                        : 'border-[#D1D5DB]/60 bg-white hover:bg-[#eff4ff]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="deliveryZone"
                        checked={isSelected}
                        onChange={() => setSelectedZoneId(zone.id)}
                        className="mt-0.5 text-[#166534] focus:ring-[#166534]"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#121c2a] block">
                          {zone.name}
                        </span>
                        <span className="text-[11px] text-[#4B5563] block">
                          {zone.description || zone.estimatedDelivery}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#166534] shrink-0">
                      {Number(zone.fee).toLocaleString('vi-VN')}đ
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* C. PHƯƠNG THỨC THANH TOÁN */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D1D5DB]/40">
              <span className="material-symbols-outlined text-[#166534] text-[22px]">payments</span>
              <h2 className="text-base font-bold text-[#121c2a]">3. Phương thức thanh toán</h2>
            </div>

            <div className="space-y-2.5">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-[#166534] bg-[#DCFCE7]/40 ring-1 ring-[#166534]'
                    : 'border-[#D1D5DB]/60 bg-white hover:bg-[#eff4ff]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-[#166534] focus:ring-[#166534]"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#121c2a] flex items-center gap-1.5">
                    Thanh toán khi nhận gạo (COD)
                    <span className="px-2 py-0.2 rounded-full bg-[#ffdf9f] text-[#795900] text-[10px] font-bold">
                      Khuyên dùng
                    </span>
                  </span>
                  <span className="text-[11px] text-[#4B5563] block">
                    Khách mở bao kiểm tra chuẩn mùi thơm, hạt bóng mẩy rồi mới thanh toán tiền mặt cho nhân viên giao hàng.
                  </span>
                </div>
              </label>

              {/* Chuyển khoản */}
              <label
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-[#166534] bg-[#DCFCE7]/40 ring-1 ring-[#166534]'
                    : 'border-[#D1D5DB]/60 bg-white hover:bg-[#eff4ff]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  className="mt-0.5 text-[#166534] focus:ring-[#166534]"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#121c2a] block">
                    Chuyển khoản ngân hàng thủ công
                  </span>
                  <span className="text-[11px] text-[#4B5563] block">
                    Chuyển khoản trực tiếp tới số tài khoản cửa hàng sau khi đơn hàng được tạo.
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* D. GHI CHÚ */}
          <section className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-2">
            <label className="text-xs font-semibold text-[#121c2a] block">
              Ghi chú thêm cho nhân viên giao hàng (nếu có)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Giao giờ hành chính, chung cư tầng 8 bấm chuông..."
              className="w-full h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </section>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN & GỬI ĐƠN (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-5 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#D1D5DB]/40">
            <h2 className="text-base font-bold text-[#121c2a]">Đơn hàng của bạn</h2>
            <span className="text-xs text-[#166534] font-semibold">
              {displayBags} bao · {displayWeight.toFixed(1)} kg
            </span>
          </div>

          {/* Danh sách items nhỏ */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.skuId} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#eff4ff] overflow-hidden shrink-0 border border-[#D1D5DB]/40">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#121c2a] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#4B5563]">
                      {item.skuName} × {item.quantity} bao ({item.lineWeight} kg)
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#166534] shrink-0">
                  {item.lineTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>

          {/* Chi tiết tiền */}
          <div className="pt-3 border-t border-[#D1D5DB]/40 space-y-2 text-xs text-[#4B5563]">
            <div className="flex items-center justify-between">
              <span>Tiền hàng:</span>
              <span className="font-semibold text-[#121c2a]">
                {displaySubtotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cước phí giao hàng ({selectedZone?.name?.split('(')[0]?.trim()}):</span>
              <span className="font-semibold text-[#121c2a]">
                {displayFee.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="pt-2 border-t border-[#D1D5DB]/40 flex items-center justify-between text-base">
              <span className="font-bold text-[#121c2a]">Tổng thanh toán:</span>
              <span className="font-bold text-[#166534] text-xl">
                {displayTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || quoteLoading}
            className="w-full h-12 rounded-xl bg-[#166534] text-white font-bold text-sm hover:bg-[#14532D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Đang gửi đơn hàng...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Xác nhận đặt hàng ({displayTotal.toLocaleString('vi-VN')}đ)
              </span>
            )}
          </button>

          <p className="text-[11px] text-[#4B5563] text-center leading-relaxed">
            Nhấn "Xác nhận đặt hàng" đồng nghĩa với việc bạn đồng ý với các chính sách giao nhận và đổi trả của DucBel.
          </p>
        </div>
      </form>
    </div>
  );
};

