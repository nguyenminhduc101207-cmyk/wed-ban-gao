import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Category } from '../../types';

export const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('Việt Nam');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  // SKU configs
  const [skus, setSkus] = useState([
    { name: 'Bao 5 kg', weightKg: 5, price: 150000, stock: 50 },
    { name: 'Bao 10 kg', weightKg: 10, price: 290000, stock: 30 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.catalog.getCategories();
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleAddSku = () => {
    setSkus([...skus, { name: 'Bao mới', weightKg: 5, price: 100000, stock: 20 }]);
  };

  const handleRemoveSku = (index: number) => {
    if (skus.length <= 1) return;
    setSkus(skus.filter((_, i) => i !== index));
  };

  const handleSkuChange = (index: number, field: string, value: any) => {
    const updated = [...skus];
    updated[index] = { ...updated[index], [field]: value };
    setSkus(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Giả lập lưu trên frontend client (do phạm vi không sửa backend)
    setTimeout(() => {
      setSubmitting(false);
      setSuccessToast(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#424754]">
        <Link to="/admin/products" className="hover:text-[#0058be] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          <span>Sản phẩm</span>
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191b23] font-semibold">Thêm mới sản phẩm</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-[#191b23]">
          Thêm Mới Loại Gạo Vào Kho
        </h1>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] text-[#166534] text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Đã thêm sản phẩm gạo mới vào danh mục thành công!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Khối 1: Thông tin cơ bản */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#191b23] uppercase tracking-wider pb-3 border-b border-[#c2c6d6]/40">
            1. Thông tin chung về loại gạo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#191b23]">
                Tên loại gạo <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Gạo Thơm ST25 Thượng Hạng"
                className="w-full h-10 px-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#191b23]">
                Vùng xuất xứ / Canh tác <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ví dụ: Sóc Trăng, Long An..."
                className="w-full h-10 px-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#191b23]">Thuộc danh mục:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#0058be] rounded focus:ring-[#0058be]"
              />
              <label htmlFor="isFeatured" className="font-semibold text-[#191b23] cursor-pointer">
                Đặt làm sản phẩm nổi bật trang chủ
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#191b23]">Mô tả ngắn:</label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Giống lúa hạt dài thon, cơm ngọt thơm mùi lá dứa..."
              className="w-full p-3 bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>
        </div>

        {/* Khối 2: Cấu hình quy cách SKU */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40">
            <h2 className="text-sm font-bold text-[#191b23] uppercase tracking-wider">
              2. Các quy cách đóng bao (SKU)
            </h2>
            <button
              type="button"
              onClick={handleAddSku}
              className="px-3 py-1.5 rounded-lg bg-[#d8e2ff] text-[#0058be] font-bold hover:bg-[#0058be] hover:text-white transition-colors cursor-pointer"
            >
              + Thêm quy cách
            </button>
          </div>

          <div className="space-y-3">
            {skus.map((sku, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-[#c2c6d6]/40 bg-[#f9f9ff] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#424754]">Tên quy cách</label>
                  <input
                    type="text"
                    value={sku.name}
                    onChange={(e) => handleSkuChange(index, 'name', e.target.value)}
                    placeholder="Bao 5 kg"
                    className="w-full h-9 px-2.5 bg-white border border-[#c2c6d6] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#424754]">Khối lượng (kg)</label>
                  <input
                    type="number"
                    value={sku.weightKg}
                    onChange={(e) => handleSkuChange(index, 'weightKg', Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-white border border-[#c2c6d6] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#424754]">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    value={sku.price}
                    onChange={(e) => handleSkuChange(index, 'price', Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-white border border-[#c2c6d6] rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[11px] font-semibold text-[#424754]">Tồn kho (bao)</label>
                    <input
                      type="number"
                      value={sku.stock}
                      onChange={(e) => handleSkuChange(index, 'stock', Number(e.target.value))}
                      className="w-full h-9 px-2.5 bg-white border border-[#c2c6d6] rounded-lg"
                    />
                  </div>
                  {skus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSku(index)}
                      className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg cursor-pointer"
                      title="Xóa quy cách"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-[#c2c6d6] text-[#424754] font-semibold hover:bg-[#f2f3fd]"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#2170e4] shadow-xs cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Lưu sản phẩm vào hệ thống'}
          </button>
        </div>
      </form>
    </div>
  );
};

