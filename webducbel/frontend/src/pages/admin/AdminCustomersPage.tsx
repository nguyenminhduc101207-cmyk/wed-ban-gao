import React, { useState } from 'react';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 'KH-001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phone: '0905123456',
    address: '124 Bạch Đằng, P. Hải Châu 1',
    district: 'Hải Châu, Đà Nẵng',
    ordersCount: 8,
    totalSpent: 4250000,
    joinedDate: '15/01/2026',
    status: 'active',
  },
  {
    id: 'KH-002',
    name: 'Trần Thị Thu Thảo',
    email: 'thao.tran@outlook.com',
    phone: '0913987654',
    address: '45 Lê Duẩn, P. Thạch Thang',
    district: 'Hải Châu, Đà Nẵng',
    ordersCount: 5,
    totalSpent: 2890000,
    joinedDate: '02/02/2026',
    status: 'active',
  },
  {
    id: 'KH-003',
    name: 'Phạm Hoàng Long',
    email: 'long.pham@fpt.edu.vn',
    phone: '0988776655',
    address: '88 Võ Văn Kiệt, P. An Hải Bắc',
    district: 'Sơn Trà, Đà Nẵng',
    ordersCount: 3,
    totalSpent: 1650000,
    joinedDate: '18/02/2026',
    status: 'active',
  },
  {
    id: 'KH-004',
    name: 'Lê Minh Hùng',
    email: 'hung.le@gmail.com',
    phone: '0935112233',
    address: '210 Điện Biên Phủ, P. Chính Gián',
    district: 'Thanh Khê, Đà Nẵng',
    ordersCount: 12,
    totalSpent: 7920000,
    joinedDate: '10/12/2025',
    status: 'active',
  },
  {
    id: 'KH-005',
    name: 'Võ Thị Mai Phương',
    email: 'phuong.vo@yahoo.com',
    phone: '0977445566',
    address: '15 Ngũ Hành Sơn, P. Mỹ An',
    district: 'Ngũ Hành Sơn, Đà Nẵng',
    ordersCount: 2,
    totalSpent: 980000,
    joinedDate: '01/03/2026',
    status: 'active',
  },
  {
    id: 'KH-006',
    name: 'Đặng Quốc Huy',
    email: 'huy.dang@danang.gov.vn',
    phone: '0909667788',
    address: '56 Tôn Đức Thắng, P. Hòa Khánh Nam',
    district: 'Liên Chiểu, Đà Nẵng',
    ordersCount: 1,
    totalSpent: 450000,
    joinedDate: '12/03/2026',
    status: 'active',
  },
];

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()),
  );

  const totalSpentSum = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersSum = customers.reduce((sum, c) => sum + c.ordersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">Quản lý Khách hàng</h1>
          <p className="text-xs text-[#424754] mt-1">
            Danh sách khách hàng đăng ký và mua gạo sạch tại hệ thống DucBel Đà Nẵng.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng số khách hàng
          </span>
          <div className="text-2xl font-bold text-[#191b23]">{customers.length}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Tài khoản hoạt động trên hệ thống</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng đơn đã mua
          </span>
          <div className="text-2xl font-bold text-[#0058be]">{totalOrdersSum} đơn</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Tỷ lệ mua lại trung bình: 5.1 đơn/KH</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng giá trị chi tiêu
          </span>
          <div className="text-2xl font-bold text-[#006e1c]">
            {totalSpentSum.toLocaleString('vi-VN')} đ
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Giá trị trọn đời (LTV) trung bình: {(totalSpentSum / customers.length).toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 flex items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên, SĐT, Email, Mã KH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
        <span className="text-xs text-[#424754] font-medium hidden sm:inline">
          Tìm thấy <strong>{filteredCustomers.length}</strong> khách hàng
        </span>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f3fa] text-[#424754] border-b border-[#c2c6d6]/60 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Khu vực giao hàng</th>
                <th className="py-3 px-4 text-center">Số đơn</th>
                <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0058be]/10 text-[#0058be] font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#191b23]">{c.name}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{c.id} • Tham gia: {c.joinedDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-700">{c.phone}</div>
                    <div className="text-[11px] text-gray-400">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="font-medium text-xs truncate max-w-[200px]">{c.address}</div>
                    <span className="text-[10px] text-gray-400">{c.district}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-sm text-[#0058be]">{c.ordersCount}</span>
                    <span className="text-[10px] text-gray-400 block">đơn</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#006e1c]">
                    {c.totalSpent.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#006e1c]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>
                      Đang hoạt động
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 rounded-lg border border-[#c2c6d6] hover:bg-[#f2f3fa] text-[11px] font-bold text-[#0058be] inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#c2c6d6]/60">
            <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0058be] text-white font-bold flex items-center justify-center text-base">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#191b23]">{selectedCustomer.name}</h2>
                  <span className="text-xs text-gray-400 font-mono">{selectedCustomer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f2f3fa] rounded-xl">
                <div>
                  <span className="text-gray-500 block mb-0.5">Số điện thoại:</span>
                  <span className="font-bold text-[#191b23]">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Email:</span>
                  <span className="font-bold text-[#191b23]">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Tổng số đơn mua:</span>
                  <span className="font-bold text-[#0058be]">{selectedCustomer.ordersCount} đơn</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Tổng chi tiêu:</span>
                  <span className="font-bold text-[#006e1c]">{selectedCustomer.totalSpent.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1 font-semibold">Địa chỉ giao hàng mặc định:</span>
                <p className="p-3 bg-white border border-[#c2c6d6]/60 rounded-xl font-medium text-[#191b23]">
                  {selectedCustomer.address}, {selectedCustomer.district}
                </p>
              </div>

              <div>
                <span className="text-gray-500 block mb-1 font-semibold">Ghi chú khách hàng:</span>
                <p className="text-gray-600 italic">
                  Khách hàng thân thiết DucBel, ưu tiên giao vào buổi sáng trước 11h.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCustomersPage;

