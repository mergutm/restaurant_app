const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { AuthenticationError, ValidationError } = require('../utils/errors');

/**
 * Login de usuario
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validar campos requeridos
        if (!username || !password) {
            throw new ValidationError('Usuario y contraseña son requeridos');
        }

        // Buscar usuario (incluir password)
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            throw new AuthenticationError('Credenciales inválidas');
        }

        // Verificar que el usuario esté activo
        if (!user.active) {
            throw new AuthenticationError('Usuario inactivo');
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new AuthenticationError('Credenciales inválidas');
        }

        // Generar token
        const token = generateToken(user);

        res.json({
            status: 'success',
            data: {
                token,
                user: user.toPublicJSON()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener usuario actual
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        res.json({
            status: 'success',
            data: {
                user: req.user.toPublicJSON()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout (solo para consistencia, el token se elimina en el cliente)
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        res.json({
            status: 'success',
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cambiar contraseña
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new ValidationError('Contraseña actual y nueva son requeridas');
        }

        if (newPassword.length < 6) {
            throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
        }

        // Verificar contraseña actual
        const user = await User.findById(req.user._id).select('+password');
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            throw new AuthenticationError('Contraseña actual incorrecta');
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        res.json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    getMe,
    logout,
    changePassword
};
