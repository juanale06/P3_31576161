import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from '../controllers/tags.controller.js';

const router = Router();

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Crear un nuevo tag
 *     description: |
 *       Crea una etiqueta para clasificar productos. Los tags permiten categorización múltiple.
 *       El nombre debe ser único. Requiere autenticación.
 *       
 *       **Ejemplos de tags:** Vintage, Rare, Limited Edition, Remastered, First Press
 *     tags: [Tags]
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
 *                 example: Vintage
 *                 description: Nombre único del tag
 *     responses:
 *       201:
 *         description: Tag creado exitosamente
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
 *                     tag:
 *                       $ref: '#/components/schemas/Tag'
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
 *         description: Conflicto - Nombre de tag ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.post('/', authenticateToken, createTag);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Obtener todos los tags
 *     description: Lista todas las etiquetas disponibles en el sistema. Requiere autenticación.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tags obtenida exitosamente
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
 *                     tags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tag'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/', authenticateToken, getAllTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Obtener un tag por ID
 *     description: Obtiene los detalles de una etiqueta específica. Requiere autenticación.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tag
 *         example: 1
 *     responses:
 *       200:
 *         description: Tag encontrado
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
 *                     tag:
 *                       $ref: '#/components/schemas/Tag'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/:id', authenticateToken, getTagById);

/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     summary: Actualizar un tag
 *     description: Actualiza el nombre de una etiqueta existente. Requiere autenticación.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tag a actualizar
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
 *                 example: Vintage Collection
 *     responses:
 *       200:
 *         description: Tag actualizado exitosamente
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
 *                     tag:
 *                       $ref: '#/components/schemas/Tag'
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       409:
 *         description: Conflicto - Nombre de tag ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.put('/:id', authenticateToken, updateTag);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Eliminar un tag
 *     description: |
 *       Elimina una etiqueta del sistema. Requiere autenticación.
 *       Los productos asociados mantendrán sus otros tags.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tag a eliminar
 *         example: 1
 *     responses:
 *       204:
 *         description: Tag eliminado exitosamente (sin contenido)
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Tag no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.delete('/:id', authenticateToken, deleteTag);

export default router;
