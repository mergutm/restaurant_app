/**
 * Clase base para errores personalizados de la API
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
    constructor(message = 'Error de validación') {
        super(message, 400);
    }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(message, 401);
    }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 403);
    }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
    constructor(message = 'Conflicto con el estado actual') {
        super(message, 409);
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError
};
