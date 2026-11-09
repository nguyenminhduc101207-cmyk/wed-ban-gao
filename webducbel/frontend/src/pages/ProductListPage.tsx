import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/FeedbackStates';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catList, prodRes] = await Promise.all([
        api.catalog.getCategories(),
        api.catalog.getProducts({
          category: currentCategory,
          search: currentSearch,
          sort: currentSort,
        }),
      ]);
      setCategories(catList);
      setProducts(prodRes.items || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [currentCategory, currentSearch, currentSort]);

  const handleCategorySelect = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.value) {
      next.set('sort', e.target.value);
    } else {
      next.delete('sort');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#4B5563] mb-6">
        <Link to="/" className="hover:text-[#166534]">Trang chủ</Link>
        <span>/</span>
        <span className="font-semibold text-[#121c2a]">Danh sách sản phẩm gạo</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#166534] tracking-tight">
            Kho Gạo Sạch Thuần Nông
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Gạo xát mộc, đóng bao tiêu chuẩn chống ẩm 3 lớp, giữ trọn hương vị phù sa
          </p>
        </div>

        {/* Controls: Search + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#4B5563] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên gạo..."
              className="h-10 pl-9 pr-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </form>

          <select
            value={currentSort}
            onChange={handleSortChange}
            className="h-10 px-3 text-xs bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] text-[#121c2a]"
          >
            <option value="">Sắp xếp mặc định</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Filter Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="bg-white rounded-xl p-5 border border-[#D1D5DB]/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#121c2a] uppercase tracking-wider">
            Danh mục gạo
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-between ${
                !currentCategory
                  ? 'bg-[#DCFCE7] text-[#166534] font-bold'
                  : 'text-[#4B5563] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Tất cả loại gạo</span>
              <span className="text-xs">({products.length})</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  currentCategory === cat.slug
                    ? 'bg-[#DCFCE7] text-[#166534] font-bold'
                    : 'text-[#4B5563] hover:bg-[#eff4ff]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#D1D5DB]/40 space-y-2">
            <span className="text-xs uppercase font-bold text-[#795900] tracking-wider block">
              Cam kết dịch vụ
            </span>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              ✓ Đổi trả miễn phí 7 ngày nếu gạo không chuẩn độ dẻo thơm.
            </p>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              ✓ Hỗ trợ bốc vác tận cửa hoặc lên căn hộ chung cư.
            </p>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCatalog} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Không tìm thấy gạo phù hợp"
              description="Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc để xem các sản phẩm khác."
              actionText="Xem tất cả gạo"
              onAction={() => handleCategorySelect('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((prod) => {
                const defaultSku = prod.skus?.find((s) => s.isDefault) || prod.skus?.[0];
                const displayPrice = defaultSku ? Number(defaultSku.price).toLocaleString('vi-VN') : '---';
                const imgUrl = prod.images?.[0] || defaultSku?.imageUrl;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-[#D1D5DB]/50 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#eff4ff] mb-4">
                        {imgUrl && (
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <span className="absolute top-3 left-3 bg-[#166534] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          100% Gạo mới
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#4B5563] mb-1">
                        <span>Xuất xứ: <strong className="text-[#121c2a]">{prod.origin}</strong></span>
                      </div>

                      <Link to={`/san-pham/${prod.slug}`}>
                        <h3 className="text-base font-bold text-[#121c2a] group-hover:text-[#166534] transition-colors line-clamp-1 mb-1.5">
                          {prod.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#4B5563] line-clamp-2 mb-4 leading-relaxed">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D1D5DB]/40 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#4B5563]">Giá từ:</span>
                        <p className="text-base font-bold text-[#166534]">
                          {displayPrice}đ
                          <span className="text-xs font-normal text-[#4B5563] ml-1">
                            /{defaultSku?.name || 'bao'}
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/san-pham/${prod.slug}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] font-semibold text-xs hover:bg-[#166534] hover:text-white transition-all"
                      >
                        Chọn mua
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

