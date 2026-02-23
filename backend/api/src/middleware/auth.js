const { User } = require('../models');
const { verifyToken, extractToken } = require('../utils/jwt');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado
 */
const authenticate = async (req, res, next) => {
    try {
        // Extraer token del header
        const token = extractToken(req);

        if (!token) {
            throw new AuthenticationError('No se proporcionó token de autenticación');
        }

        // Verificar token
        const decoded = verifyToken(token);

        // Buscar usuario
        const user = await User.findById(decoded.id).select('+password');

        if (!user) {
            throw new AuthenticationError('Usuario no encontrado');
        }

        if (!user.active) {
            throw new AuthenticationError('Usuario inactivo');
        }

        // Agregar usuario al request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware de autorización por roles
 * @param {...String} roles - Roles permitidos
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Usuario no autenticado'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AuthorizationError(
                    `El rol ${req.user.role} no tiene permisos para esta acción`
                )
            );
        }

        next();
    };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, solo agrega el usuario si existe
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (token) {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.id);

            if (user && user.active) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Ignorar errores en autenticación opcional
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
