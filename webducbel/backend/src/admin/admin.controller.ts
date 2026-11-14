import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  AdjustStockDto,
  CreateCategoryDto,
  CreateProductDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateSkuDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

// Toàn bộ API quản trị chỉ dành cho ADMIN
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ----- Sản phẩm -----
  @Get('products')
  listProducts(@Query('search') search?: string) {
    return this.adminService.listProducts(search);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ----- Quy cách (SKU) & tồn kho -----
  @Patch('skus/:id')
  updateSku(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
    return this.adminService.updateSku(id, dto);
  }

  @Post('skus/:id/stock')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.adminService.adjustStock(id, dto);
  }

  // ----- Danh mục -----
  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
