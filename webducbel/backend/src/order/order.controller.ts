import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CalculateQuoteDto,
  CreateOrderDto,
  TransitionStatusDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, OrderStatus } from '../common/enums';

@Controller('api/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('quote')
  @HttpCode(HttpStatus.OK)
  async calculateQuote(@Body() dto: CalculateQuoteDto) {
    return this.orderService.calculateQuote(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.createOrder(dto, user);
  }

  @Get('code/:code')
  async getOrderByCode(@Param('code') code: string) {
    return this.orderService.getOrderByCode(code);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@CurrentUser() user: any) {
    return this.orderService.getMyOrders(user);
  }

  @Get('staff/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async getStaffOrders(@Query('status') status?: OrderStatus) {
    return this.orderService.getStaffOrders(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.orderService.getOrderById(id, user);
  }

  @Post(':id/transition')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async transitionStatus(
    @Param('id') id: string,
    @Body() dto: TransitionStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.transitionStatus(id, dto, user);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Param('id') id: string,
    @Body('note') note: string,
    @CurrentUser() user: any,
  ) {
    return this.orderService.cancelOrder(orderIdOrId(id), note, user);
  }

  @Post(':id/confirm-receipt')
  @UseGuards(JwtAuthGuard)
  async confirmReceipt(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.orderService.confirmReceipt(id, user);
  }
}

function orderIdOrId(id: string) {
  return id;
}
