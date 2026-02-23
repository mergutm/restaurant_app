const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos
 * @access  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener un producto por ID
 * @access  Public
 */
router.get('/:id', productController.getProduct);

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);

/**
 * @route   PATCH /api/products/:id/availability
 * @desc    Actualizar disponibilidad de un producto
 * @access  Private (Admin, Kitchen)
 */
router.patch(
    '/:id/availability',
    authenticate,
    authorize('admin', 'kitchen'),
    productController.updateAvailability
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar un producto
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
