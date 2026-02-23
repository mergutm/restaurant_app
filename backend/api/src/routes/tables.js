const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/tables
 * @desc    Obtener todas las mesas
 * @access  Private
 */
router.get('/', authenticate, tableController.getTables);

/**
 * @route   GET /api/tables/:id
 * @desc    Obtener una mesa por ID
 * @access  Private
 */
router.get('/:id', authenticate, tableController.getTable);

/**
 * @route   POST /api/tables
 * @desc    Crear una nueva mesa
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), tableController.createTable);

/**
 * @route   PUT /api/tables/:id
 * @desc    Actualizar una mesa
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), tableController.updateTable);

/**
 * @route   PATCH /api/tables/:id/status
 * @desc    Actualizar estado de una mesa
 * @access  Private
 */
router.patch('/:id/status', authenticate, tableController.updateTableStatus);

/**
 * @route   DELETE /api/tables/:id
 * @desc    Eliminar una mesa
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), tableController.deleteTable);

module.exports = router;
