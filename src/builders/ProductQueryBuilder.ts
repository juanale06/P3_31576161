import { Op, WhereOptions, Includeable, Order } from 'sequelize';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import Category from '../models/Category.model.js';
import Tag from '../models/Tag.model.js';

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

interface QueryOptions {
  where: WhereOptions<any>;
  include: Includeable[];
  limit: number;
  offset: number;
  order: Order;
  distinct: boolean;
}

/**
 * Builder Pattern para construir consultas dinámicas de productos
 * Permite agregar filtros de forma fluida y construir la consulta final
 */
export class ProductQueryBuilder {
  private filters: ProductFilters;
  private whereConditions: WhereOptions<any> = {};
  private includeConditions: Includeable[] = [];
  private limitValue: number = 10;
  private offsetValue: number = 0;
  private orderConditions: Order = [['createdAt', 'DESC']];

  constructor(filters: ProductFilters) {
    this.filters = filters;
  }

  /**
   * Construye las condiciones WHERE basadas en los filtros
   */
  buildWhereConditions(): this {
    const where: any = this.whereConditions;

    // Filtro por categoría (ID)
    if (this.filters.categoryId) {
      where.categoryId = parseInt(this.filters.categoryId, 10);
    }

    // Filtro por estado activo
    if (this.filters.isActive !== undefined) {
      where.isActive = this.filters.isActive === 'true';
    }

    // Filtro por rango de precio
    this.buildPriceFilter();

    // Filtros personalizados para vinilos
    this.buildVinylFilters();

    // Búsqueda de texto
    this.buildSearchFilter();

    return this;
  }

  /**
   * Construye el filtro de precio
   */
  private buildPriceFilter(): void {
    const where: any = this.whereConditions;
    const minPriceValue = this.filters.price_min || this.filters.minPrice;
    const maxPriceValue = this.filters.price_max || this.filters.maxPrice;

    if (minPriceValue || maxPriceValue) {
      where.price = {};
      if (minPriceValue) {
        where.price[Op.gte] = parseFloat(minPriceValue);
      }
      if (maxPriceValue) {
        where.price[Op.lte] = parseFloat(maxPriceValue);
      }
    }
  }

  /**
   * Construye filtros específicos para vinilos
   */
  private buildVinylFilters(): void {
    const where: any = this.whereConditions;

    if (this.filters.artist) {
      where.artist = { [Op.like]: `%${this.filters.artist}%` };
    }

    if (this.filters.label) {
      where.label = { [Op.like]: `%${this.filters.label}%` };
    }

    if (this.filters.releaseYear) {
      where.releaseYear = parseInt(this.filters.releaseYear, 10);
    }

    if (this.filters.format) {
      where.format = this.filters.format;
    }

    if (this.filters.condition) {
      where.condition = this.filters.condition;
    }
  }

  /**
   * Construye el filtro de búsqueda de texto
   */
  private buildSearchFilter(): void {
    const where: any = this.whereConditions;

    if (this.filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${this.filters.search}%` } },
        { description: { [Op.like]: `%${this.filters.search}%` } },
        { artist: { [Op.like]: `%${this.filters.search}%` } },
        { label: { [Op.like]: `%${this.filters.search}%` } },
      ];
    }
  }

  /**
   * Construye las condiciones de INCLUDE (JOINs)
   */
  buildIncludeConditions(): this {
    // Include User
    this.includeConditions.push({
      model: User,
      attributes: ['id', 'nombreCompleto', 'email'],
    });

    // Include Category con filtro opcional
    const categoryInclude: any = {
      model: Category,
    };

    if (this.filters.category) {
      categoryInclude.where = { name: { [Op.like]: `%${this.filters.category}%` } };
      categoryInclude.required = true;
    }

    this.includeConditions.push(categoryInclude);

    // Include Tags con filtro opcional
    this.buildTagsInclude();

    return this;
  }

  /**
   * Construye el include de Tags con filtros
   */
  private buildTagsInclude(): void {
    const tagInclude: any = {
      model: Tag,
    };

    // Filtrar por un solo tag
    if (this.filters.tagId) {
      tagInclude.where = { id: parseInt(this.filters.tagId, 10) };
      tagInclude.required = true;
    }
    // Filtrar por múltiples tags
    else if (this.filters.tags) {
      const tagIds = this.filters.tags
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));

      if (tagIds.length > 0) {
        tagInclude.where = { id: { [Op.in]: tagIds } };
        tagInclude.required = true;
      }
    }

    this.includeConditions.push(tagInclude);
  }

  /**
   * Construye la paginación
   */
  buildPagination(): this {
    const page = parseInt(this.filters.page || '1', 10);
    const limit = parseInt(this.filters.limit || '10', 10);

    this.limitValue = limit;
    this.offsetValue = (page - 1) * limit;

    return this;
  }

  /**
   * Construye el ordenamiento
   */
  buildOrdering(): this {
    const sortBy = this.filters.sortBy || 'createdAt';
    const order = (this.filters.order || 'DESC').toUpperCase();

    this.orderConditions = [[sortBy, order as 'ASC' | 'DESC']];

    return this;
  }

  /**
   * Construye y retorna las opciones finales de la consulta
   */
  build(): QueryOptions {
    return {
      where: this.whereConditions,
      include: this.includeConditions,
      limit: this.limitValue,
      offset: this.offsetValue,
      order: this.orderConditions,
      distinct: true,
    };
  }

  /**
   * Método estático para crear y construir en una sola llamada
   */
  static createQuery(filters: ProductFilters): QueryOptions {
    return new ProductQueryBuilder(filters)
      .buildWhereConditions()
      .buildIncludeConditions()
      .buildPagination()
      .buildOrdering()
      .build();
  }
}
