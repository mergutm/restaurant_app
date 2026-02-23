const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const tableRoutes = require('./tables');
const dashboardRoutes = require('./dashboard');

module.exports = (app) => {
    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'restaurant-api',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/tables', tableRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'Restaurant Management API',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                products: '/api/products',
                categories: '/api/categories',
                orders: '/api/orders',
                tables: '/api/tables',
                dashboard: '/api/dashboard'
            }
        });
    });
};
