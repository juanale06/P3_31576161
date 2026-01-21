import Order from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { Transaction } from 'sequelize';

export class OrderRepository {
    async create(
        orderData: {
            userId: number;
            status: string;
            totalAmount: number;
        },
        items: Array<{
            productId: number;
            quantity: number;
            unitPrice: number;
        }>,
        transaction: Transaction
    ): Promise<Order> {
        const order = await Order.create(orderData, { transaction });

        const orderItems = items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        }));

        await OrderItem.bulkCreate(orderItems, { transaction });

        // Reload order with items
        return await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                        },
                    ],
                },
            ],
            transaction,
        }) as Order;
    }

    async findByUser(
        userId: number,
        page: number = 1,
        limit: number = 10
    ): Promise<{ orders: Order[]; total: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            orders: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
        };
    }

    async findById(orderId: number): Promise<Order | null> {
        return await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nombreCompleto', 'email'],
                },
            ],
        });
    }
}
