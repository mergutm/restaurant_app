const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    product: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        image: String
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido']
    },
    subtotal: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'delivered'],
        default: 'pending'
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'La mesa es requerida']
    },
    table: {
        _id: mongoose.Schema.Types.ObjectId,
        number: Number
    },
    waiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El mesero es requerido']
    },
    waiter: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'preparing', 'ready', 'closed', 'paid', 'cancelled'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', null],
        default: null
    },
    notes: {
        type: String,
        trim: true
    },
    closedAt: Date,
    paidAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices
orderSchema.index({ tableId: 1 });
orderSchema.index({ waiterId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'table.number': 1 });

// Generar número de orden antes de guardar
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Generar número de orden único
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

        // Crear fechas para el rango sin mutar
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const count = await mongoose.model('Order').countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }

    // Calcular totales
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.tax = this.subtotal * 0.16; // 16% IVA
    this.total = this.subtotal + this.tax;

    next();
});

// Middleware para popular datos de tabla y mesero
orderSchema.pre('save', async function (next) {
    if (this.isModified('tableId')) {
        const Table = mongoose.model('Table');
        const table = await Table.findById(this.tableId);
        if (table) {
            this.table = {
                _id: table._id,
                number: table.number
            };
        }
    }

    if (this.isModified('waiterId')) {
        const User = mongoose.model('User');
        const waiter = await User.findById(this.waiterId);
        if (waiter) {
            this.waiter = {
                _id: waiter._id,
                name: waiter.name
            };
        }
    }

    next();
});

// Calcular subtotal de cada item antes de guardar
orderItemSchema.pre('save', function (next) {
    this.subtotal = this.price * this.quantity;
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
