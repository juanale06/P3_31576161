import request from 'supertest';
import { app } from '../app';
import sequelize from '../config/database';
import Tag from '../models/Tag.model';

describe('Tags API', () => {
  let authToken: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario y obtener token
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = userResponse.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /tags', () => {
    it('should create a tag with valid token', async () => {
      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vintage',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tag).toHaveProperty('id');
      expect(response.body.data.tag.name).toBe('Vintage');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/tags')
        .send({
          name: 'Rare',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should fail without name', async () => {
      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should fail with duplicate name', async () => {
      await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Limited Edition',
        });

      const response = await request(app)
        .post('/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Limited Edition',
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /tags', () => {
    it('should fail without token', async () => {
      const response = await request(app).get('/tags');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should get all tags with token', async () => {
      const response = await request(app)
        .get('/tags')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.tags)).toBe(true);
    });
  });

  describe('GET /tags/:id', () => {
    it('should fail without token', async () => {
      const response = await request(app).get('/tags/1');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should get tag by id with token', async () => {
      const tag = await Tag.findOne();

      const response = await request(app)
        .get(`/tags/${tag!.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tag.id).toBe(tag!.id);
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/tags/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('PUT /tags/:id', () => {
    it('should fail without token', async () => {
      const tag = await Tag.findOne();

      const response = await request(app)
        .put(`/tags/${tag!.id}`)
        .send({
          name: 'Updated Tag',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should update tag with token', async () => {
      const tag = await Tag.findOne();

      const response = await request(app)
        .put(`/tags/${tag!.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Tag Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tag.name).toBe('Updated Tag Name');
    });
  });

  describe('DELETE /tags/:id', () => {
    it('should fail without token', async () => {
      const tag = await Tag.findOne();

      const response = await request(app).delete(`/tags/${tag!.id}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should delete tag with token', async () => {
      const tag = await Tag.create({
        name: 'To Delete',
      });

      const response = await request(app)
        .delete(`/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedTag = await Tag.findByPk(tag.id);
      expect(deletedTag).toBeNull();
    });
  });
});
