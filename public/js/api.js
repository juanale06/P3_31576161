// API Client for consuming the REST API
class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('jwt_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.data?.message || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    // Product endpoints
    async getProducts(filters = {}) {
        const queryParams = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';

        return this.request(endpoint);
    }

    async getProductBySlug(slug) {
        return this.request(`/api/products/${slug}`);
    }

    // Category endpoints
    async getCategories() {
        return this.request('/api/categories');
    }

    // Order endpoints
    async createOrder(orderData) {
        return this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getUserOrders(page = 1, limit = 10) {
        return this.request(`/api/orders?page=${page}&limit=${limit}`);
    }

    async getOrderById(orderId) {
        return this.request(`/api/orders/${orderId}`);
    }
}

// Create global instance
const api = new APIClient();
