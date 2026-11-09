import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryZone } from '../database/entities';
import { DeliveryZoneService } from './delivery-zone.service';
import { DeliveryZoneController } from './delivery-zone.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryZone])],
  providers: [DeliveryZoneService],
  controllers: [DeliveryZoneController],
  exports: [DeliveryZoneService],
})
export class DeliveryZoneModule {}
