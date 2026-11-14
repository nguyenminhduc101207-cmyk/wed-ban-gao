import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PeopleService } from './people.service';
import { SettingsService } from './settings.service';
import { ReportsService } from './reports.service';
import {
  CreateStaffDto,
  CreateZoneDto,
  SaveSettingsDto,
  UpdateCustomerDto,
  UpdateStaffDto,
  UpdateZoneDto,
} from './dto/admin-extra.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

// Khách hàng, nhân viên, vùng giao hàng, cài đặt, báo cáo: chỉ dành cho ADMIN
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminExtraController {
  constructor(
    private peopleService: PeopleService,
    private settingsService: SettingsService,
    private reportsService: ReportsService,
  ) {}

  // ----- Khách hàng -----
  @Get('customers')
  listCustomers(@Query('search') search?: string) {
    return this.peopleService.listCustomers(search);
  }

  @Patch('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.peopleService.updateCustomer(id, dto);
  }

  // ----- Nhân viên -----
  @Get('staff')
  listStaff() {
    return this.peopleService.listStaff();
  }

  @Post('staff')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.peopleService.createStaff(dto);
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: any,
  ) {
    return this.peopleService.updateStaff(id, dto, user.sub);
  }

  // ----- Vùng giao hàng -----
  @Get('delivery-zones')
  listZones() {
    return this.settingsService.listZones();
  }

  @Post('delivery-zones')
  createZone(@Body() dto: CreateZoneDto) {
    return this.settingsService.createZone(dto);
  }

  @Patch('delivery-zones/:id')
  updateZone(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
    return this.settingsService.updateZone(id, dto);
  }

  @Delete('delivery-zones/:id')
  deleteZone(@Param('id') id: string) {
    return this.settingsService.deleteZone(id);
  }

  // ----- Cài đặt chung -----
  @Get('settings')
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put('settings')
  saveSettings(@Body() dto: SaveSettingsDto) {
    return this.settingsService.saveSettings(dto);
  }

  // ----- Báo cáo -----
  @Get('reports')
  getReport(@Query('range') range?: string) {
    return this.reportsService.getReport(range);
  }
}
