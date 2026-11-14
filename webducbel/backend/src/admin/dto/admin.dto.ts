import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ===================== SẢN PHẨM =====================

export class SkuInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên quy cách' })
  name: string;

  @IsNumber({}, { message: 'Khối lượng phải là số' })
  @Min(0.1, { message: 'Khối lượng phải lớn hơn 0' })
  weightKg: number;

  @IsNumber({}, { message: 'Giá bán phải là số' })
  @Min(0, { message: 'Giá bán không được âm' })
  price: number;

  @IsInt({ message: 'Tồn kho phải là số nguyên' })
  @Min(0, { message: 'Tồn kho không được âm' })
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên loại gạo' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập xuất xứ' })
  origin: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Sản phẩm cần ít nhất 1 quy cách đóng bao' })
  @ValidateNested({ each: true })
  @Type(() => SkuInputDto)
  skus: SkuInputDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  origin?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateSkuDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class AdjustStockDto {
  @IsIn(['import', 'export', 'set'], {
    message: 'Loại điều chỉnh phải là import, export hoặc set',
  })
  type: 'import' | 'export' | 'set';

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(0, { message: 'Số lượng không được âm' })
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

// ===================== DANH MỤC =====================

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên danh mục' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
