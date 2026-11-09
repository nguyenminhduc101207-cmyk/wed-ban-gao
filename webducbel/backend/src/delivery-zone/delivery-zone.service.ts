import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from '../database/entities';

@Injectable()
export class DeliveryZoneService {
  constructor(
    @InjectRepository(DeliveryZone)
    private zoneRepo: Repository<DeliveryZone>,
  ) {}

  async getAll() {
    return this.zoneRepo.find({
      where: { isActive: true },
      order: { fee: 'ASC' },
    });
  }
}
