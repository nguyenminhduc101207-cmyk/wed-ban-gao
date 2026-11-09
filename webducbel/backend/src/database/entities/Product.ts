import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './Category';
import { ProductSku } from './ProductSku';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ unique: true, length: 200 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'Việt Nam' })
  origin: string;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductSku, (sku) => sku.product, { cascade: true })
  skus: ProductSku[];
}
