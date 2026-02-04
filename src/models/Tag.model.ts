import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'Tags',
  timestamps: true,
})
class Tag extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;
}

export default Tag;
