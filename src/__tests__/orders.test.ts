import request from 'supertest';
import { app } from '../app';
import sequelize from '../config/database';
import Product from '../models/Product.model';
import Category from '../models/Category.model';
import Order from '../models/Order.model';
import OrderItem from '../models/OrderItem.model';
import { CreditCardPaymentStrategy } from '../strategies/CreditCardPaymentStrategy';

// Mock the CreditCardPaymentStrategy
jest.mock('../strategies/CreditCardPaymentStrategy');

describe('Orders API', () => {
    let authToken: string;
    let userId: number;
    let categoryId: number;
    let productId1: number;
    let productId2: number;
    let orderId: number;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Create user
        const userResponse = await request(app)
            .post('/auth/register')
            .send({
                nombreCompleto: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        authToken = userResponse.body.data.token;
        userId = userResponse.body.data.user.id;

        // Create category
        const category = await Category.create({
            name: 'Rock',
            description: 'Rock music',
        });
        categoryId = category.id;

        // Create products with stock
        const product1 = await Product.create({
            name: 'Dark Side of the Moon',
            price: 45.99,
            stock: 10,
            categoryId,
            userId,
        });
        productId1 = product1.id;

        const product2 = await Product.create({
            name: 'Abbey Road',
            price: 39.99,
            stock: 5,
            categoryId,
            userId,
        });
        productId2 = product2.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('POST /orders (Protected - Successful Transaction)', () => {
        it('should create order and reduce stock when payment is successful', async () => {
            // Mock successful payment
            (CreditCardPaymentStrategy.prototype.processPayment as jest.Mock).mockResolvedValue({
                success: true,
                transactionId: 'txn_123456',
            });

            // Get initial stock
            const product1Before = await Product.findByPk(productId1);
            const product2Before = await Product.findByPk(productId2);
            const initialStock1 = product1Before!.stock;
            const initialStock2 = product2Before!.stock;

            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: [
                        { productId: productId1, quantity: 2 },
                        { productId: productId2, quantity: 1 },
                    ],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.order).toHaveProperty('id');
            expect(response.body.data.order.status).toBe('COMPLETED');
            expect(response.body.data.order.userId).toBe(userId);
            expect(parseFloat(response.body.data.order.totalAmount)).toBe(45.99 * 2 + 39.99);
            expect(response.body.data.order.items).toHaveLength(2);

            orderId = response.body.data.order.id;

            // Verify OrderItems were created
            const orderItems = await OrderItem.findAll({ where: { orderId } });
            expect(orderItems).toHaveLength(2);

            // Verify stock was reduced
            const product1After = await Product.findByPk(productId1);
            const product2After = await Product.findByPk(productId2);
            expect(product1After!.stock).toBe(initialStock1 - 2);
            expect(product2After!.stock).toBe(initialStock2 - 1);
        });
    });

    describe('POST /orders (Protected - Insufficient Stock)', () => {
        it('should fail and rollback when stock is insufficient', async () => {
            // Mock successful payment (should not be called)
            (CreditCardPaymentStrategy.prototype.processPayment as jest.Mock).mockResolvedValue({
                success: true,
                transactionId: 'txn_123456',
            });

            // Get initial stock
            const product1Before = await Product.findByPk(productId1);
            const initialStock1 = product1Before!.stock;

            // Get initial order count
            const initialOrderCount = await Order.count();

            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: [
                        { productId: productId1, quantity: 999 }, // More than available
                    ],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toContain('Insufficient stock');

            // Verify stock was NOT modified (rollback)
            const product1After = await Product.findByPk(productId1);
            expect(product1After!.stock).toBe(initialStock1);

            // Verify order was NOT created (rollback)
            const finalOrderCount = await Order.count();
            expect(finalOrderCount).toBe(initialOrderCount);

            // Verify payment was never called
            expect(CreditCardPaymentStrategy.prototype.processPayment).not.toHaveBeenCalled();
        });
    });

    describe('POST /orders (Protected - Payment Rejection)', () => {
        it('should fail and rollback when payment is rejected', async () => {
            // Mock failed payment
            (CreditCardPaymentStrategy.prototype.processPayment as jest.Mock).mockResolvedValue({
                success: false,
                errorCode: '002',
                errorMessage: 'Payment rejected',
            });

            // Get initial stock
            const product1Before = await Product.findByPk(productId1);
            const initialStock1 = product1Before!.stock;

            // Get initial order count
            const initialOrderCount = await Order.count();

            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: [
                        { productId: productId1, quantity: 1 },
                    ],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'REJECTED',
                        currency: 'USD',
                    },
                });

            expect(response.status).toBe(402);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toContain('Payment');

            // Verify stock was NOT modified (rollback)
            const product1After = await Product.findByPk(productId1);
            expect(product1After!.stock).toBe(initialStock1);

            // Verify order was NOT created (rollback)
            const finalOrderCount = await Order.count();
            expect(finalOrderCount).toBe(initialOrderCount);

            // Verify payment was called
            expect(CreditCardPaymentStrategy.prototype.processPayment).toHaveBeenCalled();
        });
    });

    describe('POST /orders (Authentication)', () => {
        it('should fail without token (401 Unauthorized)', async () => {
            const response = await request(app)
                .post('/orders')
                .send({
                    items: [
                        { productId: productId1, quantity: 1 },
                    ],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
        });

        it('should fail with missing items', async () => {
            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toContain('Items');
        });
    });

    describe('GET /orders (Protected)', () => {
        it('should get user orders with pagination', async () => {
            const response = await request(app)
                .get('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('orders');
            expect(response.body.data).toHaveProperty('pagination');
            expect(response.body.data.pagination.currentPage).toBe(1);
            expect(response.body.data.pagination.itemsPerPage).toBe(10);
            expect(Array.isArray(response.body.data.orders)).toBe(true);

            // Verify orders include items and products
            if (response.body.data.orders.length > 0) {
                const order = response.body.data.orders[0];
                expect(order).toHaveProperty('items');
                if (order.items && order.items.length > 0) {
                    expect(order.items[0]).toHaveProperty('product');
                }
            }
        });

        it('should fail without token (401 Unauthorized)', async () => {
            const response = await request(app).get('/orders');

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
        });
    });

    describe('GET /orders/:id (Protected)', () => {
        it('should get order by id for own order', async () => {
            // First create an order to ensure we have one
            (CreditCardPaymentStrategy.prototype.processPayment as jest.Mock).mockResolvedValue({
                success: true,
                transactionId: 'txn_789',
            });

            const createResponse = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: [{ productId: productId1, quantity: 1 }],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            const createdOrderId = createResponse.body.data.order.id;

            const response = await request(app)
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.order.id).toBe(createdOrderId);
            expect(response.body.data.order).toHaveProperty('items');
            expect(response.body.data.order).toHaveProperty('user');
        });

        it('should fail without token (401 Unauthorized)', async () => {
            const response = await request(app).get('/orders/1');

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
        });

        it('should fail when accessing another user order (403 Forbidden)', async () => {
            // Create another user
            const otherUserResponse = await request(app)
                .post('/auth/register')
                .send({
                    nombreCompleto: 'Other User',
                    email: 'other@example.com',
                    password: 'password123',
                });

            const otherToken = otherUserResponse.body.data.token;

            // First create an order with the first user
            (CreditCardPaymentStrategy.prototype.processPayment as jest.Mock).mockResolvedValue({
                success: true,
                transactionId: 'txn_abc',
            });

            const createResponse = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: [{ productId: productId1, quantity: 1 }],
                    paymentMethod: 'CreditCard',
                    paymentDetails: {
                        cardNumber: '4111111111111111',
                        cvv: '123',
                        expirationMonth: '12',
                        expirationYear: '2026',
                        cardholderName: 'APPROVED',
                        currency: 'USD',
                    },
                });

            const createdOrderId = createResponse.body.data.order.id;

            // Try to access it with the other user
            const response = await request(app)
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(403);
            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toContain('permission');
        });

        it('should return 404 for non-existent order', async () => {
            const response = await request(app)
                .get('/orders/99999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
        });
    });
});
