import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, ProductSku } from '../../types';

interface InventoryItem {
  id: string;
  skuId: string;
  productName: string;
  categoryName: string;
  packagingType: string;
  weightKg: number;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'out_of_stock'>('all');
  
  // Modal adjust stock
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'import' | 'export' | 'set'>('import');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustNote, setAdjustNote] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.catalog.getProducts({ limit: 50 });
      const inventoryList: InventoryItem[] = [];

      res.items.forEach((p: Product) => {
        (p.skus || []).forEach((sku: ProductSku) => {
          inventoryList.push({
            id: `${p.id}_${sku.id}`,
            skuId: sku.id,
            productName: p.name,
            categoryName: p.category?.name || 'Gạo sạch',
            packagingType: sku.name || `Bao ${sku.weightKg}kg`,
            weightKg: sku.weightKg,
            price: sku.price,
            stock: sku.stock !== undefined ? sku.stock : 50,
            lowStockThreshold: 10,
          });
        });
      });

      setItems(inventoryList);
    } catch (err) {
      console.error('Failed to load products for inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // KPI calculations
  const totalSkus = items.length;
  const totalBags = items.reduce((sum, item) => sum + item.stock, 0);
  const totalWeightKg = items.reduce((sum, item) => sum + item.stock * item.weightKg, 0);
  const lowStockCount = items.filter((item) => item.stock > 0 && item.stock <= item.lowStockThreshold).length;
  const outOfStockCount = items.filter((item) => item.stock === 0).length;

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.packagingType.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'warning') {
      return item.stock > 0 && item.stock <= item.lowStockThreshold;
    }
    if (filterStatus === 'out_of_stock') {
      return item.stock === 0;
    }
    return true;
  });

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustModalItem(item);
    setAdjustType('import');
    setAdjustQuantity(10);
    setAdjustNote('');
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    let newStock = adjustModalItem.stock;
    if (adjustType === 'import') {
      newStock += adjustQuantity;
    } else if (adjustType === 'export') {
      newStock = Math.max(0, newStock - adjustQuantity);
    } else {
      newStock = Math.max(0, adjustQuantity);
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === adjustModalItem.id ? { ...i, stock: newStock } : i,
      ),
    );

    const actionText =
      adjustType === 'import'
        ? `Nhập thêm ${adjustQuantity} bao`
        : adjustType === 'export'
        ? `Xuất kho ${adjustQuantity} bao`
        : `Điều chỉnh số dư thành ${newStock} bao`;

    showNotification(`Đã cập nhật kho: ${adjustModalItem.productName} (${adjustModalItem.packagingType}) - ${actionText}!`);
    setAdjustModalItem(null);
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">Quản lý Kho Gạo DucBel</h1>
          <p className="text-xs text-[#424754] mt-1">
            Theo dõi tồn kho theo số lượng bao, quy cách đóng gói và cảnh báo thiếu hàng kịp thời.
          </p>
        </div>
        <button
          onClick={loadInventory}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c2c6d6] text-[#191b23] rounded-xl text-xs font-bold hover:bg-[#f2f3fa] transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới tồn kho
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng mặt hàng SKU
          </span>
          <div className="text-2xl font-bold text-[#191b23]">{totalSkus}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Quy cách bao lưu thông</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng số bao tồn
          </span>
          <div className="text-2xl font-bold text-[#0058be]">{totalBags.toLocaleString('vi-VN')} bao</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Tất cả các kho Đà Nẵng</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Tổng trọng lượng
          </span>
          <div className="text-2xl font-bold text-[#006e1c]">
            {(totalWeightKg / 1000).toFixed(1)} <span className="text-sm">tấn</span>
            <span className="text-xs font-normal text-gray-400 ml-1">({totalWeightKg.toLocaleString('vi-VN')} kg)</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Quy đổi sản lượng khả dụng</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#424754] uppercase tracking-wider block mb-1">
            Cảnh báo thiếu kho
          </span>
          <div className="text-2xl font-bold text-[#ba1a1a]">
            {lowStockCount + outOfStockCount}{' '}
            <span className="text-xs font-normal text-gray-500">
              ({outOfStockCount} hết hàng)
            </span>
          </div>
          <span className="text-[10px] text-[#ba1a1a] mt-1 block font-semibold">Cần lên đơn nhập thêm</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/60 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên gạo, quy cách bao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#0058be] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#424754] hover:bg-gray-200'
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'warning'
                ? 'bg-[#b45309] text-white shadow-xs'
                : 'bg-[#fef3c7] text-[#b45309] hover:bg-[#fde68a]'
            }`}
          >
            Sắp hết hàng ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'out_of_stock'
                ? 'bg-[#ba1a1a] text-white shadow-xs'
                : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffc6c1]'
            }`}
          >
            Hết hàng ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#c2c6d6]/60 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#424754]">
            <div className="w-8 h-8 border-3 border-[#0058be] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải dữ liệu tồn kho...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#424754]">
            Không tìm thấy sản phẩm kho phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f3fa] text-[#424754] border-b border-[#c2c6d6]/60 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tên sản phẩm gạo</th>
                  <th className="py-3 px-4">Quy cách bao</th>
                  <th className="py-3 px-4 text-right">Đơn giá niêm yết</th>
                  <th className="py-3 px-4 text-center">Tồn kho (Bao)</th>
                  <th className="py-3 px-4 text-center">Quy đổi (Kg)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/40 text-[#191b23]">
                {filteredItems.map((item) => {
                  const isOutOfStock = item.stock === 0;
                  const isLow = !isOutOfStock && item.stock <= item.lowStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="py-3.5 px-4 font-bold">
                        <div className="text-sm text-[#191b23]">{item.productName}</div>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {item.categoryName} • Mã SKU: {item.skuId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0058be]">
                        {item.packagingType} ({item.weightKg} kg/bao)
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                        {item.price.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-base font-extrabold ${
                          isOutOfStock ? 'text-[#ba1a1a]' : isLow ? 'text-[#b45309]' : 'text-[#006e1c]'
                        }`}>
                          {item.stock}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1">bao</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-600">
                        {(item.stock * item.weightKg).toLocaleString('vi-VN')} kg
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            Hết hàng
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]"></span>
                            Sắp hết (≤ 10 bao)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#006e1c]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>
                            Dồi dào
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#f2f3fa] hover:bg-[#e0e2ec] text-[#0058be] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                          Nhập / Xuất kho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adjust Stock */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#c2c6d6]/60">
            <div className="flex items-center justify-between pb-3 border-b border-[#c2c6d6]/40 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#191b23]">Điều chỉnh Tồn kho Gạo</h2>
                <p className="text-xs text-gray-500">
                  {adjustModalItem.productName} ({adjustModalItem.packagingType})
                </p>
              </div>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              <div className="p-3 bg-[#f2f3fa] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#424754] font-medium">Tồn kho hiện tại:</span>
                <span className="font-bold text-base text-[#0058be]">
                  {adjustModalItem.stock} bao ({adjustModalItem.stock * adjustModalItem.weightKg} kg)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-2">Loại thao tác:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('import')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'import'
                        ? 'bg-[#dcfce7] border-[#006e1c] text-[#006e1c]'
                        : 'border-[#c2c6d6] text-[#424754] hover:bg-gray-50'
                    }`}
                  >
                    + Nhập thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('export')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'export'
                        ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#ba1a1a]'
                        : 'border-[#c2c6d6] text-[#424754] hover:bg-gray-50'
                    }`}
                  >
                    - Xuất kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('set')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'set'
                        ? 'bg-[#dbeafe] border-[#0058be] text-[#0058be]'
                        : 'border-[#c2c6d6] text-[#424754] hover:bg-gray-50'
                    }`}
                  >
                    = Cân kiểm kê
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">
                  {adjustType === 'set' ? 'Số lượng bao thực tế tồn:' : 'Số bao cần thay đổi:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-sm font-bold text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                    bao ({adjustQuantity * adjustModalItem.weightKg} kg)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Ghi chú lý do:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhập lô gạo mới vụ Mùa, Xuất bù đơn lỗi..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f3fa] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c2c6d6]/40">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#424754] hover:bg-gray-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] shadow-sm"
                >
                  Xác nhận cập nhật kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminInventoryPage;
