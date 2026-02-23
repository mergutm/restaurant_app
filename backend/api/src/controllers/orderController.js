const { Order, Product, Table, User } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { emitEvent } = require('../utils/socket');

/**
 * Obtener todas las órdenes
 * GET /api/orders
 * Query params: status, tableId, waiterId, date, limit, page
 */
const getOrders = async (req, res, next) => {
    try {
        const {
            status,
            tableId,
            waiterId,
            date,
            limit = 50,
            page = 1,
            sort = '-createdAt'
        } = req.query;

        // Construir filtro
        const filter = {};

        if (status) {
            const statuses = String(status).split(',').map(s => s.trim()).filter(Boolean);
            filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
        }

        if (tableId) {
            filter.tableId = tableId;
        }

        if (waiterId) {
            filter.waiterId = waiterId;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            filter.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Calcular skip para paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Ejecutar query
        const orders = await Order.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        // Contar total
        const total = await Order.countDocuments(filter);

        res.json({
            status: 'success',
            results: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: {
                orders
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener una orden por ID
 * GET /api/orders/:id
 */
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new NotFoundError('Orden no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear una nueva orden
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
    try {
        const { tableId, items, notes } = req.body;

        // Validar campos requeridos
        if (!tableId || !items || items.length === 0) {
            throw new ValidationError('Mesa e items son requeridos');
        }

        // Validar que la mesa exista
        const table = await Table.findById(tableId);
        if (!table) {
            throw new NotFoundError('Mesa no encontrada');
        }

        // Validar y preparar items
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                throw new NotFoundError(`Producto ${item.productId} no encontrado`);
            }

            if (!product.available) {
                throw new ValidationError(`El producto ${product.name} no está disponible`);
            }

            orderItems.push({
                productId: product._id,
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                },
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity,
                notes: item.notes || '',
                status: 'pending'
            });
        }

        // Crear orden
        const order = await Order.create({
            tableId,
            waiterId: req.user._id,
            items: orderItems,
            notes,
            status: 'pending'
        });

        // Actualizar estado de la mesa
        table.status = 'occupied';
        await table.save();

        // Emitir evento WebSocket
        emitEvent('order:create', order);

        res.status(201).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar estado de una orden
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'preparing', 'ready', 'closed', 'paid', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new NotFoundError('Orden no encontrada');
        }

        order.status = status;

        // Actualizar timestamps según el estado
        if (status === 'closed') {
            order.closedAt = new Date();
        } else if (status === 'paid') {
            order.paidAt = new Date();

            // Liberar la mesa
            const table = await Table.findById(order.tableId);
            if (table) {
                table.status = 'available';
                await table.save();
            }
        }

        await order.save();

        emitEvent('order:status_changed', order);

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Agregar items a una orden existente
 * POST /api/orders/:id/items
 */
const addOrderItems = async (req, res, next) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            throw new ValidationError('Items son requeridos');
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new NotFoundError('Orden no encontrada');
        }

        if (order.status === 'paid' || order.status === 'cancelled') {
            throw new ValidationError('No se pueden agregar items a una orden pagada o cancelada');
        }

        // Validar y preparar nuevos items
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                throw new NotFoundError(`Producto ${item.productId} no encontrado`);
            }

            if (!product.available) {
                throw new ValidationError(`El producto ${product.name} no está disponible`);
            }

            order.items.push({
                productId: product._id,
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                },
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity,
                notes: item.notes || '',
                status: 'pending'
            });
        }

        await order.save();

        emitEvent('order:update', order);

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Procesar pago de una orden
 * POST /api/orders/:id/pay
 */
const payOrder = async (req, res, next) => {
    try {
        const { paymentMethod } = req.body;

        const validMethods = ['cash', 'card', 'transfer'];
        if (!validMethods.includes(paymentMethod)) {
            throw new ValidationError(`Método de pago inválido. Debe ser uno de: ${validMethods.join(', ')}`);
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new NotFoundError('Orden no encontrada');
        }

        if (order.status === 'paid') {
            throw new ValidationError('Esta orden ya fue pagada');
        }

        if (order.status === 'cancelled') {
            throw new ValidationError('No se puede pagar una orden cancelada');
        }

        order.status = 'paid';
        order.paymentMethod = paymentMethod;
        order.paidAt = new Date();

        await order.save();

        // Liberar la mesa
        const table = await Table.findById(order.tableId);
        if (table) {
            table.status = 'available';
            await table.save();
        }

        emitEvent('order:paid', order);

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una orden
 * DELETE /api/orders/:id
 */
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            throw new NotFoundError('Orden no encontrada');
        }

        res.json({
            status: 'success',
            message: 'Orden eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    addOrderItems,
    payOrder,
    deleteOrder
};
