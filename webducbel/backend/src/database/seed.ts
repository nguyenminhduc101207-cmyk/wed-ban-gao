import { config } from 'dotenv';
config();
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import {
  User,
  Category,
  Product,
  ProductSku,
  DeliveryZone,
  Order,
  OrderItem,
  OrderHistory,
} from './entities';
import { UserRole, OrderStatus, PaymentStatus, PaymentMethod } from '../common/enums';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'gao_nha_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    entities: [
      User,
      Category,
      Product,
      ProductSku,
      DeliveryZone,
      Order,
      OrderItem,
      OrderHistory,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to MySQL for seeding...');

  const userRepo = dataSource.getRepository(User);
  const catRepo = dataSource.getRepository(Category);
  const prodRepo = dataSource.getRepository(Product);
  const skuRepo = dataSource.getRepository(ProductSku);
  const zoneRepo = dataSource.getRepository(DeliveryZone);
  const orderRepo = dataSource.getRepository(Order);
  const itemRepo = dataSource.getRepository(OrderItem);
  const historyRepo = dataSource.getRepository(OrderHistory);

  // 1. Seed Users
  let admin = await userRepo.findOne({ where: { email: 'admin@gaonha.vn' } });
  if (!admin) {
    admin = userRepo.create({
      email: 'admin@gaonha.vn',
      fullName: 'Quản Trị Viên Gạo Nhà',
      phone: '0901234567',
      role: UserRole.ADMIN,
      passwordHash: await argon2.hash('Admin@123456'),
    });
    await userRepo.save(admin);
    console.log('Created Admin user: admin@gaonha.vn / Admin@123456');
  }

  let staff = await userRepo.findOne({ where: { email: 'staff@gaonha.vn' } });
  if (!staff) {
    staff = userRepo.create({
      email: 'staff@gaonha.vn',
      fullName: 'Lê Văn Kho (Nhân Viên)',
      phone: '0907654321',
      role: UserRole.STAFF,
      passwordHash: await argon2.hash('Staff@123456'),
    });
    await userRepo.save(staff);
    console.log('Created Staff user: staff@gaonha.vn / Staff@123456');
  }

  let customer = await userRepo.findOne({ where: { email: 'nguyenvanan@gmail.com' } });
  if (!customer) {
    customer = userRepo.create({
      email: 'nguyenvanan@gmail.com',
      fullName: 'Nguyễn Văn An',
      phone: '0912345678',
      role: UserRole.CUSTOMER,
      address: 'Số 45/12 Đường Số 8, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh',
      passwordHash: await argon2.hash('Customer@123456'),
    });
    await userRepo.save(customer);
    console.log('Created Customer user: nguyenvanan@gmail.com / Customer@123456');
  }

  // 2. Seed Delivery Zones
  const existingZones = await zoneRepo.count();
  let defaultZone: DeliveryZone;
  if (existingZones === 0) {
    defaultZone = await zoneRepo.save(
      zoneRepo.create({
        name: 'Nội thành TP.HCM (Thủ Đức, Q.1, Q.3, Bình Thạnh...)',
        fee: 25000,
        description: 'Đội ngũ Gạo Nhà cam kết hỗ trợ bốc vác tận cửa hoặc phòng chung cư',
        estimatedDelivery: 'Giao trong ngày hoặc 24h',
      }),
    );
    await zoneRepo.save(
      zoneRepo.create({
        name: 'Ngoại thành TP.HCM (Hóc Môn, Củ Chi, Cần Giờ...)',
        fee: 35000,
        description: 'Giao trong 24h đến 48h',
        estimatedDelivery: '1-2 ngày',
      }),
    );
    await zoneRepo.save(
      zoneRepo.create({
        name: 'Tỉnh lân cận (Bình Dương, Đồng Nai)',
        fee: 45000,
        description: 'Giao hàng tiêu chuẩn 2-3 ngày',
        estimatedDelivery: '2-3 ngày',
      }),
    );
    console.log('Seeded delivery zones.');
  } else {
    defaultZone = await zoneRepo.findOne({ where: { isActive: true } });
  }

  // 3. Seed Categories
  const existingCats = await catRepo.count();
  let catGaoThom: Category;
  if (existingCats === 0) {
    catGaoThom = await catRepo.save(
      catRepo.create({
        name: 'Gạo thơm',
        slug: 'gao-thom',
        description: 'Gạo thơm tự nhiên, dẻo vừa, hương lài, lá dứa',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAfKJPtecF-tk1GDOJwtndY2pqXWOBHpa8Q1OhCxq94ZfyvQmRiy3myQVbH6udgDfOCACDYQuPAsF45b0iazvuvOx2o5JqZ0Qpbtw8ArDKNsmenKx_ZN4JgIls2pbbBmB8_Q9xMo3Wy9QV4VfreZxkNXVqrBWiepz7RK0vnOBWnHRgxZazyFe3bKM-hjLKNqqTUGNclafxegqrKRyHZQfRvp2vCZLuYoiAOdErFXks',
        sortOrder: 1,
      }),
    );
    await catRepo.save(
      catRepo.create({
        name: 'Gạo dẻo',
        slug: 'gao-deo',
        description: 'Cơm mềm dẻo nhiều, thích hợp cho trẻ nhỏ và người cao tuổi',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBx1w_dQ-xe1iPakILr310t16NWy147NbRbrU-knqhhJ_Odg8PtsDMrfGdW-hxYtYvhibQ8dmC-zMWBPK_7euqXBGjOMs2BBEAQxznEgf0Nlc6SCBFv1Gd5kwYwT5-L4bahAbhMaFdxtq5qO_T02DGR0umNM8dmfpiCRtaF7JEvPPlSjap1OFJjU0lAq2G_yOBIho9GVCohPtBB5VgPaX_8Vpr1yvHkqGzXXs-WFqA',
        sortOrder: 2,
      }),
    );
    await catRepo.save(
      catRepo.create({
        name: 'Gạo lứt dinh dưỡng',
        slug: 'gao-lut',
        description: 'Giàu chất xơ và vitamin, tốt cho sức khỏe tim mạch và đường huyết',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuByvdBcZDCBaZcrR8S0RuJw0N1kHz66QGb9hGewnNr7z12ULIZC_rRsQNZ2fSk1ssTHJC_bDL0EdhytdKholHf2F0b5SxWzUGhw2KpRgs470raL0E_NmfvnnIQqJRNOpMUkOd5NTJH1QQ2tdhhbSErBMoTIMd4Fn75yFH2dcOuE6Kg5nqrSZpdxnkI4WmECmVphl6FfDibRflV7XW6KFNX7pl-1UYL7unWQxalSppw',
        sortOrder: 3,
      }),
    );
    await catRepo.save(
      catRepo.create({
        name: 'Gạo nếp đặc sản',
        slug: 'gao-nep',
        description: 'Hạt tròn mẩy, chuyên dùng đồ xôi, làm bánh truyền thống',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAlr8fH7fxxP1pHzfvh7kr16EB9xTxBh_qEJ0A9kOKrClPbKZr6l4V1VxqRJSDtOEEENx2DMLsh6FU-lIUvf1FhpdlHGtJPcCJOYNHwcQK-CaiQjZ3oNiud_dBYHUGQOjaQ4YqJTYlRJ2Sys9A_CT_rIHtEzgyJrCZHfR4X00MuNcD6rMuo9sR7HiTcEWhsWpy83As3jzSqfivcUUluL88Hq81icdKpUvZC5-_Kzis',
        sortOrder: 4,
      }),
    );
    console.log('Seeded categories.');
  } else {
    catGaoThom = await catRepo.findOne({ where: { slug: 'gao-thom' } });
  }

  // 4. Seed Products and SKUs
  const existingProds = await prodRepo.count();
  let st25Prod: Product;
  let st25Sku5kg: ProductSku;
  if (existingProds === 0) {
    // ST25
    st25Prod = await prodRepo.save(
      prodRepo.create({
        name: 'Gạo Thơm ST25 Thượng Hạng',
        slug: 'gao-thom-st25-thuong-hang',
        origin: 'Sóc Trăng',
        categoryId: catGaoThom?.id,
        isFeatured: true,
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
      }),
    );

    st25Sku5kg = await skuRepo.save(
      skuRepo.create({
        productId: st25Prod.id,
        skuCode: 'GAO-ST25-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 160000,
        stock: 48,
        isDefault: true,
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB3LhDNUKiwfwDKNIV1QtkEcKJAYXjuSQTQKmR_VDpPcFX0Hf3yQ8vMsesje2GM-2elYW9dFYja9WAgxfz6Lhi-xaGJEWzkRx4W58A02Uf3oV_kRyWyqxncNoLEz4j50Fij0xD1z7_Dv4FOAHA0pD1jtcNVEmMtiDIQRkiWlsbxMYD91RvX8vEzeMsFphCLhVXNDcRPmse8YNMeygoKcR9JfUQUtHSjtipu8qCxr04',
      }),
    );

    await skuRepo.save(
      skuRepo.create({
        productId: st25Prod.id,
        skuCode: 'GAO-ST25-10KG',
        name: 'Bao 10 kg',
        weightKg: 10.0,
        price: 310000,
        stock: 25,
        isDefault: false,
      }),
    );

    await skuRepo.save(
      skuRepo.create({
        productId: st25Prod.id,
        skuCode: 'GAO-ST25-2KG',
        name: 'Túi 2 kg',
        weightKg: 2.0,
        price: 70000,
        stock: 0, // Hết hàng
        isDefault: false,
      }),
    );

    // Gạo Thơm Lài Sữa
    const laiSua = await prodRepo.save(
      prodRepo.create({
        name: 'Gạo Thơm Lài Sữa',
        slug: 'gao-thom-lai-sua',
        origin: 'Long An',
        categoryId: catGaoThom?.id,
        isFeatured: true,
        shortDescription:
          'Hạt gạo trắng đục màu sữa, thơm nhẹ tự nhiên, cơm dẻo vừa ngọt nước phù sa thích hợp ăn hàng ngày.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDWtkFzD39a8b2CqFtfYnYQP_ACisMYf_MD-fRM1B-xKjmOc1vFUAliFnto3_3xa5gfuVaVJpo9SWiW4bIBG0iYggh2xE9zJsonZJ2z9Xnty3QMV7Dx44SwdS21ccsXHFHQKnAwW-EUJIUKezvSwHCYM3b_V-uweFRFRffmmSh11azZW5Io1DvzZFwnPwbIqtJyEYL_r60Kya0KPBMtYeO56uiFtgXTDTY3jaqgGC8',
        ],
      }),
    );
    await skuRepo.save(
      skuRepo.create({
        productId: laiSua.id,
        skuCode: 'GAO-LAISUA-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 135000,
        stock: 32,
        isDefault: true,
      }),
    );
    await skuRepo.save(
      skuRepo.create({
        productId: laiSua.id,
        skuCode: 'GAO-LAISUA-10KG',
        name: 'Bao 10 kg',
        weightKg: 10.0,
        price: 260000,
        stock: 18,
        isDefault: false,
      }),
    );

    // Gạo Nàng Hoa Chuẩn Mới
    const nangHoa = await prodRepo.save(
      prodRepo.create({
        name: 'Gạo Nàng Hoa Chuẩn Mới',
        slug: 'gao-nang-hoa-chuan-moi',
        origin: 'Tiền Giang',
        categoryId: catGaoThom?.id,
        isFeatured: true,
        shortDescription:
          'Gạo Nàng Hoa hạt thon dài, hương hoa thơm ngát, hạt cơm bóng mẩy, mềm dẻo không nhão.',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBx1w_dQ-xe1iPakILr310t16NWy147NbRbrU-knqhhJ_Odg8PtsDMrfGdW-hxYtYvhibQ8dmC-zMWBPK_7euqXBGjOMs2BBEAQxznEgf0Nlc6SCBFv1Gd5kwYwT5-L4bahAbhMaFdxtq5qO_T02DGR0umNM8dmfpiCRtaF7JEvPPlSjap1OFJjU0lAq2G_yOBIho9GVCohPtBB5VgPaX_8Vpr1yvHkqGzXXs-WFqA',
        ],
      }),
    );
    await skuRepo.save(
      skuRepo.create({
        productId: nangHoa.id,
        skuCode: 'GAO-NANGHOA-5KG',
        name: 'Bao 5 kg',
        weightKg: 5.0,
        price: 145000,
        stock: 40,
        isDefault: true,
      }),
    );

    console.log('Seeded products and SKUs.');
  } else {
    st25Prod = await prodRepo.findOne({ where: { slug: 'gao-thom-st25-thuong-hang' } });
    st25Sku5kg = await skuRepo.findOne({ where: { skuCode: 'GAO-ST25-5KG' } });
  }

  // 5. Seed sample Order for Nguyễn Văn An (GAO-2610-8902)
  const existingOrder = await orderRepo.findOne({ where: { orderCode: 'GAO-2610-8902' } });
  if (!existingOrder && customer && st25Sku5kg && defaultZone) {
    const sampleOrder = await orderRepo.save(
      orderRepo.create({
        orderCode: 'GAO-2610-8902',
        customerId: customer.id,
        recipientName: 'Nguyễn Văn An',
        recipientPhone: '0912 345 678',
        recipientAddress: 'Số 45/12 Đường Số 8, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh',
        deliveryZoneId: defaultZone.id,
        deliveryFee: 25000,
        subtotal: 320000,
        totalAmount: 345000,
        totalBags: 2,
        totalWeightKg: 10.0,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus: OrderStatus.DELIVERING,
        assignedStaffId: staff?.id,
        note: 'Giao giờ hành chính, vui lòng gọi trước khi tới',
      }),
    );

    await itemRepo.save(
      itemRepo.create({
        orderId: sampleOrder.id,
        skuId: st25Sku5kg.id,
        productName: 'Gạo Thơm ST25 Thượng Hạng',
        skuName: 'Bao 5 kg',
        skuCode: 'GAO-ST25-5KG',
        weightKg: 5.0,
        unitPrice: 160000,
        quantity: 2,
        lineTotal: 320000,
        lineWeight: 10.0,
        imageUrl: st25Sku5kg.imageUrl,
      }),
    );

    await historyRepo.save([
      historyRepo.create({
        orderId: sampleOrder.id,
        previousStatus: null,
        nextStatus: OrderStatus.PENDING,
        note: 'Khách hàng đặt đơn hàng thành công qua Website',
        actionByRole: 'CUSTOMER',
        actionByUserId: customer.id,
      }),
      historyRepo.create({
        orderId: sampleOrder.id,
        previousStatus: OrderStatus.PENDING,
        nextStatus: OrderStatus.CONFIRMED,
        note: 'Nhân viên đã xác nhận đơn hàng và kiểm tra kho',
        actionByRole: 'STAFF',
        actionByUserId: staff?.id,
      }),
      historyRepo.create({
        orderId: sampleOrder.id,
        previousStatus: OrderStatus.CONFIRMED,
        nextStatus: OrderStatus.PACKING,
        note: 'Đã đóng gói bao bì PE 3 lớp chống ẩm mốc',
        actionByRole: 'STAFF',
        actionByUserId: staff?.id,
      }),
      historyRepo.create({
        orderId: sampleOrder.id,
        previousStatus: OrderStatus.PACKING,
        nextStatus: OrderStatus.DELIVERING,
        note: 'Đã bàn giao cho nhân viên giao hàng Gạo Nhà',
        actionByRole: 'STAFF',
        actionByUserId: staff?.id,
      }),
    ]);

    console.log('Seeded sample order GAO-2610-8902.');
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
