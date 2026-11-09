import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { LoadingSkeleton, ErrorState } from '../components/common/FeedbackStates';

export const OrderSuccessPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getOrderByCode(code);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [code]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Đơn hàng không tồn tại'} onRetry={fetchOrder} />
      </div>
    );
  }

  const createdDate = new Date(order.createdAt).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Checkout Stepper */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D5DB]/60 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#166534] -z-0"></div>
          {/* Step 1 */}
          <div className="flex items-center gap-1.5 bg-white px-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="text-xs font-medium text-[#121c2a] hidden sm:inline">Giỏ hàng</span>
          </div>
          {/* Step 2 */}
          <div className="flex items-center gap-1.5 bg-white px-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="text-xs font-medium text-[#121c2a] hidden sm:inline">Đặt hàng & Giao nhận</span>
          </div>
          {/* Step 3 */}
          <div className="flex items-center gap-1.5 bg-white px-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-[16px]">done_all</span>
            </div>
            <span className="text-xs font-bold text-[#166534]">Hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Main Success Confirmation Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#D1D5DB]/60 shadow-xs text-center space-y-6 relative overflow-hidden">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-[36px] sm:text-[44px]">check_circle</span>
        </div>

        <div className="space-y-1.5 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#166534] tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Cửa hàng DucBel đã ghi nhận đơn hàng của bạn. Bạn có thể theo dõi tiến trình xử lý trong mục{' '}
            <strong className="text-[#121c2a]">Đơn hàng của tôi</strong>.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="w-full bg-[#FFFBF2] rounded-xl p-4 border border-[#D1D5DB]/50 flex flex-wrap items-center justify-center sm:justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#4B5563]">Mã đơn hàng:</span>
            <span className="text-base font-bold text-[#166534]">{order.orderCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-[#DCFCE7] text-[#166534] text-xs font-semibold border border-[#D1D5DB]/60 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Thời gian đặt: <strong className="text-[#121c2a]">{createdDate}</strong></span>
          </div>
        </div>

        {/* Dual Distinct Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Trạng thái đơn */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffdf9f] text-[#795900] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
            <span>Trạng thái đơn: {order.orderStatus === 'PENDING' ? 'Chờ xác nhận' : order.orderStatus}</span>
          </div>

          {/* Trạng thái thanh toán */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dee9fc] text-[#121c2a] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#4B5563]">pending_actions</span>
            <span>
              Thanh toán:{' '}
              {order.paymentStatus === 'PAID'
                ? 'Đã thanh toán'
                : `Chưa thanh toán (${order.paymentMethod === 'COD' ? 'Đối soát COD' : 'Chờ chuyển khoản'})`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={`/tai-khoan/don-hang/${order.id}`}
            className="inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-xl bg-[#166534] text-white font-semibold text-sm hover:bg-[#14532D] shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Xem chi tiết đơn hàng</span>
          </Link>
          <Link
            to="/san-pham"
            className="inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-xl bg-white hover:bg-[#eff4ff] text-[#166534] font-semibold text-sm border border-[#D1D5DB] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>
      </div>

      {/* Snapshot chi tiết đơn hàng */}
      <div className="bg-white rounded-2xl p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider pb-2 border-b border-[#D1D5DB]/40">
          Thông tin giao hàng & Dòng sản phẩm
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#4B5563] block">Người nhận:</span>
            <strong className="text-sm text-[#121c2a]">{order.recipientName} ({order.recipientPhone})</strong>
            <span className="text-[#4B5563] block mt-1">Địa chỉ nhận hàng:</span>
            <p className="text-[#121c2a] font-medium leading-relaxed">{order.recipientAddress}</p>
          </div>
          <div>
            <span className="text-[#4B5563] block">Khu vực:</span>
            <strong className="text-sm text-[#121c2a]">{order.deliveryZone?.name || 'Khu vực tiêu chuẩn'}</strong>
            <span className="text-[#4B5563] block mt-1">Hình thức thanh toán:</span>
            <strong className="text-[#166534]">
              {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản thủ công'}
            </strong>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D1D5DB]/40 space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-1">
              <div>
                <strong className="text-[#121c2a]">{item.productName}</strong>
                <span className="text-[#4B5563] ml-2">({item.skuName} × {item.quantity} bao)</span>
              </div>
              <strong className="text-[#166534]">{Number(item.lineTotal).toLocaleString('vi-VN')}đ</strong>
            </div>
          ))}
          <div className="pt-2 border-t border-[#D1D5DB]/30 flex items-center justify-between text-sm font-bold">
            <span className="text-[#121c2a]">Tổng thanh toán:</span>
            <span className="text-[#166534] text-base">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

