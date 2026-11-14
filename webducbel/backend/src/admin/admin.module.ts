import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Category,
  DeliveryZone,
  Product,
  ProductSku,
  User,
} from '../database/entities';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PeopleService } from './people.service';
import { SettingsService } from './settings.service';
import { ReportsService } from './reports.service';
import { AdminExtraController } from './admin-extra.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductSku, User, DeliveryZone]),
    AuthModule,
  ],
  providers: [AdminService, PeopleService, SettingsService, ReportsService],
  controllers: [AdminController, AdminExtraController],
})
export class AdminModule {}
