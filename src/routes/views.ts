import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Homepage - Product Catalog
 */
router.get('/', (req: Request, res: Response) => {
    res.render('products/index', {
        title: 'Tienda de Vinilos - Catálogo',
        page: 'catalog'
    });
});

/**
 * Register Page
 */
router.get('/register', (req: Request, res: Response) => {
    res.render('auth/register', {
        title: 'Registro - Tienda de Vinilos',
        page: 'register'
    });
});

/**
 * Login Page
 */
router.get('/login', (req: Request, res: Response) => {
    res.render('auth/login', {
        title: 'Iniciar Sesión - Tienda de Vinilos',
        page: 'login'
    });
});

/**
 * Product Detail Page
 */
router.get('/products/:slug', (req: Request, res: Response) => {
    res.render('products/detail', {
        title: 'Detalle del Producto - Tienda de Vinilos',
        page: 'product-detail',
        slug: req.params.slug
    });
});

/**
 * Cart Page
 */
router.get('/cart', (req: Request, res: Response) => {
    res.render('cart/index', {
        title: 'Carrito de Compras - Tienda de Vinilos',
        page: 'cart'
    });
});

/**
 * Checkout Page (Protected - verified client-side)
 */
router.get('/checkout', (req: Request, res: Response) => {
    res.render('checkout/index', {
        title: 'Checkout - Tienda de Vinilos',
        page: 'checkout'
    });
});

/**
 * Checkout Success Page
 */
router.get('/checkout/success', (req: Request, res: Response) => {
    res.render('checkout/success', {
        title: 'Compra Exitosa - Tienda de Vinilos',
        page: 'checkout-success'
    });
});

/**
 * Orders History Page (Protected - verified client-side)
 */
router.get('/orders', (req: Request, res: Response) => {
    res.render('orders/index', {
        title: 'Mis Pedidos - Tienda de Vinilos',
        page: 'orders'
    });
});

/**
 * Order Detail Page (Protected - verified client-side)
 */
router.get('/orders/:id', (req: Request, res: Response) => {
    res.render('orders/detail', {
        title: 'Detalle del Pedido - Tienda de Vinilos',
        page: 'order-detail',
        orderId: req.params.id
    });
});

export default router;
