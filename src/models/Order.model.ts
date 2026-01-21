import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

@Table({
  tableName: 'Orders',
  timestamps: true,
})
class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount!: number;

  // Association defined in associations.ts
  items?: any[];

  declare createdAt: Date;
  declare updatedAt: Date;
}

export default Order;
