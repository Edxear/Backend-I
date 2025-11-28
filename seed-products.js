import mongoose from 'mongoose';
import 'dotenv/config.js';
import ProductModel from './src/model/Product.model.js';

const MONGO_URL = process.env.MONGO_URL;

const products = [
  {
    title: 'Refrigerador Samsung 550L',
    description: 'Refrigerador de doble puerta con compresor inverter, capacidad de 550 litros',
    code: 'REF-SAM-001',
    price: 850,
    stock: 15,
    category: 'Refrigeradores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Refrigerador+Samsung']
  },
  {
    title: 'Microondas LG 25L',
    description: 'Microondas digital con 10 niveles de potencia, capacidad de 25 litros',
    code: 'MIC-LG-001',
    price: 180,
    stock: 25,
    category: 'Microondas',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Microondas+LG']
  },
  {
    title: 'Lavadora Electrolux 8kg',
    description: 'Lavadora automática frontal con ciclo de lavado rápido, capacidad 8kg',
    code: 'LAV-ELC-001',
    price: 620,
    stock: 10,
    category: 'Lavadoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Lavadora+Electrolux']
  },
  {
    title: 'Aire Acondicionado TCL 2000W',
    description: 'Aire acondicionado split inverter, 2000W de potencia, control remoto',
    code: 'AC-TCL-001',
    price: 450,
    stock: 8,
    category: 'Aire Acondicionado',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Aire+Acondicionado']
  },
  {
    title: 'Televisor Sony 55 pulgadas 4K',
    description: 'Smart TV 4K HDR, 55 pulgadas, conexión WiFi incorporada',
    code: 'TV-SONY-001',
    price: 750,
    stock: 12,
    category: 'Televisores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Televisor+Sony']
  },
  {
    title: 'Horno Eléctrico Philips 45L',
    description: 'Horno eléctrico con convección, capacidad 45 litros, temperatura hasta 250°C',
    code: 'HORNO-PH-001',
    price: 320,
    stock: 7,
    category: 'Hornos',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Horno+Philips']
  },
  {
    title: 'Licuadora Black+Decker 1000W',
    description: 'Licuadora de vaso de vidrio, motor de 1000W, 6 velocidades',
    code: 'LIC-BD-001',
    price: 95,
    stock: 30,
    category: 'Licuadoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Licuadora+BD']
  },
  {
    title: 'Plancha Vapor Rowenta 2800W',
    description: 'Plancha de vapor profesional, 2800W, suela de cerámica',
    code: 'PLAN-ROW-001',
    price: 140,
    stock: 20,
    category: 'Planchas',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Plancha+Rowenta']
  },
  {
    title: 'Ventilador Olimpo 50cm',
    description: 'Ventilador de pedestal con 3 velocidades, altura ajustable',
    code: 'VENT-OLI-001',
    price: 65,
    stock: 40,
    category: 'Ventiladores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Ventilador+Olimpo']
  },
  {
    title: 'Tostadora Oster 2 Espacios',
    description: 'Tostadora para 2 rebanadas, 6 niveles de dorado, bandeja extraíble',
    code: 'TOST-OST-001',
    price: 55,
    stock: 25,
    category: 'Tostadoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Tostadora+Oster']
  },
  {
    title: 'Hervidor Eléctrico Strix 1.7L',
    description: 'Hervidor de acero inoxidable, capacidad 1.7L, apagado automático',
    code: 'HERV-STR-001',
    price: 45,
    stock: 35,
    category: 'Hervidores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Hervidor+Strix']
  },
  {
    title: 'Secadora Whirlpool 7kg',
    description: 'Secadora eléctrica con sensor de humedad, capacidad 7kg',
    code: 'SEC-WHIR-001',
    price: 580,
    stock: 6,
    category: 'Secadoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Secadora+Whirlpool']
  },
  {
    title: 'Cafetera Nespresso Inissia',
    description: 'Cafetera automática para cápsulas, presión 19 bares',
    code: 'CAF-NESP-001',
    price: 200,
    stock: 18,
    category: 'Cafeteras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Cafetera+Nespresso']
  },
  {
    title: 'Batidora KitchenAid 500W',
    description: 'Batidora de mano 500W, velocidad variable, 5 accesorios',
    code: 'BAT-KA-001',
    price: 120,
    stock: 22,
    category: 'Batidoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Batidora+KitchenAid']
  },
  {
    title: 'Humidificador Bionaire 4L',
    description: 'Humidificador ultrasónico, capacidad 4L, difusión de aromas',
    code: 'HUM-BIO-001',
    price: 85,
    stock: 19,
    category: 'Humidificadores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Humidificador']
  },
  {
    title: 'Purificador Coway 500ml/h',
    description: 'Purificador de aire con filtro HEPA, capacidad 500ml/h',
    code: 'PUR-COW-001',
    price: 280,
    stock: 9,
    category: 'Purificadores',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Purificador+Coway']
  },
  {
    title: 'Estufa Rayos Infrarrojo 1500W',
    description: 'Estufa infrarroja portátil, 1500W, termostato regulable',
    code: 'EST-RAY-001',
    price: 110,
    stock: 14,
    category: 'Estufas',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Estufa+Infrarrojo']
  },
  {
    title: 'Aspiradora Electrolux 2000W',
    description: 'Aspiradora vertical con bolsa, 2000W, filtro HEPA',
    code: 'ASP-ELC-001',
    price: 240,
    stock: 11,
    category: 'Aspiradoras',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Aspiradora+Electrolux']
  },
  {
    title: 'Tabla de Planchar Metálica',
    description: 'Tabla de planchar profesional, altura ajustable, funda de algodón',
    code: 'TAB-PLAN-001',
    price: 75,
    stock: 28,
    category: 'Accesorios',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Tabla+Planchar']
  },
  {
    title: 'Molino de Café Cuisinart 110W',
    description: 'Molinillo de café eléctrico, 110W, capacidad 55g',
    code: 'MOL-CUI-001',
    price: 65,
    stock: 23,
    category: 'Accesorios',
    status: true,
    thumbnails: ['https://via.placeholder.com/300?text=Molino+Cafe']
  }
];

async function seedProducts() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Conectado a MongoDB');

    console.log('Eliminando productos existentes...');
    await ProductModel.deleteMany({});
    console.log('Productos eliminados');

    console.log('Insertando 20 productos electrodomésticos...');
    const inserted = await ProductModel.insertMany(products);
    console.log(`${inserted.length} productos insertados correctamente`);

    console.log('\n Resumen de productos:');
    const categories = {};
    inserted.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} productos`);
    });

    console.log('\n Base de datos lista para pruebas');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
