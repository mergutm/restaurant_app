const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Crear aplicación Express
const app = express();

// Configuración
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/restaurant?authSource=admin';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Conectar a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    });

// Configurar eventos de mongoose
mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
});

// Registrar rutas
routes(app);

// Middleware de error 404
app.use(notFound);

// Middleware global de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS habilitado para: ${CORS_ORIGIN}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM recibido, cerrando servidor...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('👋 SIGINT recibido, cerrando servidor...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
