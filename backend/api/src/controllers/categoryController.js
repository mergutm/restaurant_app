const { Category } = require('../models');
const { NotFoundError } = require('../utils/errors');

/**
 * Obtener todas las categorías
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
    try {
        const { active } = req.query;

        const filter = {};
        if (active !== undefined) {
            filter.active = active === 'true';
        }

        const categories = await Category.find(filter).sort({ order: 1, name: 1 });

        res.json({
            status: 'success',
            results: categories.length,
            data: {
                categories
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener una categoría por ID
 * GET /api/categories/:id
 */
const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw new NotFoundError('Categoría no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear una nueva categoría
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description, order } = req.body;

        const category = await Category.create({
            name,
            description,
            order,
            active: true
        });

        res.status(201).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar una categoría
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, order, active } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, order, active },
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            throw new NotFoundError('Categoría no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una categoría
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            throw new NotFoundError('Categoría no encontrada');
        }

        res.json({
            status: 'success',
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
