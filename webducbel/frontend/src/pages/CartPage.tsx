import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/FeedbackStates';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalBags,
    totalWeightKg,
    subtotal,
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="shopping_bag"
          title="Giỏ hàng của bạn đang trống"
          description="Bạn chưa chọn loại gạo nào. Hãy khám phá kho gạo mới vụ mùa thơm ngon, ngọt lành cho bữa cơm gia đình nhé."
          actionText="Tiếp tục chọn gạo"
          onAction={() => navigate('/san-pham')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-[#4B5563]">
          <Link
            to="/san-pham"
            className="inline-flex items-center gap-1 font-semibold text-[#166534] hover:text-[#14532D]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Tiếp tục chọn gạo</span>
          </Link>
          <span>/</span>
          <span>Chi tiết đơn hàng đang chọn</span>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs text-[#4B5563] hover:text-[#B91C1C] px-3 py-1.5 rounded-lg hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
          <span>Xóa toàn bộ giỏ</span>
        </button>
      </div>

      {/* Page Header & Agrarian Quick Stats Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#D1D5DB]/40">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#795900] flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">agriculture</span>
            Kho Gạo Sạch Thuần Nông
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] tracking-tight">
            Giỏ hàng của bạn
          </h1>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-[#D1D5DB]/60 shadow-xs text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffc329]"></span>
            <span className="font-bold text-[#166534]">{items.length} quy cách</span>
          </div>
          <span className="text-[#D1D5DB]">•</span>
          <div className="flex items-center gap-1 text-[#121c2a]">
            <span className="font-bold">{totalBags}</span>
            <span className="text-[#4B5563]">bao</span>
          </div>
          <span className="text-[#D1D5DB]">•</span>
          <div className="flex items-center gap-1 text-[#166534] font-bold">
            <span className="material-symbols-outlined text-[16px]">scale</span>
            <span>{totalWeightKg.toFixed(1)} kg gạo sạch</span>
          </div>
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.skuId}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D5DB]/60 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              {/* Thumbnail & Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#eff4ff] shrink-0 border border-[#D1D5DB]/40">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#166534]">
                      <span className="material-symbols-outlined text-[28px]">grass</span>
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-[#166534] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Vụ mới
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] text-xs font-bold">
                      {item.skuName}
                    </span>
                    <span className="text-[11px] text-[#4B5563]">Mã: {item.skuCode}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#121c2a] truncate">
                    {item.productName}
                  </h3>

                  <div className="flex items-baseline gap-1.5 text-xs">
                    <span className="text-sm font-bold text-[#166534]">
                      {item.unitPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[#4B5563]">/ bao ({Math.round(item.unitPrice / item.weightKg).toLocaleString('vi-VN')}đ/kg)</span>
                  </div>

                  {/* Weight info badge */}
                  <div className="inline-flex items-center gap-1 text-[#4B5563] text-xs mt-1">
                    <span className="material-symbols-outlined text-[15px] text-[#166534]">fitness_center</span>
                    <span>Khối lượng dòng: <strong className="text-[#121c2a]">{item.lineWeight.toFixed(1)} kg</strong> ({item.quantity} bao × {item.weightKg} kg)</span>
                  </div>
                </div>
              </div>

              {/* Stepper + Price + Remove */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D1D5DB]/40">
                {/* Stepper */}
                <div className="flex items-center bg-[#eff4ff] rounded-lg p-1 border border-[#D1D5DB]/40">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                    className="w-7 h-7 rounded bg-white hover:bg-[#dee9fc] text-[#121c2a] flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer transition-colors"
                  >
                    −
                  </button>
                  <span className="w-9 text-center font-bold text-xs text-[#121c2a]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                    className="w-7 h-7 rounded bg-white hover:bg-[#dee9fc] text-[#121c2a] flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-bold text-[#166534] block">
                    {item.lineTotal.toLocaleString('vi-VN')}đ
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.skuId)}
                    className="text-[11px] text-[#B91C1C] hover:underline cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-5 sticky top-28">
          <h2 className="text-base font-bold text-[#121c2a] pb-3 border-b border-[#D1D5DB]/40">
            Tóm tắt giỏ hàng
          </h2>

          <div className="space-y-3 text-xs text-[#4B5563]">
            <div className="flex items-center justify-between">
              <span>Tổng số bao:</span>
              <span className="font-semibold text-[#121c2a]">{totalBags} bao</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tổng khối lượng gạo:</span>
              <span className="font-bold text-[#166534]">{totalWeightKg.toFixed(1)} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tiền hàng tạm tính:</span>
              <span className="font-bold text-[#121c2a] text-sm">
                {subtotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#795900] bg-[#ffdf9f]/30 p-2.5 rounded-lg">
              <span>Phí vận chuyển:</span>
              <span>Được tính chính xác tại bước thanh toán theo khu vực</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D1D5DB]/40 flex items-center justify-between">
            <span className="text-sm font-bold text-[#121c2a]">Tổng tiền tạm tính:</span>
            <span className="text-xl font-bold text-[#166534]">
              {subtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/thanh-toan')}
            className="w-full h-12 rounded-xl bg-[#166534] text-white font-bold text-sm hover:bg-[#14532D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tiến hành đặt hàng</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <div className="pt-2 border-t border-[#D1D5DB]/30 space-y-1.5 text-[11px] text-[#4B5563]">
            <p className="flex items-center gap-1.5 text-[#166534]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Cam kết giao tận cửa, hỗ trợ mang lên chung cư
            </p>
            <p className="flex items-center gap-1.5 text-[#166534]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Kiểm tra hương vị gạo trước khi trả tiền
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

