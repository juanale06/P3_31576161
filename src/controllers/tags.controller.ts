import { Request, Response } from 'express';
import Tag from '../models/Tag.model.js';

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Name is required' },
      });
      return;
    }

    const tag = await Tag.create({ name });

    res.status(201).json({
      status: 'success',
      data: { tag },
    });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        status: 'fail',
        data: { message: 'Tag name already exists' },
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: { tags },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Tag not found' },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { tag },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Tag not found' },
      });
      return;
    }

    await tag.update(updates);

    res.status(200).json({
      status: 'success',
      data: { tag },
    });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        status: 'fail',
        data: { message: 'Tag name already exists' },
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Tag not found' },
      });
      return;
    }

    await tag.destroy();

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
