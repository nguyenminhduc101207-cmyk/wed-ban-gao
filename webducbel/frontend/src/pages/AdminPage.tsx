import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, DeliveryZone } from '../types';
import { LoadingSkeleton, ErrorState } from '../components/common/FeedbackStates';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/dang-nhap?redirect=/admin');
      } else if (user && user.role !== 'ADMIN') {
        setError('Bạn không có quyền truy cập trang quản trị Admin.');
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadAdminData = async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const [prodRes, zoneRes] = await Promise.all([
        api.catalog.getProducts({ limit: 50 }),
        api.deliveryZones.getAll(),
      ]);
      setProducts(prodRes.items || []);
      setZones(zoneRes || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  if (!authLoading && user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message="Chỉ có tài khoản có quyền ADMIN mới có thể vào trang quản trị hệ thống." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#D1D5DB]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#B91C1C] flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Bảng Điều Khiển Quản Trị Hệ Thống
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
            Quản lý Sản phẩm, Tồn kho & Vùng giao
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] text-xs font-bold">
            Admin: {user?.fullName}
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAdminData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI (2 cols): SẢN PHẨM & TỒN KHO */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#121c2a] pb-3 border-b border-[#D1D5DB]/40">
              Danh mục Gạo & Tồn kho SKU ({products.length} loại gạo)
            </h2>

            <div className="space-y-4">
              {products.map((prod) => (
                <div key={prod.id} className="p-4 rounded-xl border border-[#D1D5DB]/50 bg-[#eff4ff]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#121c2a]">{prod.name}</strong>
                    <span className="text-[#166534] font-semibold">{prod.origin}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#D1D5DB]/30">
                    {prod.skus?.map((sku) => (
                      <div key={sku.id} className="p-2 bg-white rounded-lg border border-[#D1D5DB]/40 text-xs">
                        <p className="font-bold text-[#121c2a]">{sku.name} ({sku.weightKg} kg)</p>
                        <p className="text-[#4B5563]">Mã: {sku.skuCode}</p>
                        <p className="text-[#166534] font-semibold">{Number(sku.price).toLocaleString('vi-VN')}đ</p>
                        <p className={`font-bold mt-1 ${sku.stock > 0 ? 'text-[#166534]' : 'text-[#B91C1C]'}`}>
                          Tồn kho: {sku.stock} bao
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI (1 col): VÙNG GIAO HÀNG */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D5DB]/60 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#121c2a] pb-3 border-b border-[#D1D5DB]/40">
              Biểu phí Vùng giao hàng ({zones.length} khu vực)
            </h2>

            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="p-3 bg-[#FFFBF2] rounded-xl border border-[#D1D5DB]/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#121c2a]">{zone.name}</strong>
                    <span className="font-bold text-[#166534]">{Number(zone.fee).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563]">{zone.description}</p>
                  <span className="text-[10px] text-[#795900] block">Thời gian: {zone.estimatedDelivery}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

