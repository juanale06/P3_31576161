import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller.js';

const router = Router();

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     description: Crea una categoría para clasificar productos. El nombre debe ser único. Requiere autenticación.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rock
 *                 description: Nombre único de la categoría
 *               description:
 *                 type: string
 *                 example: Vinilos de música rock de todas las épocas
 *                 description: Descripción opcional de la categoría
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos o campo requerido faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       409:
 *         description: Conflicto - Nombre de categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.post('/', authenticateToken, createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Lista todas las categorías disponibles. Requiere autenticación.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/', authenticateToken, getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     description: Obtiene los detalles de una categoría específica. Requiere autenticación.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/:id', authenticateToken, getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     description: Actualiza el nombre y/o descripción de una categoría existente. Requiere autenticación.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rock Clásico
 *               description:
 *                 type: string
 *                 example: Vinilos de rock clásico de los 60s y 70s
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       409:
 *         description: Conflicto - Nombre de categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.put('/:id', authenticateToken, updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     description: Elimina una categoría del sistema. Requiere autenticación. Nota - Los productos asociados quedarán sin categoría.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a eliminar
 *         example: 1
 *     responses:
 *       204:
 *         description: Categoría eliminada exitosamente (sin contenido)
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.delete('/:id', authenticateToken, deleteCategory);

export default router;
