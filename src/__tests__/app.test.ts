import request from 'supertest';
import {app} from '../app.js';
import { describe, it, expect } from '@jest/globals';

describe('API Endpoints Tests', () => {
  describe('GET /ping', () => {
    it('debe responder con status 200 OK', async () => {
      const response = await request(app).get('/ping');
      expect(response.status).toBe(200);
    });

    it('debe responder con un cuerpo vacío', async () => {
      const response = await request(app).get('/ping');
      expect(response.text).toBe('');
    });
  });

  describe('GET /about', () => {
    it('debe responder con status 200 OK', async () => {
      const response = await request(app).get('/about');
      expect(response.status).toBe(200);
    });

    it('debe responder con formato JSend correcto', async () => {
      const response = await request(app).get('/about');
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('data');
    });

    it('debe contener los campos requeridos en data', async () => {
      const response = await request(app).get('/about');
      
      expect(response.body.data).toHaveProperty('nombreCompleto');
      expect(response.body.data).toHaveProperty('cedula');
      expect(response.body.data).toHaveProperty('seccion');
    });

    it('los campos no deben estar vacíos', async () => {
      const response = await request(app).get('/about');
      
      expect(response.body.data.nombreCompleto).toBeTruthy();
      expect(response.body.data.cedula).toBeTruthy();
      expect(response.body.data.seccion).toBeTruthy();
    });
  });
});