import request from 'supertest';
import { app } from '../app';
import sequelize from '../config/database';
import Product from '../models/Product.model';
import Category from '../models/Category.model';
import Tag from '../models/Tag.model';

describe('Products API', () => {
  let authToken: string;
  let userId: number;
  let categoryId: number;
  let tagId1: number;
  let tagId2: number;
  let productId: number;
  let productSlug: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Crear categoría
    const category = await Category.create({
      name: 'Rock',
      description: 'Rock music',
    });
    categoryId = category.id;

    // Crear tags
    const tag1 = await Tag.create({ name: 'Vintage' });
    const tag2 = await Tag.create({ name: 'Rare' });
    tagId1 = tag1.id;
    tagId2 = tag2.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /products (Protected)', () => {
    it('should fail without token', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Test Product',
          price: 45.99,
          categoryId,
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should create product with valid token', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Dark Side of the Moon',
          description: 'Pink Floyd album',
          price: 45.99,
          stock: 5,
          categoryId,
          artist: 'Pink Floyd',
          label: 'Harvest Records',
          releaseYear: 1973,
          format: 'LP',
          condition: 'Mint',
          sku: 'PF-DSOTM-1973',
          tagIds: [tagId1, tagId2],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.product).toHaveProperty('id');
      expect(response.body.data.product).toHaveProperty('slug');
      expect(response.body.data.product.name).toBe('Dark Side of the Moon');
      expect(response.body.data.product.tags).toHaveLength(2);

      productId = response.body.data.product.id;
      productSlug = response.body.data.product.slug;
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Product',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should fail with non-existent category', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          price: 45.99,
          categoryId: 9999,
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.data.message).toContain('Category not found');
    });
  });

  describe('GET /products (Public)', () => {
    it('should get all products without token', async () => {
      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(5);
    });

    it('should filter by categoryId', async () => {
      const response = await request(app)
        .get('/products')
        .query({ categoryId });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => p.categoryId === categoryId)).toBe(true);
    });

    it('should filter by artist', async () => {
      const response = await request(app)
        .get('/products')
        .query({ artist: 'Pink Floyd' });

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.products[0].artist).toContain('Pink Floyd');
    });

    it('should filter by format', async () => {
      const response = await request(app)
        .get('/products')
        .query({ format: 'LP' });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => p.format === 'LP')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/products')
        .query({ price_min: 40, price_max: 50 });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => p.price >= 40 && p.price <= 50)).toBe(true);
    });

    it('should filter by releaseYear', async () => {
      const response = await request(app)
        .get('/products')
        .query({ releaseYear: 1973 });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => p.releaseYear === 1973)).toBe(true);
    });

    it('should filter by label', async () => {
      const response = await request(app)
        .get('/products')
        .query({ label: 'Harvest' });

      expect(response.status).toBe(200);
      if (response.body.data.products.length > 0) {
        expect(response.body.data.products[0].label).toContain('Harvest');
      }
    });

    it('should filter by condition', async () => {
      const response = await request(app)
        .get('/products')
        .query({ condition: 'Mint' });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => p.condition === 'Mint')).toBe(true);
    });

    it('should search by text', async () => {
      const response = await request(app)
        .get('/products')
        .query({ search: 'Floyd' });

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/products')
        .query({ sortBy: 'price', order: 'ASC' });

      expect(response.status).toBe(200);
      const prices = response.body.data.products.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should filter by multiple tags', async () => {
      const response = await request(app)
        .get('/products')
        .query({ tags: `${tagId1},${tagId2}` });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /products/:slug (Public)', () => {
    it('should get product by slug without token', async () => {
      const response = await request(app).get(`/products/${productSlug}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.product.slug).toBe(productSlug);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/products/non-existent-slug');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /p/:id/:slug (Self-Healing URL)', () => {
    it('should return product with correct slug', async () => {
      // Obtener el producto directamente de la base de datos para tener el slug actual
      const product = await Product.findByPk(productId);
      const currentSlug = product?.getDataValue('slug');
      
      const response = await request(app)
        .get(`/p/${productId}/${currentSlug}`)
        .redirects(0); // No seguir redirecciones

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.product.id).toBe(productId);
    });

    it('should redirect (301) with incorrect slug', async () => {
      const response = await request(app)
        .get(`/p/${productId}/wrong-slug`)
        .redirects(0);

      expect(response.status).toBe(301);
      expect(response.header.location).toContain(`/p/${productId}/`);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app).get('/p/9999/any-slug');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /products/id/:id (Protected)', () => {
    it('should fail without token', async () => {
      const response = await request(app).get(`/products/id/${productId}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should get product by id with token', async () => {
      const response = await request(app)
        .get(`/products/id/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.product.id).toBe(productId);
    });
  });

  describe('PUT /products/id/:id (Protected)', () => {
    it('should fail without token', async () => {
      const response = await request(app)
        .put(`/products/id/${productId}`)
        .send({
          price: 49.99,
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should update product with token', async () => {
      const response = await request(app)
        .put(`/products/id/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 49.99,
          stock: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(parseFloat(response.body.data.product.price)).toBe(49.99);
      expect(response.body.data.product.stock).toBe(3);
    });

    it('should fail when updating non-owned product', async () => {
      // Crear otro usuario
      const otherUserResponse = await request(app)
        .post('/auth/register')
        .send({
          nombreCompleto: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .put(`/products/id/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          price: 99.99,
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('DELETE /products/id/:id (Protected)', () => {
    it('should fail without token', async () => {
      const response = await request(app).delete(`/products/id/${productId}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should fail when deleting non-owned product', async () => {
      const otherUserResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .delete(`/products/id/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
    });

    it('should delete product with token', async () => {
      // Crear un producto para eliminar
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Delete',
          price: 10.99,
          categoryId,
        });

      const productToDeleteId = createResponse.body.data.product.id;

      const response = await request(app)
        .delete(`/products/id/${productToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedProduct = await Product.findByPk(productToDeleteId);
      expect(deletedProduct).toBeNull();
    });
  });
});
