// Authentication Manager
class AuthManager {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.userKey = 'user_data';
    }

    // Save user data and token after login/register
    saveSession(userData, token) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        this.updateUI();

        // Refresh cart for the new user
        if (typeof cartManager !== 'undefined') {
            cartManager.init();
        }
    }

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Get JWT token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.updateUI();

        // Refresh cart (will switch back to guest cart)
        if (typeof cartManager !== 'undefined') {
            cartManager.init();
        }

        window.location.href = '/login';
    }

    // Update UI based on auth status
    updateUI() {
        const user = this.getCurrentUser();
        const authLinks = document.getElementById('auth-links');
        const userInfo = document.getElementById('user-info');

        if (!authLinks) return;

        if (user) {
            authLinks.innerHTML = `
        <span class="user-name">Hola, ${user.nombreCompleto}</span>
        <a href="/orders" class="nav-link">Mis Pedidos</a>
        <button onclick="authManager.logout()" class="btn btn-outline">Cerrar Sesión</button>
      `;
        } else {
            authLinks.innerHTML = `
        <a href="/login" class="nav-link">Iniciar Sesión</a>
        <a href="/register" class="btn btn-primary">Registrarse</a>
      `;
        }
    }

    // Protect routes - redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }

    // Handle login form submission
    async handleLogin(email, password) {
        try {
            const response = await api.login({ email, password });

            if (response.status === 'success') {
                this.saveSession(response.data.user, response.data.token);

                // Check for redirect parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/';
                window.location.href = redirect;
            }
        } catch (error) {
            throw error;
        }
    }

    // Handle register form submission
    async handleRegister(nombreCompleto, email, password) {
        try {
            const response = await api.register({ nombreCompleto, email, password });

            if (response.status === 'success') {
                this.saveSession(response.data.user, response.data.token);
                window.location.href = '/';
            }
        } catch (error) {
            throw error;
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Update UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => authManager.updateUI());
} else {
    authManager.updateUI();
}
