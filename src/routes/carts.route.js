import { Router } from 'express';
import CartModel from '../model/Cart.model.js';
import ProductModel from '../model/Product.model.js';

const router = Router();

/**
 * POST /api/carts
 * Crea un nuevo carrito vacío
 */
router.post('/', async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.status(201).json({ status: 'success', payload: newCart, message: 'Carrito creado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/carts/:cid
 * Obtiene un carrito completo con productos populados
 */
router.get('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/carts/:cid/product/:pid
 * Agrega un producto al carrito (incrementa cantidad si ya existe)
 */
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Verificar que el producto existe
    const product = await ProductModel.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    // Obtener el carrito
    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );

    if (productIndex !== -1) {
      // Si existe, incrementar cantidad
      cart.products[productIndex].quantity += req.body.quantity || 1;
    } else {
      // Si no existe, agregar nuevo
      cart.products.push({
        product: pid,
        quantity: req.body.quantity || 1
      });
    }

    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart, message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * PUT /api/carts/:cid
 * Reemplaza todos los productos del carrito con un nuevo array
 */
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'products debe ser un array' });
    }

    // Validar que todos los productos existan
    for (const item of products) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        return res.status(404).json({ status: 'error', message: `Producto ${item.product} no encontrado` });
      }
    }

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    ).populate('products.product');

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart, message: 'Carrito actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * PUT /api/carts/:cid/product/:pid
 * Actualiza SOLO la cantidad de un producto en el carrito
 */
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ status: 'error', message: 'quantity debe ser mayor a 0' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );

    if (productIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart, message: 'Cantidad actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/carts/:cid/product/:pid
 * Elimina un producto específico del carrito
 */
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();
    await cart.populate('products.product');

    res.json({ status: 'success', payload: cart, message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/carts/:cid
 * Elimina todos los productos del carrito
 */
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findByIdAndUpdate(
      req.params.cid,
      { products: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart, message: 'Carrito vaciado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;