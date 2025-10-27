import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CartManager {
  constructor() {
    this.path = path.join(__dirname, 'carts.json');
    this.carts = [];
  }

  async init() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
    } catch (error) {
      await this.saveCarts();
    }
  }

  async saveCarts() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

  async createCart() {
    const newCart = {
      id: this.generateId(),
      products: []
    };

    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    const cart = this.carts.find(c => c.id === id);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    const existingProduct = cart.products.find(p => p.product === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({
        product: productId,
        quantity: 1
      });
    }

    await this.saveCarts();
    return cart;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}