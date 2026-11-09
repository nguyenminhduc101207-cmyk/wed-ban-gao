import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import {
  Order,
  OrderItem,
  OrderHistory,
  ProductSku,
  DeliveryZone,
  User,
} from '../database/entities';
import { OrderStatus, PaymentStatus, PaymentMethod, UserRole } from '../common/enums';
import { CalculateQuoteDto, CreateOrderDto, TransitionStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderHistory)
    private historyRepo: Repository<OrderHistory>,
    @InjectRepository(ProductSku)
    private skuRepo: Repository<ProductSku>,
    @InjectRepository(DeliveryZone)
    private zoneRepo: Repository<DeliveryZone>,
  ) {}

  async calculateQuote(dto: CalculateQuoteDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Giỏ hàng chưa có sản phẩm');
    }

    const zone = await this.zoneRepo.findOne({
      where: { id: dto.deliveryZoneId, isActive: true },
    });
    if (!zone) {
      throw new BadRequestException('Vùng giao hàng không hợp lệ hoặc đã ngừng phục vụ');
    }

    const skuIds = dto.items.map((i) => i.skuId);
    const skus = await this.skuRepo.find({
      where: { id: In(skuIds), isActive: true },
      relations: ['product'],
    });

    const skuMap = new Map<string, ProductSku>();
    skus.forEach((s) => skuMap.set(s.id, s));

    let subtotal = 0;
    let totalWeightKg = 0;
    let totalBags = 0;

    const lineItems = dto.items.map((item) => {
      const sku = skuMap.get(item.skuId);
      if (!sku) {
        throw new BadRequestException(`Sản phẩm quy cách không còn tồn tại`);
      }
      if (sku.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${sku.product?.name} - ${sku.name}" chỉ còn ${sku.stock} bao trong kho`,
        );
      }

      const itemPrice = Number(sku.price);
      const itemWeight = Number(sku.weightKg);
      const lineTotal = itemPrice * item.quantity;
      const lineWeight = itemWeight * item.quantity;

      subtotal += lineTotal;
      totalWeightKg += lineWeight;
      totalBags += item.quantity;

      return {
        skuId: sku.id,
        skuCode: sku.skuCode,
        skuName: sku.name,
        productName: sku.product?.name,
        imageUrl: sku.imageUrl || sku.product?.images?.[0],
        unitPrice: itemPrice,
        quantity: item.quantity,
        weightKg: itemWeight,
        lineTotal,
        lineWeight,
      };
    });

    const deliveryFee = Number(zone.fee);
    const totalAmount = subtotal + deliveryFee;

    return {
      lineItems,
      subtotal,
      deliveryFee,
      totalAmount,
      totalWeightKg,
      totalBags,
      deliveryZone: zone,
    };
  }

  async createOrder(dto: CreateOrderDto, user?: any) {
    // 1. Kiểm tra idempotency
    if (dto.idempotencyKey) {
      const existing = await this.orderRepo.findOne({
        where: { idempotencyKey: dto.idempotencyKey },
        relations: ['items', 'deliveryZone', 'histories'],
      });
      if (existing) {
        return existing;
      }
    }

    const quote = await this.calculateQuote({
      items: dto.items,
      deliveryZoneId: dto.deliveryZoneId,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Trừ tồn kho và kiểm tra concurrency
      for (const item of quote.lineItems) {
        const sku = await queryRunner.manager.findOne(ProductSku, {
          where: { id: item.skuId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!sku || sku.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm quy cách "${item.skuName}" đã hết hàng hoặc không đủ tồn kho`,
          );
        }

        sku.stock -= item.quantity;
        await queryRunner.manager.save(sku);
      }

      // 3. Tạo mã đơn hàng độc nhất dạng GAO-YYMM-XXXX
      const datePart = new Date()
        .toISOString()
        .slice(2, 7)
        .replace('-', '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `GAO-${datePart}-${randomPart}`;

      // 4. Lưu đơn hàng
      const order = queryRunner.manager.create(Order, {
        orderCode,
        customerId: user?.sub || null,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        recipientAddress: dto.recipientAddress,
        deliveryZoneId: dto.deliveryZoneId,
        deliveryFee: quote.deliveryFee,
        subtotal: quote.subtotal,
        totalAmount: quote.totalAmount,
        totalWeightKg: quote.totalWeightKg,
        totalBags: quote.totalBags,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus: OrderStatus.PENDING,
        note: dto.note,
        idempotencyKey: dto.idempotencyKey,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 5. Lưu order items
      const orderItems = quote.lineItems.map((item) =>
        queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          skuId: item.skuId,
          skuCode: item.skuCode,
          skuName: item.skuName,
          productName: item.productName,
          weightKg: item.weightKg,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          lineWeight: item.lineWeight,
          imageUrl: item.imageUrl,
        }),
      );
      await queryRunner.manager.save(orderItems);

      // 6. Ghi lịch sử đơn hàng đầu tiên
      const history = queryRunner.manager.create(OrderHistory, {
        orderId: savedOrder.id,
        previousStatus: null,
        nextStatus: OrderStatus.PENDING,
        note: 'Khách hàng tạo đơn hàng thành công qua Website Gạo Nhà',
        actionByRole: user?.role || 'CUSTOMER',
        actionByUserId: user?.sub || null,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      return this.getOrderById(savedOrder.id, user);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrderByCode(code: string) {
    const order = await this.orderRepo.findOne({
      where: { orderCode: code },
      relations: ['items', 'deliveryZone', 'histories', 'customer'],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng mã ${code}`);
    }

    return order;
  }

  async getOrderById(id: string, user?: any) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'deliveryZone', 'histories', 'assignedStaff', 'customer'],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng`);
    }

    if (
      user &&
      user.role === UserRole.CUSTOMER &&
      order.customerId &&
      order.customerId !== user.sub
    ) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  async getMyOrders(user: any) {
    return this.orderRepo.find({
      where: { customerId: user.sub },
      relations: ['items', 'deliveryZone'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStaffOrders(status?: OrderStatus) {
    const where: any = {};
    if (status) {
      where.orderStatus = status;
    }
    return this.orderRepo.find({
      where,
      relations: ['items', 'deliveryZone', 'customer', 'assignedStaff'],
      order: { createdAt: 'DESC' },
    });
  }

  async transitionStatus(
    orderId: string,
    dto: TransitionStatusDto,
    user: any,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.sku'],
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const prevStatus = order.orderStatus;
    const nextStatus = dto.status;

    // Kiểm tra tính hợp lệ của chuyển trạng thái theo luồng
    order.orderStatus = nextStatus;

    if (dto.assignedStaffId) {
      order.assignedStaffId = dto.assignedStaffId;
    }

    // Nếu đơn hàng giao thành công và là COD, cập nhật thanh toán đã thu
    if (nextStatus === OrderStatus.DELIVERED || nextStatus === OrderStatus.COMPLETED) {
      if (order.paymentMethod === PaymentMethod.COD) {
        order.paymentStatus = PaymentStatus.PAID;
      }
    }

    // Nếu duyệt hủy đơn (CANCELLED), hoàn lại số lượng tồn kho
    if (nextStatus === OrderStatus.CANCELLED && prevStatus !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        if (item.skuId) {
          await this.skuRepo.increment({ id: item.skuId }, 'stock', item.quantity);
        }
      }
    }

    await this.orderRepo.save(order);

    // Ghi lịch sử
    const history = this.historyRepo.create({
      orderId: order.id,
      previousStatus: prevStatus,
      nextStatus,
      note: dto.note || `Chuyển trạng thái sang ${nextStatus}`,
      actionByRole: user.role,
      actionByUserId: user.sub,
    });
    await this.historyRepo.save(history);

    return this.getOrderById(orderId, user);
  }

  async cancelOrder(orderId: string, note: string, user: any) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (user.role === UserRole.CUSTOMER && order.customerId !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
    }

    const prevStatus = order.orderStatus;

    if (prevStatus === OrderStatus.PENDING) {
      // Hủy trực tiếp vì chưa xác nhận
      order.orderStatus = OrderStatus.CANCELLED;
      // Hoàn tồn kho
      for (const item of order.items) {
        if (item.skuId) {
          await this.skuRepo.increment({ id: item.skuId }, 'stock', item.quantity);
        }
      }
      await this.orderRepo.save(order);

      await this.historyRepo.save(
        this.historyRepo.create({
          orderId: order.id,
          previousStatus: prevStatus,
          nextStatus: OrderStatus.CANCELLED,
          note: note || 'Khách hàng hủy đơn khi còn ở trạng thái chờ xác nhận',
          actionByRole: user.role,
          actionByUserId: user.sub,
        }),
      );

      return { success: true, message: 'Đã hủy đơn hàng thành công', order };
    } else if (
      prevStatus === OrderStatus.CONFIRMED ||
      prevStatus === OrderStatus.PACKING
    ) {
      // Gửi yêu cầu hủy
      order.orderStatus = OrderStatus.CANCEL_REQUESTED;
      await this.orderRepo.save(order);

      await this.historyRepo.save(
        this.historyRepo.create({
          orderId: order.id,
          previousStatus: prevStatus,
          nextStatus: OrderStatus.CANCEL_REQUESTED,
          note: note || 'Khách hàng gửi yêu cầu hủy đơn hàng',
          actionByRole: user.role,
          actionByUserId: user.sub,
        }),
      );

      return {
        success: true,
        message: 'Đã gửi yêu cầu hủy đơn. Cửa hàng sẽ duyệt trước khi xuất giao.',
        order,
      };
    } else {
      throw new BadRequestException(
        'Không thể hủy đơn hàng khi đơn đã xuất kho đi giao hoặc đã hoàn tất',
      );
    }
  }

  async confirmReceipt(orderId: string, user: any) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (user.role === UserRole.CUSTOMER && order.customerId !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
    }

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Chỉ có thể xác nhận nhận hàng khi đơn hàng đang ở trạng thái Đã giao hàng',
      );
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = OrderStatus.COMPLETED;
    await this.orderRepo.save(order);

    await this.historyRepo.save(
      this.historyRepo.create({
        orderId: order.id,
        previousStatus: prevStatus,
        nextStatus: OrderStatus.COMPLETED,
        note: 'Khách hàng xác nhận đã nhận đủ gạo và hài lòng',
        actionByRole: user.role,
        actionByUserId: user.sub,
      }),
    );

    return {
      success: true,
      message: 'Cảm ơn quý khách! Đơn hàng đã hoàn tất.',
      order,
    };
  }
}
