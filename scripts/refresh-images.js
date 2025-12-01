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

const categoryConfig = {
  'Refrigeradores': { color: '#3498db', icon: '🧊' },
  'Microondas': { color: '#e74c3c', icon: '📡' },
  'Lavadoras': { color: '#16a085', icon: '🌊' },
  'Aire Acondicionado': { color: '#f39c12', icon: '❄️' },
  'Televisores': { color: '#2c3e50', icon: '📺' },
  'Hornos': { color: '#d35400', icon: '🔥' },
  'Licuadoras': { color: '#c0392b', icon: '🥤' },
  'Planchas': { color: '#8e44ad', icon: '👕' },
  'Ventiladores': { color: '#1abc9c', icon: '💨' },
  'Tostadoras': { color: '#d4a017', icon: '🍞' },
  'Hervidores': { color: '#27ae60', icon: '☕' },
  'Secadoras': { color: '#e67e22', icon: '🌬️' },
  'Cafeteras': { color: '#34495e', icon: '☕' },
  'Batidoras': { color: '#c0392b', icon: '🥄' },
  'Humidificadores': { color: '#3498db', icon: '💧' },
  'Purificadores': { color: '#16a085', icon: '💨' },
  'Estufas': { color: '#e74c3c', icon: '🔥' },
  'Aspiradoras': { color: '#9b59b6', icon: '🌪️' },
  'Accesorios': { color: '#95a5a6', icon: '🔧' }
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateSVG(product) {
  const config = categoryConfig[product.category] || { color: '#95a5a6', icon: '📦' };
  const bgColor = config.color;
  const title = escapeHtml(product.title || 'Producto');
  const price = typeof product.price === 'number' ? product.price.toFixed(2) : '0.00';
  const category = escapeHtml(product.category || '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs>
  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${bgColor}"/>
    <stop offset="100%" stop-color="${darkenColor(bgColor)}"/>
  </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#bgGrad)"/>
<rect x="40" y="60" width="720" height="480" rx="16" fill="#ffffff" opacity="0.95"/>
<text x="650" y="200" font-size="120" text-anchor="middle" opacity="0.15">${config.icon}</text>
<text x="60" y="130" font-family="Arial" font-size="36" font-weight="bold" fill="#2c3e50">${title}</text>
<text x="60" y="180" font-family="Arial" font-size="18" fill="#7f8c8d">${category}</text>
<line x1="60" y1="210" x2="760" y2="210" stroke="#ecf0f1" stroke-width="2"/>
<text x="70" y="265" font-family="Arial" font-size="16" fill="#7f8c8d">Precio</text>
<text x="70" y="330" font-family="Arial" font-size="52" font-weight="bold" fill="${bgColor}">$${price}</text>
<rect x="420" y="260" width="300" height="80" rx="12" fill="${bgColor}"/>
<text x="570" y="320" font-family="Arial" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">Ver Producto</text>
</svg>`;
}

function darkenColor(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  const R = Math.max(0, (num >> 16) - 40);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - 40);
  const B = Math.max(0, (num & 0x0000FF) - 40);
  return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado a MongoDB');

    const products = await ProductModel.find().lean();
    console.log(`Encontrados ${products.length} productos`);

    const outDir = path.join(__dirname, '..', 'public', 'images', 'generated');
    await fs.mkdir(outDir, { recursive: true });

    // Limpiar archivos antiguos
    try {
      const files = await fs.readdir(outDir);
      for (const file of files) {
        if (file.startsWith('product-')) {
          await fs.unlink(path.join(outDir, file));
        }
      }
      console.log('Archivos antiguos eliminados');
    } catch (err) {
      console.log('No hay archivos antiguos que eliminar');
    }

    let updated = 0;
    const timestamp = Date.now();

    for (const p of products) {
      const seed = p.code || String(p._id);
      const safeName = seed.toString().replace(/[^a-zA-Z0-9-_]/g, '-');
      const filename = `product-${timestamp}-${safeName}.svg`;
      const filepath = path.join(outDir, filename);
      const publicPath = `/images/generated/${filename}`;

      const svg = generateSVG(p);
      await fs.writeFile(filepath, svg, 'utf8');
      await ProductModel.updateOne({ _id: p._id }, { $set: { thumbnails: [publicPath] } });
      updated++;
      console.log(`✅ ${p.title}`);
    }

    console.log(`\n✨ ${updated} productos actualizados con imágenes nuevas`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
