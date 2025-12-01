import { Router } from "express";
import ProductModel from '../model/Product.model.js';
import CartModel from '../model/Cart.model.js';

const route = Router();

/**
 * GET /perfil
 * Página de perfil de usuario
 */
route.get('/perfil', (req, res) => {
    res.render('perfil', {
        name: "Exequiel Dearmas",
        rol: "guest",
        isAdmin: true,
        notas: [{curso: "javascript", nota:10},{curso: 'html', nota:9}, {curso:'css', nota:6}, {curso:'react', nota: 3}]
    })
})

/**
 * GET /socket
 * Página de chat con websockets
 */
route.get('/socket', (req, res) => {
    res.render('chat',{})
})

/**
 * GET /realtimeproducts
 * Página de productos en tiempo real (websockets)
 */
route.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {});
})

/**
 * GET /products
 * Página de listado de productos con paginación y filtros, agrupados por categoría
 */
route.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;

        // Construir filtro
        let filter = {};
        if (query) {
            try {
                const parsed = JSON.parse(query);
                filter = parsed;
            } catch {
                filter = { category: query };
            }
        }

        // Construir sort por categoría primero, luego por precio si es necesario
        let sortObj = { category: 1 }; // Ordenar por categoría por defecto
        if (sort === 'asc') {
            sortObj = { category: 1, price: 1 };
        } else if (sort === 'desc') {
            sortObj = { category: 1, price: -1 };
        }

        const skip = (page - 1) * limit;

        // Obtener productos
        const products = await ProductModel.find(filter)
            .sort(sortObj)
            .limit(limit)
            .skip(skip)
            .lean();

        // Agrupar productos por categoría
        const groupedByCategory = {};
        products.forEach(product => {
            if (!groupedByCategory[product.category]) {
                groupedByCategory[product.category] = [];
            }
            groupedByCategory[product.category].push(product);
        });

        // Contar total
        const totalDocs = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / limit);

        res.render('products', {
            payload: products,
            groupedByCategory,
            page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            prevLink: page > 1 ? `/products?page=${page - 1}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: page < totalPages ? `/products?page=${page + 1}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null
        });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

/**
 * GET /products/:pid
 * Vista detallada de un producto
 */
route.get('/products/:pid', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado' });
        }
        res.render('product-detail', { product });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

/**
 * GET /carts/:cid
 * Vista de un carrito específico
 */
route.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }
        res.render('cart', { cart });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
});

export default route;