import 'dotenv/config.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductModel from '../src/model/Product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('MONGO_URL no definida en .env');
  process.exit(1);
}

function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado a MongoDB');

    const products = await ProductModel.find().lean();
    console.log(`Encontrados ${products.length} productos`);

    const outDir = path.join(__dirname, '..', 'public', 'images', 'generated');
    await fs.mkdir(outDir, { recursive: true });

    let updated = 0;

    for (const p of products) {
      const seed = p.code || String(p._id);
      const safeName = seed.toString().replace(/[^a-zA-Z0-9-_]/g, '-');
      const filename = `product-${safeName}.svg`;
      const filepath = path.join(outDir, filename);
      const publicPath = `/images/generated/${filename}`;

      // Create a simple SVG with title and price
      const bg = colorFromString(String(seed));
      const title = escapeHtml(p.title || 'Producto');
      const price = typeof p.price === 'number' ? p.price.toFixed(2) : '';
      const category = escapeHtml(p.category || '');

      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">\n` +
        `<defs>\n` +
        `  <linearGradient id="g" x1="0" x2="1">\n` +
        `    <stop offset="0" stop-color="${bg}" stop-opacity="0.9"/>\n` +
        `    <stop offset="1" stop-color="#ffffff" stop-opacity="0.05"/>\n` +
        `  </linearGradient>\n` +
        `</defs>\n` +
        `<rect width="100%" height="100%" fill="url(#g)"/>\n` +
        `<g transform="translate(40,80)">\n` +
        `  <rect x="0" y="0" width="720" height="360" rx="14" ry="14" fill="#ffffff" opacity="0.06"/>\n` +
        `  <text x="20" y="60" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#222" font-weight="700">${title}</text>\n` +
        `  <text x="20" y="110" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#333">${category}</text>\n` +
        `  <text x="20" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#27ae60">$${price}</text>\n` +
        `  <rect x="520" y="260" width="200" height="40" rx="8" fill="#3498db"/>\n` +
        `  <text x="630" y="288" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#fff" text-anchor="middle">Ver producto</text>\n` +
        `</g>\n` +
        `</svg>`;

      // Write file (overwrite if exists)
      await fs.writeFile(filepath, svg, 'utf8');

      // Update product thumbnails to point to the generated image
      await ProductModel.updateOne({ _id: p._id }, { $set: { thumbnails: [publicPath] } });
      updated++;
      console.log(`Generado y asignado imagen para: ${p.title} -> ${publicPath}`);
    }

    console.log(`Proceso terminado. Productos actualizados: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
