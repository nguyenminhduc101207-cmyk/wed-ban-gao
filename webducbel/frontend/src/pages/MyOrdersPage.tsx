import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/FeedbackStates';

export const MyOrdersPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/dang-nhap?redirect=/tai-khoan/don-hang');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const filterTabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'PROCESSING', label: 'Đang chuẩn bị' },
    { key: 'DELIVERING', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Đã giao' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PROCESSING') {
      return o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKING';
    }
    return o.orderStatus === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full bg-[#ffdf9f] text-[#795900] text-xs font-semibold">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#166534] text-xs font-semibold">Đã xác nhận</span>;
      case 'PACKING':
        return <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#166534] text-xs font-semibold">Đang đóng gói</span>;
      case 'DELIVERING':
        return <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-bold animate-pulse">Đang giao hàng</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full bg-[#166534] text-white text-xs font-bold">Đã giao hàng</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-[#166534] text-white text-xs font-bold">Hoàn tất</span>;
      case 'CANCEL_REQUESTED':
        return <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">Yêu cầu hủy</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ASIDE: SIDEBAR TÀI KHOẢN */}
        <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#D1D5DB]/40">
            <div className="w-11 h-11 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold text-base shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-[#121c2a] truncate">{user?.fullName}</h2>
              <p className="text-xs text-[#4B5563] truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/tai-khoan/don-hang"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Đơn hàng của tôi</span>
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#B91C1C] hover:bg-[#ffdad6]/40 transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* MAIN: DANH SÁCH ĐƠN HÀNG */}
        <main className="flex-1 min-w-0 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs">
            <h1 className="text-xl font-bold text-[#121c2a] mb-4">Đơn hàng của tôi</h1>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D1D5DB]/40">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'text-[#4B5563] hover:bg-[#eff4ff]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchOrders} />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              title="Không có đơn hàng nào"
              description={
                activeTab === 'ALL'
                  ? 'Bạn chưa đặt đơn hàng nào tại DucBel. Hãy khám phá kho gạo mới thơm lành nhé.'
                  : 'Không có đơn hàng nào ở trạng thái này.'
              }
              actionText="Khám phá kho gạo"
              onAction={() => navigate('/san-pham')}
            />
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const createdDate = new Date(order.createdAt).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-4 hover:shadow-md transition-all"
                  >
                    {/* Header đơn */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D1D5DB]/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#166534] text-sm">
                          {order.orderCode}
                        </span>
                        <span className="text-[#D1D5DB]">•</span>
                        <span className="text-[#4B5563]">{createdDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.orderStatus)}
                        <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#121c2a] text-[11px] font-semibold">
                          {order.paymentStatus === 'PAID' ? 'Đã trả tiền' : 'Chưa thanh toán'}
                        </span>
                      </div>
                    </div>

                    {/* Dòng hàng tóm tắt */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#166534]">
                              inventory_2
                            </span>
                            <span className="font-bold text-[#121c2a]">{item.productName}</span>
                            <span className="text-[#4B5563]">
                              ({item.skuName} × {item.quantity} bao · {item.lineWeight} kg)
                            </span>
                          </div>
                          <span className="font-semibold text-[#121c2a]">
                            {Number(item.lineTotal).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer đơn */}
                    <div className="pt-3 border-t border-[#D1D5DB]/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#4B5563]">
                        Người nhận: <strong className="text-[#121c2a]">{order.recipientName}</strong> ({order.recipientPhone})
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-[#4B5563] block">Tổng thanh toán:</span>
                          <span className="text-base font-bold text-[#166534]">
                            {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <Link
                          to={`/tai-khoan/don-hang/${order.id}`}
                          className="px-4 py-2 rounded-xl bg-[#DCFCE7] text-[#166534] text-xs font-bold hover:bg-[#166534] hover:text-white transition-all shadow-xs"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

