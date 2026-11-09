import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.catalog.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const generatedSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, slug: generatedSlug, description: formData.description }
            : c,
        ),
      );
      showNotification('Đã cập nhật danh mục thành công!');
    } else {
      const newCat: Category = {
        id: 'cat_' + Date.now(),
        name: formData.name,
        slug: generatedSlug,
        description: formData.description,
        sortOrder: categories.length + 1,
      };
      setCategories((prev) => [newCat, ...prev]);
      showNotification('Đã tạo danh mục gạo mới thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showNotification(`Đã xóa danh mục "${name}"!`);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()),
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">Quản lý Danh mục Gạo</h1>
          <p className="text-xs text-[#424754] mt-1">
            Phân loại các dòng sản phẩm gạo trên hệ thống thương mại điện tử DucBel.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-colors shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Thêm danh mục mới
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên danh mục, đường dẫn slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-[#424754] w-full sm:w-auto justify-end">
          <span>Tổng số danh mục: <strong>{categories.length}</strong></span>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#424754]">
            <div className="w-8 h-8 border-3 border-[#0058be] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải danh mục gạo...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#424754]">
            Không tìm thấy danh mục phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f3fa] text-[#424754] border-b border-[#c2c6d6]/60 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Slug (URL)</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#f9f9ff] transition-colors">
                    <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#e0e2ec] flex items-center justify-center text-[#0058be]">
                        <span className="material-symbols-outlined text-[18px]">category</span>
                      </div>
                      <div>
                        <span className="block text-sm">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {cat.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#0058be]">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-[#424754] max-w-xs truncate">
                      {cat.description || 'Chưa có mô tả'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#006e1c]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#c2c6d6] hover:bg-gray-100 text-[11px] font-semibold text-[#191b23]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#ffdad6] hover:bg-[#ffdad6]/40 text-[11px] font-semibold text-[#ba1a1a]"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#c2c6d6]/60">
            <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40 mb-4">
              <h2 className="text-base font-bold text-[#191b23]">
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Tên danh mục <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gạo Thơm Đặc Sản"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: !editingCategory ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  Slug URL <span className="text-gray-400 font-normal">(tự động sinh)</span>
                </label>
                <input
                  type="text"
                  placeholder="gao-thom-dac-san"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Mô tả danh mục</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ngắn gọn về nhóm gạo này để khách hàng dễ chọn lựa..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c2c6d6]/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#424754] hover:bg-gray-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] shadow-sm"
                >
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo mới danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCategoriesPage;
