import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('categories')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('products/featured')
  async getFeaturedProducts() {
    return this.catalogService.getFeaturedProducts();
  }

  @Get('products')
  async getProducts(
    @Query('search') search?: string,
    @Query('category') categorySlug?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.catalogService.getProducts({
      search,
      categorySlug,
      sort,
      page,
      limit,
    });
  }

  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
