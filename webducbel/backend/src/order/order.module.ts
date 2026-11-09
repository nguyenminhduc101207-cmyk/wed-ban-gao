import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderItem,
  OrderHistory,
  ProductSku,
  DeliveryZone,
} from '../database/entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderHistory,
      ProductSku,
      DeliveryZone,
    ]),
    AuthModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
