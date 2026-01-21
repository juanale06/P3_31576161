import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import User from './User.model.js';
import OrderItem from './OrderItem.model.js';

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

  @HasMany(() => OrderItem)
  items?: OrderItem[];

  declare createdAt: Date;
  declare updatedAt: Date;
}

export default Order;
