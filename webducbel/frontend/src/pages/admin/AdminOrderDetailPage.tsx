import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState<OrderStatus>('CONFIRMED');
  const [transitionNote, setTransitionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getOrderById(id);
      setOrder(data);
      if (data) {
        setNextStatus(data.orderStatus);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmitting(true);
    try {
      await api.orders.transitionStatus(order.id, nextStatus, transitionNote);
      setToastMessage('Cập nhật trạng thái đơn hàng thành công');
      setTransitionNote('');
      await fetchOrderDetail();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (error || !order) {
    return <ErrorState message={error || 'Đơn hàng không tồn tại'} onRetry={fetchOrderDetail} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#424754] mb-1">
            <Link to="/admin/orders" className="hover:text-[#0058be] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Danh sách Đơn hàng</span>
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#191b23] font-semibold">{order.orderCode}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#191b23]">
            Chi tiết Đơn hàng: <span className="text-[#0058be]">{order.orderCode}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534]">
            {order.orderStatus}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#dae2fd] text-[#131b2e]">
            {order.paymentStatus === 'PAID' ? 'Đã thu tiền' : 'Chưa thanh toán'}
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#166534] text-xs font-bold flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (8 cols): THÔNG TIN SẢN PHẨM & DÒNG HÀNG */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-[#191b23] uppercase tracking-wider pb-3 border-b border-[#c2c6d6]/40">
            Dòng sản phẩm ({order.totalBags} bao · {order.totalWeightKg} kg)
          </h2>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-[#c2c6d6]/30 last:border-0 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-16 rounded-xl bg-[#f2f3fd] overflow-hidden shrink-0 border border-[#c2c6d6]/50">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#191b23]">{item.productName}</h3>
                    <p className="text-[#424754]">
                      Quy cách: <strong className="text-[#0058be]">{item.skuName}</strong> (Mã: {item.skuCode})
                    </p>
                    <p className="text-[11px] text-[#424754] mt-0.5">
                      Số lượng: <strong>{item.quantity} bao</strong> × {Number(item.unitPrice).toLocaleString('vi-VN')}đ ({item.lineWeight} kg)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#166534]">
                    {Number(item.lineTotal).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chi tiết tiền */}
          <div className="pt-4 border-t border-[#c2c6d6]/40 space-y-2 text-xs text-[#424754]">
            <div className="flex justify-between">
              <span>Tiền hàng tạm tính:</span>
              <span className="font-semibold text-[#191b23]">{Number(order.subtotal).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Cước phí vận chuyển ({order.deliveryZone?.name || 'Khu vực'}):</span>
              <span className="font-semibold text-[#191b23]">{Number(order.deliveryFee).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="pt-2 border-t border-[#c2c6d6]/40 flex justify-between text-base font-bold text-[#191b23]">
              <span>Tổng thanh toán đơn hàng:</span>
              <span className="text-xl text-[#166534]">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (4 cols): KHÁCH HÀNG & QUẢN TRỊ TRẠNG THÁI */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form chuyển trạng thái */}
          <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-[#191b23] uppercase tracking-wider pb-2 border-b border-[#c2c6d6]/40">
              Quản trị trạng thái đơn hàng
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#191b23]">Chuyển sang trạng thái:</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="w-full h-10 px-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be] text-[#191b23]"
                >
                  <option value="PENDING">PENDING - Chờ xác nhận</option>
                  <option value="CONFIRMED">CONFIRMED - Đã xác nhận</option>
                  <option value="PACKING">PACKING - Đang đóng gói</option>
                  <option value="DELIVERING">DELIVERING - Đang giao hàng</option>
                  <option value="DELIVERED">DELIVERED - Đã giao hàng</option>
                  <option value="COMPLETED">COMPLETED - Hoàn tất</option>
                  <option value="CANCELLED">CANCELLED - Hủy đơn</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#191b23]">Ghi chú thao tác (tùy chọn):</label>
                <input
                  type="text"
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="Ghi chú cập nhật..."
                  className="w-full h-10 px-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-xl bg-[#0058be] text-white font-bold text-xs hover:bg-[#2170e4] shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
              </button>
            </form>
          </div>

          {/* Thông tin người nhận */}
          <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-bold text-[#191b23] uppercase tracking-wider pb-2 border-b border-[#c2c6d6]/40">
              Thông tin người nhận gạo
            </h2>
            <div className="space-y-1">
              <span className="text-[#424754]">Họ và tên:</span>
              <p className="font-bold text-[#191b23] text-sm">{order.recipientName}</p>
              <p className="text-[#0058be] font-semibold">{order.recipientPhone}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#424754]">Địa chỉ giao:</span>
              <p className="text-[#191b23] leading-relaxed">{order.recipientAddress}</p>
            </div>
            {order.note && (
              <div className="space-y-1 pt-2 border-t border-[#c2c6d6]/30">
                <span className="text-[#795900] font-semibold">Ghi chú của khách:</span>
                <p className="text-[#424754] italic">{order.note}</p>
              </div>
            )}
          </div>

          {/* Timeline Lịch sử xử lý */}
          {order.histories && order.histories.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs space-y-3 text-xs">
              <h2 className="text-xs font-bold text-[#191b23] uppercase tracking-wider pb-2 border-b border-[#c2c6d6]/40">
                Timeline Lịch sử đơn
              </h2>
              <div className="space-y-3">
                {order.histories.map((h) => (
                  <div key={h.id} className="relative pl-3.5 border-l-2 border-[#0058be] space-y-0.5">
                    <p className="font-bold text-[#191b23]">{h.nextStatus}</p>
                    <p className="text-[11px] text-[#424754]">{h.note}</p>
                    <span className="text-[10px] text-[#795900] block">
                      {new Date(h.createdAt).toLocaleString('vi-VN')} ({h.actionByRole})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

