import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import Category from '../models/Category.model.js';
import Tag from '../models/Tag.model.js';
import { ProductQueryBuilder } from '../builders/ProductQueryBuilder.js';

interface ProductFilters {
  page?: string;
  limit?: string;
  category?: string;
  categoryId?: string;
  tags?: string;
  tagId?: string;
  price_min?: string;
  price_max?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  isActive?: string;
  sortBy?: string;
  order?: string;
  artist?: string;
  label?: string;
  releaseYear?: string;
  format?: string;
  condition?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ProductListResult {
  products: Product[];
  pagination: PaginationInfo;
}

/**
 * Repository Pattern para Product
 * Abstrae toda la lógica de acceso a datos del controlador
 */
export class ProductRepository {
  /**
   * Encuentra todos los productos con filtros avanzados
   */
  async findAll(filters: ProductFilters): Promise<ProductListResult> {
    // Usar el Builder para construir la consulta
    const queryOptions = ProductQueryBuilder.createQuery(filters);

    // Ejecutar la consulta
    const { count, rows: products } = await Product.findAndCountAll(queryOptions);

    // Calcular información de paginación
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '10', 10);
    const totalPages = Math.ceil(count / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Encuentra un producto por ID con todas sus relaciones
   */
  async findById(id: number): Promise<Product | null> {
    return await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'nombreCompleto', 'email'],
        },
        {
          model: Category,
        },
        {
          model: Tag,
        },
      ],
    });
  }

  /**
   * Encuentra un producto por slug con todas sus relaciones
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return await Product.findOne({
      where: { slug },
      include: [
        {
          model: User,
          attributes: ['id', 'nombreCompleto', 'email'],
        },
        {
          model: Category,
        },
        {
          model: Tag,
        },
      ],
    });
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: any): Promise<Product> {
    return await Product.create(data as any);
  }

  /**
   * Actualiza un producto existente
   */
  async update(product: Product, data: any): Promise<Product> {
    await product.update(data as any);
    return product;
  }

  /**
   * Elimina un producto
   */
  async delete(product: Product): Promise<void> {
    await product.destroy();
  }

  /**
   * Asocia tags a un producto
   */
  async setTags(product: Product, tagIds: number[]): Promise<void> {
    const tags = await Tag.findAll({ where: { id: tagIds } });
    await product.$set('tags', tags);
  }

  /**
   * Recarga un producto con todas sus relaciones
   */
  async reloadWithRelations(productId: number): Promise<Product | null> {
    return await this.findById(productId);
  }

  /**
   * Verifica si un producto pertenece a un usuario
   */
  async belongsToUser(product: Product, userId: number): Promise<boolean> {
    return product.userId === userId;
  }

  /**
   * Cuenta productos por categoría
   */
  async countByCategory(categoryId: number): Promise<number> {
    return await Product.count({ where: { categoryId } });
  }

  /**
   * Cuenta productos por tag
   */
  async countByTag(tagId: number): Promise<number> {
    const products = await Product.findAll({
      include: [
        {
          model: Tag,
          where: { id: tagId },
          required: true,
        },
      ],
    });
    return products.length;
  }

  /**
   * Encuentra productos por usuario
   */
  async findByUser(userId: number): Promise<Product[]> {
    return await Product.findAll({
      where: { userId },
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
