import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';

export const AdminSettingsPage: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: BRAND_CONFIG.name,
    tagline: 'Cơm Lành Canh Ngọt | Gạo Sạch Thuần Nông',
    hotline: '0905 123 456',
    email: 'cskh@ducbel.vn',
    address: '124 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
    operatingHours: '07:30 - 21:00 hàng ngày',
  });

  const [deliveryZones, setDeliveryZones] = useState([
    {
      id: 'dz_1',
      name: 'Nội thành Đà Nẵng (Hải Châu, Thanh Khê)',
      fee: 15000,
      freeThreshold: 300000,
      estimatedMinutes: '30 - 45 phút',
      active: true,
    },
    {
      id: 'dz_2',
      name: 'Cận nội thành (Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ)',
      fee: 20000,
      freeThreshold: 350000,
      estimatedMinutes: '45 - 60 phút',
      active: true,
    },
    {
      id: 'dz_3',
      name: 'Ngoại thành (Liên Chiểu, Hòa Vang)',
      fee: 25000,
      freeThreshold: 400000,
      estimatedMinutes: '60 - 90 phút',
      active: true,
    },
  ]);

  const [policySettings, setPolicySettings] = useState({
    autoCancelMinutes: 60,
    lowStockThreshold: 10,
    allowGuestCheckout: true,
    requirePhoneOtp: false,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Đã lưu thông tin thương hiệu DucBel thành công!');
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Đã cập nhật biểu phí vùng giao hàng Đà Nẵng!');
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Đã cập nhật cấu hình hệ thống & cảnh báo!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#006e1c] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {notification}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">Cài Đặt Hệ Thống & Vùng Giao Hàng</h1>
        <p className="text-xs text-[#424754] mt-1">
          Cấu hình thông tin thương hiệu DucBel, biểu phí vận chuyển tại Đà Nẵng và chính sách đặt hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Information Form */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#c2c6d6]/40">
            <span className="material-symbols-outlined text-[#0058be]">storefront</span>
            <h2 className="text-base font-bold text-[#191b23]">Thông tin Thương hiệu DucBel</h2>
          </div>

          <form onSubmit={handleSaveStoreInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Tên thương hiệu</label>
              <input
                type="text"
                required
                value={storeInfo.name}
                onChange={(e) => setStoreInfo((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-bold text-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Khẩu hiệu (Tagline / Slogan)</label>
              <input
                type="text"
                value={storeInfo.tagline}
                onChange={(e) => setStoreInfo((p) => ({ ...p, tagline: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Hotline giao gạo</label>
                <input
                  type="text"
                  value={storeInfo.hotline}
                  onChange={(e) => setStoreInfo((p) => ({ ...p, hotline: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Email CSKH</label>
                <input
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) => setStoreInfo((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Địa chỉ kho tổng & cửa hàng</label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo((p) => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Thời gian phục vụ</label>
              <input
                type="text"
                value={storeInfo.operatingHours}
                onChange={(e) => setStoreInfo((p) => ({ ...p, operatingHours: e.target.value }))}
                className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-colors shadow-xs"
            >
              Lưu thông tin thương hiệu
            </button>
          </form>
        </div>

        {/* Operating Policies */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#c2c6d6]/40">
              <span className="material-symbols-outlined text-[#0058be]">tune</span>
              <h2 className="text-base font-bold text-[#191b23]">Chính Sách Đơn & Cảnh Báo</h2>
            </div>

            <form onSubmit={handleSavePolicies} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Thời hạn tự hủy đơn chuyển khoản chưa thanh toán (Phút)
                </label>
                <input
                  type="number"
                  min="15"
                  max="1440"
                  value={policySettings.autoCancelMinutes}
                  onChange={(e) =>
                    setPolicySettings((p) => ({ ...p, autoCancelMinutes: parseInt(e.target.value) || 60 }))
                  }
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Đơn hàng chuyển khoản nếu sau khoảng thời gian này không thanh toán sẽ tự hủy để hoàn kho.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Ngưỡng cảnh báo tồn kho tối thiểu (Số bao)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={policySettings.lowStockThreshold}
                  onChange={(e) =>
                    setPolicySettings((p) => ({ ...p, lowStockThreshold: parseInt(e.target.value) || 10 }))
                  }
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Hệ thống sẽ gắn cờ cảnh báo màu vàng khi số bao tồn của một SKU thấp hơn hoặc bằng mức này.
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policySettings.allowGuestCheckout}
                    onChange={(e) =>
                      setPolicySettings((p) => ({ ...p, allowGuestCheckout: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be]"
                  />
                  <span className="text-xs font-semibold text-[#191b23]">
                    Cho phép khách mua gạo nhanh không cần đăng nhập
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policySettings.requirePhoneOtp}
                    onChange={(e) =>
                      setPolicySettings((p) => ({ ...p, requirePhoneOtp: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be]"
                  />
                  <span className="text-xs font-semibold text-[#191b23]">
                    Bắt buộc xác thực OTP SMS số điện thoại khi đặt đơn trên 2.000.000 đ
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-colors shadow-xs"
                >
                  Lưu cấu hình chính sách
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delivery Zones Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c2c6d6]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">local_shipping</span>
            <div>
              <h2 className="text-base font-bold text-[#191b23]">Biểu Phí Vận Chuyển Vùng Giao Đà Nẵng</h2>
              <span className="text-xs text-gray-500">Chính sách phí ship theo quận/huyện và ngưỡng miễn phí vận chuyển</span>
            </div>
          </div>
          <button
            onClick={handleSaveDelivery}
            className="px-4 py-2 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] shadow-xs"
          >
            Lưu bảng phí giao hàng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f3fa] text-[#424754] font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Khu vực / Quận huyện</th>
                <th className="py-3 px-4 text-center">Thời gian dự kiến</th>
                <th className="py-3 px-4 text-right">Phí cước chuẩn</th>
                <th className="py-3 px-4 text-right">Ngưỡng Freeship</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
              {deliveryZones.map((zone, idx) => (
                <tr key={zone.id} className="hover:bg-[#f9f9ff]">
                  <td className="py-3.5 px-4 font-bold">
                    <span className="text-sm">{zone.name}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">ID: {zone.id}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                    {zone.estimatedMinutes}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#0058be]">
                    <input
                      type="number"
                      step="1000"
                      value={zone.fee}
                      onChange={(e) => {
                        const fee = parseInt(e.target.value) || 0;
                        setDeliveryZones((prev) =>
                          prev.map((z, i) => (i === idx ? { ...z, fee } : z)),
                        );
                      }}
                      className="w-24 px-2 py-1 text-right bg-[#f2f3fa] rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0058be]"
                    />{' '}
                    đ
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#006e1c]">
                    <input
                      type="number"
                      step="10000"
                      value={zone.freeThreshold}
                      onChange={(e) => {
                        const freeThreshold = parseInt(e.target.value) || 0;
                        setDeliveryZones((prev) =>
                          prev.map((z, i) => (i === idx ? { ...z, freeThreshold } : z)),
                        );
                      }}
                      className="w-28 px-2 py-1 text-right bg-[#f2f3fa] rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#006e1c]"
                    />{' '}
                    đ
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#006e1c]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>
                      Đang áp dụng
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminSettingsPage;

