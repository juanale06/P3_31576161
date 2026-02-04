// Shopping Cart Manager
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    // Initialize cart based on current auth state
    init() {
        this.cart = this.loadCart();
        this.updateCartUI();
    }

    // Get a unique key for the cart based on user ID
    getCartKey() {
        const userJson = localStorage.getItem('auth_user');
        const user = userJson ? JSON.parse(userJson) : null;
        return user ? `cart_user_${user.id}` : 'shopping_cart_guest';
    }

    // Load cart from localStorage
    loadCart() {
        const key = this.getCartKey();
        const cartData = localStorage.getItem(key);
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart to localStorage
    saveCart() {
        const key = this.getCartKey();
        localStorage.setItem(key, JSON.stringify(this.cart));
        this.updateCartUI();
    }

    // Add product to cart
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                artist: product.artist,
                slug: product.slug,
                quantity: quantity,
                stock: product.stock
            });
        }

        this.saveCart();
        this.showNotification(`"${product.name}" agregado al carrito`, 'success');
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else if (quantity <= item.stock) {
                item.quantity = quantity;
                this.saveCart();
            } else {
                this.showNotification(`Stock disponible: ${item.stock}`, 'error');
            }
        }
    }

    // Get cart items
    getCart() {
        return this.cart;
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Update cart UI (badge count)
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const count = this.getItemCount();

        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }

        if (cartTotal) {
            cartTotal.textContent = '$' + this.getTotal().toFixed(2);
        }
    }

    // Get items formatted for order creation
    getOrderItems() {
        return this.cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Create global instance
const cartManager = new CartManager();

// Update cart UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => cartManager.updateCartUI());
} else {
    cartManager.updateCartUI();
}
