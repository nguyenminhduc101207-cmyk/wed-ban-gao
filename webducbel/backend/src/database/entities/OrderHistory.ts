import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './Order';
import { OrderStatus } from '../../common/enums';

@Entity('order_histories')
export class OrderHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.histories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  previousStatus: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  nextStatus: OrderStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ length: 50 })
  actionByRole: string; // 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SYSTEM'

  @Column({ nullable: true })
  actionByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
