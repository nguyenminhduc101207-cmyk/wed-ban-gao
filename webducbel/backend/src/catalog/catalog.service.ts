import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Product, ProductSku } from '../database/entities';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Category)
    private catRepo: Repository<Category>,
    @InjectRepository(Product)
    private prodRepo: Repository<Product>,
    @InjectRepository(ProductSku)
    private skuRepo: Repository<ProductSku>,
  ) {}

  async getCategories() {
    return this.catRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getFeaturedProducts() {
    return this.prodRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['skus', 'category'],
      order: { createdAt: 'DESC' },
      take: 8,
    });
  }

  async getProducts(params: {
    search?: string;
    categorySlug?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ? Math.max(1, Number(params.page)) : 1;
    const limit = params.limit ? Math.min(50, Math.max(1, Number(params.limit))) : 12;
    const skip = (page - 1) * limit;

    const qb = this.prodRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.skus', 'skus')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (params.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.origin) LIKE :search OR LOWER(product.shortDescription) LIKE :search)',
        { search: `%${params.search.toLowerCase()}%` },
      );
    }

    if (params.categorySlug) {
      qb.andWhere('category.slug = :catSlug', { catSlug: params.categorySlug });
    }

    if (params.sort === 'price_asc') {
      qb.orderBy('skus.price', 'ASC');
    } else if (params.sort === 'price_desc') {
      qb.orderBy('skus.price', 'DESC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prodRepo.findOne({
      where: { slug, isActive: true },
      relations: ['skus', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm '${slug}'`);
    }

    return product;
  }
}
