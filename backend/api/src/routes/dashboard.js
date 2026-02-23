const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas del dashboard
 * @access  Private (Cashier, Admin)
 */
router.get(
    '/stats',
    authenticate,
    authorize('cashier', 'admin'),
    dashboardController.getStats
);

/**
 * @route   GET /api/dashboard/sales
 * @desc    Obtener ventas por período
 * @access  Private (Cashier, Admin)
 */
router.get(
    '/sales',
    authenticate,
    authorize('cashier', 'admin'),
    dashboardController.getSales
);

module.exports = router;
