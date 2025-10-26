import { Request, Response, Router } from 'express';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas las rutas de users requieren autenticación
router.use(authenticateToken);

// GET /users
/** 
* @swagger
* /users:
*   get:
*     summary: Obtiene todos los usuarios
*     tags: [Users]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Lista de usuarios obtenida exitosamente
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/UserResponse'
*       401:
*         description: Token de acceso requerido
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*       403:
*         description: Token inválido o expirado
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*       500:
*         description: Error interno del servidor
*/
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombreCompleto', 'email', 'createdAt', 'updatedAt'],
    });
    
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

// GET /users/:id
/** 
* @swagger
* /users/{id}:
*   get:
*     summary: Obtiene un usuario por ID 
*     tags: [Users]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path  
*         name: id  
*         required: true
*         schema:
*           type: string
*         description: ID del usuario a obtener
*     responses:
*       200: 
*         description: Usuario obtenido exitosamente
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/UserResponse'
*       401:
*         description: Token de acceso requerido
*       403:
*         description: Token inválido o expirado
*       404:
*         description: Usuario no encontrado
*       500:
*         description: Error interno del servidor
*/
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'nombreCompleto', 'email', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' },
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user,
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
* /users:
*   post:
*     summary: Crea un nuevo usuario
*     tags: [Users]
*     security:
*       - bearerAuth: []
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
*         description: Usuario creado exitosamente
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/UserResponse'
*       400:
*         description: Error en la solicitud (ej. email duplicado)
*       401:
*         description: Token de acceso requerido
*       403:
*         description: Token inválido o expirado
*       500:
*         description: Error interno del servidor
*/
router.post('/', async (req: Request, res: Response) => {
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
    
    const user = await User.create({ nombreCompleto, email, password });
    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });
    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
* /users/{id}:
*   put:
*     summary: Actualiza un usuario existente
*     tags: [Users]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: ID del usuario a actualizar
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
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
*       200:
*         description: Usuario actualizado exitosamente
*       400:
*         description: Error en la solicitud (ej. email duplicado)
*       401:
*         description: Token de acceso requerido
*       403:
*         description: Token inválido o expirado
*       404:
*         description: Usuario no encontrado
*       500:
*         description: Error interno del servidor
*/
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { nombreCompleto, email, password } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' },
      });
    }
    
    // Si se cambia el email, verificar que no esté en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'El email ya está en uso' },
        });
      }
    }
    
    await user.update({ nombreCompleto, email, password });
    
    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

// DELETE /users/:id
/** 
* @swagger
* /users/{id}:
*   delete:
*     summary: Elimina un usuario por ID   
*     tags: [Users]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: ID del usuario a eliminar
*     responses:
*       200:
*         description: Usuario eliminado exitosamente
*       401:
*         description: Token de acceso requerido
*       403:
*         description: Token inválido o expirado
*       404:
*         description: Usuario no encontrado
*       500:
*         description: Error interno del servidor
*/
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' },
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

export default router;