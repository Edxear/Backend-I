import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import multer from 'multer';
import path from 'path';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import 'dotenv/config.js';
import viewRouter from './routes/view.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/carts.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error(' MONGO_URL no está definida en .env');
  process.exit(1);
}

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log(' MongoDB conectado correctamente');
    console.log(' Base de datos: Ecommerce');
  })
  .catch((err) => {
    console.error(' Error de conexión a MongoDB:', err.message);
  });



// multer storage
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalname = file.originalname;
    cb(null, `${timestamp}-${originalname}`);
  }
});
const upload = multer({ storage: storageConfig });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine({
  extname: '.handlebars',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  defaultLayout: 'main'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

let messages = [];

// Configuración de Socket.io
io.on('connection', (socket) => {
  socket.emit('messageList', messages);
  console.log('Nuevo cliente conectado', socket.id);

  socket.on('newMessage', (message) => {
    messages.push(message);
    io.emit('newMessage', {
      socketId: socket.id,
      message: message
    });
  });
});

app.get("/", (req, res) => {
  let testUser = {
    title: 'Inicio',
    name: "Exequiel",
    last_name: "Dearmas"
  };
  res.render("app", testUser);
});

// Socket handlers para actualizar productos en tiempo real
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('requestProducts', async () => {
    try {
      const ProductModel = (await import('./model/Product.model.js')).default;
      const products = await ProductModel.find();
      socket.emit('updateProducts', products);
    } catch (err) {
      console.error('Error al obtener productos:', err);
    }
  });
});

// Configurar routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewRouter);

// Importar rutas opcionales (si existen y están configuradas)
try {
  const { default: OrdersRoute } = await import('./routes/Orders.route.js');
  app.use('/api/orders', OrdersRoute);
  console.log('Ruta Orders cargada');
} catch (err) {
  console.warn('Ruta Orders no disponible');
}

// La ruta de `Alumnos` fue eliminada; no se intenta importar ni registrar.

app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).send('No se subió archivo');
  res.json({ message: 'Archivo subido correctamente', file: req.file });
});

// Iniciar el servidor DESPUÉS de conectar a MongoDB
mongoose.connection.once('open', () => {
  const PORT = process.env.PORT || 8080;
  httpServer.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
  });
});

// En caso de desconexión
mongoose.connection.on('disconnected', () => {
  console.warn('Desconectado de MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error en conexión de MongoDB:', err.message);
});