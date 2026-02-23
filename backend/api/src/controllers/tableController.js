const { Table } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obtener todas las mesas
 * GET /api/tables
 */
const getTables = async (req, res, next) => {
    try {
        const { status, location, active } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (location) {
            filter.location = location;
        }

        if (active !== undefined) {
            filter.active = active === 'true';
        }

        const tables = await Table.find(filter).sort({ number: 1 });

        res.json({
            status: 'success',
            results: tables.length,
            data: {
                tables
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener una mesa por ID
 * GET /api/tables/:id
 */
const getTable = async (req, res, next) => {
    try {
        const table = await Table.findById(req.params.id).populate('currentOrder');

        if (!table) {
            throw new NotFoundError('Mesa no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                table
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear una nueva mesa
 * POST /api/tables
 */
const createTable = async (req, res, next) => {
    try {
        const { number, capacity, location } = req.body;

        const table = await Table.create({
            number,
            capacity,
            location,
            status: 'available',
            active: true
        });

        res.status(201).json({
            status: 'success',
            data: {
                table
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar una mesa
 * PUT /api/tables/:id
 */
const updateTable = async (req, res, next) => {
    try {
        const { number, capacity, location, status, active } = req.body;

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { number, capacity, location, status, active },
            {
                new: true,
                runValidators: true
            }
        );

        if (!table) {
            throw new NotFoundError('Mesa no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                table
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar estado de una mesa
 * PATCH /api/tables/:id/status
 */
const updateTableStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
        }

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!table) {
            throw new NotFoundError('Mesa no encontrada');
        }

        res.json({
            status: 'success',
            data: {
                table
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una mesa
 * DELETE /api/tables/:id
 */
const deleteTable = async (req, res, next) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);

        if (!table) {
            throw new NotFoundError('Mesa no encontrada');
        }

        res.json({
            status: 'success',
            message: 'Mesa eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTables,
    getTable,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable
};
