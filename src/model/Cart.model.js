import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const CartCollection = 'carts';

/**
 * Esquema de Carrito
 * Cada producto en el array productos es una referencia a Product
 * Se usa populate() para traer los detalles del producto
 */
const CartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'products',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'La cantidad debe ser al menos 1'],
          default: 1
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Middleware para populate automático al recuperar un carrito
CartSchema.pre(/^find/, function () {
  this.populate('products.product');
});

// Evitar recompilación del modelo
const CartModel = models[CartCollection] || model(CartCollection, CartSchema);

export default CartModel;
