import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ProductCollection = 'products';

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del producto es obligatorio'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'El código del producto es obligatorio'],
      unique: [true, 'El código ya existe'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
      index: true
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo']
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
      index: true
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    },
    thumbnails: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Crear índices compuestos para búsquedas comunes
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ title: 'text', description: 'text' });

// Evitar recompilación del modelo
const ProductModel = models[ProductCollection] || model(ProductCollection, ProductSchema);

export default ProductModel;
