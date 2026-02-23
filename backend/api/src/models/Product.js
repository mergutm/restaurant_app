const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es requerida']
    },
    category: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        name: String
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Sin+Imagen'
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    available: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        default: 15,
        min: [0, 'El tiempo de preparación no puede ser negativo']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices
productSchema.index({ name: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ available: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'category.name': 1 });

// Índice de texto para búsqueda
productSchema.index({ name: 'text', description: 'text', ingredients: 'text' });

// Middleware para actualizar el campo category cuando cambia categoryId
productSchema.pre('save', async function (next) {
    if (this.isModified('categoryId')) {
        const Category = mongoose.model('Category');
        const category = await Category.findById(this.categoryId);
        if (category) {
            this.category = {
                _id: category._id,
                name: category.name
            };
        }
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
