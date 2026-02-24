const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/orders
 * @desc    Obtener todas las órdenes
 * @access  Private
 */
router.get('/', authenticate, orderController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener una orden por ID
 * @access  Private
 */
router.get('/:id', authenticate, orderController.getOrder);

/**
 * @route   POST /api/orders
 * @desc    Crear una nueva orden
 * @access  Private (Waiter, Admin)
 */
router.post('/', authenticate, authorize('waiter', 'admin'), orderController.createOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualizar estado de una orden
 * @access  Private
 */
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

/**
 * @route   POST /api/orders/:id/items
 * @desc    Agregar items a una orden
 * @access  Private (Waiter, Admin)
 */
router.post(
    '/:id/items',
    authenticate,
    authorize('waiter', 'admin'),
    orderController.addOrderItems
);

/**
 * @route   POST /api/orders/:id/pay
 * @desc    Procesar pago de una orden
 * @access  Private (Cashier, Admin)
 */
router.post(
    '/:id/pay',
    authenticate,
    authorize('cashier', 'admin'),
    orderController.payOrder
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Eliminar una orden
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), orderController.deleteOrder);

/**
 * @route   PATCH /api/orders/:id/items/:itemId/status
 * @desc    Actualizar estado de un ítem individual
 * @access  Private (Waiter, Kitchen, Admin)
 */
router.patch('/:id/items/:itemId/status', authenticate, orderController.updateItemStatus);

module.exports = router;
