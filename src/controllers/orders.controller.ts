import { Request, Response } from 'express';
import {
    OrderService,
    InsufficientStockError,
    PaymentFailedError,
    ProductNotFoundError,
    OrderNotFoundError,
    UnauthorizedOrderAccessError,
} from '../services/OrderService.js';

const orderService = new OrderService();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { items, paymentMethod, paymentDetails } = req.body;

        // Validate request body
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                status: 'fail',
                data: {
                    message: 'Items array is required and must not be empty',
                },
            });
            return;
        }

        if (!paymentMethod) {
            res.status(400).json({
                status: 'fail',
                data: {
                    message: 'Payment method is required',
                },
            });
            return;
        }

        if (!paymentDetails) {
            res.status(400).json({
                status: 'fail',
                data: {
                    message: 'Payment details are required',
                },
            });
            return;
        }

        // Extract userId from authenticated user
        const userId = (req as any).user.id;

        // Create order
        const order = await orderService.createOrder(
            userId,
            items,
            paymentMethod,
            paymentDetails
        );

        res.status(201).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error: any) {
        if (error instanceof InsufficientStockError) {
            res.status(400).json({
                status: 'fail',
                data: {
                    message: error.message,
                },
            });
            return;
        }

        if (error instanceof PaymentFailedError) {
            res.status(402).json({
                status: 'fail',
                data: {
                    message: error.message,
                    errorCode: error.errorCode,
                },
            });
            return;
        }

        if (error instanceof ProductNotFoundError) {
            res.status(404).json({
                status: 'fail',
                data: {
                    message: error.message,
                },
            });
            return;
        }

        console.error('Error creating order:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while creating order',
        });
    }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await orderService.getUserOrders(userId, page, limit);

        res.status(200).json({
            status: 'success',
            data: {
                orders: result.orders,
                pagination: {
                    currentPage: result.currentPage,
                    itemsPerPage: result.itemsPerPage,
                    totalItems: result.total,
                    totalPages: result.totalPages,
                },
            },
        });
    } catch (error: any) {
        console.error('Error getting user orders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching orders',
        });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderId = parseInt(req.params.id);
        const userId = (req as any).user.id;

        if (isNaN(orderId)) {
            res.status(400).json({
                status: 'fail',
                data: {
                    message: 'Invalid order ID',
                },
            });
            return;
        }

        const order = await orderService.getOrderById(orderId, userId);

        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error: any) {
        if (error instanceof OrderNotFoundError) {
            res.status(404).json({
                status: 'fail',
                data: {
                    message: error.message,
                },
            });
            return;
        }

        if (error instanceof UnauthorizedOrderAccessError) {
            res.status(403).json({
                status: 'fail',
                data: {
                    message: error.message,
                },
            });
            return;
        }

        console.error('Error getting order by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching order',
        });
    }
};
