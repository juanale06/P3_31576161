import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import type Order from './Order.model.js';
import Product from './Product.model.js';

@Table({
    tableName: 'OrderItems',
    timestamps: true,
})
class OrderItem extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @ForeignKey(() => require('./Order.model.js').default)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    orderId!: number;

    @BelongsTo(() => require('./Order.model.js').default)
    order!: Order;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    productId!: number;

    @BelongsTo(() => Product)
    product!: Product;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    unitPrice!: number;

    declare createdAt: Date;
    declare updatedAt: Date;
}

export default OrderItem;
