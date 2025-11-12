import express from 'express';

export default function productRouterFactory(productManager) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const products = await productManager.getProducts();
      res.json({ payload: products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const product = await productManager.getProductById(req.params.pid);
      res.json({ payload: product });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const newProduct = await productManager.addProduct(req.body);
      res.status(201).json({ payload: newProduct });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const updated = await productManager.updateProduct(req.params.pid, req.body);
      res.json({ payload: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const deleted = await productManager.deleteProduct(req.params.pid);
      res.json({ payload: deleted });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}