import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category, Product, ProductSku } from '../database/entities';
import {
  AdjustStockDto,
  CreateCategoryDto,
  CreateProductDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateSkuDto,
} from './dto/admin.dto';

// Chuyển "Gạo Thơm ST25" -> "gao-thom-st25"
export function slugify(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Category)
    private catRepo: Repository<Category>,
    @InjectRepository(Product)
    private prodRepo: Repository<Product>,
    @InjectRepository(ProductSku)
    private skuRepo: Repository<ProductSku>,
  ) {}

  // ===================== SẢN PHẨM =====================

  /** Danh sách tất cả sản phẩm (kể cả đang ẩn) cho trang quản trị */
  async listProducts(search?: string) {
    const qb = this.prodRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.skus', 'skus')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC');

    if (search && search.trim()) {
      qb.where(
        '(LOWER(product.name) LIKE :s OR LOWER(product.origin) LIKE :s)',
        { s: `%${search.trim().toLowerCase()}%` },
      );
    }

    return qb.take(200).getMany();
  }

  async createProduct(dto: CreateProductDto) {
    if (dto.categoryId) {
      const cat = await this.catRepo.findOne({ where: { id: dto.categoryId } });
      if (!cat) {
        throw new BadRequestException('Danh mục không tồn tại');
      }
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const skuRepo = manager.getRepository(ProductSku);

      const baseSlug = slugify(dto.name) || 'san-pham';
      const slug = await this.uniqueValue(
        (candidate) => productRepo.findOne({ where: { slug: candidate } }),
        baseSlug,
      );

      const product = productRepo.create({
        name: dto.name.trim(),
        slug,
        origin: dto.origin.trim(),
        categoryId: dto.categoryId || null,
        shortDescription: dto.shortDescription,
        description: dto.description,
        isFeatured: dto.isFeatured ?? false,
        isActive: dto.isActive ?? true,
        images: dto.images && dto.images.length > 0 ? dto.images : null,
      });
      const saved = await productRepo.save(product);

      const codeBase = slug.toUpperCase().slice(0, 60);
      let index = 0;
      for (const s of dto.skus) {
        const weightLabel = String(s.weightKg).replace('.', '_');
        const skuCode = await this.uniqueValue(
          (candidate) => skuRepo.findOne({ where: { skuCode: candidate } }),
          `${codeBase}-${weightLabel}KG`,
        );
        await skuRepo.save(
          skuRepo.create({
            productId: saved.id,
            skuCode,
            name: s.name.trim(),
            weightKg: s.weightKg,
            price: Math.round(s.price),
            stock: s.stock,
            imageUrl: s.imageUrl || null,
            isActive: true,
            isDefault: index === 0,
          }),
        );
        index++;
      }

      return productRepo.findOne({
        where: { id: saved.id },
        relations: ['skus', 'category'],
      });
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prodRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (dto.categoryId) {
      const cat = await this.catRepo.findOne({ where: { id: dto.categoryId } });
      if (!cat) {
        throw new BadRequestException('Danh mục không tồn tại');
      }
    }

    // Slug giữ nguyên để không làm hỏng đường dẫn đã chia sẻ
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.origin !== undefined) product.origin = dto.origin.trim();
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.shortDescription !== undefined) product.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.images !== undefined) product.images = dto.images;

    await this.prodRepo.save(product);
    return this.prodRepo.findOne({ where: { id }, relations: ['skus', 'category'] });
  }

  /**
   * "Xóa" sản phẩm = ẩn khỏi cửa hàng (isActive = false).
   * Không xóa hẳn để các đơn hàng cũ vẫn giữ nguyên lịch sử.
   */
  async deleteProduct(id: string) {
    const product = await this.prodRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    product.isActive = false;
    await this.prodRepo.save(product);
    return { success: true, message: 'Đã ẩn sản phẩm khỏi cửa hàng' };
  }

  // ===================== QUY CÁCH (SKU) & TỒN KHO =====================

  async updateSku(id: string, dto: UpdateSkuDto) {
    const sku = await this.skuRepo.findOne({ where: { id } });
    if (!sku) {
      throw new NotFoundException('Không tìm thấy quy cách');
    }
    if (dto.name !== undefined) sku.name = dto.name.trim();
    if (dto.weightKg !== undefined) sku.weightKg = dto.weightKg;
    if (dto.price !== undefined) sku.price = Math.round(dto.price);
    if (dto.isActive !== undefined) sku.isActive = dto.isActive;
    if (dto.imageUrl !== undefined) sku.imageUrl = dto.imageUrl;
    return this.skuRepo.save(sku);
  }

  /** Nhập / xuất / đặt lại tồn kho, có khóa dòng để tránh ghi đè khi có đơn hàng cùng lúc */
  async adjustStock(id: string, dto: AdjustStockDto) {
    return this.dataSource.transaction(async (manager) => {
      const sku = await manager.findOne(ProductSku, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!sku) {
        throw new NotFoundException('Không tìm thấy quy cách');
      }

      let next: number;
      if (dto.type === 'import') {
        next = sku.stock + dto.quantity;
      } else if (dto.type === 'export') {
        if (dto.quantity > sku.stock) {
          throw new BadRequestException(
            `Không thể xuất ${dto.quantity} bao, kho chỉ còn ${sku.stock} bao`,
          );
        }
        next = sku.stock - dto.quantity;
      } else {
        next = dto.quantity;
      }

      sku.stock = next;
      return manager.save(sku);
    });
  }

  // ===================== DANH MỤC =====================

  async listCategories() {
    return this.catRepo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const baseSlug = slugify(dto.slug || dto.name) || 'danh-muc';
    const slug = await this.uniqueValue(
      (candidate) => this.catRepo.findOne({ where: { slug: candidate } }),
      baseSlug,
    );

    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const last = await this.catRepo.find({ order: { sortOrder: 'DESC' }, take: 1 });
      sortOrder = last.length > 0 ? last[0].sortOrder + 1 : 1;
    }

    const cat = this.catRepo.create({
      name: dto.name.trim(),
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      sortOrder,
      isActive: dto.isActive ?? true,
    });
    return this.catRepo.save(cat);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (dto.slug !== undefined) {
      const newSlug = slugify(dto.slug);
      if (!newSlug) {
        throw new BadRequestException('Slug không hợp lệ');
      }
      if (newSlug !== cat.slug) {
        const taken = await this.catRepo.findOne({ where: { slug: newSlug } });
        if (taken) {
          throw new ConflictException('Slug này đã được dùng cho danh mục khác');
        }
        cat.slug = newSlug;
      }
    }
    if (dto.name !== undefined) cat.name = dto.name.trim();
    if (dto.description !== undefined) cat.description = dto.description;
    if (dto.imageUrl !== undefined) cat.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) cat.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) cat.isActive = dto.isActive;

    return this.catRepo.save(cat);
  }

  async deleteCategory(id: string) {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    const count = await this.prodRepo.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new ConflictException(
        `Danh mục đang có ${count} sản phẩm. Hãy chuyển các sản phẩm sang danh mục khác trước khi xóa.`,
      );
    }
    await this.catRepo.remove(cat);
    return { success: true, message: 'Đã xóa danh mục' };
  }

  // ===================== TIỆN ÍCH =====================

  /** Trả về giá trị chưa bị trùng: base, base-2, base-3, ... */
  private async uniqueValue(
    findExisting: (candidate: string) => Promise<unknown>,
    base: string,
  ): Promise<string> {
    let candidate = base;
    let n = 2;
    while (await findExisting(candidate)) {
      candidate = `${base}-${n}`;
      n++;
      if (n > 1000) {
        throw new ConflictException('Không tạo được giá trị duy nhất');
      }
    }
    return candidate;
  }
}
