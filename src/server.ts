import dotenv from 'dotenv';
dotenv.config();

import { app, syncDatabase } from './app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Sincronizar Base de Datos primero
    await syncDatabase();

    // 2. Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();