import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/FeedbackStates';

export const StaffOrdersPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/dang-nhap?redirect=/nhan-vien/don-hang');
      } else if (user && user.role !== 'STAFF' && user.role !== 'ADMIN') {
        setError('Bạn không có quyền truy cập khu vực xử lý đơn của nhân viên.');
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const fetchStaffOrders = async () => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getStaffOrders(selectedStatus || undefined);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
      fetchStaffOrders();
    }
  }, [user, selectedStatus]);

  const handleTransition = async (orderId: string, nextStatus: OrderStatus, noteText: string) => {
    setActionLoadingId(orderId);
    try {
      await api.orders.transitionStatus(orderId, nextStatus, noteText, user?.id);
      await fetchStaffOrders();
    } catch (err: any) {
      alert(err.message || 'Chuyển trạng thái thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!authLoading && user && user.role !== 'STAFF' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message="Tài khoản của bạn là Khách hàng. Chỉ Nhân viên hoặc Quản trị viên mới có thể xử lý đơn hàng nội bộ." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#795900] flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Khu vực nghiệp vụ nhân viên cửa hàng
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
            Quản lý & Xử lý đơn hàng DucBel
          </h1>
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#4B5563]">Lọc trạng thái:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] text-[#121c2a]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận (PENDING)</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="PACKING">Đang đóng gói (PACKING)</option>
            <option value="DELIVERING">Đang giao hàng (DELIVERING)</option>
            <option value="CANCEL_REQUESTED">Yêu cầu hủy (CANCEL_REQUESTED)</option>
            <option value="DELIVERED">Đã giao hàng (DELIVERED)</option>
            <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStaffOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không có đơn hàng nào cần xử lý"
          description="Hiện tại không có đơn hàng nào khớp với trạng thái đã chọn."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isProcessing = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-4 hover:shadow-md transition-all"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D1D5DB]/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#166534] text-base">{order.orderCode}</span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="text-[#4B5563]">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534]">
                      {order.orderStatus}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eff4ff] text-[#121c2a]">
                      {order.paymentStatus === 'PAID' ? 'Đã thu tiền' : `Chưa thanh toán (${order.paymentMethod})`}
                    </span>
                  </div>
                </div>

                {/* Thông tin khách & Hàng hóa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[#4B5563]">
                      Người nhận: <strong className="text-[#121c2a]">{order.recipientName}</strong> ({order.recipientPhone})
                    </p>
                    <p className="text-[#4B5563]">
                      Địa chỉ: <span className="text-[#121c2a]">{order.recipientAddress}</span>
                    </p>
                    {order.note && (
                      <p className="text-[#795900] bg-[#ffdf9f]/30 p-2 rounded-lg">
                        Ghi chú: {order.note}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[#4B5563]">
                      Tổng đơn: <strong className="text-[#166534] text-sm">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</strong> ({order.totalBags} bao · {order.totalWeightKg} kg)
                    </p>
                    <div className="text-[11px] text-[#4B5563]">
                      {order.items?.map((it) => (
                        <div key={it.id}>
                          • {it.productName} - {it.skuName} × {it.quantity} bao ({it.lineWeight} kg)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hành động nhân viên */}
                <div className="pt-3 border-t border-[#D1D5DB]/40 flex flex-wrap items-center justify-end gap-2">
                  {order.orderStatus === 'PENDING' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleTransition(order.id, 'CONFIRMED', 'Nhân viên xác nhận đơn và kiểm tra tồn kho')}
                      className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Xác nhận đơn (CONFIRMED)
                    </button>
                  )}

                  {order.orderStatus === 'CONFIRMED' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleTransition(order.id, 'PACKING', 'Nhân viên đóng bao bì PE 3 lớp chống ẩm')}
                      className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Bắt đầu đóng gói (PACKING)
                    </button>
                  )}

                  {order.orderStatus === 'PACKING' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleTransition(order.id, 'DELIVERING', 'Đã xuất kho bàn giao nhân viên giao hàng')}
                      className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Xuất kho giao hàng (DELIVERING)
                    </button>
                  )}

                  {order.orderStatus === 'DELIVERING' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleTransition(order.id, 'DELIVERED', 'Đã giao gạo tận cửa thành công và thu tiền COD')}
                      className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Đã giao & Thu tiền COD (DELIVERED)
                    </button>
                  )}

                  {order.orderStatus === 'CANCEL_REQUESTED' && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleTransition(order.id, 'CANCELLED', 'Nhân viên duyệt yêu cầu hủy và hoàn tồn kho')}
                        className="px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991b1b] shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        Duyệt hủy đơn (CANCELLED)
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleTransition(order.id, 'CONFIRMED', 'Từ chối hủy do đã chuẩn bị xong')}
                        className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#166534] text-xs font-bold hover:bg-[#DCFCE7] shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        Từ chối hủy, tiếp tục đơn
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

