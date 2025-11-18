import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes, { selfHealingRouter } from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';

import sequelize from './config/database.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RESTful - Tienda de Vinilos',
      version: '1.0.0',
      description: `
# API RESTful para Tienda de Vinilos
API desarrollada con Node.js, Express, TypeScript y Sequelize.

## 🔐 Autenticación
Para probar los endpoints protegidos:
1. Registra un usuario en \`/auth/register\` o inicia sesión en \`/auth/login\`
2. Copia el token JWT de la respuesta
3. Haz clic en el botón **Authorize** 🔓 (arriba a la derecha)
4. Ingresa el token en el formato: \`Bearer <tu-token>\`

## 📚 Características
- **Autenticación JWT**: Registro y login de usuarios
- **Gestión de Productos**: CRUD completo de vinilos con atributos personalizados
- **Categorías y Tags**: Organización y clasificación de productos
- **Búsqueda Avanzada**: Filtros múltiples, paginación y ordenamiento
- **Self-Healing URLs**: URLs amigables con redirección automática
- **Formato JSend**: Respuestas estandarizadas

## 👤 Desarrollado por
**Juan Dawaher** - Cédula: 31576161 - Sección 2
      `,
      contact: {
        name: 'Juan Dawaher',
        email: 'juanD@example.com',
      },
    },
    tags: [
      { 
        name: 'Auth', 
        description: '🔐 Autenticación y registro de usuarios' 
      },
      { 
        name: 'Users', 
        description: '👥 Gestión de usuarios (requiere autenticación)' 
      },
      { 
        name: 'Products - Público', 
        description: '🎵 Endpoints públicos de vinilos - Listado, búsqueda y detalle (sin autenticación)' 
      },
      { 
        name: 'Products - Gestión', 
        description: '🔒 Gestión de vinilos - Crear, actualizar y eliminar (requiere autenticación)' 
      },
      { 
        name: 'Categories', 
        description: '📁 Gestión de categorías de vinilos (requiere autenticación)' 
      },
      { 
        name: 'Tags', 
        description: '🏷️ Gestión de etiquetas para vinilos (requiere autenticación)' 
      },
      { 
        name: 'System', 
        description: '⚙️ Endpoints del sistema' 
      },
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Autenticación mediante token JWT. Formato: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombreCompleto: { type: 'string', example: 'Juan Dawaher' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Rock' },
            description: { type: 'string', example: 'Música rock de todas las épocas' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Vintage' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Dark Side of the Moon' },
            slug: { type: 'string', example: 'dark-side-of-the-moon-a1b2c3d4' },
            description: { type: 'string', example: 'Álbum icónico de Pink Floyd de 1973' },
            price: { type: 'number', format: 'float', example: 45.99 },
            stock: { type: 'integer', example: 5 },
            artist: { type: 'string', example: 'Pink Floyd' },
            label: { type: 'string', example: 'Harvest Records' },
            releaseYear: { type: 'integer', example: 1973 },
            format: { type: 'string', enum: ['LP', 'EP', 'Single', '7"', '10"', '12"'], example: 'LP' },
            condition: { type: 'string', enum: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good'], example: 'Near Mint' },
            sku: { type: 'string', example: 'PF-DSOTM-1973' },
            isActive: { type: 'boolean', example: true },
            userId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', example: 1 },
            category: { $ref: '#/components/schemas/Category' },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'Dark Side of the Moon' },
            description: { type: 'string', example: 'Álbum icónico de Pink Floyd de 1973' },
            price: { type: 'number', format: 'float', example: 45.99 },
            stock: { type: 'integer', example: 5, default: 0 },
            categoryId: { type: 'integer', example: 1 },
            artist: { type: 'string', example: 'Pink Floyd' },
            label: { type: 'string', example: 'Harvest Records' },
            releaseYear: { type: 'integer', example: 1973 },
            format: { type: 'string', example: 'LP' },
            condition: { type: 'string', example: 'Near Mint' },
            sku: { type: 'string', example: 'PF-DSOTM-1973' },
            isActive: { type: 'boolean', example: true, default: true },
            tagIds: {
              type: 'array',
              items: { type: 'integer' },
              example: [1, 2],
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            itemsPerPage: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        JSendSuccess: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: { type: 'object' },
          },
        },
        JSendFail: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Descripción del error' },
              },
            },
          },
        },
        JSendError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error interno del servidor' },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/products', productRoutes);
app.use('/p', selfHealingRouter); // Self-healing URL router      

/**
* @swagger
* /about:
*   get:
*     summary: Información del estudiante
*     description: Retorna información del desarrollador de la API (nombre completo, cédula y sección)
*     tags: [System]
*     responses:
*       200:
*         description: Información del estudiante
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
*                     nombreCompleto:
*                       type: string
*                       example: Juan Dawaher
*                     cedula:
*                       type: string
*                       example: 31576161
*                     seccion:
*                       type: string
*                       example: SECCIÓN 2
*/
app.get('/about', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      nombreCompleto: 'Juan Dawaher',
      cedula: '31576161',
      seccion: 'SECCIÓN 2',
    },
  });
});

/**
* @swagger
* /ping:
*   get:
*     summary: Health check del servidor
*     description: Verifica que el servidor está funcionando correctamente. Retorna un estado 200 OK sin contenido.
*     tags: [System]
*     responses:
*       200:
*         description: Servidor funcionando correctamente
*/
app.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send();
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API RESTful por Juan Dawaher - SECCIÓN 2',
    endpoints: {
      about: '/about',
      ping: '/ping',
      docs: '/api-docs',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
      },
      users: '/users',
      products: '/products',
      categories: '/categories',
      tags: '/tags',
    },
  });
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: false }); // Cambia a true solo en desarrollo para resetear DB
    console.log('✅ Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

export {app,syncDatabase};
