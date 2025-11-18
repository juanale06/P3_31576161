import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  getProductByIdAndSlug,
  updateProduct,
  updateProductById,
  deleteProduct,
  deleteProductById,
} from '../controllers/products.controller.js';

const router = Router();
const selfHealingRouter = Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto (vinilo)
 *     description: |
 *       Crea un producto asociado al usuario autenticado. 
 *       - El slug se genera automáticamente a partir del nombre
 *       - Permite asociar una categoría (requerida) y múltiples tags (opcional)
 *       - Solo usuarios autenticados pueden crear productos
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos o campos requeridos faltantes
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
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.post('/', authenticateToken, createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar productos con búsqueda avanzada (Público)
 *     description: |
 *       Obtiene una lista paginada de productos con múltiples opciones de filtrado y ordenamiento.
 *       
 *       **Características:**
 *       - ✅ Acceso público (no requiere autenticación)
 *       - 📄 Paginación configurable
 *       - 🔍 Búsqueda de texto completo
 *       - 🎯 Filtros múltiples combinables
 *       - 📊 Ordenamiento personalizable
 *       
 *       **Ejemplos de uso:**
 *       - Buscar vinilos de Pink Floyd: `?search=Pink Floyd`
 *       - Filtrar por categoría Rock: `?categoryId=1`
 *       - Vinilos entre $20 y $50: `?price_min=20&price_max=50`
 *       - Formato LP del año 1973: `?format=LP&releaseYear=1973`
 *       - Combinar filtros: `?artist=Beatles&condition=Mint&sortBy=price&order=ASC`
 *     tags: [Products - Público]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página (comienza en 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de productos por página (máximo 100)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda de texto en nombre, descripción, artista y sello discográfico
 *         example: Pink Floyd
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría específica
 *         example: 1
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de categoría (búsqueda parcial, case-insensitive)
 *         example: Rock
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *         description: Filtrar por un tag específico (ID único)
 *         example: 1
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filtrar por múltiples tags (IDs separados por coma)
 *         example: "1,2,3"
 *       - in: query
 *         name: artist
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del artista (búsqueda parcial)
 *         example: Beatles
 *       - in: query
 *         name: label
 *         schema:
 *           type: string
 *         description: Filtrar por sello discográfico (búsqueda parcial)
 *         example: Columbia
 *       - in: query
 *         name: releaseYear
 *         schema:
 *           type: integer
 *         description: Filtrar por año de lanzamiento exacto
 *         example: 1973
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [LP, EP, Single, 7", 10", 12"]
 *         description: Filtrar por formato del vinilo
 *         example: LP
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [Mint, Near Mint, Very Good Plus, Very Good, Good Plus, Good]
 *         description: Filtrar por condición del vinilo
 *         example: Mint
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio mínimo (inclusive)
 *         example: 20.00
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio máximo (inclusive)
 *         example: 50.00
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *         example: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum: [name, price, releaseYear, createdAt, updatedAt]
 *         description: Campo por el cual ordenar los resultados
 *         example: price
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Dirección del ordenamiento (ascendente o descendente)
 *         example: ASC
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /p/{id}/{slug}:
 *   get:
 *     summary: Obtener producto con Self-Healing URL (Público)
 *     description: |
 *       Endpoint con URL auto-reparable que busca un producto por ID y valida su slug.
 *       
 *       **Funcionamiento:**
 *       - ✅ Si el slug es correcto → Retorna el producto (200)
 *       - 🔄 Si el slug es incorrecto o desactualizado → Redirige (301) a la URL canónica
 *       - ❌ Si el ID no existe → Retorna error 404
 *       
 *       **Ventajas:**
 *       - URLs amigables y legibles
 *       - SEO optimizado con redirecciones permanentes
 *       - Tolerante a cambios en el nombre del producto
 *       - Mantiene enlaces antiguos funcionando
 *       
 *       **Ejemplo:**
 *       - URL correcta: `/p/1/dark-side-of-the-moon-a1b2c3d4`
 *       - URL incorrecta: `/p/1/wrong-slug` → Redirige a la correcta
 *     tags: [Products - Público]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del producto
 *         example: 1
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del producto (generado automáticamente del nombre)
 *         example: dark-side-of-the-moon-a1b2c3d4
 *     responses:
 *       200:
 *         description: Producto encontrado con slug correcto
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
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       301:
 *         description: Redirección permanente a la URL canónica (slug incorrecto o desactualizado)
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL canónica correcta del producto
 *             example: /p/1/dark-side-of-the-moon-a1b2c3d4
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendError'
 */
selfHealingRouter.get('/:id/:slug', getProductByIdAndSlug);

/**
 * @swagger
 * /products/id/{id}:
 *   get:
 *     summary: Obtener un producto por ID (Gestión)
 *     description: Retorna los detalles de un producto específico usando su ID. Ruta para administración.
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/id/:id', authenticateToken, getProductById);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Obtener un producto por slug (Público)
 *     description: Retorna los detalles de un producto específico usando su slug único
 *     tags: [Products - Público]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:slug', getProductBySlug);

/**
 * @swagger
 * /products/id/{id}:
 *   put:
 *     summary: Actualizar un producto por ID (Gestión)
 *     description: Actualiza un producto usando su ID. Solo el dueño puede actualizarlo. Permite actualizar categoría y tags.
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               artist:
 *                 type: string
 *               label:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               format:
 *                 type: string
 *               condition:
 *                 type: string
 *               sku:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Producto no encontrado
 */
router.put('/id/:id', authenticateToken, updateProductById);

/**
 * @swagger
 * /products/{slug}:
 *   put:
 *     summary: Actualizar un producto por slug
 *     description: Actualiza un producto usando su slug. Solo el dueño puede actualizarlo.
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               artist:
 *                 type: string
 *               label:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               format:
 *                 type: string
 *               condition:
 *                 type: string
 *               sku:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:slug', authenticateToken, updateProduct);

/**
 * @swagger
 * /products/id/{id}:
 *   delete:
 *     summary: Eliminar un producto por ID (Gestión)
 *     description: Elimina un producto usando su ID. Solo el dueño puede eliminarlo.
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       204:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/id/:id', authenticateToken, deleteProductById);

/**
 * @swagger
 * /products/{slug}:
 *   delete:
 *     summary: Eliminar un producto por slug
 *     description: Elimina un producto usando su slug. Solo el dueño puede eliminarlo.
 *     tags: [Products - Gestión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del producto
 *     responses:
 *       204:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:slug', authenticateToken, deleteProduct);

export default router;
export { selfHealingRouter };
