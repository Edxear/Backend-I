import express from 'express';
import { ProductManager } from './ProductManager.js';
import { CartManager } from './CartManager.js';

const app = express();

app.use(express.json());

// Inicializar managers
const productManager = new ProductManager();
const cartManager = new CartManager();

// esperar inicialización de managers antes de exponer rutas y antes de arrancar servidor
await productManager.init();
await cartManager.init();

// Routers
const productsRouter = express.Router();
const cartsRouter = express.Router();

// Configurar routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

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

app.listen(8080, () => {
  console.log("Servidor ejecutándose en puerto 8080");
});