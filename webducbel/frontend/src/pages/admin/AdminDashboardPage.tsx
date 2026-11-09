import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order, Product } from '../../types';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month'>('month');

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderList, prodRes] = await Promise.all([
        api.orders.getStaffOrders(),
        api.catalog.getProducts({ limit: 50 }),
      ]);
      setOrders(orderList || []);
      setProducts(prodRes.items || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Tính toán KPI thực tế từ dữ liệu đơn hàng
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED') {
      return sum + Number(o.totalAmount || 0);
    }
    return sum;
  }, 0);

  const totalBagsSold = orders.reduce((sum, o) => {
    if (o.orderStatus !== 'CANCELLED') {
      return sum + Number(o.totalBags || 0);
    }
    return sum;
  }, 0);

  const totalKgSold = orders.reduce((sum, o) => {
    if (o.orderStatus !== 'CANCELLED') {
      return sum + Number(o.totalWeightKg || 0);
    }
    return sum;
  }, 0);

  const totalAvailableStock = products.reduce((sum, p) => {
    return sum + (p.skus?.reduce((skuSum, s) => skuSum + Number(s.stock || 0), 0) || 0);
  }, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING');

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#424754] mb-1">
            <span>Tổng quan</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#191b23] font-semibold">Báo cáo & Phân tích chuyên sâu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#191b23] tracking-tight">
            Bảng điều khiển kinh doanh DucBel
          </h1>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center bg-[#f2f3fd] p-1 rounded-xl border border-[#c2c6d6]/60 self-start md:self-auto text-xs">
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeFilter === 'today'
                ? 'bg-white text-[#0058be] shadow-xs'
                : 'text-[#424754] hover:text-[#191b23]'
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('7days')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeFilter === '7days'
                ? 'bg-white text-[#0058be] shadow-xs'
                : 'text-[#424754] hover:text-[#191b23]'
            }`}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeFilter === 'month'
                ? 'bg-white text-[#0058be] shadow-xs'
                : 'text-[#424754] hover:text-[#191b23]'
            }`}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Doanh thu */}
        <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#424754] mb-2">
            <span className="text-xs font-semibold">Doanh thu ghi nhận</span>
            <div className="w-8 h-8 rounded-lg bg-[#d8e2ff] text-[#0058be] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191b23]">
              {totalRevenue.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-[11px] text-[#166534] font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              Đơn COD đã thu & Chuyển khoản
            </p>
          </div>
        </div>

        {/* KPI 2: Tổng số đơn */}
        <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#424754] mb-2">
            <span className="text-xs font-semibold">Tổng đơn hàng</span>
            <div className="w-8 h-8 rounded-lg bg-[#dae2fd] text-[#565e74] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191b23]">{orders.length}</p>
            <p className="text-[11px] text-[#795900] font-medium mt-1">
              {pendingOrders.length} đơn đang chờ duyệt
            </p>
          </div>
        </div>

        {/* KPI 3: Khối lượng bán */}
        <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#424754] mb-2">
            <span className="text-xs font-semibold">Khối lượng gạo bán</span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">scale</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191b23]">{totalKgSold.toFixed(1)} kg</p>
            <p className="text-[11px] text-[#424754] font-medium mt-1">
              Tương đương <strong>{totalBagsSold}</strong> bao đóng gói
            </p>
          </div>
        </div>

        {/* KPI 4: Tồn kho sẵn sàng */}
        <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#424754] mb-2">
            <span className="text-xs font-semibold">Tồn kho sẵn sàng</span>
            <div className="w-8 h-8 rounded-lg bg-[#ffdcc6] text-[#924700] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warehouse</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191b23]">{totalAvailableStock} bao</p>
            <p className="text-[11px] text-[#166534] font-medium mt-1">
              Phân bổ trên {products.length} dòng gạo
            </p>
          </div>
        </div>
      </div>

      {/* Grid 2 cột: Biểu đồ & Đơn hàng mới nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (5 cols): Biểu đồ Doughnut tỉ lệ sản phẩm */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#c2c6d6]/60 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#191b23] uppercase tracking-wider pb-3 border-b border-[#c2c6d6]/40">
            Cơ cấu các dòng gạo bán ra
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {/* Doughnut Chart Canvas */}
            <div
              className="w-40 h-40 rounded-full relative flex items-center justify-center shadow-inner shrink-0"
              style={{
                background:
                  'conic-gradient(#0058be 0% 50%, #2170e4 50% 75%, #565e74 75% 90%, #d8d9e3 90% 100%)',
              }}
            >
              <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[11px] text-[#424754]">Tổng đã bán</span>
                <span className="text-base font-bold text-[#191b23]">{totalBagsSold} bao</span>
              </div>
            </div>

            {/* Chú giải Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0058be]"></span>
                <span className="text-[#191b23] font-semibold">Gạo ST25 Thượng Hạng (50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2170e4]"></span>
                <span className="text-[#191b23] font-semibold">Gạo Thơm Lài Sữa (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#565e74]"></span>
                <span className="text-[#191b23] font-semibold">Gạo Nàng Hoa (15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d8d9e3]"></span>
                <span className="text-[#191b23] font-semibold">Gạo Lứt & Khác (10%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 cols): Danh sách đơn hàng mới nhất */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-[#c2c6d6]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40">
            <h2 className="text-sm font-bold text-[#191b23] uppercase tracking-wider">
              Đơn hàng gần đây ({orders.length})
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#0058be] hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-[#c2c6d6]/40 bg-[#f9f9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[#0058be]/50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#0058be]">{order.orderCode}</span>
                    <span className="text-[#c2c6d6]">•</span>
                    <span className="font-semibold text-[#191b23]">{order.recipientName}</span>
                    <span className="text-[#424754]">({order.recipientPhone})</span>
                  </div>
                  <p className="text-[11px] text-[#424754]">
                    {order.totalBags} bao · {order.totalWeightKg} kg •{' '}
                    <strong className="text-[#166534]">
                      {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#166534]">
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="p-1.5 rounded-lg bg-white border border-[#c2c6d6] text-[#0058be] hover:bg-[#d8e2ff] transition-colors"
                    title="Xem chi tiết"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

