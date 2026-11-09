import { Controller, Get } from '@nestjs/common';
import { DeliveryZoneService } from './delivery-zone.service';

@Controller('api/delivery-zones')
export class DeliveryZoneController {
  constructor(private zoneService: DeliveryZoneService) {}

  @Get()
  async getAll() {
    return this.zoneService.getAll();
  }
}
