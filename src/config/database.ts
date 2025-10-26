import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../config/database.db'),
  logging: true, 
  models: [path.join(__dirname, '../models')], 
});

export default sequelize;