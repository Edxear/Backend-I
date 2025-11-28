import { Router } from 'express';
import ProductModel from '../model/Product.model.js';

const router = Router();

/**
 * GET /api/products
 * Obtiene productos con paginación, filtros y ordenamiento
 * Query params:
 *   - limit (default: 10)
 *   - page (default: 1)
 *   - sort (asc/desc por precio)
 *   - query (filtro por categoría o status)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort; // asc o desc
    const query = req.query.query; // ej: category=electronics o status=true

    // Construir filtro
    let filter = {};
    if (query) {
      // Intentar parsear como JSON (ej: {"category":"electronics"})
      try {
        const parsed = JSON.parse(query);
        filter = parsed;
      } catch {
        // Si no es JSON válido, asumir que es categoría
        filter = { category: query };
      }
    }

    // Construir sort object
    let sortObj = {};
    if (sort === 'asc') {
      sortObj = { price: 1 };
    } else if (sort === 'desc') {
      sortObj = { price: -1 };
    }

    // Calcular skip
    const skip = (page - 1) * limit;

    // Ejecutar consulta
    const products = await ProductModel.find(filter)
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    // Contar total de documentos que coinciden
    const totalDocs = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    // Construir links
    const baseUrl = `${req.protocol}://${req.get('host')}/api/products`;
    const prevLink = hasPrevPage
      ? `${baseUrl}?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}`
      : null;
    const nextLink = hasNextPage
      ? `${baseUrl}?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}`
      : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/products/:pid
 * Obtiene un producto por ID
 */
router.get('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/products
 * Crea un nuevo producto
 */
router.post('/', async (req, res) => {
  try {
    const newProduct = await ProductModel.create(req.body);
    res.status(201).json({ status: 'success', payload: newProduct, message: 'Producto creado correctamente' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * PUT /api/products/:pid
 * Actualiza un producto
 */
router.put('/:pid', async (req, res) => {
  try {
    // Evitar actualizar el campo _id
    const { _id, ...updateData } = req.body;
    const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.pid, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: updatedProduct, message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/products/:pid
 * Elimina un producto
 */
router.delete('/:pid', async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: deletedProduct, message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;