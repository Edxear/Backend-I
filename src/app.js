import express from 'express';
import { ProductManager } from './ProductManager.js';
import { CartManager } from './CartManager.js';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import multer from 'multer';
import path from 'path';
import viewRouter from './routes/view.route.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


const app = express();

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

app.get("/", (req, res) => {
  let testUser = {
    name: "Exequiel",
    last_name: "Dearmas"
  };
  res.render("app", testUser);
});


const productManager = new ProductManager();
const cartManager = new CartManager();

await productManager.init();
await cartManager.init();

// Routers
const productsRouter = express.Router();
const cartsRouter = express.Router();

// Configurar routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewRouter);

// Routes para productos
productsRouter.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json({ payload: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productsRouter.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.json({ payload: product });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

productsRouter.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json({ payload: newProduct, message: "Producto creado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.put('/:pid', async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    res.json({ payload: updatedProduct, message: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  try {
    const deletedProduct = await productManager.deleteProduct(req.params.pid);
    res.json({ payload: deletedProduct, message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Routes para carritos
cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ payload: newCart, message: 'Carrito creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json({ payload: cart });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json({ payload: cart, message: 'Producto agregado al carrito correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).send('No se subió archivo');
  res.json({ message: 'Archivo subido correctamente', file: req.file });
});

// Iniciar el servidor

app.listen(8080, () => {
  console.log("Servidor ejecutándose en puerto 8080");
});