import { Category, Product, DeliveryZone, Order } from '../types';

export const FIXTURE_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Gạo thơm',
    slug: 'gao-thom',
    description: 'Gạo thơm tự nhiên, dẻo vừa, hương lài, lá dứa',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfKJPtecF-tk1GDOJwtndY2pqXWOBHpa8Q1OhCxq94ZfyvQmRiy3myQVbH6udgDfOCACDYQuPAsF45b0iazvuvOx2o5JqZ0Qpbtw8ArDKNsmenKx_ZN4JgIls2pbbBmB8_Q9xMo3Wy9QV4VfreZxkNXVqrBWiepz7RK0vnOBWnHRgxZazyFe3bKM-hjLKNqqTUGNclafxegqrKRyHZQfRvp2vCZLuYoiAOdErFXks',
    sortOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Gạo dẻo',
    slug: 'gao-deo',
    description: 'Cơm mềm dẻo nhiều, thích hợp cho trẻ nhỏ và người cao tuổi',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBx1w_dQ-xe1iPakILr310t16NWy147NbRbrU-knqhhJ_Odg8PtsDMrfGdW-hxYtYvhibQ8dmC-zMWBPK_7euqXBGjOMs2BBEAQxznEgf0Nlc6SCBFv1Gd5kwYwT5-L4bahAbhMaFdxtq5qO_T02DGR0umNM8dmfpiCRtaF7JEvPPlSjap1OFJjU0lAq2G_yOBIho9GVCohPtBB5VgPaX_8Vpr1yvHkqGzXXs-WFqA',
    sortOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Gạo lứt dinh dưỡng',
    slug: 'gao-lut',
    description: 'Giàu chất xơ và vitamin, tốt cho tim mạch và đường huyết',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByvdBcZDCBaZcrR8S0RuJw0N1kHz66QGb9hGewnNr7z12ULIZC_rRsQNZ2fSk1ssTHJC_bDL0EdhytdKholHf2F0b5SxWzUGhw2KpRgs470raL0E_NmfvnnIQqJRNOpMUkOd5NTJH1QQ2tdhhbSErBMoTIMd4Fn75yFH2dcOuE6Kg5nqrSZpdxnkI4WmECmVphl6FfDibRflV7XW6KFNX7pl-1UYL7unWQxalSppw',
    sortOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Gạo nếp đặc sản',
    slug: 'gao-nep',
    description: 'Hạt tròn mẩy, chuyên dùng đồ xôi, làm bánh truyền thống',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlr8fH7fxxP1pHzfvh7kr16EB9xTxBh_qEJ0A9kOKrClPbKZr6l4V1VxqRJSDtOEEENx2DMLsh6FU-lIUvf1FhpdlHGtJPcCJOYNHwcQK-CaiQjZ3oNiud_dBYHUGQOjaQ4YqJTYlRJ2Sys9A_CT_rIHtEzgyJrCZHfR4X00MuNcD6rMuo9sR7HiTcEWhsWpy83As3jzSqfivcUUluL88Hq81icdKpUvZC5-_Kzis',
    sortOrder: 4,
  },
];

export const FIXTURE_PRODUCTS: Product[] = [
  {
    id: 'prod-st25',
    name: 'Gạo Thơm ST25 Thượng Hạng',
    slug: 'gao-thom-st25-thuong-hang',
    origin: 'Sóc Trăng',
    isFeatured: true,
    isActive: true,
    shortDescription:
      'Giống lúa tiến vua hạt dài thon, khi nấu cho cơm dẻo mềm vị ngọt đậm và thoang thoảng hương lá dứa tự nhiên. Cơm để nguội vẫn giữ nguyên độ dẻo ngon.',
    description:
      'Gạo ST25 được mệnh danh là một trong những loại gạo ngon nhất thế giới. Canh tác tự nhiên theo mô hình tôm - lúa an toàn sinh học tại vùng đất phù sa Sóc Trăng. Sản phẩm đóng bao kín khí 3 lớp tiêu chuẩn chống ẩm mốc.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3LhDNUKiwfwDKNIV1QtkEcKJAYXjuSQTQKmR_VDpPcFX0Hf3yQ8vMsesje2GM-2elYW9dFYja9WAgxfz6Lhi-xaGJEWzkRx4W58A02Uf3oV_kRyWyqxncNoLEz4j50Fij0xD1z7_Dv4FOAHA0pD1jtcNVEmMtiDIQRkiWlsbxMYD91RvX8vEzeMsFphCLhVXNDcRPmse8YNMeygoKcR9JfUQUtHSjtipu8qCxr04',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWtkFzD39a8b2CqFtfYnYQP_ACisMYf_MD-fRM1B-xKjmOc1vFUAliFnto3_3xa5gfuVaVJpo9SWiW4bIBG0iYggh2xE9zJsonZJ2z9Xnty3QMV7Dx44SwdS21ccsXHFHQKnAwW-EUJIUKezvSwHCYM3b_V-uweFRFRffmmSh11azZW5Io1DvzZFwnPwbIqtJyEYL_r60Kya0KPBMtYeO56uiFtgXTDTY3jaqgGC8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlr8fH7fxxP1pHzfvh7kr16EB9xTxBh_qEJ0A9kOKrClPbKZr6l4V1VxqRJSDtOEEENx2DMLsh6FU-lIUvf1FhpdlHGtJPcCJOYNHwcQK-CaiQjZ3oNiud_dBYHUGQOjaQ4YqJTYlRJ2Sys9A_CT_rIHtEzgyJrCZHfR4X00MuNcD6rMuo9sR7HiTcEWhsWpy83As3jzSqfivcUUluL88Hq81icdKpUvZC5-_Kzis',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBx1w_dQ-xe1iPakILr310t16NWy147NbRbrU-knqhhJ_Odg8PtsDMrfGdW-hxYtYvhibQ8dmC-zMWBPK_7euqXBGjOMs2BBEAQxznEgf0Nlc6SCBFv1Gd5kwYwT5-L4bahAbhMaFdxtq5qO_T02DGR0umNM8dmfpiCRtaF7JEvPPlSjap1OFJjU0lAq2G_yOBIho9GVCohPtBB5VgPaX_8Vpr1yvHkqGzXXs-WFqA',
    ],
    skus: [
      {
        id: 'sku-st25-5kg',
        productId: 'prod-st25',
        skuCode: 'GAO-ST25-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 160000,
        stock: 48,
        isDefault: true,
        isActive: true,
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB3LhDNUKiwfwDKNIV1QtkEcKJAYXjuSQTQKmR_VDpPcFX0Hf3yQ8vMsesje2GM-2elYW9dFYja9WAgxfz6Lhi-xaGJEWzkRx4W58A02Uf3oV_kRyWyqxncNoLEz4j50Fij0xD1z7_Dv4FOAHA0pD1jtcNVEmMtiDIQRkiWlsbxMYD91RvX8vEzeMsFphCLhVXNDcRPmse8YNMeygoKcR9JfUQUtHSjtipu8qCxr04',
      },
      {
        id: 'sku-st25-10kg',
        productId: 'prod-st25',
        skuCode: 'GAO-ST25-10KG',
        name: 'Bao 10 kg',
        weightKg: 10.0,
        price: 310000,
        stock: 25,
        isDefault: false,
        isActive: true,
      },
      {
        id: 'sku-st25-2kg',
        productId: 'prod-st25',
        skuCode: 'GAO-ST25-2KG',
        name: 'Túi 2 kg',
        weightKg: 2.0,
        price: 70000,
        stock: 0, // Hết hàng
        isDefault: false,
        isActive: true,
      },
    ],
  },
  {
    id: 'prod-laisua',
    name: 'Gạo Thơm Lài Sữa',
    slug: 'gao-thom-lai-sua',
    origin: 'Long An',
    isFeatured: true,
    isActive: true,
    shortDescription:
      'Hạt gạo trắng đục màu sữa, thơm nhẹ tự nhiên, cơm dẻo vừa ngọt nước phù sa thích hợp ăn hàng ngày.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWtkFzD39a8b2CqFtfYnYQP_ACisMYf_MD-fRM1B-xKjmOc1vFUAliFnto3_3xa5gfuVaVJpo9SWiW4bIBG0iYggh2xE9zJsonZJ2z9Xnty3QMV7Dx44SwdS21ccsXHFHQKnAwW-EUJIUKezvSwHCYM3b_V-uweFRFRffmmSh11azZW5Io1DvzZFwnPwbIqtJyEYL_r60Kya0KPBMtYeO56uiFtgXTDTY3jaqgGC8',
    ],
    skus: [
      {
        id: 'sku-laisua-5kg',
        productId: 'prod-laisua',
        skuCode: 'GAO-LAISUA-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 135000,
        stock: 32,
        isDefault: true,
        isActive: true,
      },
    ],
  },
  {
    id: 'prod-nanghoa',
    name: 'Gạo Nàng Hoa Chuẩn Mới',
    slug: 'gao-nang-hoa-chuan-moi',
    origin: 'Tiền Giang',
    isFeatured: true,
    isActive: true,
    shortDescription:
      'Gạo Nàng Hoa hạt thon dài, hương hoa thơm ngát, hạt cơm bóng mẩy, mềm dẻo không nhão.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBx1w_dQ-xe1iPakILr310t16NWy147NbRbrU-knqhhJ_Odg8PtsDMrfGdW-hxYtYvhibQ8dmC-zMWBPK_7euqXBGjOMs2BBEAQxznEgf0Nlc6SCBFv1Gd5kwYwT5-L4bahAbhMaFdxtq5qO_T02DGR0umNM8dmfpiCRtaF7JEvPPlSjap1OFJjU0lAq2G_yOBIho9GVCohPtBB5VgPaX_8Vpr1yvHkqGzXXs-WFqA',
    ],
    skus: [
      {
        id: 'sku-nanghoa-5kg',
        productId: 'prod-nanghoa',
        skuCode: 'GAO-NANGHOA-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 145000,
        stock: 40,
        isDefault: true,
        isActive: true,
      },
    ],
  },
];

export const FIXTURE_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Nội thành TP.HCM (Thủ Đức, Q.1, Q.3, Bình Thạnh...)',
    fee: 25000,
    description: 'Đội ngũ DucBel cam kết hỗ trợ bốc vác tận cửa hoặc phòng chung cư',
    estimatedDelivery: 'Giao trong ngày hoặc 24h',
    isActive: true,
  },
  {
    id: 'zone-2',
    name: 'Ngoại thành TP.HCM (Hóc Môn, Củ Chi, Cần Giờ...)',
    fee: 35000,
    description: 'Giao trong 24h đến 48h',
    estimatedDelivery: '1-2 ngày',
    isActive: true,
  },
];

