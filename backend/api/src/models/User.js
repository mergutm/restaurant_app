const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No incluir password en queries por defecto
    },
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    role: {
        type: String,
        enum: {
            values: ['cashier', 'waiter', 'kitchen', 'admin'],
            message: '{VALUE} no es un rol válido'
        },
        required: [true, 'El rol es requerido']
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
userSchema.index({ role: 1, active: 1 });

// Hash password antes de guardar
userSchema.pre('save', async function (next) {
    // Solo hash si el password fue modificado
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublicJSON = function () {
    return {
        _id: this._id,
        username: this.username,
        name: this.name,
        role: this.role,
        active: this.active,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
