import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  Min,
} from 'class-validator';

// ===================== KHÁCH HÀNG =====================

export class UpdateCustomerDto {
  @IsBoolean({ message: 'Trạng thái không hợp lệ' })
  isActive: boolean;
}

// ===================== NHÂN VIÊN =====================

export class CreateStaffDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(['STAFF', 'ADMIN'], { message: 'Vai trò phải là STAFF hoặc ADMIN' })
  role: 'STAFF' | 'ADMIN';
}

export class UpdateStaffDto {
  @IsOptional()
  @IsIn(['STAFF', 'ADMIN'], { message: 'Vai trò phải là STAFF hoặc ADMIN' })
  role?: 'STAFF' | 'ADMIN';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

// ===================== VÙNG GIAO HÀNG =====================

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên khu vực' })
  name: string;

  @IsNumber({}, { message: 'Phí giao hàng phải là số' })
  @Min(0, { message: 'Phí giao hàng không được âm' })
  fee: number;

  @IsOptional()
  @IsString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ===================== CÀI ĐẶT =====================

export class StoreInfoDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() hotline?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() operatingHours?: string;
}

export class PolicyDto {
  @IsOptional() @IsInt() @Min(1) autoCancelMinutes?: number;
  @IsOptional() @IsInt() @Min(1) lowStockThreshold?: number;
  @IsOptional() @IsBoolean() allowGuestCheckout?: boolean;
  @IsOptional() @IsBoolean() requirePhoneOtp?: boolean;
}

export class SaveSettingsDto {
  @IsOptional()
  @IsObject()
  storeInfo?: StoreInfoDto;

  @IsOptional()
  @IsObject()
  policy?: PolicyDto;
}
