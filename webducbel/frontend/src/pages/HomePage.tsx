import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { LoadingSkeleton, ErrorState } from '../components/common/FeedbackStates';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        api.catalog.getCategories(),
        api.catalog.getFeaturedProducts(),
      ]);
      setCategories(cats);
      setFeaturedProducts(prods);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 1. HERO BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Cột trái: Thông điệp & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-xs uppercase tracking-wider font-semibold">
                100% Gạo mới vụ mùa
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#166534] tracking-tight leading-tight">
              Chọn gạo ngon cho bữa cơm nhà
            </h1>
            <p className="text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed">
              Khám phá các loại gạo thượng hạng chuẩn nguồn gốc và quy cách đóng bao phù hợp với nhu cầu của gia đình bạn.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/san-pham"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#166534] text-white font-semibold text-base hover:bg-[#14532D] shadow-sm transition-all duration-200"
              >
                Khám phá sản phẩm
              </Link>
              <Link
                to="/chinh-sach-giao-hang"
                className="inline-flex items-center gap-1 font-semibold text-base text-[#166534] underline hover:text-[#14532D] transition-colors underline-offset-4"
              >
                <span>Xem chính sách giao hàng</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 w-full max-w-md border-t border-[#D1D5DB]/40 mt-2">
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#166534]">Cam kết</span>
                <span className="text-xs text-[#4B5563]">Không chất bảo quản</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#166534]">Mới xay</span>
                <span className="text-xs text-[#4B5563]">Bảo toàn dưỡng chất</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#166534]">Giao nhanh</span>
                <span className="text-xs text-[#4B5563]">Tận cửa bếp nhà</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Bố cục hình ảnh ấm áp */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-white">
              <img
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt="Bữa cơm ấm cúng gia đình Việt với bát cơm trắng dẻo thơm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj-c7KIEz13dgnYWPGhikkcaBUR9TCqXuWAzWZZj2XjdnqgV0XQdREjr406Z7IxGo4dkGSYkXHBTLnS9BjQ2r6dx6sIS38cbz7odsNXvJHrduOeaqCVvVwbV-B2rl9G9zCLJNLN8mKrLyS2yBOSNL7HMpR_CtIjoYzuIfGCl6e78fUqjuJN6S5JcYwSHGEK_mSF6Tpx7zBvz27lYfNj-Aynw4EuZoSBEK2qV0hwro"
              />
            </div>
            {/* Thẻ điểm nhấn */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 bg-white p-3.5 rounded-xl shadow-lg flex items-center gap-3 max-w-xs border border-[#D1D5DB]/40">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534] shrink-0">
                <span className="material-symbols-outlined text-[22px]">rice_bowl</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#121c2a]">Cơm dẻo ngọt lành</p>
                <p className="text-xs text-[#4B5563]">Giữ trọn hương vị phù sa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DANH MỤC GẠO */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#166534]">
            Bạn đang tìm loại gạo nào?
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 max-w-xl">
            Phân loại theo khẩu vị và đặc tính nấu giúp bạn dễ dàng chọn được loại gạo ưng ý nhất cho gia đình.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/san-pham?category=${cat.slug}`}
                className="group flex flex-col bg-white rounded-xl p-3 shadow-sm border border-[#D1D5DB]/50 transition-all duration-300 hover:bg-[#DCFCE7]/40 hover:shadow-md cursor-pointer"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#FFFBF2] mb-3">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-sm sm:text-base font-semibold text-[#121c2a] group-hover:text-[#166534]">
                    {cat.name}
                  </span>
                  <span className="material-symbols-outlined text-[#4B5563] group-hover:text-[#166534] transition-transform group-hover:translate-x-1 text-[20px]">
                    chevron_right
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. SẢN PHẨM NỔI BẬT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#795900] mb-1">
              <span className="material-symbols-outlined text-[16px]">eco</span>
              Gạo xát mộc thuần nông
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#121c2a]">
              Sản phẩm nổi bật
            </h2>
          </div>
          <Link
            to="/san-pham"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#166534] hover:text-[#14532D]"
          >
            <span>Xem toàn bộ gạo</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => {
              const defaultSku = prod.skus?.find((s) => s.isDefault) || prod.skus?.[0];
              const displayPrice = defaultSku ? Number(defaultSku.price).toLocaleString('vi-VN') : '---';
              const imgUrl = prod.images?.[0] || defaultSku?.imageUrl;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#D1D5DB]/50 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Badge Vụ Mới */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#eff4ff] mb-4">
                      {imgUrl && (
                        <img
                          src={imgUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <span className="absolute top-3 left-3 bg-[#166534] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        100% Gạo mới
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#4B5563] mb-1.5">
                      <span>Xuất xứ: <strong className="text-[#121c2a]">{prod.origin}</strong></span>
                      <span>•</span>
                      <span>Quy cách: {defaultSku?.name || 'Bao'}</span>
                    </div>

                    <Link to={`/san-pham/${prod.slug}`}>
                      <h3 className="text-lg font-bold text-[#121c2a] group-hover:text-[#166534] transition-colors line-clamp-1 mb-2">
                        {prod.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#4B5563] line-clamp-2 mb-4 leading-relaxed">
                      {prod.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D1D5DB]/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#4B5563]">Giá từ:</span>
                      <p className="text-lg font-bold text-[#166534]">
                        {displayPrice}đ
                        <span className="text-xs font-normal text-[#4B5563] ml-1">
                          /{defaultSku?.name || 'bao'}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={`/san-pham/${prod.slug}`}
                      className="px-4 py-2 rounded-lg bg-[#DCFCE7] text-[#166534] font-semibold text-xs hover:bg-[#166534] hover:text-white transition-all shadow-xs"
                    >
                      Chọn mua
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. CHÍNH SÁCH GIAO HÀNG & CAM KẾT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#166534] text-white rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#ffdf9f] uppercase tracking-wider font-bold mb-2">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Dịch vụ giao tận cửa bếp
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Miễn phí giao hàng & hỗ trợ vác lên tận tầng
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
              Đội ngũ nhân viên DucBel chuyên nghiệp luôn sẵn sàng hỗ trợ khách hàng mang bao gạo nặng lên phòng chung cư hoặc nhà riêng. Quý khách kiểm tra gạo chuẩn mùi thơm trước khi thanh toán.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/san-pham"
                className="px-6 py-2.5 rounded-lg bg-white text-[#166534] font-bold text-sm hover:bg-[#FFFBF2] transition-colors shadow-xs"
              >
                Đặt mua ngay
              </Link>
              <Link
                to="/chinh-sach-giao-hang"
                className="px-6 py-2.5 rounded-lg border border-white/60 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Chi tiết chính sách
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

