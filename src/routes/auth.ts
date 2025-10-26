import { Request, Response, Router } from 'express';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt';

const router = Router();

/**
* @swagger
* /auth/register:
*   post:
*     summary: Registra un nuevo usuario ..
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - nombreCompleto
*               - email
*               - password
*             properties:
*               nombreCompleto:
*                 type: string
*               email:
*                 type: string
*                 format: email
*               password:
*                 type: string
*                 format: password
*     responses:
*       201:
*         description: Usuario registrado exitosamente
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AuthResponse'
*       400:
*         description: Error en la solicitud (ej. email duplicado)
*       500:
*         description: Error interno del servidor
*/
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { nombreCompleto, email, password } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'El email ya está en uso' },
      });
    }
    
    // Crear el usuario
    const user = await User.create({ nombreCompleto, email, password });
    
    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

/**
* @swagger
* /auth/login:
*   post:
*     summary: Inicia sesión de usuario
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - password
*             properties:
*               email:
*                 type: string
*                 format: email
*               password:
*                 type: string
*                 format: password
*     responses:
*       200:
*         description: Login exitoso
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AuthResponse'
*       400:
*         description: Credenciales inválidas
*       500:
*         description: Error interno del servidor
*/  
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'Credenciales inválidas' },
      });
    }
    
    // Verificar contraseña
    if (!user.validPassword(password)) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'Credenciales inválidas' },
      });
    }
    
    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

export default router;