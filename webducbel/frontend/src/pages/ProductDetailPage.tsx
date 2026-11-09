import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, ProductSku } from '../types';
import { useCart } from '../context/CartContext';
import { LoadingSkeleton, ErrorState } from '../components/common/FeedbackStates';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const fetchProduct = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.catalog.getProductBySlug(slug);
      setProduct(data);
      if (data.skus && data.skus.length > 0) {
        const defaultSku = data.skus.find((s) => s.isDefault && s.stock > 0) || data.skus.find((s) => s.stock > 0) || data.skus[0];
        setSelectedSku(defaultSku);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message={error || 'Sản phẩm không tồn tại'} onRetry={fetchProduct} />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB3LhDNUKiwfwDKNIV1QtkEcKJAYXjuSQTQKmR_VDpPcFX0Hf3yQ8vMsesje2GM-2elYW9dFYja9WAgxfz6Lhi-xaGJEWzkRx4W58A02Uf3oV_kRyWyqxncNoLEz4j50Fij0xD1z7_Dv4FOAHA0pD1jtcNVEmMtiDIQRkiWlsbxMYD91RvX8vEzeMsFphCLhVXNDcRPmse8YNMeygoKcR9JfUQUtHSjtipu8qCxr04',
      ];

  const currentPrice = selectedSku ? Number(selectedSku.price) : 0;
  const currentWeight = selectedSku ? Number(selectedSku.weightKg) : 0;
  const perKgPrice = currentWeight > 0 ? Math.round(currentPrice / currentWeight) : 0;

  const totalLinePrice = currentPrice * quantity;
  const totalLineWeight = currentWeight * quantity;

  const handleSkuChange = (sku: ProductSku) => {
    if (sku.stock <= 0) return;
    setSelectedSku(sku);
    setQuantity(1);
  };

  const handleAddToCart = (directCheckout = false) => {
    if (!selectedSku || selectedSku.stock <= 0) return;

    addItem({
      skuId: selectedSku.id,
      skuCode: selectedSku.skuCode,
      skuName: selectedSku.name,
      productName: product.name,
      weightKg: currentWeight,
      unitPrice: currentPrice,
      quantity,
      imageUrl: images[0],
    });

    if (directCheckout) {
      navigate('/thanh-toan');
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#4B5563] mb-6">
        <Link to="/" className="hover:text-[#166534] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Trang chủ</span>
        </Link>
        <span className="text-[#D1D5DB]">•</span>
        <Link to="/san-pham" className="hover:text-[#166534]">Sản phẩm</Link>
        <span className="text-[#D1D5DB]">•</span>
        <span className="text-[#121c2a] font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* MAIN 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-16">
        {/* CỘT TRÁI: GALLERY ẢNH */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Ảnh lớn chính */}
          <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D1D5DB]/60 flex items-center justify-center p-4 group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-[#166534] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
              <span className="material-symbols-outlined text-[16px]">eco</span>
              100% Gạo mới vụ mùa
            </div>

            <img
              src={images[activeImgIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`aspect-square rounded-xl p-1 bg-white border-2 transition-all overflow-hidden cursor-pointer ${
                    activeImgIndex === idx
                      ? 'border-[#166534] ring-2 ring-[#DCFCE7]'
                      : 'border-[#D1D5DB]/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}

          {/* 3 Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D1D5DB]/50 shadow-xs">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">verified</span>
              <span className="text-xs font-semibold text-[#121c2a]">Chuẩn {product.origin}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D1D5DB]/50 shadow-xs">
              <span className="material-symbols-outlined text-[#795900] text-[20px]">workspace_premium</span>
              <span className="text-xs font-semibold text-[#121c2a]">Gạo ngon thượng hạng</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#D1D5DB]/50 shadow-xs">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">nest_eco_leaf</span>
              <span className="text-xs font-semibold text-[#121c2a]">Không chất tẩy mùi</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN & MUA HÀNG */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4B5563]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdf9f] text-[#795900] font-bold uppercase tracking-wider text-[11px]">
                Đặc sản
              </span>
              <span>SKU: <strong className="text-[#121c2a]">{selectedSku?.skuCode || '---'}</strong></span>
              <span>•</span>
              <span>Xuất xứ: <strong className="text-[#121c2a]">{product.origin}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] tracking-tight">
              {product.name}
            </h1>

            {/* Trạng thái kho */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedSku && selectedSku.stock > 0 ? 'bg-[#166534] animate-pulse' : 'bg-[#B91C1C]'}`}></span>
              <span className={`text-xs font-bold ${selectedSku && selectedSku.stock > 0 ? 'text-[#166534]' : 'text-[#B91C1C]'}`}>
                {selectedSku && selectedSku.stock > 0
                  ? `Còn hàng (Kho sẵn ${selectedSku.stock} bao)`
                  : 'Tạm hết quy cách này'}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#404940] leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* KHỐI GIÁ NỔI BẬT */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#D1D5DB]/60 shadow-xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#166534] tracking-tight">
                {currentPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-sm text-[#4B5563] font-medium">
                / {selectedSku?.name || 'bao'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-[#121c2a]">
                Tương đương {perKgPrice.toLocaleString('vi-VN')}đ / kg
              </p>
              <p className="text-[11px] text-[#4B5563] italic">
                *Chỉ bán theo bao/túi đóng gói tiêu chuẩn
              </p>
            </div>
          </div>

          {/* BỘ CHỌN QUY CÁCH SKU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#121c2a]">Chọn quy cách đóng gói:</span>
              <span className="text-[#166534] font-medium">Bảo quản túi 3 lớp chống ẩm</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {product.skus?.map((sku) => {
                const isOutOfStock = sku.stock <= 0;
                const isSelected = selectedSku?.id === sku.id;

                if (isOutOfStock) {
                  return (
                    <button
                      key={sku.id}
                      type="button"
                      disabled
                      className="p-3 rounded-xl border border-dashed border-[#D1D5DB] bg-[#dee9fc]/20 text-[#4B5563]/60 cursor-not-allowed text-center select-none"
                    >
                      <span className="text-xs font-bold line-through block">{sku.name}</span>
                      <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] px-1.5 py-0.5 rounded font-semibold inline-block mt-1">
                        Tạm hết hàng
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => handleSkuChange(sku)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#166534] bg-[#DCFCE7] text-[#166534] shadow-xs ring-1 ring-[#166534]'
                        : 'border-[#D1D5DB]/70 bg-white text-[#121c2a] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center justify-center gap-1">
                      {sku.name}
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      )}
                    </span>
                    <span className="text-xs font-semibold block mt-0.5">
                      {Number(sku.price).toLocaleString('vi-VN')}đ
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHỌN SỐ BAO & TÍNH TOÁN REALTIME */}
          <div className="p-4 bg-[#eff4ff]/60 rounded-2xl border border-[#D1D5DB]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#121c2a]">Số bao đặt mua:</span>
              <div className="flex items-center bg-white rounded-lg border border-[#D1D5DB] p-1 shadow-xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#121c2a] hover:bg-[#dee9fc] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#121c2a] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={selectedSku && quantity >= selectedSku.stock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#121c2a] hover:bg-[#dee9fc] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Khối tóm tắt realtime */}
            <div className="p-3 bg-white rounded-xl border border-[#D1D5DB]/50 space-y-1.5 text-xs text-[#4B5563]">
              <div className="flex items-center justify-between">
                <span>Quy cách & số bao:</span>
                <span className="font-semibold text-[#121c2a]">
                  {quantity} bao × {currentWeight} kg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tổng khối lượng:</span>
                <span className="font-bold text-[#166534]">
                  {totalLineWeight} kg gạo sạch
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#D1D5DB]/40 text-sm">
                <span className="font-bold text-[#121c2a]">Tạm tính:</span>
                <span className="font-bold text-[#166534]">
                  {totalLinePrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Toast thông báo thêm giỏ */}
          {addedToast && (
            <div className="p-3 bg-[#DCFCE7] text-[#166534] rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Đã thêm {quantity} bao {selectedSku?.name} ({totalLineWeight} kg) vào giỏ hàng!
              </span>
              <Link to="/gio-hang" className="underline font-bold">
                Xem giỏ
              </Link>
            </div>
          )}

          {/* NÚT THAO TÁC CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={!selectedSku || selectedSku.stock <= 0}
              onClick={() => handleAddToCart(false)}
              className="flex-1 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] font-bold text-sm hover:bg-[#166534] hover:text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              Thêm vào giỏ hàng
            </button>
            <button
              type="button"
              disabled={!selectedSku || selectedSku.stock <= 0}
              onClick={() => handleAddToCart(true)}
              className="flex-1 h-12 rounded-xl bg-[#166534] text-white font-bold text-sm hover:bg-[#14532D] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

