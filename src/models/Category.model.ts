import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Product from './Product.model.js';

@Table({
  tableName: 'Categories',
  timestamps: true,
})
class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @HasMany(() => Product)
  products?: Product[];
}

export default Category;
