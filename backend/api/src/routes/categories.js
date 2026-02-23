const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener una categoría por ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategory);

/**
 * @route   POST /api/categories
 * @desc    Crear una nueva categoría
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Actualizar una categoría
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar una categoría
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
