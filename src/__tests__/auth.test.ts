import request from 'supertest';
import {app} from '../app';
import sequelize from '../config/database';
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincroniza la base de datos y crea las tablas
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Auth Test User',
        email: 'authtest@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toEqual('authtest@example.com');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should not register a user with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Auth Test User 2',
        email: 'authtest@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'authtest@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.user.email).toEqual('authtest@example.com');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'authtest@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });
});