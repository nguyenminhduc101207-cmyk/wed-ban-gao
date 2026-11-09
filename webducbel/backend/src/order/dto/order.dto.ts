import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderStatus } from '../../common/enums';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  skuId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CalculateQuoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString()
  @IsNotEmpty()
  deliveryZoneId: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString()
  @IsNotEmpty()
  deliveryZoneId: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên người nhận' })
  recipientName: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại người nhận' })
  recipientPhone: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ nhận hàng' })
  recipientAddress: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class TransitionStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  assignedStaffId?: string;
}
