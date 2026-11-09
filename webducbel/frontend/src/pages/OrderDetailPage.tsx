import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton, ErrorState } from '../components/common/FeedbackStates';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/dang-nhap?redirect=/tai-khoan/don-hang/${id}`);
    }
  }, [authLoading, isAuthenticated, id, navigate]);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const handleCopyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await api.orders.cancelOrder(order.id, cancelReason);
      setCancelModalOpen(false);
      setActionMessage(res.message);
      fetchOrder();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!order) return;
    if (!window.confirm('Quý khách đã kiểm tra đầy đủ bao gạo và xác nhận nhận hàng?')) return;

    setActionLoading(true);
    try {
      const res = await api.orders.confirmReceipt(order.id);
      setActionMessage(res.message);
      fetchOrder();
    } catch (err: any) {
      alert(err.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Đơn hàng không tồn tại'} onRetry={fetchOrder} />
      </div>
    );
  }

  // Xác định bước tiến trình (Shopee style 5 milestones)
  const getMilestoneIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
      case 'PACKING':
        return 2;
      case 'DELIVERING':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getMilestoneIndex(order.orderStatus);

  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'CANCEL_REQUESTED';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Meta Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D5DB]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#4B5563]">
          <Link
            to="/tai-khoan/don-hang"
            className="inline-flex items-center gap-1 font-bold text-[#166534] hover:text-[#14532D]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại Đơn hàng của tôi</span>
          </Link>
          <span className="text-[#D1D5DB]">•</span>
          <span>Mã đơn: <strong className="text-[#121c2a] text-sm">{order.orderCode}</strong></span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 text-[#166534] hover:bg-[#DCFCE7] rounded transition-colors cursor-pointer"
            title="Sao chép mã đơn"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
          {copied && <span className="text-[11px] bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded font-bold">Đã chép!</span>}
        </div>

        {/* 2 Badges trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#166534] text-white text-xs font-bold shadow-xs">
            {order.orderStatus === 'PENDING'
              ? 'CHỜ XÁC NHẬN'
              : order.orderStatus === 'CONFIRMED'
              ? 'ĐÃ XÁC NHẬN'
              : order.orderStatus === 'PACKING'
              ? 'ĐANG ĐÓNG GÓI'
              : order.orderStatus === 'DELIVERING'
              ? 'ĐANG GIAO HÀNG'
              : order.orderStatus === 'DELIVERED'
              ? 'ĐÃ GIAO HÀNG'
              : order.orderStatus === 'COMPLETED'
              ? 'HOÀN TẤT'
              : order.orderStatus === 'CANCEL_REQUESTED'
              ? 'YÊU CẦU HỦY'
              : 'ĐÃ HỦY'}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#ffdf9f] text-[#795900] text-xs font-semibold shadow-xs">
            {order.paymentStatus === 'PAID'
              ? 'ĐÃ THANH TOÁN'
              : `Chưa thanh toán (${order.paymentMethod === 'COD' ? 'Đối soát COD' : 'Chuyển khoản'})`}
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] text-[#166534] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-sm font-bold">✕</button>
        </div>
      )}

      {/* Shopee-Style Visual Stepper Card */}
      {!isCancelled ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D1D5DB]/60 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className={`flex md:flex-col items-center md:text-center gap-3 ${currentStep >= 1 ? 'text-[#166534]' : 'text-[#4B5563] opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? 'bg-[#166534] text-white shadow-xs' : 'bg-[#dee9fc]'}`}>
                <span className="material-symbols-outlined text-[20px]">receipt</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121c2a]">Đã đặt hàng</p>
                <p className="text-[11px] text-[#4B5563]">Đã tiếp nhận</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex md:flex-col items-center md:text-center gap-3 ${currentStep >= 2 ? 'text-[#166534]' : 'text-[#4B5563] opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? 'bg-[#166534] text-white shadow-xs' : 'bg-[#dee9fc]'}`}>
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121c2a]">Đang chuẩn bị</p>
                <p className="text-[11px] text-[#4B5563]">Đóng bao 3 lớp</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex md:flex-col items-center md:text-center gap-3 ${currentStep >= 3 ? 'text-[#166534]' : 'text-[#4B5563] opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? 'bg-[#166534] text-white shadow-xs ring-4 ring-[#DCFCE7]' : 'bg-[#dee9fc]'}`}>
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121c2a]">Đang giao hàng</p>
                <p className="text-[11px] text-[#4B5563]">Xe giao DucBel</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`flex md:flex-col items-center md:text-center gap-3 ${currentStep >= 4 ? 'text-[#166534]' : 'text-[#4B5563] opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 4 ? 'bg-[#166534] text-white shadow-xs' : 'bg-[#dee9fc]'}`}>
                <span className="material-symbols-outlined text-[20px]">package_2</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121c2a]">Đã giao hàng</p>
                <p className="text-[11px] text-[#4B5563]">Giao tận cửa bếp</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className={`flex md:flex-col items-center md:text-center gap-3 ${currentStep >= 5 ? 'text-[#166534]' : 'text-[#4B5563] opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 5 ? 'bg-[#166534] text-white shadow-xs' : 'bg-[#dee9fc]'}`}>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121c2a]">Hoàn tất</p>
                <p className="text-[11px] text-[#4B5563]">Đã nghiệm thu</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#ffdad6]/30 border border-[#ba1a1a]/30 rounded-2xl p-5 text-center">
          <p className="text-sm font-bold text-[#ba1a1a]">
            {order.orderStatus === 'CANCEL_REQUESTED'
              ? 'Đang có yêu cầu hủy đơn hàng. Cửa hàng đang xử lý trước khi xuất kho.'
              : 'Đơn hàng này đã bị hủy.'}
          </p>
        </div>
      )}

      {/* Main Grid: Chi tiết & Thông tin người nhận */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2 cols): BẢNG DÒNG HÀNG */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider pb-3 border-b border-[#D1D5DB]/40">
            Chi tiết các loại gạo trong đơn ({order.totalBags} bao · {order.totalWeightKg} kg)
          </h3>

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-[#D1D5DB]/30 last:border-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-14 rounded-lg bg-[#eff4ff] overflow-hidden shrink-0 border border-[#D1D5DB]/40">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#121c2a]">{item.productName}</h4>
                    <p className="text-xs text-[#4B5563]">
                      Quy cách: <span className="font-semibold text-[#166534]">{item.skuName}</span> (Mã: {item.skuCode})
                    </p>
                    <p className="text-[11px] text-[#4B5563]">
                      Số lượng: {item.quantity} bao × {Number(item.unitPrice).toLocaleString('vi-VN')}đ ({item.lineWeight} kg)
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#166534]">
                    {Number(item.lineTotal).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chi tiết tính tiền */}
          <div className="pt-4 border-t border-[#D1D5DB]/40 space-y-2 text-xs text-[#4B5563]">
            <div className="flex justify-between">
              <span>Tiền hàng:</span>
              <span className="font-semibold text-[#121c2a]">{Number(order.subtotal).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển ({order.deliveryZone?.name}):</span>
              <span className="font-semibold text-[#121c2a]">{Number(order.deliveryFee).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="pt-2 border-t border-[#D1D5DB]/40 flex justify-between text-base font-bold text-[#121c2a]">
              <span>Tổng thanh toán:</span>
              <span className="text-lg text-[#166534]">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1 col): THÔNG TIN GIAO & HÀNH ĐỘNG */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider pb-2 border-b border-[#D1D5DB]/40">
              Thông tin nhận hàng
            </h3>
            <div>
              <span className="text-[#4B5563] block">Người nhận:</span>
              <strong className="text-sm text-[#121c2a]">{order.recipientName}</strong>
              <p className="text-[#121c2a] font-semibold">{order.recipientPhone}</p>
            </div>
            <div>
              <span className="text-[#4B5563] block">Địa chỉ nhận gạo:</span>
              <p className="text-[#121c2a] leading-relaxed">{order.recipientAddress}</p>
            </div>
            <div>
              <span className="text-[#4B5563] block">Ghi chú giao hàng:</span>
              <p className="text-[#121c2a] italic">{order.note || 'Không có ghi chú'}</p>
            </div>
          </div>

          {/* Hành động người dùng */}
          <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider pb-2 border-b border-[#D1D5DB]/40">
              Thao tác đơn hàng
            </h3>

            {/* Khi PENDING hoặc CONFIRMED/PACKING: Cho phép hủy / gửi yêu cầu hủy */}
            {(order.orderStatus === 'PENDING' ||
              order.orderStatus === 'CONFIRMED' ||
              order.orderStatus === 'PACKING') && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-[#B91C1C] text-[#B91C1C] font-semibold text-xs hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
              >
                {order.orderStatus === 'PENDING' ? 'Hủy đơn hàng này' : 'Yêu cầu hủy đơn hàng'}
              </button>
            )}

            {/* Khi DELIVERED: Khách xác nhận nhận hàng */}
            {order.orderStatus === 'DELIVERED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReceipt}
                className="w-full py-2.5 rounded-xl bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] shadow-xs transition-colors cursor-pointer"
              >
                Xác nhận đã nhận đủ gạo
              </button>
            )}

            {order.orderStatus === 'COMPLETED' && (
              <p className="text-xs text-[#166534] font-semibold text-center py-2 bg-[#DCFCE7] rounded-xl">
                Đơn hàng đã hoàn tất thành công. Cảm ơn quý khách!
              </p>
            )}

            <Link
              to="/san-pham"
              className="w-full py-2.5 rounded-xl bg-[#eff4ff] text-[#166534] font-semibold text-xs text-center block hover:bg-[#DCFCE7] transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Timeline Lịch sử đơn */}
          {order.histories && order.histories.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-bold text-[#121c2a] uppercase tracking-wider pb-2 border-b border-[#D1D5DB]/40">
                Lịch sử xử lý đơn
              </h3>
              <div className="space-y-3">
                {order.histories.map((h) => {
                  const time = new Date(h.createdAt).toLocaleString('vi-VN');
                  return (
                    <div key={h.id} className="relative pl-4 border-l-2 border-[#166534] text-xs space-y-0.5">
                      <p className="font-bold text-[#121c2a]">{h.nextStatus}</p>
                      <p className="text-[11px] text-[#4B5563]">{h.note}</p>
                      <span className="text-[10px] text-[#795900] block">{time} ({h.actionByRole})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Hủy Đơn */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#121c2a]">Xác nhận hủy đơn hàng</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng <strong>{order.orderCode}</strong> không? Vui lòng cho biết lý do hủy để cửa hàng phục vụ tốt hơn.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Đổi ý chọn loại gạo khác, nhập sai địa chỉ..."
              className="w-full p-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#eff4ff] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

