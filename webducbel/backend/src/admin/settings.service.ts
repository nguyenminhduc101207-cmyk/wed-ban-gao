import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeliveryZone } from '../database/entities';
import {
  CreateZoneDto,
  SaveSettingsDto,
  UpdateZoneDto,
} from './dto/admin-extra.dto';

const DEFAULT_STORE_INFO = {
  name: 'DucBel',
  tagline: 'Cơm Lành Canh Ngọt | Gạo Sạch Thuần Nông',
  hotline: '0905 123 456',
  email: 'cskh@ducbel.vn',
  address: '124 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
  operatingHours: '07:30 - 21:00 hàng ngày',
};

const DEFAULT_POLICY = {
  autoCancelMinutes: 60,
  lowStockThreshold: 10,
  allowGuestCheckout: true,
  requirePhoneOtp: false,
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(DeliveryZone)
    private zoneRepo: Repository<DeliveryZone>,
  ) {}

  // Tự tạo bảng lưu cấu hình (không cần sửa file cấu hình database)
  async onModuleInit() {
    await this.dataSource.query(
      `CREATE TABLE IF NOT EXISTS app_settings (
         setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
         setting_value TEXT NOT NULL,
         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
       ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  }

  // ===================== CẤU HÌNH CHUNG =====================

  private async readKey<T extends object>(key: string, fallback: T): Promise<T> {
    const rows = await this.dataSource.query(
      'SELECT setting_value FROM app_settings WHERE setting_key = ?',
      [key],
    );
    if (!rows.length) return { ...fallback };
    try {
      return { ...fallback, ...JSON.parse(rows[0].setting_value) };
    } catch {
      return { ...fallback };
    }
  }

  private async writeKey(key: string, value: object) {
    await this.dataSource.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, JSON.stringify(value)],
    );
  }

  async getSettings() {
    const [storeInfo, policy] = await Promise.all([
      this.readKey('storeInfo', DEFAULT_STORE_INFO),
      this.readKey('policy', DEFAULT_POLICY),
    ]);
    return { storeInfo, policy };
  }

  async saveSettings(dto: SaveSettingsDto) {
    if (dto.storeInfo) {
      const current = await this.readKey('storeInfo', DEFAULT_STORE_INFO);
      await this.writeKey('storeInfo', { ...current, ...dto.storeInfo });
    }
    if (dto.policy) {
      const current = await this.readKey('policy', DEFAULT_POLICY);
      await this.writeKey('policy', { ...current, ...dto.policy });
    }
    return this.getSettings();
  }

  // ===================== VÙNG GIAO HÀNG =====================

  async listZones() {
    return this.zoneRepo.find({ order: { fee: 'ASC', name: 'ASC' } });
  }

  async createZone(dto: CreateZoneDto) {
    const zone = this.zoneRepo.create({
      name: dto.name.trim(),
      fee: Math.round(dto.fee),
      estimatedDelivery: dto.estimatedDelivery?.trim() || 'Giao trong ngày hoặc 24h',
      description: dto.description,
      isActive: dto.isActive ?? true,
    });
    return this.zoneRepo.save(zone);
  }

  async updateZone(id: string, dto: UpdateZoneDto) {
    const zone = await this.zoneRepo.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Không tìm thấy vùng giao hàng');
    }
    if (dto.name !== undefined) zone.name = dto.name.trim();
    if (dto.fee !== undefined) zone.fee = Math.round(dto.fee);
    if (dto.estimatedDelivery !== undefined) zone.estimatedDelivery = dto.estimatedDelivery.trim();
    if (dto.description !== undefined) zone.description = dto.description;
    if (dto.isActive !== undefined) zone.isActive = dto.isActive;
    return this.zoneRepo.save(zone);
  }

  /** "Xóa" vùng giao hàng = ngừng áp dụng, để đơn hàng cũ vẫn giữ thông tin vùng */
  async deleteZone(id: string) {
    const zone = await this.zoneRepo.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Không tìm thấy vùng giao hàng');
    }
    zone.isActive = false;
    await this.zoneRepo.save(zone);
    return { success: true, message: 'Đã ngừng áp dụng vùng giao hàng' };
  }
}
