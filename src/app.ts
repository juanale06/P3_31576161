import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

import sequelize from './config/database';
import User from './models/User.model';

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
      title: 'API RESTful Juan Dawaher',
      version: '1.0.0',
      description: 'API desarrollada con Node.js, Express y TypeScript. **Instrucciones:** Para probar los endpoints protegidos, primero registra un usuario en `/auth/register` o inicia sesión en `/auth/login`, copia el token de la respuesta, y haz clic en el botón **Authorize** 🔓 (arriba a la derecha) para ingresarlo.',
    },
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
          description: 'Ingresa tu token JWT obtenido de /auth/register o /auth/login',
        },
      },
      schemas: {
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombreCompleto: { type: 'string', example: 'Juan Dawaher' },
            email: { type: 'string', example: 'juanD@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9TYUGIAHOJSDHAS' },
          },
        },
        ErrorResponse: {
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

/**
* @swagger
* /about:
*   get:
*     summary: Obtiene información del estudiante
*     description: Retorna un objeto JSON con el nombre completo, cédula y sección del estudiante
*     responses:
*       200:
*         description: Respuesta exitosa
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
*                       example: Seccion 2
*/

app.get('/about', (req: Request, res: Response) => {
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
*     summary: Verifica que el servidor está funcionando
*     description: Retorna un estado 200 OK sin contenido
*     responses:
*       200:
*         description: Servidor funcionando correctamente
*/
//este endpoint sirve para verificar que el servidor está activo
app.get('/ping', (req: Request, res: Response) => {
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
