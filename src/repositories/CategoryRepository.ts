import Category from '../models/Category.model.js';

/**
 * Repository Pattern para Category
 * Abstrae la lógica de acceso a datos de categorías
 */
export class CategoryRepository {
  /**
   * Encuentra todas las categorías ordenadas por nombre
   */
  async findAll(): Promise<Category[]> {
    return await Category.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Encuentra una categoría por ID
   */
  async findById(id: number): Promise<Category | null> {
    return await Category.findByPk(id);
  }

  /**
   * Encuentra una categoría por nombre
   */
  async findByName(name: string): Promise<Category | null> {
    return await Category.findOne({ where: { name } });
  }

  /**
   * Crea una nueva categoría
   */
  async create(data: { name: string; description?: string }): Promise<Category> {
    return await Category.create(data as any);
  }

  /**
   * Actualiza una categoría existente
   */
  async update(category: Category, data: { name?: string; description?: string }): Promise<Category> {
    await category.update(data as any);
    return category;
  }

  /**
   * Elimina una categoría
   */
  async delete(category: Category): Promise<void> {
    await category.destroy();
  }

  /**
   * Verifica si existe una categoría con el nombre dado
   */
  async existsByName(name: string): Promise<boolean> {
    const category = await this.findByName(name);
    return category !== null;
  }
}
