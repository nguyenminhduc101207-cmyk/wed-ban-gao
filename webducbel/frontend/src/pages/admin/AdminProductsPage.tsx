import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product } from '../../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/FeedbackStates';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.catalog.getProducts({ limit: 50, search: search.trim() || undefined });
      setProducts(res.items || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#424754] mb-1">
            <Link to="/admin" className="hover:text-[#0058be]">Tổng quan</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#191b23] font-semibold">Sản phẩm gạo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#191b23]">
            Quản lý Các Loại Gạo ({products.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#424754] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên gạo, xuất xứ..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#c2c6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <Link
            to="/admin/products/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0058be] text-white text-xs font-bold hover:bg-[#2170e4] shadow-xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description="Hiện chưa có sản phẩm gạo nào trong hệ thống hoặc không khớp với từ khóa tìm kiếm."
          actionText="Thêm sản phẩm mới"
          actionHref="/admin/products/create"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f3fd] text-[#424754] uppercase tracking-wider font-semibold border-b border-[#c2c6d6]/40">
                <tr>
                  <th className="py-3.5 px-4">Loại gạo</th>
                  <th className="py-3.5 px-4">Xuất xứ</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4">Các quy cách SKU (Bao / Tồn / Giá)</th>
                  <th className="py-3.5 px-4">Nổi bật</th>
                  <th className="py-3.5 px-4 text-right">Xem ngoài web</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
                {products.map((p) => {
                  const firstImg = p.images?.[0] || p.skus?.[0]?.imageUrl;

                  return (
                    <tr key={p.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg bg-[#f2f3fd] overflow-hidden shrink-0 border border-[#c2c6d6]/40">
                            {firstImg ? (
                              <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#424754]">
                                <span className="material-symbols-outlined text-[18px]">grass</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#191b23] block text-sm">{p.name}</span>
                            <span className="text-[11px] text-[#424754]">Slug: {p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0058be]">{p.origin}</td>
                      <td className="py-3.5 px-4 text-[#424754]">{p.category?.name || '---'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.skus?.map((sku) => (
                            <span
                              key={sku.id}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                sku.stock > 0
                                  ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]/30'
                                  : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                              }`}
                            >
                              {sku.name}: {Number(sku.price).toLocaleString('vi-VN')}đ ({sku.stock} bao)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.isFeatured ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdf9f] text-[#795900] text-[10px] font-bold">
                            Nổi bật
                          </span>
                        ) : (
                          <span className="text-[#424754] text-[11px]">Thường</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/san-pham/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-[#c2c6d6] text-[#424754] hover:bg-[#f2f3fd] hover:text-[#0058be] transition-colors inline-flex"
                          title="Mở trang chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>
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

