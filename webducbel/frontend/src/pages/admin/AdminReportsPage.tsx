import React, { useState } from 'react';

export const AdminReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'quarter' | 'year'>('30days');

  // Chart data
  const monthlyData = [
    { month: 'T10/25', revenue: 64200000, orders: 124, height: '55%' },
    { month: 'T11/25', revenue: 78500000, orders: 156, height: '68%' },
    { month: 'T12/25', revenue: 98400000, orders: 198, height: '85%' },
    { month: 'T01/26', revenue: 115200000, orders: 230, height: '98%' },
    { month: 'T02/26', revenue: 89600000, orders: 180, height: '78%' },
    { month: 'T03/26', revenue: 104800000, orders: 212, height: '90%' },
  ];

  const categoryBreakdown = [
    { name: 'Gạo Đặc Sản ST25 Sóc Trăng', sales: 48500000, share: 46, color: '#0058be' },
    { name: 'Gạo Tám Xoan Hải Hậu Thơm Dẻo', sales: 26200000, share: 25, color: '#006e1c' },
    { name: 'Gạo Lứt Huyết Rồng & Đỏ ST', sales: 16800000, share: 16, color: '#b45309' },
    { name: 'Nếp Cái Hoa Vàng Chọn Lọc', sales: 8400000, share: 8, color: '#7c3aed' },
    { name: 'Gạo Hằng Ngày Tiết Kiệm', sales: 4900000, share: 5, color: '#64748b' },
  ];

  const districtShipping = [
    { district: 'Quận Hải Châu', count: 342, pct: 38, avgTime: '32 phút' },
    { district: 'Quận Thanh Khê', count: 215, pct: 24, avgTime: '38 phút' },
    { district: 'Quận Sơn Trà', count: 168, pct: 19, avgTime: '45 phút' },
    { district: 'Quận Ngũ Hành Sơn', count: 98, pct: 11, avgTime: '50 phút' },
    { district: 'Quận Cẩm Lệ & Liên Chiểu', count: 72, pct: 8, avgTime: '55 phút' },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Thang,DoanhThu,SoDon\n' +
      monthlyData.map((e) => `${e.month},${e.revenue},${e.orders}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_doanh_thu_ducbel_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">
            Báo Cáo Phân Tích Chuyên Sâu DucBel
          </h1>
          <p className="text-xs text-[#424754] mt-1">
            Tổng hợp dữ liệu doanh thu, sản lượng gạo tiêu thụ và hiệu suất giao hàng tại Đà Nẵng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#c2c6d6] rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === '7days' ? 'bg-[#0058be] text-white' : 'text-[#424754] hover:bg-gray-100'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === '30days' ? 'bg-[#0058be] text-white' : 'text-[#424754] hover:bg-gray-100'
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === 'quarter' ? 'bg-[#0058be] text-white' : 'text-[#424754] hover:bg-gray-100'
              }`}
            >
              Quý này
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === 'year' ? 'bg-[#0058be] text-white' : 'text-[#424754] hover:bg-gray-100'
              }`}
            >
              Năm nay
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#131b2e] text-white rounded-xl text-xs font-bold hover:bg-[#1a243c] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Xuất file CSV
          </button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng doanh thu
          </span>
          <div className="text-2xl font-bold text-[#0058be]">104.800.000 đ</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#006e1c] mt-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +16.9% so với kỳ trước
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Số đơn thành công
          </span>
          <div className="text-2xl font-bold text-[#191b23]">212 đơn</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#006e1c] mt-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Tỷ lệ giao đạt 97.2%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Giá trị trung bình/đơn (AOV)
          </span>
          <div className="text-2xl font-bold text-[#006e1c]">494.300 đ</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Trung bình ~2.4 bao gạo/đơn</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tỷ lệ hủy / Đổi trả
          </span>
          <div className="text-2xl font-bold text-[#ba1a1a]">2.8%</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Dưới ngưỡng rủi ro 5%</span>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#191b23]">Biểu đồ Doanh thu Theo Tháng</h2>
            <p className="text-xs text-gray-500">Tăng trưởng ổn định từ nguồn khách hàng hộ gia đình & nhà hàng</p>
          </div>
          <span className="text-xs font-semibold text-[#0058be] bg-[#0058be]/10 px-3 py-1 rounded-full">
            Đơn vị: VNĐ
          </span>
        </div>

        <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-[#e0e2ec]">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#0058be] bg-white shadow-md border border-[#c2c6d6] px-2 py-0.5 rounded whitespace-nowrap">
                {(d.revenue / 1000000).toFixed(1)} tr ({d.orders} đơn)
              </div>
              <div
                style={{ height: d.height }}
                className="w-full max-w-[48px] bg-gradient-to-t from-[#0058be] to-[#2170e4] rounded-t-xl transition-all duration-300 group-hover:from-[#004294] group-hover:to-[#0058be]"
              ></div>
              <span className="text-xs font-bold text-gray-600 mt-2">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Category Breakdown & District Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs">
          <h2 className="text-base font-bold text-[#191b23] mb-1">Cơ cấu Doanh số Dòng Gạo</h2>
          <p className="text-xs text-gray-500 mb-6">Tỷ lệ đóng góp doanh thu của từng chủng loại gạo DucBel</p>

          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#191b23] truncate max-w-[240px]">{cat.name}</span>
                  <span className="text-[#0058be]">
                    {cat.sales.toLocaleString('vi-VN')} đ ({cat.share}%)
                  </span>
                </div>
                <div className="w-full bg-[#f2f3fa] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Shipping Performance */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs">
          <h2 className="text-base font-bold text-[#191b23] mb-1">Phân bổ Giao hàng Theo Quận</h2>
          <p className="text-xs text-gray-500 mb-6">Mật độ giao nhận và thời gian vận chuyển trung bình tại TP. Đà Nẵng</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f3fa] text-[#424754] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Quận / Huyện</th>
                  <th className="py-2.5 px-3 text-center">Số đơn</th>
                  <th className="py-2.5 px-3 text-center">Thị phần</th>
                  <th className="py-2.5 px-3 text-right">Thời gian TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
                {districtShipping.map((d) => (
                  <tr key={d.district} className="hover:bg-[#f9f9ff]">
                    <td className="py-2.5 px-3 font-bold">{d.district}</td>
                    <td className="py-2.5 px-3 text-center font-semibold">{d.count}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#0058be]/10 text-[#0058be] font-bold text-[10px]">
                        {d.pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600 font-medium">
                      {d.avgTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminReportsPage;

