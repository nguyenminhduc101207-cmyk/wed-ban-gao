import React, { useState } from 'react';

interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF';
  status: 'active' | 'suspended';
  ordersProcessed: number;
  lastActive: string;
}

const INITIAL_STAFF: StaffItem[] = [
  {
    id: 'STF-001',
    name: 'Quản trị viên Hệ Thống',
    email: 'admin@gaonha.vn',
    phone: '0905999888',
    role: 'ADMIN',
    status: 'active',
    ordersProcessed: 142,
    lastActive: 'Vừa xong',
  },
  {
    id: 'STF-002',
    name: 'Nguyễn Văn Hùng (Kho & Đóng gói)',
    email: 'staff.hung@ducbel.vn',
    phone: '0905111222',
    role: 'STAFF',
    status: 'active',
    ordersProcessed: 89,
    lastActive: '15 phút trước',
  },
  {
    id: 'STF-003',
    name: 'Lê Thị Thu Thủy (Điều vận giao hàng)',
    email: 'staff.thuy@ducbel.vn',
    phone: '0914333444',
    role: 'STAFF',
    status: 'active',
    ordersProcessed: 64,
    lastActive: '1 giờ trước',
  },
  {
    id: 'STF-004',
    name: 'Trần Đình Trọng (Nhân viên ca tối)',
    email: 'staff.trong@ducbel.vn',
    phone: '0988555666',
    role: 'STAFF',
    status: 'active',
    ordersProcessed: 32,
    lastActive: 'Hôm qua',
  },
];

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffItem[]>(INITIAL_STAFF);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) return;

    const staffMember: StaffItem = {
      id: 'STF-' + String(staffList.length + 1).padStart(3, '0'),
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone || '0905000000',
      role: newStaff.role,
      status: 'active',
      ordersProcessed: 0,
      lastActive: 'Vừa tạo',
    };

    setStaffList((prev) => [staffMember, ...prev]);
    showNotification(`Đã cấp tài khoản nhân sự cho "${newStaff.name}"!`);
    setIsModalOpen(false);
    setNewStaff({ name: '', email: '', phone: '', role: 'STAFF' });
  };

  const handleToggleRole = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextRole = s.role === 'ADMIN' ? 'STAFF' : 'ADMIN';
          showNotification(`Đã đổi vai trò của ${s.name} thành ${nextRole}!`);
          return { ...s, role: nextRole };
        }
        return s;
      }),
    );
  };

  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'active' ? 'suspended' : 'active';
          showNotification(`Đã ${nextStatus === 'active' ? 'mở khóa' : 'tạm khóa'} tài khoản ${s.name}!`);
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    );
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);

    if (!matchesSearch) return false;
    if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#006e1c] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">Nhân sự & Phân quyền</h1>
          <p className="text-xs text-[#424754] mt-1">
            Quản lý danh sách nhân viên xử lý đơn, nhân viên kho và phân quyền quản trị viên DucBel.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-colors shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm nhân viên mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng nhân sự nội bộ
          </span>
          <div className="text-2xl font-bold text-[#191b23]">{staffList.length} nhân viên</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Toàn bộ kho & cửa hàng</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Quản trị viên (ADMIN)
          </span>
          <div className="text-2xl font-bold text-[#0058be]">
            {staffList.filter((s) => s.role === 'ADMIN').length} tài khoản
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Quyền can thiệp toàn hệ thống</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Nhân viên kho / giao vận (STAFF)
          </span>
          <div className="text-2xl font-bold text-[#006e1c]">
            {staffList.filter((s) => s.role === 'STAFF').length} nhân viên
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Quyền xử lý đơn & kho</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              roleFilter === 'ALL'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#424754] hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              roleFilter === 'ADMIN'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#424754] hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setRoleFilter('STAFF')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              roleFilter === 'STAFF'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#424754] hover:bg-gray-200'
            }`}
          >
            Nhân viên kho
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f3fa] text-[#424754] border-b border-[#c2c6d6]/60 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nhân sự</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4 text-center">Vai trò</th>
                <th className="py-3 px-4 text-center">Đơn đã xử lý</th>
                <th className="py-3 px-4 text-center">Hoạt động gần nhất</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white font-bold flex items-center justify-center text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#191b23]">{s.name}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{s.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-700">{s.email}</div>
                    <div className="text-[11px] text-gray-400">{s.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {s.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dbeafe] text-[#0058be]">
                        <span className="material-symbols-outlined text-[13px]">shield_person</span>
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309]">
                        <span className="material-symbols-outlined text-[13px]">badge</span>
                        STAFF
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#191b23]">
                    {s.ordersProcessed} đơn
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                    {s.lastActive}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {s.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#006e1c]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                        Tạm khóa
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleRole(s.id)}
                      title="Chuyển đổi quyền ADMIN / STAFF"
                      className="px-2.5 py-1 rounded-lg border border-[#c2c6d6] hover:bg-gray-100 text-[11px] font-semibold text-[#0058be]"
                    >
                      Đổi vai trò
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                        s.status === 'active'
                          ? 'border-[#ffdad6] hover:bg-[#ffdad6]/40 text-[#ba1a1a]'
                          : 'border-[#dcfce7] hover:bg-[#dcfce7]/40 text-[#006e1c]'
                      }`}
                    >
                      {s.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#c2c6d6]/60">
            <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40 mb-4">
              <h2 className="text-base font-bold text-[#191b23]">Cấp tài khoản Nhân sự mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Họ và tên <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hải"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Email đăng nhập <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="hai.nguyen@ducbel.vn"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="0905123xxx"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Phân quyền</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                >
                  <option value="STAFF">STAFF - Nhân viên kho & Điều vận giao hàng</option>
                  <option value="ADMIN">ADMIN - Quản trị viên toàn quyền hệ thống</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c2c6d6]/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#424754] hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] shadow-sm"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminStaffPage;

