import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import * as slugifyModule from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import User from './User.model.js';
import Category from './Category.model.js';
import Tag from './Tag.model.js';
import ProductTag from './ProductTag.model.js';

const slugify = (slugifyModule as any).default || slugifyModule;

@Table({
  tableName: 'Products',
  timestamps: true,
})
class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  slug?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  stock!: number;

  // Atributos específicos para Vinilos
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  artist?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  label?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  releaseYear?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  format?: string; // LP, EP, Single, etc.

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  condition?: string; // Mint, Near Mint, Very Good, etc.

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  sku?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive!: boolean;

  // Relación con User
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  // Relación con Category
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;

  @BelongsTo(() => Category)
  category!: Category;

  // Relación muchos-a-muchos con Tags
  @BelongsToMany(() => Tag, () => ProductTag)
  tags?: Tag[];

  // Generar slug único antes de crear
  @BeforeCreate
  static async generateSlugBeforeCreate(product: Product) {
    if (!product.slug) {
      const name = product.getDataValue('name');
      if (name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        product.setDataValue('slug', `${baseSlug}-${uuidv4().slice(0, 8)}`);
      }
    }
  }

  // Actualizar slug si cambia el nombre
  @BeforeUpdate
  static async updateSlugBeforeUpdate(product: Product) {
    const changedFields = product.changed() as string[] | boolean;
    if (changedFields && (changedFields === true || (Array.isArray(changedFields) && changedFields.includes('name')))) {
      const name = product.getDataValue('name');
      if (name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        product.setDataValue('slug', `${baseSlug}-${uuidv4().slice(0, 8)}`);
      }
    }
  }
}

export default Product;
