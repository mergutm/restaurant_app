const { AppError } = require('../utils/errors');

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join(', ');
        error = new AppError(message, 400);
    }

    // Error de cast de Mongoose (ID inválido)
    if (err.name === 'CastError') {
        const message = `Recurso no encontrado con id: ${err.value}`;
        error = new AppError(message, 404);
    }

    // Error de duplicado de Mongoose
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `Ya existe un registro con ese ${field}`;
        error = new AppError(message, 409);
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = new AppError(message, 401);
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = new AppError(message, 401);
    }

    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';

    res.status(statusCode).json({
        status,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res, next) => {
    const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
