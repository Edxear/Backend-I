import { Router } from "express";
import OrdersModel from '../model/orders.model.js';
import CartModel from '../model/Cart.model.js';

const router = Router();

/**
 * GET /api/orders
 * Obtiene todas las órdenes
 */
router.get('/', async (req, res) => {
  try {
    const orders = await OrdersModel.find().populate('cart').populate('products.product');
    res.json({ status: 'success', payload: orders });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/orders/:oid
 * Obtiene una orden específica
 */
router.get('/:oid', async (req, res) => {
  try {
    const order = await OrdersModel.findById(req.params.oid).populate('cart').populate('products.product');
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Orden no encontrada' });
    }
    res.json({ status: 'success', payload: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/orders
 * Crea una nueva orden a partir de un carrito
 */
router.post('/', async (req, res) => {
  try {
    const { cartId, email, shippingAddress } = req.body;

    if (!cartId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'cartId y email son obligatorios'
      });
    }

    const cart = await CartModel.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    if (cart.products.length === 0) {
      return res.status(400).json({ status: 'error', message: 'El carrito está vacío' });
    }

    // Construir array de productos y calcular total
    let total = 0;
    const products = cart.products.map((item) => {
      const subtotal = item.product.price * item.quantity;
      total += subtotal;
      return {
        product: item.product._id,
        quantity: item.quantity,
        precio_unitario: item.product.price
      };
    });

    // Crear la orden
    const newOrder = await OrdersModel.create({
      cart: cartId,
      products,
      email,
      total,
      shippingAddress: shippingAddress || null,
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      payload: newOrder,
      message: 'Orden creada correctamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * PUT /api/orders/:oid
 * Actualiza el estado de una orden
 */
router.put('/:oid', async (req, res) => {
  try {
    const { status, shippingAddress } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;

    const updatedOrder = await OrdersModel.findByIdAndUpdate(
      req.params.oid,
      updateData,
      { new: true }
    ).populate('cart').populate('products.product');

    if (!updatedOrder) {
      return res.status(404).json({ status: 'error', message: 'Orden no encontrada' });
    }

    res.json({
      status: 'success',
      payload: updatedOrder,
      message: 'Orden actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/orders/:oid
 * Elimina una orden
 */
router.delete('/:oid', async (req, res) => {
  try {
    const deletedOrder = await OrdersModel.findByIdAndDelete(req.params.oid);
    if (!deletedOrder) {
      return res.status(404).json({ status: 'error', message: 'Orden no encontrada' });
    }
    res.json({
      status: 'success',
      payload: deletedOrder,
      message: 'Orden eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;