import 'dotenv/config.js';
import mongoose from 'mongoose';
import ProductModel from '../src/model/Product.model.js';

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('MONGO_URL no definida en .env');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado a MongoDB');

    const products = await ProductModel.find().lean();
    console.log(`Encontrados ${products.length} productos`);

    let updated = 0;
    for (const p of products) {
      const seed = p.code || p._id || p.title || Math.random().toString(36).slice(2,8);
      const safeSeed = encodeURIComponent(String(seed));
      const url = `https://picsum.photos/seed/${safeSeed}/600/400`;

      // Si ya tiene thumbnails, saltar o actualizar: aqui sobrescribimos con 1 imagen si está vacío
      if (!p.thumbnails || p.thumbnails.length === 0) {
        await ProductModel.updateOne({ _id: p._id }, { $set: { thumbnails: [url] } });
        updated++;
        console.log(`-> Actualizado ${p.title} (${p._id}) con imagen: ${url}`);
      } else {
        console.log(`- Ya tiene imagen(es): ${p.title} (${p._id})`);
      }
    }

    console.log(`Proceso terminado. Productos actualizados: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
