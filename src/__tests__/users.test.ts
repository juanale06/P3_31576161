import request from 'supertest';
import {app} from '../app.js';
import sequelize from '../config/database.js';
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';
let token: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Registrar un usuario y obtener el token para las pruebas
  const registerRes = await request(app)
    .post('/auth/register')
    .send({
      nombreCompleto: 'Users Test User',
      email: 'userstest@example.com',
      password: 'password123',
    });

  // Usar el token del registro directamente
  token = registerRes.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Users Endpoints', () => {
  it('should get all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombreCompleto: 'Another User',
        email: 'another@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.email).toEqual('another@example.com');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject access without token', async () => {
    const res = await request(app).get('/users');
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toEqual('fail');
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer invalid_token_here');
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.status).toEqual('fail');
  });
});