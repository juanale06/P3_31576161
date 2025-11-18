import dotenv from 'dotenv';
dotenv.config();

import {app,syncDatabase} from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  syncDatabase();
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
});