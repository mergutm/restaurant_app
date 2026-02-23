const { Order, Product, User } = require('../models');

/**
 * Obtener estadísticas del dashboard
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Órdenes de hoy
        const todayOrders = await Order.find({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // Estadísticas de órdenes
        const totalOrdersToday = todayOrders.length;
        const activeOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing', 'ready'] }
        });
        const completedOrdersToday = todayOrders.filter(o => o.status === 'paid').length;

        // Ingresos de hoy
        const revenueToday = todayOrders
            .filter(o => o.status === 'paid')
            .reduce((sum, order) => sum + order.total, 0);

        // Productos más vendidos hoy
        const productSales = {};
        todayOrders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.productId.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        product: item.product,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[productId].quantity += item.quantity;
                productSales[productId].revenue += item.subtotal;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Órdenes por estado
        const ordersByStatus = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Promedio de ticket
        const averageTicket = completedOrdersToday > 0
            ? revenueToday / completedOrdersToday
            : 0;

        // Meseros más activos
        const topWaiters = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$waiterId',
                    waiterName: { $first: '$waiter.name' },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            {
                $sort: { orders: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.json({
            status: 'success',
            data: {
                today: {
                    totalOrders: totalOrdersToday,
                    completedOrders: completedOrdersToday,
                    activeOrders,
                    revenue: Math.round(revenueToday * 100) / 100,
                    averageTicket: Math.round(averageTicket * 100) / 100
                },
                ordersByStatus,
                topProducts,
                topWaiters
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener ventas por período
 * GET /api/dashboard/sales
 * Query params: startDate, endDate, groupBy (day, week, month)
 */
const getSales = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();

        let groupFormat;
        switch (groupBy) {
            case 'month':
                groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'week':
                groupFormat = { $week: '$createdAt' };
                break;
            default:
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const sales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: 'paid'
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' },
                    averageTicket: { $avg: '$total' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                sales
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats,
    getSales
};
