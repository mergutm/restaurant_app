const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: [true, 'El número de mesa es requerido'],
        unique: true,
        min: [1, 'El número de mesa debe ser mayor a 0']
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad es requerida'],
        min: [1, 'La capacidad debe ser al menos 1']
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'occupied', 'reserved', 'cleaning'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'available'
    },
    location: {
        type: String,
        enum: ['indoor', 'outdoor', 'terrace', 'bar'],
        default: 'indoor'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices
tableSchema.index({ status: 1 });
tableSchema.index({ active: 1 });

// Virtual para obtener la orden actual de la mesa
tableSchema.virtual('currentOrder', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'tableId',
    justOne: true,
    match: { status: { $in: ['pending', 'preparing', 'ready'] } }
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
