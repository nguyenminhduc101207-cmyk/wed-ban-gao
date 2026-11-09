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
import { User } from './User';
import { DeliveryZone } from './DeliveryZone';
import { OrderItem } from './OrderItem';
import { OrderHistory } from './OrderHistory';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../common/enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  orderCode: string; // "GAO-2610-8902"

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ length: 100 })
  recipientName: string;

  @Column({ length: 20 })
  recipientPhone: string;

  @Column({ type: 'text' })
  recipientAddress: string;

  @Column({ nullable: true })
  deliveryZoneId: string;

  @ManyToOne(() => DeliveryZone, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deliveryZoneId' })
  deliveryZone: DeliveryZone;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWeightKg: number;

  @Column({ default: 0 })
  totalBags: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'text', nullable: true })
  staffNotes: string;

  @Column({ nullable: true })
  assignedStaffId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedStaffId' })
  assignedStaff: User;

  @Column({ nullable: true, unique: true, length: 100 })
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderHistory, (history) => history.order, { cascade: true })
  histories: OrderHistory[];
}
