import request from 'supertest';
import { app } from '../app';
import sequelize from '../config/database';
import User from '../models/User.model';
import Category from '../models/Category.model';

describe('Categories API', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario de prueba
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /categories', () => {
    it('should create a category with valid token', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Rock',
          description: 'Rock music category',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.category).toHaveProperty('id');
      expect(response.body.data.category.name).toBe('Rock');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Jazz',
          description: 'Jazz music category',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should fail without name', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No name category',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should fail with duplicate name', async () => {
      await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Electronic',
          description: 'Electronic music',
        });

      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Electronic',
          description: 'Duplicate',
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /categories', () => {
    it('should fail without token', async () => {
      const response = await request(app).get('/categories');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should get all categories with token', async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });
  });

  describe('GET /categories/:id', () => {
    it('should fail without token', async () => {
      const response = await request(app).get('/categories/1');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should get category by id with token', async () => {
      const category = await Category.findOne();

      const response = await request(app)
        .get(`/categories/${category!.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.category.id).toBe(category!.id);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/categories/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('PUT /categories/:id', () => {
    it('should fail without token', async () => {
      const category = await Category.findOne();

      const response = await request(app)
        .put(`/categories/${category!.id}`)
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should update category with token', async () => {
      const category = await Category.findOne();

      const response = await request(app)
        .put(`/categories/${category!.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.category.description).toBe('Updated description');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should fail without token', async () => {
      const category = await Category.findOne();

      const response = await request(app).delete(`/categories/${category!.id}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should delete category with token', async () => {
      const category = await Category.create({
        name: 'To Delete',
        description: 'Will be deleted',
      });

      const response = await request(app)
        .delete(`/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedCategory = await Category.findByPk(category.id);
      expect(deletedCategory).toBeNull();
    });
  });
});
