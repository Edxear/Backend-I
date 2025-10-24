import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductManager {
  constructor() {
    this.path = path.join(__dirname, 'products.json');
    this.products = [];
  }

  async init() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
    } catch (error) {
      this.products = [];
      await this.saveProducts();
    }
  }

  async saveProducts() {
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
  }

  async getProducts() {
    return this.products;
  }

  async getProductById(id) {
    const product = this.products.find(prod => prod.id === id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async addProduct(productData) {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = productData;

    // Validación que permite valores 0
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (productData[field] === undefined || productData[field] === null || productData[field] === '') {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Validar tipos/números
    if (isNaN(Number(price)) || isNaN(Number(stock))) {
      throw new Error('price y stock deben ser números válidos');
    }

    // Verificar que no se repita el código
    if (this.products.some(prod => prod.code === code)) {
      throw new Error('El código del producto ya existe');
    }

    const newProduct = {
      id: this.generateId(),
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [thumbnails]
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const index = this.products.findIndex(prod => prod.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    // No permitir actualizar el id
    if (updatedFields.id) {
      delete updatedFields.id;
    }

    // Normalizar tipos si vienen price/stock/status
    if (updatedFields.price != null) {
      if (isNaN(Number(updatedFields.price))) throw new Error('price debe ser un número');
      updatedFields.price = Number(updatedFields.price);
    }
    if (updatedFields.stock != null) {
      if (isNaN(Number(updatedFields.stock))) throw new Error('stock debe ser un número');
      updatedFields.stock = Number(updatedFields.stock);
    }
    if (updatedFields.status != null) {
      updatedFields.status = Boolean(updatedFields.status);
    }

    this.products[index] = { ...this.products[index], ...updatedFields };
    await this.saveProducts();
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(prod => prod.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    const deletedProduct = this.products.splice(index, 1)[0];
    await this.saveProducts();
    return deletedProduct;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}