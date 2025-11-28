import mongoose from 'mongoose';
import 'dotenv/config.js';

const MONGO_URL = process.env.MONGO_URL;

console.log('🔍 Probando conexión a MongoDB...');
console.log('URL:', MONGO_URL.replace(/:[^:]*@/, ':***@'));

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Conectado exitosamente a MongoDB');
    console.log('Bases de datos disponibles:');
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listando colecciones:', err);
      } else {
        collections.forEach(col => console.log('  -', col.name));
      }
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('❌ Error de conexión:', err.message);
    console.error('Código:', err.codeName);
    process.exit(1);
  });
