import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Tag from '../models/Tag.model.js';
import ProductTag from '../models/ProductTag.model.js';

// Determinar el directorio base
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
const dbPath = isTest 
  ? ':memory:' // Base de datos en memoria para tests
  : path.join(process.cwd(), 'src', 'config', 'database.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  models: [User, Category, Tag, Product, ProductTag], 
});

export default sequelize;
