import Tag from '../models/Tag.model.js';

/**
 * Repository Pattern para Tag
 * Abstrae la lógica de acceso a datos de tags
 */
export class TagRepository {
  /**
   * Encuentra todos los tags ordenados por nombre
   */
  async findAll(): Promise<Tag[]> {
    return await Tag.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Encuentra un tag por ID
   */
  async findById(id: number): Promise<Tag | null> {
    return await Tag.findByPk(id);
  }

  /**
   * Encuentra un tag por nombre
   */
  async findByName(name: string): Promise<Tag | null> {
    return await Tag.findOne({ where: { name } });
  }

  /**
   * Encuentra múltiples tags por IDs
   */
  async findByIds(ids: number[]): Promise<Tag[]> {
    return await Tag.findAll({ where: { id: ids } });
  }

  /**
   * Crea un nuevo tag
   */
  async create(data: { name: string }): Promise<Tag> {
    return await Tag.create(data as any);
  }

  /**
   * Actualiza un tag existente
   */
  async update(tag: Tag, data: { name?: string }): Promise<Tag> {
    await tag.update(data as any);
    return tag;
  }

  /**
   * Elimina un tag
   */
  async delete(tag: Tag): Promise<void> {
    await tag.destroy();
  }

  /**
   * Verifica si existe un tag con el nombre dado
   */
  async existsByName(name: string): Promise<boolean> {
    const tag = await this.findByName(name);
    return tag !== null;
  }
}
