import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_zones')
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string; // "Nội thành TP.HCM (Thủ Đức, Q.1...)"

  @Column({ type: 'decimal', precision: 10, scale: 0, default: 25000 })
  fee: number; // 25000đ

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'Giao trong ngày hoặc 24h' })
  estimatedDelivery: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
