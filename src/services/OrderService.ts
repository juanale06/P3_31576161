import sequelize from '../config/database.js';
import Product from '../models/Product.model.js';
import { OrderStatus } from '../models/Order.model.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { PaymentStrategy } from '../strategies/PaymentStrategy.js';
import { CreditCardPaymentStrategy } from '../strategies/CreditCardPaymentStrategy.js';
import Order from '../models/Order.model.js';

export class InsufficientStockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InsufficientStockError';
    }
}

export class PaymentFailedError extends Error {
    public errorCode: string;

    constructor(message: string, errorCode: string) {
        super(message);
        this.name = 'PaymentFailedError';
        this.errorCode = errorCode;
    }
}

export class ProductNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProductNotFoundError';
    }
}

export class OrderNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OrderNotFoundError';
    }
}

export class UnauthorizedOrderAccessError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedOrderAccessError';
    }
}

interface OrderItem {
    productId: number;
    quantity: number;
}

interface PaymentDetails {
    cardNumber: string;
    cvv: string;
    expirationMonth: string;
    expirationYear: string;
    cardholderName: string;
    currency: string;
}

export class OrderService {
    private orderRepository: OrderRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
    }

    private getPaymentStrategy(paymentMethod: string): PaymentStrategy {
        switch (paymentMethod.toLowerCase()) {
            case 'creditcard':
                return new CreditCardPaymentStrategy();
            default:
                throw new Error(`Payment method '${paymentMethod}' not supported`);
        }
    }

    async createOrder(
        userId: number,
        items: OrderItem[],
        paymentMethod: string,
        paymentDetails: PaymentDetails
    ): Promise<Order> {
        // Start transaction
        return await sequelize.transaction(async (t) => {
            // 1. Validate and fetch products
            const productIds = items.map((item) => item.productId);
            const products = await Product.findAll({
                where: { id: productIds },
                transaction: t,
            });

            if (products.length !== productIds.length) {
                throw new ProductNotFoundError('One or more products not found');
            }

            // 2. Verify stock availability
            const productMap = new Map(products.map((p) => [p.id, p]));

            for (const item of items) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw new ProductNotFoundError(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new InsufficientStockError(
                        `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
                    );
                }
            }

            // 3. Calculate total amount
            let totalAmount = 0;
            const orderItemsData = items.map((item) => {
                const product = productMap.get(item.productId)!;
                // Convertir precio a número de forma segura
                const priceValue = product.getDataValue('price');
                const unitPrice = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue));

                if (isNaN(unitPrice)) {
                    throw new Error(`Invalid price for product ${product.name}: ${priceValue}`);
                }

                totalAmount += unitPrice * item.quantity;

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                };
            });

            console.log('💰 Total calculado:', totalAmount);

            // 4. Process payment
            const paymentStrategy = this.getPaymentStrategy(paymentMethod);
            const paymentResult = await paymentStrategy.processPayment(
                totalAmount,
                paymentDetails,
                `user_${userId}_${Date.now()}`
            );

            if (!paymentResult.success) {
                throw new PaymentFailedError(
                    paymentResult.errorMessage || 'Payment failed',
                    paymentResult.errorCode || 'UNKNOWN'
                );
            }

            // 5. Update stock (only if payment successful)
            for (const item of items) {
                const product = productMap.get(item.productId)!;
                await product.decrement('stock', {
                    by: item.quantity,
                    transaction: t,
                });
            }

            // 6. Create Order and OrderItems
            const order = await this.orderRepository.create(
                {
                    userId,
                    status: OrderStatus.COMPLETED,
                    totalAmount,
                },
                orderItemsData,
                t
            );

            return order;
        });
    }

    async getUserOrders(
        userId: number,
        page: number = 1,
        limit: number = 10
    ): Promise<{ orders: Order[]; total: number; totalPages: number; currentPage: number; itemsPerPage: number }> {
        const result = await this.orderRepository.findByUser(userId, page, limit);

        return {
            orders: result.orders,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: page,
            itemsPerPage: limit,
        };
    }

    async getOrderById(orderId: number, userId: number): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new OrderNotFoundError(`Order with ID ${orderId} not found`);
        }

        if (order.userId !== userId) {
            throw new UnauthorizedOrderAccessError('You do not have permission to access this order');
        }

        return order;
    }
}
