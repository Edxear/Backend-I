import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const OrdersCollection = 'orders';

/**
 * Esquema de Orden
 * Referencia a Cart y contiene todos los productos de esa orden
 * Se usa populate() para traer los detalles completos de los productos
 */
const OrdersSchema = new Schema(
  {
    // Referencia al carrito del cual se generó la orden
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'carts',
      required: [true, 'El carrito es obligatorio']
    },

    // Array de productos en la orden (copia del carrito en el momento de la compra)
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
          min: [1, 'La cantidad debe ser al menos 1']
        },
        precio_unitario: {
          type: Number,
          required: true,
          min: [0, 'El precio no puede ser negativo']
        }
      }
    ],

    // Email del cliente
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },

    // Total de la orden
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: [0, 'El total no puede ser negativo']
    },

    // Estado de la orden
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },

    // Dirección de envío (opcional)
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  {
    timestamps: true
  }
);

// Middleware para populate automático
OrdersSchema.pre(/^find/, function () {
  this.populate('cart').populate('products.product');
});

// Evitar recompilación del modelo
const OrdersModel = models[OrdersCollection] || model(OrdersCollection, OrdersSchema);

export default OrdersModel;