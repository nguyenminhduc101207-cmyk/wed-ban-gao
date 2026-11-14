import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../database/entities';
import { UserRole } from '../common/enums';
import {
  CreateStaffDto,
  UpdateCustomerDto,
  UpdateStaffDto,
} from './dto/admin-extra.dto';

@Injectable()
export class PeopleService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ===================== KHÁCH HÀNG =====================

  /** Danh sách khách hàng kèm số đơn và tổng chi tiêu (không tính đơn đã hủy) */
  async listCustomers(search?: string) {
    const params: any[] = [UserRole.CUSTOMER];
    let where = 'u.role = ?';
    if (search && search.trim()) {
      where += ' AND (LOWER(u.fullName) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)';
      const s = `%${search.trim().toLowerCase()}%`;
      params.push(s, s, `%${search.trim()}%`);
    }

    const rows = await this.dataSource.query(
      `SELECT u.id, u.email, u.fullName, u.phone, u.address, u.isActive, u.createdAt,
              COALESCE(SUM(CASE WHEN o.orderStatus <> 'CANCELLED' THEN 1 ELSE 0 END), 0) AS ordersCount,
              COALESCE(SUM(CASE WHEN o.orderStatus <> 'CANCELLED' THEN o.totalAmount ELSE 0 END), 0) AS totalSpent
         FROM users u
         LEFT JOIN orders o ON o.customerId = u.id
        WHERE ${where}
        GROUP BY u.id
        ORDER BY u.createdAt DESC
        LIMIT 500`,
      params,
    );

    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      fullName: r.fullName,
      phone: r.phone,
      address: r.address,
      isActive: !!r.isActive,
      createdAt: r.createdAt,
      ordersCount: Number(r.ordersCount),
      totalSpent: Number(r.totalSpent),
    }));
  }

  /** Khóa / mở khóa tài khoản khách hàng */
  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    user.isActive = dto.isActive;
    await this.userRepo.save(user);
    return { id: user.id, isActive: user.isActive };
  }

  // ===================== NHÂN VIÊN & QUẢN TRỊ =====================

  async listStaff() {
    const rows = await this.dataSource.query(
      `SELECT u.id, u.email, u.fullName, u.phone, u.role, u.isActive, u.createdAt,
              (SELECT COUNT(*) FROM orders o WHERE o.assignedStaffId = u.id) AS ordersProcessed
         FROM users u
        WHERE u.role IN (?, ?)
        ORDER BY u.role ASC, u.createdAt ASC`,
      [UserRole.ADMIN, UserRole.STAFF],
    );

    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      fullName: r.fullName,
      phone: r.phone,
      role: r.role,
      isActive: !!r.isActive,
      createdAt: r.createdAt,
      ordersProcessed: Number(r.ordersProcessed),
    }));
  }

  async createStaff(dto: CreateStaffDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = this.userRepo.create({
      email,
      passwordHash,
      fullName: dto.fullName.trim(),
      phone: (dto.phone || '').trim() || '0000000000',
      role: dto.role === 'ADMIN' ? UserRole.ADMIN : UserRole.STAFF,
      isActive: true,
    });
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      email: saved.email,
      fullName: saved.fullName,
      phone: saved.phone,
      role: saved.role,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      ordersProcessed: 0,
    };
  }

  async updateStaff(id: string, dto: UpdateStaffDto, currentUserId: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.role === UserRole.CUSTOMER) {
      throw new NotFoundException('Không tìm thấy nhân sự');
    }

    const isSelf = user.id === currentUserId;
    const losesAdmin =
      user.role === UserRole.ADMIN && dto.role !== undefined && dto.role !== 'ADMIN';
    const getsLocked = dto.isActive === false;

    if (isSelf && (losesAdmin || getsLocked)) {
      throw new BadRequestException(
        'Bạn không thể tự khóa hoặc tự hạ quyền chính mình',
      );
    }

    // Luôn phải còn ít nhất 1 quản trị viên đang hoạt động
    if (user.role === UserRole.ADMIN && user.isActive && (losesAdmin || getsLocked)) {
      const activeAdmins = await this.userRepo.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException(
          'Hệ thống phải còn ít nhất 1 quản trị viên đang hoạt động',
        );
      }
    }

    if (dto.role !== undefined) {
      user.role = dto.role === 'ADMIN' ? UserRole.ADMIN : UserRole.STAFF;
    }
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();

    await this.userRepo.save(user);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
