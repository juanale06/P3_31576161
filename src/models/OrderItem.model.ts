import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Product from './Product.model.js';
import Order from './Order.model.js';

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

    @ForeignKey(() => Order)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    orderId!: number;

    // Association defined in associations.ts
    order!: any;

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
    declare quantity: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare unitPrice: number;

    declare createdAt: Date;
    declare updatedAt: Date;
}

export default OrderItem;
