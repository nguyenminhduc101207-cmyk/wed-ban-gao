import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
      synchronize: true, // Dành cho môi trường phát triển local
      logging: false,
    }),
    TypeOrmModule.forFeature([
      User,
      Category,
      Product,
      ProductSku,
      DeliveryZone,
      Order,
      OrderItem,
      OrderHistory,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
