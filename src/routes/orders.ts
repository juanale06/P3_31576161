import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { createOrder, getUserOrders, getOrderById } from '../controllers/orders.controller.js';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (Checkout)
 *     description: Creates a new order with payment processing. This is a transactional operation that verifies stock, processes payment, and updates inventory atomically.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - paymentMethod
 *               - paymentDetails
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               paymentMethod:
 *                 type: string
 *                 example: CreditCard
 *               paymentDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                     example: "4111111111111111"
 *                   cvv:
 *                     type: string
 *                     example: "123"
 *                   expirationMonth:
 *                     type: string
 *                     example: "12"
 *                   expirationYear:
 *                     type: string
 *                     example: "2026"
 *                   cardholderName:
 *                     type: string
 *                     example: "APPROVED"
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *       400:
 *         description: Bad request (missing fields or insufficient stock)
 *       402:
 *         description: Payment failed
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's order history
 *     description: Retrieves all orders for the authenticated user with pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     description: Retrieves detailed information about a specific order. User can only access their own orders.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *       403:
 *         description: Forbidden - order belongs to another user
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, getOrderById);

export default router;
