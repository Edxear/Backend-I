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

// Mapear categorías a colores y emojis/iconos
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
    <stop offset="0%" stop-color="${bgColor}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${adjustBrightness(bgColor, -30)}" stop-opacity="1"/>
  </linearGradient>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
  </filter>
</defs>

<!-- Fondo degradado -->
<rect width="100%" height="100%" fill="url(#bgGrad)"/>

<!-- Decoración superior derecha -->
<circle cx="700" cy="100" r="120" fill="#ffffff" opacity="0.1"/>
<circle cx="750" cy="50" r="80" fill="#ffffff" opacity="0.08"/>

<!-- Área principal de contenido -->
<g filter="url(#shadow)">
  <rect x="40" y="60" width="720" height="480" rx="16" ry="16" fill="#ffffff" opacity="0.95"/>
</g>

<!-- Icono de categoría grande -->
<text x="650" y="200" font-size="140" text-anchor="middle" opacity="0.15">${config.icon}</text>

<!-- Título del producto -->
<text x="60" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="700" fill="#2c3e50">${title}</text>

<!-- Categoría -->
<text x="60" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#7f8c8d">${category}</text>

<!-- Línea divisoria -->
<line x1="60" y1="210" x2="760" y2="210" stroke="#ecf0f1" stroke-width="2"/>

<!-- Precio -->
<g>
  <rect x="60" y="240" width="300" height="120" rx="12" fill="${bgColor}" opacity="0.1"/>
  <text x="70" y="265" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#7f8c8d">Precio</text>
  <text x="70" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="700" fill="${bgColor}">$${price}</text>
</g>

<!-- Botón -->
<g>
  <rect x="420" y="260" width="300" height="80" rx="12" fill="${bgColor}"/>
  <text x="570" y="320" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">Ver Producto</text>
</g>

<!-- Decoración inferior -->
<circle cx="100" cy="550" r="60" fill="${bgColor}" opacity="0.1"/>
<circle cx="750" cy="540" r="80" fill="${bgColor}" opacity="0.08"/>
</svg>`;
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return '#' + [R, G, B].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
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

      const svg = generateSVG(p);
      await fs.writeFile(filepath, svg, 'utf8');

      // Actualizar solo si no tiene imagen o queremos reemplazar
      await ProductModel.updateOne({ _id: p._id }, { $set: { thumbnails: [publicPath] } });
      updated++;
      console.log(`✨ Actualizado: ${p.title}`);
    }

    console.log(`✅ Proceso terminado. ${updated} productos con nuevas imágenes.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
