import { Request, Response } from 'express';
import Category from '../models/Category.model.js';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Name is required' },
      });
      return;
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      status: 'success',
      data: { category },
    });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        status: 'fail',
        data: { message: 'Category name already exists' },
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Category not found' },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Category not found' },
      });
      return;
    }

    await category.update(updates);

    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        status: 'fail',
        data: { message: 'Category name already exists' },
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Category not found' },
      });
      return;
    }

    await category.destroy();

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
