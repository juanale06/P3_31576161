import { Request, Response } from 'express';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

// Instanciar repositorios
const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, categoryId, artist, label, releaseYear, format, condition, sku, isActive, tagIds } = req.body;
    const userId = (req as any).user.id;

    if (!name || !price || !categoryId) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Name, price, and categoryId are required' },
      });
      return;
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Category not found' },
      });
      return;
    }

    const product = await productRepository.create({
      name,
      description,
      price,
      stock: stock || 0,
      categoryId,
      artist,
      label,
      releaseYear,
      format,
      condition,
      sku,
      isActive: isActive !== undefined ? isActive : true,
      userId,
    });

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await productRepository.setTags(product, tagIds);
    }

    const productWithRelations = await productRepository.reloadWithRelations(product.id);

    res.status(201).json({
      status: 'success',
      data: { product: productWithRelations },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = req.query as any;
    const result = await productRepository.findAll(filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await productRepository.findBySlug(slug);

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productRepository.findById(parseInt(id, 10));

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getProductByIdAndSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, slug } = req.params;
    const product = await productRepository.findById(parseInt(id, 10));

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    const correctSlug = product.getDataValue('slug');

    if (slug !== correctSlug) {
      const canonicalUrl = `/p/${id}/${correctSlug}`;
      res.redirect(301, canonicalUrl);
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user.id;
    const { tagIds, ...updates } = req.body;

    const product = await productRepository.findBySlug(slug);

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    if (!await productRepository.belongsToUser(product, userId)) {
      res.status(403).json({
        status: 'fail',
        data: { message: 'You do not have permission to update this product' },
      });
      return;
    }

    if (updates.categoryId) {
      const category = await categoryRepository.findById(updates.categoryId);
      if (!category) {
        res.status(404).json({
          status: 'fail',
          data: { message: 'Category not found' },
        });
        return;
      }
    }

    await productRepository.update(product, updates);

    if (tagIds && Array.isArray(tagIds)) {
      await productRepository.setTags(product, tagIds);
    }

    const productWithRelations = await productRepository.reloadWithRelations(product.id);

    res.status(200).json({
      status: 'success',
      data: { product: productWithRelations },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { tagIds, ...updates } = req.body;

    const product = await productRepository.findById(parseInt(id, 10));

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    if (!await productRepository.belongsToUser(product, userId)) {
      res.status(403).json({
        status: 'fail',
        data: { message: 'You do not have permission to update this product' },
      });
      return;
    }

    if (updates.categoryId) {
      const category = await categoryRepository.findById(updates.categoryId);
      if (!category) {
        res.status(404).json({
          status: 'fail',
          data: { message: 'Category not found' },
        });
        return;
      }
    }

    await productRepository.update(product, updates);

    if (tagIds && Array.isArray(tagIds)) {
      await productRepository.setTags(product, tagIds);
    }

    const productWithRelations = await productRepository.reloadWithRelations(product.id);

    res.status(200).json({
      status: 'success',
      data: { product: productWithRelations },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user.id;

    const product = await productRepository.findBySlug(slug);

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    if (!await productRepository.belongsToUser(product, userId)) {
      res.status(403).json({
        status: 'fail',
        data: { message: 'You do not have permission to delete this product' },
      });
      return;
    }

    await productRepository.delete(product);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const product = await productRepository.findById(parseInt(id, 10));

    if (!product) {
      res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' },
      });
      return;
    }

    if (!await productRepository.belongsToUser(product, userId)) {
      res.status(403).json({
        status: 'fail',
        data: { message: 'You do not have permission to delete this product' },
      });
      return;
    }

    await productRepository.delete(product);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
