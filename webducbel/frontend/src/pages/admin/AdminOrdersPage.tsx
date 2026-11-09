import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/FeedbackStates';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getStaffOrders();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTransition = async (orderId: string, nextStatus: OrderStatus, note: string) => {
    setActionLoadingId(orderId);
    try {
      await api.orders.transitionStatus(orderId, nextStatus, note);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'ALL' || o.orderStatus === filterStatus;
    const matchSearch =
      !searchQuery.trim() ||
      o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientPhone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#424754] mb-1">
            <Link to="/admin" className="hover:text-[#0058be]">Tổng quan</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#191b23] font-semibold">Quản lý Đơn hàng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#191b23]">
            Danh sách Đơn hàng toàn hệ thống ({orders.length})
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#424754] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, họ tên, SĐT..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: 'Chờ duyệt' },
          { key: 'CONFIRMED', label: 'Đã xác nhận' },
          { key: 'PACKING', label: 'Đang đóng gói' },
          { key: 'DELIVERING', label: 'Đang giao' },
          { key: 'DELIVERED', label: 'Đã giao' },
          { key: 'COMPLETED', label: 'Hoàn tất' },
          { key: 'CANCEL_REQUESTED', label: 'Yêu cầu hủy' },
          { key: 'CANCELLED', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'text-[#424754] hover:bg-[#f2f3fd]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description="Hiện không có đơn hàng nào khớp với bộ lọc hoặc từ khóa tìm kiếm."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f3fd] text-[#424754] uppercase tracking-wider font-semibold border-b border-[#c2c6d6]/40">
                <tr>
                  <th className="py-3.5 px-4">Mã đơn</th>
                  <th className="py-3.5 px-4">Ngày đặt</th>
                  <th className="py-3.5 px-4">Khách hàng / SĐT</th>
                  <th className="py-3.5 px-4">Quy cách & Khối lượng</th>
                  <th className="py-3.5 px-4">Tổng tiền</th>
                  <th className="py-3.5 px-4">Trạng thái đơn</th>
                  <th className="py-3.5 px-4">Thanh toán</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
                {filteredOrders.map((order) => {
                  const isActing = actionLoadingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0058be]">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderCode}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[#424754]">
                        {new Date(order.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold">{order.recipientName}</p>
                        <p className="text-[11px] text-[#424754]">{order.recipientPhone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#166534]">{order.totalBags} bao</span>
                        <span className="text-[#424754]"> · {order.totalWeightKg} kg</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#166534]">
                        {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#dae2fd] text-[#131b2e]">
                          {order.paymentStatus === 'PAID' ? 'Đã thu tiền' : `Chưa thu (${order.paymentMethod})`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {order.orderStatus === 'PENDING' && (
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => handleTransition(order.id, 'CONFIRMED', 'Admin duyệt đơn')}
                              className="px-2.5 py-1 rounded-lg bg-[#0058be] text-white text-[11px] font-bold hover:bg-[#2170e4] cursor-pointer disabled:opacity-50"
                            >
                              Duyệt
                            </button>
                          )}
                          {order.orderStatus === 'CANCEL_REQUESTED' && (
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => handleTransition(order.id, 'CANCELLED', 'Admin đồng ý hủy đơn')}
                              className="px-2.5 py-1 rounded-lg bg-[#ba1a1a] text-white text-[11px] font-bold hover:bg-[#93000a] cursor-pointer disabled:opacity-50"
                            >
                              Duyệt hủy
                            </button>
                          )}
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-1.5 rounded-lg border border-[#c2c6d6] text-[#424754] hover:bg-[#f2f3fd] hover:text-[#0058be] transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

