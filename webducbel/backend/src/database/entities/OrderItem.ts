import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './Order';
import { ProductSku } from './ProductSku';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  skuId: string;

  @ManyToOne(() => ProductSku, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'skuId' })
  sku: ProductSku;

  @Column({ length: 200 })
  productName: string;

  @Column({ length: 100 })
  skuName: string; // "Bao 5 kg"

  @Column({ length: 100 })
  skuCode: string; // "GAO-ST25-5KG"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weightKg: number; // 5.0

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  unitPrice: number; // 160000

  @Column({ default: 1 })
  quantity: number; // 2 bao

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  lineTotal: number; // 320000

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineWeight: number; // 10.0 kg

  @Column({ type: 'text', nullable: true })
  imageUrl: string;
}
