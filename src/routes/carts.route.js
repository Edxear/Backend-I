import express from 'express';

export default function cartRouterFactory(cartManager) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json({ payload: newCart });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:cid', async (req, res) => {
    try {
      const cart = await cartManager.getCartById(req.params.cid);
      res.json({ payload: cart });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:cid/product/:pid', async (req, res) => {
    try {
      const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
      res.json({ payload: cart });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}