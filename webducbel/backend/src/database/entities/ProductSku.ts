import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './Product';

@Entity('product_skus')
export class ProductSku {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.skus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ unique: true, length: 100 })
  skuCode: string;

  @Column({ length: 100 })
  name: string; // ví dụ: "Bao 5 kg"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weightKg: number; // 5.0

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  price: number; // 160000

  @Column({ default: 0 })
  stock: number; // Số bao tồn khả dụng

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;
}
