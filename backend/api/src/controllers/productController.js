const { Product, Category } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obtener todos los productos
 * GET /api/products
 * Query params: category, available, search, limit, page
 */
const getProducts = async (req, res, next) => {
    try {
        const {
            category,
            available,
            search,
            limit = 50,
            page = 1,
            sort = '-createdAt'
        } = req.query;

        // Construir filtro
        const filter = {};

        if (category) {
            filter['category.name'] = category;
        }

        if (available !== undefined) {
            filter.available = available === 'true';
        }

        if (search) {
            filter.$text = { $search: search };
        }

        // Calcular skip para paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Ejecutar query
        const products = await Product.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        // Contar total de documentos
        const total = await Product.countDocuments(filter);

        res.json({
            status: 'success',
            results: products.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: {
                products
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un producto por ID
 * GET /api/products/:id
 */
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear un nuevo producto
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            categoryId,
            image,
            ingredients,
            preparationTime
        } = req.body;

        // Validar que la categoría exista
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ValidationError('Categoría no encontrada');
        }

        const product = await Product.create({
            name,
            description,
            price,
            categoryId,
            image,
            ingredients,
            preparationTime,
            available: true
        });

        res.status(201).json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un producto
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            categoryId,
            image,
            ingredients,
            available,
            preparationTime
        } = req.body;

        // Si se actualiza la categoría, validar que exista
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                throw new ValidationError('Categoría no encontrada');
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                categoryId,
                image,
                ingredients,
                available,
                preparationTime
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un producto
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar disponibilidad de un producto
 * PATCH /api/products/:id/availability
 */
const updateAvailability = async (req, res, next) => {
    try {
        const { available } = req.body;

        if (typeof available !== 'boolean') {
            throw new ValidationError('El campo available debe ser booleano');
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { available },
            { new: true }
        );

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateAvailability
};
